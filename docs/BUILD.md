# Ontrek Build Documentation

## Version
Current: **1.1.3**

## Build Commands

### Development Build (Debug)
```bash
# Run on Android
npx expo run:android

# Or directly with Gradle
cd android && ./gradlew assembleDebug
```

### Release Build (APK)
```bash
cd android && ./gradlew assembleRelease
```

### Android App Bundle (AAB) - for Play Store
```bash
cd android && ./gradlew bundleRelease
```

## Build Outputs

| Type | Location | Notes |
|------|----------|-------|
| Debug APK | `android/app/build/outputs/apk/debug/app-debug.apk` | Uses Metro for JS |
| Release APK | `android/app/build/outputs/apk/release/app-release.apk` | Standalone APK |
| Release AAB | `android/app/build/outputs/bundle/release/app-release.aab` | Play Store submission |

## Signing

### Keystore
- **Location:** `android/app/upload-keystore.jks`
- **Alias:** (stored locally, not in repo)
- **Password:** (stored in `gradle.properties` — not committed)

### Configuration
Located in `android/app/build.gradle`:
```groovy
signingConfigs {
    release {
        storeFile file('upload-keystore.jks')
        storePassword 'YOUR_PASSWORD'
        keyAlias 'YOUR_ALIAS'
        keyPassword 'YOUR_PASSWORD'
    }
}
```

**Note:** Signing config is stored in `gradle.properties` which is gitignored. The keystore file (`upload-keystore.jks`) is also gitignored.

## How Gradle Builds TypeScript

1. **Prebuild** (one-time, already done):
   ```bash
   npx expo prebuild
   ```

2. **Bundling**: During build, Expo CLI bundles TypeScript/JS:
   - Debug: Metro serves JS in real-time
   - Release: JS bundled into APK/AAB as `index.android.bundle`

3. **Verification**:
   ```bash
   # Check APK contains JS bundle
   unzip -l android/app/build/outputs/apk/release/app-release.apk | grep -i bundle
   ```

## EAS Build (Alternative)

For cloud builds:
```bash
# Preview build (internal testing)
eas build --platform android --profile preview

# Production build (for Play Store)
eas build --platform android --profile production
```

EAS config in `eas.json`:
```json
{
  "build": {
    "preview": { "distribution": "internal" },
    "production": {
      "distribution": "store",
      "android": { "buildType": "app-bundle" }
    }
  }
}
```

## Version Bumping

**IMPORTANT:** Version must be updated in TWO places for consistency:

1. `app.json` — update `version` (e.g., "1.2.0") AND `android.versionCode` (integer, must increment)
2. `package.json` — update `version` (e.g., "1.2.0")
3. `android/app/build.gradle` — update `versionName` (e.g., "1.2.0") AND `versionCode` (integer)

Example:
```json
// app.json
{
  "expo": {
    "version": "1.2.0",
    "android": {
      "versionCode": 6
    }
  }
}
```

```json
// package.json
{
  "version": "1.2.0"
}
```

```groovy
// android/app/build.gradle
android {
    defaultConfig {
        versionCode 6
        versionName "1.2.0"
    }
}
```

**Note:** `expo prebuild` regenerates the android folder from `app.json`. Always run `expo prebuild` after updating `app.json` to ensure android files stay in sync.

## Troubleshooting

- **Build fails**: Clear Gradle cache
  ```bash
  cd android && ./gradlew clean
  ```

- **JS not updating**: Clear Metro cache
  ```bash
  npx expo start --clear
  ```

- **Signing error**: Verify keystore exists at `android/app/upload-keystore.jks`