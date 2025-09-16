# Car Damage Detection and Recognition App Using Deep Learning

## 📚 Thesis Project
**Title:** Detection and Recognition of Car Damages from Video Using Deep Learning  
**Author:** Andreas Ioannou  
**Model Used:** YOLOv11

---

## 🤖 Project Overview
This project is part of a thesis that explores the use of deep learning models to detect and recognize car damages from images and videos. It includes:

- A mobile app built with **React Native (Expo)**
- A server-side implementation using **FastAPI + Uvicorn**
- Two trained YOLOv11 models for:
  - **Car Part Recognition**
  - **Car Damage Recognition**

---

## 🚗 App Features
- **User-Friendly Interface:** Clean UI for seamless interaction
- **Model Integration:** Utilizes two YOLOv11-based models
- **Multi-Mode Analysis:**
  - **Recognition from Photo**
  - **Recognition from Video**
  - **Car Part Recognition**
  - **Car Damage Recognition**
  - **Full Scan Mode:** Combines both recognitions

**Final Output:**
- The app displays the image with detected damage.
- Highlights the affected car part(s).
- Displays a concluding message with recognition results.

---

## ⚙️ Implementation Details

### Segmentation Model
- YOLOv11 (trained separately for car parts and damage detection)

### Server Backend
- **Python 3.8+** with **FastAPI** and **Uvicorn**

### Training Acceleration
- CUDA 12.6

### React Native App
- Built using Expo (via `npx expo`)

---

## 🚀 Getting Started

### Backend Setup
1. Ensure **Python 3.8+** is installed.
2. Install required packages:
   ```bash
   pip install fastapi uvicorn numpy pillow opencv-python ultralytics python-multipart moviepy


# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
    npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
