// src/utils/api.ts
import Constants from 'expo-constants';

// Get the Expo debugger host 
const debuggerHost = Constants.manifest?.debuggerHost;
// Extract the IP part or default to localhost
const host = debuggerHost ? debuggerHost.split(':')[0] || 'localhost' : 'localhost';

// Development and Production URLs
const DEV_API_URL  = `http://${host}:9000`;
const PROD_API_URL = 'https://api.myapp.com'; // replace with real prod URL

// Export base URL depending on environment
export const API_BASE_URL = __DEV__ ? DEV_API_URL : PROD_API_URL;

console.log(`API Base URL: ${API_BASE_URL}`);