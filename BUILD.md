# Testing & APK Build Guide

## Testing

### Run Tests

```bash
# Run tests once
pnpm test:run

# Run tests in watch mode
pnpm test

# Run tests with UI
pnpm test:ui
```

### Test Coverage

Tests are located in `src/test/` directory:
- `store.test.js` - Unit tests for state management (store.js)
- `setup.js` - Test setup with mocks for localStorage and events

Current test coverage includes:
- State management (getState, addTodo, updateTodo)
- Todo filtering by date
- Monthly task completion logic
- Streak calculation
- Event listener management (onChange, offChange)

## APK Build with Capacitor

### Prerequisites

1. **Android Studio** - Install Android Studio for Android SDK and build tools
2. **Java JDK** - Install JDK 17 or higher
3. **Environment Variables**:
   ```bash
   export ANDROID_HOME=$HOME/Library/Android/sdk
   export PATH=$PATH:$ANDROID_HOME/emulator
   export PATH=$PATH:$ANDROID_HOME/tools
   export PATH=$PATH:$ANDROID_HOME/tools/bin
   export PATH=$PATH:$ANDROID_HOME/platform-tools
   ```

### Build APK

#### Option 1: Build APK via Gradle (Recommended)

```bash
# Build the web app and sync with Android
pnpm android:build
```

This will:
1. Build the Astro app to `dist/`
2. Sync the web assets with Android project
3. Build the debug APK using Gradle

The APK will be located at: `android/app/build/outputs/apk/debug/app-debug.apk`

#### Option 2: Manual Build Steps

```bash
# 1. Build the web app
pnpm build

# 2. Sync with Capacitor
pnpm cap:sync

# 3. Open Android Studio (for manual build)
pnpm cap:open:android
```

In Android Studio:
1. Wait for Gradle sync to complete
2. Go to **Build > Build Bundle(s) / APK(s) > Build APK(s)**
3. The APK will be in `android/app/build/outputs/apk/debug/`

### Install APK on Device

#### Via ADB (Android Debug Bridge)

```bash
# Connect device via USB with USB debugging enabled
adb devices

# Install APK
adb install android/app/build/outputs/apk/debug/app-debug.apk
```

#### Via File Transfer

1. Copy `android/app/build/outputs/apk/debug/app-debug.apk` to your device
2. Open the APK file on your Android device
3. Allow installation from unknown sources if prompted
4. Install the app

### Capacitor Configuration

Configuration is in `capacitor.config.json`:

```json
{
  "appId": "com.dailysprout.app",
  "appName": "DailySprout",
  "webDir": "dist"
}
```

### Common Issues

#### Gradle sync fails
- Make sure Android SDK is installed
- Check that `ANDROID_HOME` environment variable is set
- Update Android Studio and SDK tools

#### Build fails with "dist directory not found"
- Run `pnpm build` first to create the `dist/` directory

#### App doesn't load content
- Make sure `pnpm build` completed successfully
- Run `pnpm cap:sync` to update the native project

### Release Build (Production)

For a release APK (signed):

1. Open Android Studio: `pnpm cap:open:android`
2. Go to **Build > Generate Signed Bundle / APK**
3. Follow the signing wizard
4. Choose **APK** and **release** build variant
5. The release APK will be in `android/app/build/outputs/apk/release/`

### Updating the App

After making changes to the web app:

```bash
# Rebuild and sync
pnpm build
pnpm cap:sync

# Rebuild APK
pnpm android:build
```

## Development Workflow

1. Make changes to the code
2. Run tests: `pnpm test:run`
3. Test in browser: `pnpm dev`
4. Build for production: `pnpm build`
5. Build APK: `pnpm android:build`
6. Install and test on device
