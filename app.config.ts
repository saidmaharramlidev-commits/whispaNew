import { ExpoConfig } from "expo/config";

const isDevelopment = process.env.APP_VARIANT === "development";

const config: ExpoConfig = {
  name: "WhispaMe",
  slug: "WhispaMe",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/images/Logo.png",
  scheme: "whispame",  // ← changed from "whispa" to "whispame" for consistency
  userInterfaceStyle: "automatic",

  ios: {
    supportsTablet: true,
    bundleIdentifier: isDevelopment
      ? "com.saidovery.whispame.dev"
      : "com.saidovery.whispame",
    associatedDomains: ["applinks:feedbackapp-drsj.onrender.com"],
  },

  android: {
    package: isDevelopment
      ? "com.saidovery.whispame.dev"
      : "com.saidovery.whispame",
    versionCode: 2,
    googleServicesFile: isDevelopment
      ? "./google-services(dev).json"
      : "./google-services.json",
    adaptiveIcon: {
      backgroundColor: "#E6F4FE",
      foregroundImage: "./assets/images/Logo.png",
      monochromeImage: "./assets/images/Logo.png",
    },
    predictiveBackGestureEnabled: false,
    permissions: [
      "android.permission.RECORD_AUDIO"
    ],
    intentFilters: [
      {
        action: "VIEW",
        autoVerify: true,
        data: [
          {
            scheme: "https",
            host: "feedbackapp-drsj.onrender.com",
            pathPrefix: "/u"
          }
        ],
        category: ["BROWSABLE", "DEFAULT"]
      },
      {
        action: "VIEW",
        data: [
          {
            scheme: "whispame"
          }
        ],
        category: ["BROWSABLE", "DEFAULT"]
      }
    ]
  },

  plugins: [
    "expo-router",
    "expo-notifications",
    [
      "expo-splash-screen",
      {
        image: "./assets/images/Logo.png",
        imageWidth: 200,
        resizeMode: "contain",
        backgroundColor: "#000000",
        dark: {
          backgroundColor: "#000000"
        }
      }
    ],
    [
      "expo-image-picker",
      {
        photosPermission:
          "Allow Whispa to access your photos to update your profile picture."
      }
    ],
    "@clerk/expo",
    "expo-secure-store",
    "expo-web-browser",
    "expo-localization"
  ],

  experiments: {
    typedRoutes: true,
    reactCompiler: true
  },

  extra: {
    eas: {
      projectId: "fdba0e63-d55b-4f71-9ff3-f603a5dc8070"
    }
  },

  owner: "said20072026",
};

export default config;