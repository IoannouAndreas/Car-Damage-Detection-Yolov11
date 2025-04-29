from fastapi import FastAPI, File, UploadFile, Form ,Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import uvicorn
import numpy as np
from io import BytesIO
from PIL import Image, ImageDraw , ImageOps
import base64
import cv2  # OpenCV for video/full scan processing
from ultralytics import YOLO
from fastapi.responses import FileResponse
from pathlib import Path
from ultralytics.utils.plotting import Colors
import uuid
import os
from ultralytics.utils.plotting import Colors
from moviepy import VideoFileClip
from collections import defaultdict


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # or restrict to your app IPs later
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Paths to your models
MODEL_PATH_PARTS = r"E:\\Ptyxiakh_Project_Car_Parts_Detection\\runs\\segment\\train6\\weights\\best.pt"
MODEL_PATH_DAMAGE = r"E:\\Ptyxiakh_Project_Damage_detection\\runs\\segment\\train6\\weights\\best.pt"
model_parts = YOLO(MODEL_PATH_PARTS)
model_damage = YOLO(MODEL_PATH_DAMAGE)
colors = Colors()

# --- Helper Functions ---
def process_masks(masks, orig_shape):
    """Properly handle YOLO Mask objects and resize to original dimensions"""
    if masks is None:
        return None
    
    processed = []
    # Convert masks tensor to numpy array and transpose dimensions
    masks_np = masks.data.cpu().numpy().transpose(1, 2, 0)  # (N, H, W) → (H, W, N)
    
    for i in range(masks_np.shape[-1]):
        # Extract individual mask and ensure 2D format
        mask = masks_np[:, :, i].squeeze().astype(np.float32)
        
        # Skip invalid empty masks
        if mask.size == 0:
            continue
            
        # Resize to original image dimensions
        mask_resized = cv2.resize(
            mask, 
            (orig_shape[1], orig_shape[0]),  # (width, height)
            interpolation=cv2.INTER_LINEAR
        )
        
        # Binarize and convert to uint8
        processed.append((mask_resized > 0.5).astype(np.uint8))
    
    return processed

def apply_mask(image, mask, color, alpha=0.4):
    """Safe mask application with dimension validation"""
    if mask is not None and mask.ndim == 2 and mask.shape[:2] == image.shape[:2]:
        colored_mask = np.zeros_like(image)
        colored_mask[mask > 0] = color
        return cv2.addWeighted(image, 1, colored_mask, alpha, 0)
    return image

def iou(box1, box2):
    """Calculate intersection over union"""
    x1 = max(box1[0], box2[0])
    y1 = max(box1[1], box2[1])
    x2 = min(box1[2], box2[2])
    y2 = min(box1[3], box2[3])
    
    inter_area = max(0, x2 - x1) * max(0, y2 - y1)
    box1_area = (box1[2] - box1[0]) * (box1[3] - box1[1])
    box2_area = (box2[2] - box2[0]) * (box2[3] - box2[1])
    
    return inter_area / (box1_area + box2_area - inter_area + 1e-6)

def colors(idx):
    """Generate consistent colors for annotations"""
    np.random.seed(idx)
    return tuple(map(int, np.random.randint(0, 255, size=3)))

def filter_best_detections_per_class(boxes, classes, confs, keep_top_n_for=None):
    """
    Επιστρέφει λίστα από (index, class_id) με τα καλύτερα detections per class.
    Για συγκεκριμένες κατηγορίες (π.χ. headlight, mirror, fender) κρατάει top-N.
    """
    keep_top_n_for = keep_top_n_for or []
    
    class_detections = defaultdict(list)

    for i, cls in enumerate(classes):
        class_detections[cls].append((i, confs[i]))

    filtered_indices = []
    for cls, detections in class_detections.items():
        # Ταξινόμηση κατά confidence φθίνουσα
        detections.sort(key=lambda x: x[1], reverse=True)
        top_n = 2 if cls in keep_top_n_for else 1
        top = detections[:top_n]
        for idx, _ in top:
            filtered_indices.append((idx, cls))

    return filtered_indices


