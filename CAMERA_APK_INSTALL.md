# Just Us v2 - Camera & Password Fix

## What's New in This APK?

This updated APK (`just-us-v2.apk`) includes major improvements!

### New Features:
- ✅ **Direct Camera Launch**: When you click "Take Photo" in the meal log form, it now opens your camera app directly
- ✅ **Smart Chooser**: Shows both "Camera" and "Choose from Gallery" options
- ✅ **Full Camera Permissions**: Properly configured Android permissions for camera access
- ✅ **FileProvider Support**: Secure file handling for camera photos
- ✅ **No Password Re-prompt on Camera**: App won't ask for password when returning from camera/file picker (within 3 seconds)
- ✅ **Smart Security**: Still locks app when going to background for longer periods (>3 seconds)

## Installation Steps

### 1. Uninstall the Old App (Important!)
Before installing the new APK, you **must** uninstall the previous version:
- Go to Settings → Apps → Just Us (or your app name)
- Tap "Uninstall"
- Confirm uninstallation

### 2. Install the New APK
1. Transfer `just-us-v2.apk` to your Android device
2. Open the APK file on your device
3. If prompted, allow installation from unknown sources
4. Tap "Install"
5. Wait for installation to complete

### 3. Grant Permissions
On first launch, the app will request:
- ✅ Camera permission
- ✅ Storage permission (for saving photos)
- ✅ Notification permission (if on Android 13+)

**Make sure to ALLOW all permissions** for the camera feature to work!

## How to Use Camera Feature

1. Open the app and go to "Challenges"
2. Click on a challenge to view details
3. Tap the "Log a meal" button
4. Click on the photo upload area
5. You'll see two options:
   - **Take Photo** ← Opens camera directly! 📷
   - **Choose from Gallery** ← Opens photo picker

6. Take your photo with the camera
7. Fill in the meal details
8. Save the log!

## Technical Details

### Android Permissions Added:
```xml
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
<uses-feature android:name="android.hardware.camera" android:required="false" />
```

### Changes Made:
1. **MainActivity.java**: Enhanced WebView file chooser to detect camera capture requests
2. **FileProvider**: Added for secure camera photo handling
3. **Camera Intent**: Direct camera launch when `capture="environment"` attribute is detected

## Troubleshooting

### Camera doesn't open?
- Check that you granted camera permission in Settings → Apps → Just Us → Permissions
- Restart the app after granting permissions

### Photos not saving?
- Check storage permission is granted
- Make sure you have enough storage space on your device

### App won't install?
- Make sure you uninstalled the old version first
- Enable "Install from Unknown Sources" in your Android settings

## What Changed?

### Web App (src/App.jsx):
- Updated auto-lock behavior to exclude quick app switches (like camera)
- Added 3-second grace period before re-locking
- Maintains security for actual backgrounding

### Android App (MainActivity.java):
- Enhanced file chooser to detect camera capture intent
- Direct camera launch using MediaStore.ACTION_IMAGE_CAPTURE
- FileProvider integration for secure photo handling

## File Location
APK file: `just-us-v2.apk` (3.0 MB)

Build date: July 28, 2026
Version: 2.0
