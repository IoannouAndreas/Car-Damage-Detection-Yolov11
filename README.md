This is a project part of my thesis 
Thesis Title:
Detection and Recognition of Car Damages from Video Using Deep Learning

Implementation Details:

Segmentation Model: YOLOv11

Training Acceleration: CUDA 12.6

Demo Application: A React Native app (built with npx expo) that communicates with a Uvicorn/FastAPI server (also developed as part of the project)

App Features:
A mobile app with a simple, user-friendly UI that leverages two pre-trained models:

Car Part Recognition Model

Detects and recognizes the various parts of a car

Both pre-trained models were trained using YOLOv11

Car Damage Recognition Model

Detects and analyzes damage on the car

Main Menu Structure:

Recognition from Photo

Recognition from Video

Within each category, the user can choose:

Car Part Recognition

Car Damage Recognition

Full Scan — a combined mode that simultaneously identifies damage and pinpoints which car part is affected

Final Output:
The app displays the image with the detected damage, highlights the exact location of the damage, and shows a concluding message to inform the user.

This project also contains a Python code that uses uvicorn to run as a server and the two trained models needed to run it sucsesfully 

Make sure you have Python 3.8+ installed. To install the required Python packages, run:

pip install fastapi uvicorn numpy pillow opencv-python ultralytics python-multipart moviepy

Ensure you have Node.js and Expo CLI installed. If not:
npm install -g expo-cli

Then, inside your React Native project directory, install the necessary dependencies:
npm install react react-native react-native-paper react-native-reanimated react-native-video @expo/vector-icons expo-camera expo-av expo-image-picker expo-media-library expo-router expo-constants

You may also need to install required peer dependencies with:
npx expo install react-native-gesture-handler react-native-screens react-native-safe-area-context


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