# --- Detection Endpoint ---
@app.post("/detect/")
async def detect_car_parts(
    file: UploadFile = File(...),
    analysis_type: str = Form(...)
):
    # Read and preprocess image
    image_bytes = await file.read()
    original_image = Image.open(BytesIO(image_bytes)).convert("RGB")
    original_image = ImageOps.exif_transpose(original_image)
    resized_image = original_image
    
    # Convert to OpenCV format
    image_np = np.array(resized_image)
    image_cv = cv2.cvtColor(image_np, cv2.COLOR_RGB2BGR)
    orig_shape = image_cv.shape[:2]
    annotated_image = image_cv.copy()

    # Process based on analysis type
    analysis_type = analysis_type.strip().lower()
    combined_results = []
    detections = []

    if analysis_type == "full.scan":
        results_parts = model_parts(resized_image)
        results_damage = model_damage(resized_image)
        result_parts = results_parts[0]
        result_damage = results_damage[0]

        # Όρισε τις "ειδικές" κατηγορίες (κρατάμε 2 για αυτές)
        special_classes = [i for i, name in model_parts.names.items() if name in ["Headlight", "Mirror", "Fender"]]

        # Πάρε όλα τα μέρη (boxes, classes, confs)
        parts_boxes_all = result_parts.boxes.xyxy.cpu().numpy()
        parts_classes_all = result_parts.boxes.cls.cpu().numpy().astype(int)
        parts_confs_all = result_parts.boxes.conf.cpu().numpy()

        # Φιλτράρισμα: κρατάμε 1 ή 2 ανάλογα με το είδος του μέρους
        
        class_detections = defaultdict(list)
        for i, cls in enumerate(parts_classes_all):
            class_detections[cls].append((i, parts_confs_all[i]))

        selected_indices = []
        for cls, dets in class_detections.items():
            dets.sort(key=lambda x: x[1], reverse=True)
            top_n = 2 if cls in special_classes else 1
            selected_indices.extend([idx for idx, _ in dets[:top_n]])

        # Τελικά filtered parts
        parts_boxes = np.array([parts_boxes_all[i] for i in selected_indices])
        parts_classes = np.array([parts_classes_all[i] for i in selected_indices])

        # Ζημιές
        damage_boxes = result_damage.boxes.xyxy.cpu().numpy()
        damage_classes = result_damage.boxes.cls.cpu().numpy().astype(int)
        damage_confs = result_damage.boxes.conf.cpu().numpy()
        damage_masks = process_masks(result_damage.masks, orig_shape) if result_damage.masks else None

        combined_results = []

        for d_idx, (d_box, d_class, d_conf) in enumerate(zip(damage_boxes, damage_classes, damage_confs)):
            best_iou = 0.0
            best_part = None

            for p_idx, (p_box, p_class) in enumerate(zip(parts_boxes, parts_classes)):
                current_iou = iou(d_box, p_box)
                if current_iou > best_iou:
                    best_iou = current_iou
                    best_part = p_class

            damage_name = model_damage.names[d_class]
            part_name = model_parts.names[best_part] if best_part is not None else "unknown part"
            confidence = round(float(d_conf) * 100, 1)
            display_text = f"{damage_name} on {part_name} ({confidence}%)"

            combined_results.append({
                "display_text": display_text,
                "damage": damage_name,
                "part": part_name,
                "confidence": confidence * 1,
                "location": {
                    "x1": float(d_box[0]),
                    "y1": float(d_box[1]),
                    "x2": float(d_box[2]),
                    "y2": float(d_box[3])
                }
            })

            color = colors(best_part if best_part is not None else 0)[::-1]  # BGR
            x1, y1, x2, y2 = map(int, d_box)
            cv2.rectangle(annotated_image, (x1, y1), (x2, y2), color, 2)
            cv2.putText(annotated_image, display_text, (x1, y1 - 10),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.6, color, 2)

            if damage_masks and d_idx < len(damage_masks):
                annotated_image = apply_mask(annotated_image, damage_masks[d_idx], color)

        response_data = {
            "analysis_type": "full_scan",
            "detections": combined_results,
            "total_damages": len(combined_results),
        }

    elif analysis_type in ["damage.detection", "car.parts.detection"]:
        # Determine model and labels
        model = model_damage if analysis_type == "damage.detection" else model_parts
        labels = model_damage.names if analysis_type == "damage.detection" else model_parts.names

        results = model(resized_image)
        result = results[0]
        boxes = result.boxes.xyxy.cpu().numpy()
        classes = result.boxes.cls.cpu().numpy().astype(int)
        confs = result.boxes.conf.cpu().numpy()
        masks = process_masks(result.masks, orig_shape) if result.masks else None

        detections = []

        if analysis_type == "car.parts.detection":
            # Ορισμός κατηγοριών που θέλουμε top-2 (με βάση το όνομα)
            special_classes = [i for i, name in model_parts.names.items() if name in ["Headlight", "Mirror", "Fender"]]

            # Ομαδοποίηση ανιχνεύσεων ανά class
            
            class_detections = defaultdict(list)
            for idx, cls in enumerate(classes):
                conf = confs[idx]
                class_detections[cls].append((idx, conf))

            # Επιλογή καλύτερων (top-1 ή top-2)
            selected_detections = []
            for cls, det_list in class_detections.items():
                det_list.sort(key=lambda x: x[1], reverse=True)  # ταξινόμηση κατά confidence
                top_n = 2 if cls in special_classes else 1
                selected_detections.extend([(idx, cls) for idx, _ in det_list[:top_n]])

            # Σχεδίαση & αποθήκευση
            for idx, cls in selected_detections:
                box = boxes[idx]
                conf = confs[idx]
                color = colors(cls)
                x1, y1, x2, y2 = map(int, box)
                label = f"{labels[cls]} {conf*100:.1f}%"

                cv2.rectangle(annotated_image, (x1, y1), (x2, y2), color, 2)
                cv2.putText(annotated_image, label, (x1, y1 - 10),
                            cv2.FONT_HERSHEY_SIMPLEX, 0.6, color, 2)

                if masks:
                    annotated_image = apply_mask(annotated_image, masks[idx], color)

                detections.append({
                    "part": labels[cls],
                    "confidence": round(conf * 100, 1),
                    "box": [float(x) for x in box]
                })

        else:
            # Για ζημιές: κρατάμε τα πάντα
            for idx, (box, cls, conf) in enumerate(zip(boxes, classes, confs)):
                color = colors(cls)
                x1, y1, x2, y2 = map(int, box)
                label = f"{labels[cls]} {conf*100:.1f}%"

                cv2.rectangle(annotated_image, (x1, y1), (x2, y2), color, 2)
                cv2.putText(annotated_image, label, (x1, y1 - 10),
                            cv2.FONT_HERSHEY_SIMPLEX, 0.6, color, 2)

                if masks:
                    annotated_image = apply_mask(annotated_image, masks[idx], color)

                detections.append({
                    "part": labels[cls],
                    "confidence": round(conf * 100, 1),
                    "box": [float(x) for x in box]
                })

        response_data = {"detections": detections}

    else:
        return {"error": "Invalid analysis type"}

    # Encode and return results
    _, buffer = cv2.imencode('.jpg', annotated_image)
    encoded_image = base64.b64encode(buffer).decode('utf-8')
    
    return {**response_data, "annotated_image": encoded_image}


