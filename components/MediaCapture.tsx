import React, { useState, useRef, useEffect } from "react";
import { 
  View, 
  Text, 
  TouchableOpacity, 
  ActivityIndicator, 
  StyleSheet, 
  Image, 
  Button,
  Alert 
} from "react-native";
import { CameraView, CameraType, useCameraPermissions, useMicrophonePermissions } from "expo-camera";
import { Video, ResizeMode } from "expo-av";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";
import { MaterialIcons } from "@expo/vector-icons";
import * as MediaLibrary from "expo-media-library";

interface MediaCaptureProps {
  onCapture: (file: { uri: string }) => void;
  onClear: () => void;
  isLoading?: boolean;
  mediaType: "photo" | "video";
  capturedMedia: string | null;
}

const MediaCapture: React.FC<MediaCaptureProps> = ({
  onCapture,
  onClear,
  isLoading = false,
  mediaType,
  capturedMedia,
}) => {
  const [isCapturing, setIsCapturing] = useState<boolean>(false);
  const [facing, setFacing] = useState<CameraType>("back");
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [microphonePermission, requestMicrophonePermission] = useMicrophonePermissions();

  const cameraRef = useRef<CameraView | null>(null);
  const videoRef = useRef<Video | null>(null);

  useEffect(() => {
    (async () => {
      if (!cameraPermission?.granted) {
        console.log("📸 Requesting Camera Permission...");
        await requestCameraPermission();
      }
      if (!microphonePermission?.granted) {
        console.log("🎤 Requesting Microphone Permission...");
        await requestMicrophonePermission();
      }
  
      const { status: mediaStatus } = await MediaLibrary.requestPermissionsAsync();
      if (mediaStatus !== "granted") {
        Alert.alert("Storage Permission Required", "Please enable storage permissions in settings.");
      }
  
      setHasPermission(
        !!cameraPermission?.granted && !!microphonePermission?.granted && mediaStatus === "granted"
      );
    })();
  }, [cameraPermission, microphonePermission]);
  

  if (hasPermission === null) return <View />;
  if (!hasPermission) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>We need camera and microphone permissions</Text>
        <Button 
          title="Grant Permissions" 
          onPress={() => {
            requestCameraPermission();
            requestMicrophonePermission();
          }} 
        />
      </View>
    );
  }

  const toggleCameraFacing = () => setFacing((current) => (current === "back" ? "front" : "back"));

  const handlePickMedia = async () => {
    let result: ImagePicker.ImagePickerResult;
    if (mediaType === "photo") {
      result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images });
    } else {
      result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Videos });
    }
    if (!result.canceled && result.assets?.length) {
      onCapture({ uri: result.assets[0].uri });
    }
  };

  const saveVideo = async (uri: string) => {
    try {
      const destination = `${FileSystem.documentDirectory}video_${Date.now()}.mp4`;
      await FileSystem.copyAsync({ from: uri, to: destination });
  
      //  Ensure file size is retrieved correctly
      const fileInfo = await FileSystem.getInfoAsync(destination, { md5: false });
  
      console.log("✅ Video saved to:", destination, "Exists:", fileInfo.exists);
  
      if (!fileInfo.exists) {
        throw new Error("❌ Failed to save video: File does not exist.");
      }
  
      return destination;
    } catch (error) {
      console.error("🚨 Error saving video:", error);
      return uri;
    }
  };

  const captureMedia = async () => {
    if (!cameraRef.current) {
      console.error("🚨 No Camera reference found! Check if CameraView is mounted.");
      return;
    }
  
    setIsCapturing(true);
  
    if (mediaType === "photo") {
      try {
        const photo = await cameraRef.current.takePictureAsync();
        if (photo?.uri) {
          console.log("✅ Photo captured:", photo.uri);
          onCapture({ uri: photo.uri });
        }
      } catch (error) {
        console.error("🚨 Photo Capture Error:", error);
      }
      setIsCapturing(false);
    } else {
      try {
        console.log("🎥 Preparing for Video Recording...");
  
        //  Ensure the camera is fully ready before recording
        await new Promise((resolve) => setTimeout(resolve, 1000));
  
        console.log("🎥 Attempting to start recording...");
        
        //  Add more recording options to ensure it captures frames
        const video = await cameraRef.current.recordAsync({
          maxDuration: 30,  // Ensure recording lasts
          
        });
  
        if (video?.uri) {
          console.log("✅ Video recorded successfully:", video.uri);
  
          // Check if the file actually exists before using it
          const fileInfo = await FileSystem.getInfoAsync(video.uri);
          console.log("🔍 Recorded video exists:", fileInfo.exists, "Size:", "size" in fileInfo ? fileInfo.size : "Unknown");
  
          if (!fileInfo.exists || ("size" in fileInfo && fileInfo.size === 0)) {
            throw new Error("❌ Video file does not exist or is empty.");
          }
  
          const savedUri = await saveVideo(video.uri);
          onCapture({ uri: savedUri });
        } else {
          console.error("❌ Video recording failed: No URI was returned.");
        }
      } catch (error) {
        console.error("🚨 Video Recording Error:", error);
        Alert.alert("Recording Error", "Failed to record video. Please try again.");
      }
    }
    setIsCapturing(false);
  };
  
  const stopRecording = async () => {
    if (!cameraRef.current || !isCapturing) {
      console.warn("🚨 Tried to stop recording, but no recording is active.");
      return;
    }
  
    console.log("⏳ Ensuring at least 1 seconds of recording...");
    setTimeout(() => {
      console.log("🛑 Stopping recording now...");
      cameraRef.current?.stopRecording();
      setIsCapturing(false);
    }, 1000); // ✅ Ensures at least 1 seconds of recording before stopping
  };
  return (
    <View style={styles.container}>
      {capturedMedia ? (
        <View style={styles.previewContainer}>
          {mediaType === "photo" ? (
            <Image source={{ uri: capturedMedia }} style={styles.media} />
          ) : (
            <Video source={{ uri: capturedMedia }} ref={videoRef} style={styles.media} useNativeControls resizeMode={ResizeMode.CONTAIN} />
          )}
          <TouchableOpacity style={styles.clearButton} onPress={onClear}>
            <MaterialIcons name="close" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      ) : (
        <CameraView 
          mode={mediaType === 'photo' ? 'picture' : 'video'}
          videoQuality="720p"
          style={styles.camera} 
          facing={facing} 
          ref={(ref) => {
            if (ref) {
              console.log("✅ Camera is mounted and ready!");
            }
            cameraRef.current = ref;
          }}
          onCameraReady={() => console.log("📸 Camera is fully ready to record!")} // ✅ New log to check readiness
        >
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.button} onPress={handlePickMedia}>
              <MaterialIcons name="folder" size={30} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.captureButton} onPress={isCapturing ? stopRecording : captureMedia}>
              <MaterialIcons name={mediaType === "photo" ? "camera" : "videocam"} size={40} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={toggleCameraFacing}>
              <MaterialIcons name="flip-camera-ios" size={30} color="#fff" />
            </TouchableOpacity>
          </View>
        </CameraView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { width: "100%", height: 350, alignItems: "center", justifyContent: "center" },
  previewContainer: { width: "100%", height: 350, position: "relative" },
  media: { width: "100%", height: "100%", borderRadius: 10 },
  clearButton: { position: "absolute", top: 10, right: 10, backgroundColor: "rgba(0,0,0,0.5)", borderRadius: 20, padding: 5 },
  camera: { width: "100%", height: 350, justifyContent: "flex-end", alignItems: "center" },
  buttonContainer: { flexDirection: "row", justifyContent: "space-between", width: "100%", padding: 20 },
  button: { backgroundColor: "rgba(0,0,0,0.5)", padding: 10, borderRadius: 30 },
  captureButton: { backgroundColor: "red", padding: 15, borderRadius: 50 },
  message: { fontSize: 16, marginBottom: 10 },
});

export default MediaCapture;
