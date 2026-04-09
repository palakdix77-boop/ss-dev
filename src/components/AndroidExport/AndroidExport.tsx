"use client";

import { useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { Smartphone, Download, Check, AlertCircle, Copy, ExternalLink } from 'lucide-react';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

export function AndroidExport() {
  const { exportProject } = useAppStore();
  const [appName, setAppName] = useState('My Web App');
  const [packageName, setPackageName] = useState('com.mycompany.mywebapp');
  const [version, setVersion] = useState('1.0.0');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState('');

  const generateAndroidProject = async () => {
    setIsGenerating(true);
    
    try {
      const files = exportProject();
      const zip = new JSZip();
      
      // Create Android project structure
      const androidFolder = zip.folder('android-app');
      const assetsFolder = androidFolder?.folder('app/src/main/assets');
      const resFolder = androidFolder?.folder('app/src/main/res');
      
      // Add web files to assets
      files.forEach(file => {
        assetsFolder?.file(file.name, file.content);
      });
      
      // Create MainActivity.java
      const mainActivity = `package ${packageName};

import android.os.Bundle;
import android.webkit.WebChromeClient;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import androidx.appcompat.app.AppCompatActivity;

public class MainActivity extends AppCompatActivity {
    private WebView webView;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
        webView = new WebView(this);
        setContentView(webView);
        
        WebSettings webSettings = webView.getSettings();
        webSettings.setJavaScriptEnabled(true);
        webSettings.setDomStorageEnabled(true);
        webSettings.setAllowFileAccess(true);
        webSettings.setAllowContentAccess(true);
        webSettings.setMediaPlaybackRequiresUserGesture(false);
        
        webView.setWebChromeClient(new WebChromeClient());
        webView.setWebViewClient(new WebViewClient());
        
        webView.loadUrl("file:///android_asset/index.html");
    }

    @Override
    public void onBackPressed() {
        if (webView.canGoBack()) {
            webView.goBack();
        } else {
            super.onBackPressed();
        }
    }
}`;
      
      androidFolder?.folder(`app/src/main/java/${packageName.replace(/\./g, '/')}`)
        ?.file('MainActivity.java', mainActivity);
      
      // Create AndroidManifest.xml
      const manifest = `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="${packageName}">

    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />

    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="${appName}"
        android:theme="@style/AppTheme">
        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:configChanges="orientation|screenSize">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>

</manifest>`;
      
      androidFolder?.folder('app/src/main')?.file('AndroidManifest.xml', manifest);
      
      // Create build.gradle
      const buildGradle = `plugins {
    id 'com.android.application'
}

android {
    namespace '${packageName}'
    compileSdk 34

    defaultConfig {
        applicationId "${packageName}"
        minSdk 21
        targetSdk 34
        versionCode 1
        versionName "${version}"
    }

    buildTypes {
        release {
            minifyEnabled false
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
        }
    }
    compileOptions {
        sourceCompatibility JavaVersion.VERSION_1_8
        targetCompatibility JavaVersion.VERSION_1_8
    }
}

dependencies {
    implementation 'androidx.appcompat:appcompat:1.6.1'
    implementation 'com.google.android.material:material:1.9.0'
}`;
      
      androidFolder?.folder('app')?.file('build.gradle', buildGradle);
      
      // Create project build.gradle
      const projectBuildGradle = `// Top-level build file
plugins {
    id 'com.android.application' version '8.1.0' apply false
}`;
      
      androidFolder?.file('build.gradle', projectBuildGradle);
      
      // Create settings.gradle
      androidFolder?.file('settings.gradle', `include ':app'`);
      
      // Create README
      const readme = `# ${appName} - Android App

## Project Details
- **App Name**: ${appName}
- **Package**: ${packageName}
- **Version**: ${version}

## How to Build

### Option 1: Android Studio
1. Extract this ZIP file
2. Open Android Studio
3. Select "Open an existing Android Studio project"
4. Choose the 'android-app' folder
5. Wait for Gradle sync to complete
6. Build > Build Bundle(s) / APK(s) > Build APK(s)

### Option 2: Command Line
1. Extract this ZIP file
2. Navigate to the 'android-app' folder
3. Run: ./gradlew assembleDebug
4. APK will be in: app/build/outputs/apk/debug/

## Requirements
- Android Studio Arctic Fox or newer
- Android SDK 21 or higher
- Gradle 8.0 or higher

## Features
- Full WebView support
- JavaScript enabled
- Local file access
- Hardware back button support
`;
      
      androidFolder?.file('README.md', readme);
      
      // Generate ZIP
      const content = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(content);
      setDownloadUrl(url);
      setGenerated(true);
      
    } catch (error) {
      console.error('Error generating Android project:', error);
      alert('Error generating Android project. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadProject = () => {
    if (downloadUrl) {
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `${appName.replace(/\s+/g, '-').toLowerCase()}-android.zip`;
      link.click();
    }
  };

  return (
    <div className="h-full flex flex-col bg-[#252526] text-gray-300">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 bg-[#2d2d2d] border-b border-[#3c3c3c]">
        <Smartphone size={20} className="text-green-400" />
        <span className="font-semibold text-sm">Export to Android</span>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {!generated ? (
          <div className="space-y-4">
            <div className="bg-[#1e1e1e] rounded-lg p-4 border border-[#3c3c3c]">
              <h3 className="text-sm font-medium text-gray-400 mb-3">App Configuration</h3>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">App Name</label>
                  <input
                    type="text"
                    value={appName}
                    onChange={(e) => setAppName(e.target.value)}
                    className="w-full bg-[#2d2d2d] text-gray-300 text-sm px-3 py-2 rounded border border-[#3c3c3c] outline-none focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Package Name</label>
                  <input
                    type="text"
                    value={packageName}
                    onChange={(e) => setPackageName(e.target.value)}
                    className="w-full bg-[#2d2d2d] text-gray-300 text-sm px-3 py-2 rounded border border-[#3c3c3c] outline-none focus:border-blue-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">Format: com.company.appname</p>
                </div>
                
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Version</label>
                  <input
                    type="text"
                    value={version}
                    onChange={(e) => setVersion(e.target.value)}
                    className="w-full bg-[#2d2d2d] text-gray-300 text-sm px-3 py-2 rounded border border-[#3c3c3c] outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle size={18} className="text-blue-400 mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium text-blue-400">What happens next?</h4>
                  <ul className="text-xs text-gray-400 mt-2 space-y-1">
                    <li>• Android Studio project will be generated</li>
                    <li>• Your web files will be included as assets</li>
                    <li>• WebView-based app configuration</li>
                    <li>• Download and open in Android Studio</li>
                  </ul>
                </div>
              </div>
            </div>

            <button
              onClick={generateAndroidProject}
              disabled={isGenerating}
              className="w-full py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-700 text-white rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
            >
              {isGenerating ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Smartphone size={18} />
                  Generate Android Project
                </>
              )}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-6 text-center">
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check size={32} className="text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Project Generated!</h3>
              <p className="text-sm text-gray-400">
                Your Android Studio project is ready for download.
              </p>
            </div>

            <div className="bg-[#1e1e1e] rounded-lg p-4 border border-[#3c3c3c]">
              <h4 className="text-sm font-medium text-gray-400 mb-3">Next Steps</h4>
              <ol className="text-sm text-gray-300 space-y-2 list-decimal list-inside">
                <li>Download the ZIP file</li>
                <li>Extract it to your computer</li>
                <li>Open Android Studio</li>
                <li>Select "Open an existing project"</li>
                <li>Choose the extracted folder</li>
                <li>Build and run on your device!</li>
              </ol>
            </div>

            <button
              onClick={downloadProject}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
            >
              <Download size={18} />
              Download Project
            </button>

            <button
              onClick={() => {
                setGenerated(false);
                setDownloadUrl('');
              }}
              className="w-full py-2 text-gray-400 hover:text-white text-sm"
            >
              Generate Another Project
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