# Ορισμός φακέλου εξόδου για τα βίντεο και δημιουργία του αν δεν υπάρχει
OUTPUT_DIR = Path("./static/videos")
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
confidences_per_label = defaultdict(list)

# Σερβίρισμα στατικών αρχείων
app.mount("/static", StaticFiles(directory="static"), name="static")

@app.post("/detect_video/")
async def detect_video(
    file: UploadFile = File(...),
    analysis_type: str = Form(...)
):
    
    """
    Επεξεργάζεται το ανεβασμένο βίντεο και επιστρέφει το URL του επεξεργασμένου αρχείου.
    
    Οι επιλογές για το analysis_type είναι:
      - "scan_parts": μόνο ανίχνευση μερών αυτοκινήτου.
      - "detect_damage": μόνο ανίχνευση ζημιών.
      - "full_scan": συνδυασμένη ανίχνευση (full scan).
    
    Σε κάθε περίπτωση παράγεται μόνο ένα αρχείο εξόδου.
    """
    # Καθαρισμός της τιμής του analysis_type
    analysis_type = analysis_type.strip().lower()
    print("Received analysis_type:", analysis_type)

    temp_video_path = f"temp_{uuid.uuid4()}.mp4"
    with open(temp_video_path, "wb") as f:
        f.write(await file.read())

    clip = VideoFileClip(temp_video_path)
    fps = clip.fps
    width, height = clip.w, clip.h
    frame_size = (width, height)

    output_filename = f"{uuid.uuid4()}.mp4"
    output_path = str(OUTPUT_DIR / output_filename)

    fourcc = cv2.VideoWriter_fourcc(*'mp4v')
    out = cv2.VideoWriter(output_path, fourcc, fps, frame_size)

    # Δημιουργία δομής για αποθήκευση των confidence ανά label (π.χ. "Scratch on Door", "Mirror", "Dent on Fender")
    confidences_per_label = defaultdict(list)

    # Λίστα για αποθήκευση όλων των ανιχνεύσεων του βίντεο
    video_detections = []

    for frame_rgb in clip.iter_frames():
        frame = cv2.cvtColor(frame_rgb, cv2.COLOR_RGB2BGR)
        orig_shape = frame.shape[:2]
        annotated_frame = frame.copy()

        if analysis_type == "full":
            results_parts = model_parts(frame_rgb)
            results_damage = model_damage(frame_rgb)
            frame_combined = frame.copy()

            parts_boxes_all = results_parts[0].boxes.xyxy.cpu().numpy()
            parts_classes_all = results_parts[0].boxes.cls.cpu().numpy().astype(int)
            parts_confs_all = results_parts[0].boxes.conf.cpu().numpy()

            special_classes = [i for i, name in model_parts.names.items() if name in ["Headlight", "Mirror", "Fender"]]
            class_detections = defaultdict(list)
            for i, cls in enumerate(parts_classes_all):
                class_detections[cls].append((i, parts_confs_all[i]))

            selected_indices = []
            for cls, dets in class_detections.items():
                dets.sort(key=lambda x: x[1], reverse=True)
                top_n = 2 if cls in special_classes else 1
                selected_indices.extend([(i, cls) for i, _ in dets[:top_n]])

            filtered_part_boxes = [parts_boxes_all[i] for i, _ in selected_indices]
            filtered_part_classes = [cls for _, cls in selected_indices]
            filtered_part_indices = [i for i, _ in selected_indices]

            parts_masks_all = process_masks(results_parts[0].masks, orig_shape) if results_parts[0].masks else None
            damage_masks = process_masks(results_damage[0].masks, orig_shape) if results_damage[0].masks else None

            if damage_masks is not None:
                for d_idx, d_mask in enumerate(damage_masks):
                    d_box = results_damage[0].boxes.xyxy[d_idx].cpu().numpy()
                    best_iou = 0
                    best_part_idx = None

                    for i, p_box in enumerate(filtered_part_boxes):
                        iou_score = iou(d_box, p_box)
                        if iou_score > best_iou:
                            best_iou = iou_score
                            best_part_idx = i

                    if best_part_idx is not None and best_iou > 0.1:
                        part_class_id = filtered_part_classes[best_part_idx]
                        part_name = model_parts.names[part_class_id]

                        damage_class_id = int(results_damage[0].boxes.cls[d_idx].item())
                        damage_name = model_damage.names[damage_class_id]

                        confidence = float(results_damage[0].boxes.conf[d_idx].cpu().item())
                        label_text = f"{damage_name} on {part_name}"


                        if confidence >= 0.40:
                            confidences_per_label[label_text].append(confidence)

                            video_detections.append({
                                "part": part_name,
                                "damage": damage_name,
                                "confidence": confidence * 100,
                                "display_text": f"{label_text} ({confidence:.0%})"
                            })

                        color = colors(part_class_id)[::-1]
                        frame_combined = apply_mask(frame_combined, d_mask, color)

                        x1, y1, x2, y2 = map(int, d_box)
                        cv2.putText(frame_combined, label_text, (x1, y1 - 10),
                                    cv2.FONT_HERSHEY_SIMPLEX, 0.6, color, 2)
                        cv2.rectangle(frame_combined, (x1, y1), (x2, y2), color, 2)

            annotated_frame = frame_combined

        elif analysis_type == "damage":
            results_damage = model_damage(frame_rgb)
            frame_damage = frame.copy()
            damage_masks = process_masks(results_damage[0].masks, orig_shape) if results_damage[0].masks else None

            for i in range(len(results_damage[0].boxes.xyxy)):
                box = results_damage[0].boxes.xyxy[i].cpu().numpy()
                class_id = int(results_damage[0].boxes.cls[i].cpu().item())
                confidence = float(results_damage[0].boxes.conf[i].cpu().item())
                damage_name = model_damage.names[class_id]

                col = colors(class_id + 100)[::-1]
                if damage_masks is not None:
                    mask = damage_masks[i]
                    frame_damage = apply_mask(frame_damage, mask, col)

                x1, y1, x2, y2 = map(int, box)
                cv2.rectangle(frame_damage, (x1, y1), (x2, y2), col, 2)
                cv2.putText(frame_damage, damage_name, (x1, y1 - 10),
                            cv2.FONT_HERSHEY_SIMPLEX, 0.6, col, 2)
                if confidence >= 0.40:
                    video_detections.append({
                        "damage": damage_name,
                        "confidence": confidence * 100,
                        "display_text": f"{damage_name} ({confidence:.0%})"
                    })
                    confidences_per_label[damage_name].append(confidence)

            annotated_frame = frame_damage

        elif analysis_type == "parts":
            results_parts = model_parts(frame_rgb)
            frame_parts = frame.copy()
            parts_masks_all = process_masks(results_parts[0].masks, orig_shape) if results_parts[0].masks else None

            boxes_all = results_parts[0].boxes.xyxy.cpu().numpy()
            classes_all = results_parts[0].boxes.cls.cpu().numpy().astype(int)
            confs_all = results_parts[0].boxes.conf.cpu().numpy()

            special_classes = [i for i, name in model_parts.names.items() if name in ["Headlight", "Mirror", "Fender"]]
            class_detections = defaultdict(list)
            for i, cls in enumerate(classes_all):
                class_detections[cls].append((i, confs_all[i]))

            selected_indices = []
            for cls, det_list in class_detections.items():
                det_list.sort(key=lambda x: x[1], reverse=True)
                top_n = 2 if cls in special_classes else 1
                selected_indices.extend([(i, cls) for i, _ in det_list[:top_n]])

            for idx, cls in selected_indices:
                box = boxes_all[idx]
                x1, y1, x2, y2 = map(int, box)
                col = colors(cls)[::-1]

                if parts_masks_all is not None:
                    mask = parts_masks_all[idx]
                    frame_parts = apply_mask(frame_parts, mask, col)

                part_name = model_parts.names[cls]
                confidence = float(confs_all[idx])
                cv2.rectangle(frame_parts, (x1, y1), (x2, y2), col, 2)
                cv2.putText(frame_parts, part_name, (x1, y1 - 10),
                            cv2.FONT_HERSHEY_SIMPLEX, 0.6, col, 2)

                video_detections.append({
                    "part": part_name,
                    "confidence": confidence,
                    "display_text": f"{part_name} ({confidence:.0%})"
                })
                confidences_per_label[part_name].append(confidence)

            annotated_frame = frame_parts
        else:
            return {"error": "Invalid analysis type"}

        out.write(annotated_frame)

    out.release()
    clip.close()
    try:
        os.remove(temp_video_path)
    except Exception as e:
        print(f"Σφάλμα κατά την διαγραφή του προσωρινού αρχείου: {e}")


    average_confidences = {
        label: round(sum(vals) / len(vals), 4) if vals else 0.0
        for label, vals in confidences_per_label.items()
    }

    video_url = f"/static/videos/{output_filename}"
    if analysis_type == "parts":
        return {
            "annotated_video_url": video_url,
            "average_confidence": average_confidences
        }
    else:
        return {
            "annotated_video_url": video_url,
            "detections": video_detections,
            "average_confidence": average_confidences
        }

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=9000)
