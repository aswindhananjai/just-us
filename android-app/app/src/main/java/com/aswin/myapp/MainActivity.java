package com.aswin.myapp;

import android.Manifest;
import android.app.Activity;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.Environment;
import android.provider.MediaStore;
import android.webkit.JavascriptInterface;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.view.KeyEvent;
import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;
import androidx.core.content.FileProvider;

import java.io.File;
import java.io.IOException;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Locale;

public class MainActivity extends Activity {
    private WebView webView;
    private static final String URL = "https://just-us-seven-theta.vercel.app/";
    private static final int REQUEST_PERMISSIONS = 100;
    private static final int FILE_CHOOSER_REQUEST_CODE = 101;

    private ValueCallback<Uri[]> filePathCallback;
    private Uri cameraPhotoUri;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        webView = findViewById(R.id.webview);

        // Request permissions at startup
        requestNecessaryPermissions();

        // Configure WebView settings
        WebSettings webSettings = webView.getSettings();
        webSettings.setJavaScriptEnabled(true);
        webSettings.setDomStorageEnabled(true);
        webSettings.setLoadWithOverviewMode(true);
        webSettings.setUseWideViewPort(true);
        webSettings.setBuiltInZoomControls(false);
        webSettings.setDisplayZoomControls(false);
        webSettings.setSupportZoom(false);
        webSettings.setDefaultTextEncodingName("utf-8");
        webSettings.setCacheMode(WebSettings.LOAD_DEFAULT);
        webSettings.setAllowFileAccess(true);
        webSettings.setAllowContentAccess(true);

        // Add JavaScript interface for native Android calls
        webView.addJavascriptInterface(new AndroidInterface(), "Android");

        // Set WebViewClient to handle page navigation
        webView.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, String url) {
                view.loadUrl(url);
                return true;
            }
        });

        // Set WebChromeClient to handle file upload
        webView.setWebChromeClient(new WebChromeClient() {
            @Override
            public boolean onShowFileChooser(WebView webView, ValueCallback<Uri[]> filePathCallback, FileChooserParams fileChooserParams) {
                if (MainActivity.this.filePathCallback != null) {
                    MainActivity.this.filePathCallback.onReceiveValue(null);
                }
                MainActivity.this.filePathCallback = filePathCallback;

                // Check if the file chooser is requesting camera capture
                boolean captureEnabled = false;
                if (fileChooserParams.getAcceptTypes() != null) {
                    for (String type : fileChooserParams.getAcceptTypes()) {
                        if (type.contains("image")) {
                            captureEnabled = fileChooserParams.isCaptureEnabled();
                            break;
                        }
                    }
                }

                Intent chooserIntent = null;

                if (captureEnabled) {
                    // Launch camera directly
                    Intent cameraIntent = new Intent(MediaStore.ACTION_IMAGE_CAPTURE);
                    if (cameraIntent.resolveActivity(getPackageManager()) != null) {
                        File photoFile = null;
                        try {
                            photoFile = createImageFile();
                        } catch (IOException ex) {
                            // Error occurred while creating the File
                        }

                        if (photoFile != null) {
                            cameraPhotoUri = FileProvider.getUriForFile(MainActivity.this,
                                    "com.aswin.myapp.fileprovider",
                                    photoFile);
                            cameraIntent.putExtra(MediaStore.EXTRA_OUTPUT, cameraPhotoUri);

                            // Also create a gallery chooser as fallback
                            Intent galleryIntent = new Intent(Intent.ACTION_GET_CONTENT);
                            galleryIntent.addCategory(Intent.CATEGORY_OPENABLE);
                            galleryIntent.setType("image/*");

                            chooserIntent = Intent.createChooser(galleryIntent, "Choose Photo");
                            chooserIntent.putExtra(Intent.EXTRA_INITIAL_INTENTS, new Intent[]{cameraIntent});
                        }
                    }
                } else {
                    // Regular file chooser
                    Intent intent = fileChooserParams.createIntent();
                    chooserIntent = intent;
                }

                try {
                    startActivityForResult(chooserIntent, FILE_CHOOSER_REQUEST_CODE);
                } catch (Exception e) {
                    MainActivity.this.filePathCallback = null;
                    return false;
                }
                return true;
            }
        });

        // Load the website
        webView.loadUrl(URL);
    }

    private void requestNecessaryPermissions() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            // Build permissions list based on Android version
            java.util.ArrayList<String> permissionsList = new java.util.ArrayList<>();
            permissionsList.add(Manifest.permission.CAMERA);
            permissionsList.add(Manifest.permission.READ_EXTERNAL_STORAGE);

            // Add notification permission for Android 13+
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                permissionsList.add(Manifest.permission.POST_NOTIFICATIONS);
            }

            String[] permissions = permissionsList.toArray(new String[0]);

            boolean allGranted = true;
            for (String permission : permissions) {
                if (ContextCompat.checkSelfPermission(this, permission) != PackageManager.PERMISSION_GRANTED) {
                    allGranted = false;
                    break;
                }
            }

            if (!allGranted) {
                ActivityCompat.requestPermissions(this, permissions, REQUEST_PERMISSIONS);
            }
        }
    }

    public void requestNotificationPermission() {
        // Request notification permission for Android 13+
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            if (ContextCompat.checkSelfPermission(this, Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED) {
                ActivityCompat.requestPermissions(this, new String[]{Manifest.permission.POST_NOTIFICATIONS}, REQUEST_PERMISSIONS);
            }
        }
    }

    private File createImageFile() throws IOException {
        // Create an image file name
        String timeStamp = new SimpleDateFormat("yyyyMMdd_HHmmss", Locale.US).format(new Date());
        String imageFileName = "JPEG_" + timeStamp + "_";
        File storageDir = getExternalFilesDir(Environment.DIRECTORY_PICTURES);
        return File.createTempFile(imageFileName, ".jpg", storageDir);
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);

        if (requestCode == FILE_CHOOSER_REQUEST_CODE) {
            if (filePathCallback == null) {
                return;
            }

            Uri[] results = null;
            if (resultCode == RESULT_OK) {
                if (data != null && data.getDataString() != null) {
                    // File selected from gallery
                    String dataString = data.getDataString();
                    results = new Uri[]{Uri.parse(dataString)};
                } else if (data != null && data.getClipData() != null) {
                    // Multiple files selected
                    int count = data.getClipData().getItemCount();
                    results = new Uri[count];
                    for (int i = 0; i < count; i++) {
                        results[i] = data.getClipData().getItemAt(i).getUri();
                    }
                } else if (cameraPhotoUri != null) {
                    // Photo taken from camera
                    results = new Uri[]{cameraPhotoUri};
                }
            }

            filePathCallback.onReceiveValue(results);
            filePathCallback = null;
            cameraPhotoUri = null;
        }
    }

    @Override
    public boolean onKeyDown(int keyCode, KeyEvent event) {
        // Handle back button to navigate back in WebView
        if (event.getAction() == KeyEvent.ACTION_DOWN) {
            if (keyCode == KeyEvent.KEYCODE_BACK) {
                if (webView.canGoBack()) {
                    webView.goBack();
                } else {
                    finish();
                }
                return true;
            }
        }
        return super.onKeyDown(keyCode, event);
    }

    // JavaScript Interface for web app to call Android methods
    private class AndroidInterface {
        @JavascriptInterface
        public void requestNotificationPermission() {
            runOnUiThread(new Runnable() {
                @Override
                public void run() {
                    MainActivity.this.requestNotificationPermission();
                }
            });
        }
    }
}
