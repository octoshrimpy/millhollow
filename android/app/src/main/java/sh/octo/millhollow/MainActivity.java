package sh.octo.millhollow;

import android.app.Activity;
import android.content.Intent;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.view.WindowInsets;
import android.widget.FrameLayout;
import android.webkit.JavascriptInterface;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import java.io.IOException;
import java.io.OutputStream;
import java.nio.charset.StandardCharsets;
import java.util.Map;

// The game is the web page, served from the APK's assets under a fixed https origin so the
// save in localStorage stays put between runs.
public class MainActivity extends Activity {
  private static final String HOST = "appassets.androidplatform.net";
  private static final int SAVE = 1, OPEN = 2;
  private static final Map<String, String> TYPES = Map.of("html", "text/html", "js", "text/javascript",
      "css", "text/css", "avif", "image/avif", "png", "image/png", "webmanifest", "application/manifest+json");

  private WebView web;
  private String pending;
  private ValueCallback<Uri[]> picked;

  @Override protected void onCreate(Bundle state) {
    super.onCreate(state);
    web = new WebView(this);
    web.setBackgroundColor(0xff14110e);
    WebSettings s = web.getSettings();
    s.setJavaScriptEnabled(true);
    s.setDomStorageEnabled(true);
    s.setAllowFileAccess(false);
    s.setAllowContentAccess(false);
    web.addJavascriptInterface(new Bridge(), "Android");
    web.setWebViewClient(new WebViewClient() {
      @Override public WebResourceResponse shouldInterceptRequest(WebView v, WebResourceRequest r) {
        Uri u = r.getUrl();
        if (!HOST.equals(u.getHost())) return null;
        String path = u.getPath() == null || u.getPath().equals("/") ? "index.html" : u.getPath().substring(1);
        String ext = path.substring(path.lastIndexOf('.') + 1);
        try {
          return new WebResourceResponse(TYPES.getOrDefault(ext, "application/octet-stream"), null, getAssets().open(path));
        } catch (IOException e) {
          return new WebResourceResponse("text/plain", null, 404, "Not Found", null, null);
        }
      }
      @Override public boolean shouldOverrideUrlLoading(WebView v, WebResourceRequest r) {
        if (HOST.equals(r.getUrl().getHost())) return false;
        startActivity(new Intent(Intent.ACTION_VIEW, r.getUrl()));
        return true;
      }
    });
    web.setWebChromeClient(new WebChromeClient() {
      @Override public boolean onShowFileChooser(WebView v, ValueCallback<Uri[]> cb, FileChooserParams p) {
        picked = cb;
        Intent i = new Intent(Intent.ACTION_OPEN_DOCUMENT).addCategory(Intent.CATEGORY_OPENABLE).setType("*/*");
        startActivityForResult(i, OPEN);
        return true;
      }
    });
    // Keep the page clear of the status and navigation bars. A WebView ignores its own padding,
    // so the frame around it takes the insets.
    FrameLayout frame = new FrameLayout(this);
    frame.setBackgroundColor(0xff14110e);
    frame.addView(web);
    frame.setOnApplyWindowInsetsListener((v, in) -> {
      if (Build.VERSION.SDK_INT >= 30) {
        android.graphics.Insets i = in.getInsets(WindowInsets.Type.systemBars() | WindowInsets.Type.ime());
        v.setPadding(i.left, i.top, i.right, i.bottom);
      } else {
        v.setPadding(in.getSystemWindowInsetLeft(), in.getSystemWindowInsetTop(), in.getSystemWindowInsetRight(), in.getSystemWindowInsetBottom());
      }
      return in;
    });
    setContentView(frame);
    if (state != null) web.restoreState(state);
    else web.loadUrl("https://" + HOST + "/index.html");
  }

  @Override protected void onSaveInstanceState(Bundle out) { super.onSaveInstanceState(out); web.saveState(out); }

  @Override protected void onActivityResult(int req, int res, Intent data) {
    Uri u = res == RESULT_OK && data != null ? data.getData() : null;
    if (req == OPEN && picked != null) { picked.onReceiveValue(u == null ? null : new Uri[] { u }); picked = null; }
    if (req == SAVE && u != null && pending != null) {
      try (OutputStream o = getContentResolver().openOutputStream(u)) { o.write(pending.getBytes(StandardCharsets.UTF_8)); }
      catch (IOException | NullPointerException ignored) { }
      pending = null;
    }
  }

  // What the page can't do from a WebView by itself: save a file where the player chooses.
  class Bridge {
    @JavascriptInterface public void saveFile(String name, String text) {
      pending = text;
      runOnUiThread(() -> startActivityForResult(new Intent(Intent.ACTION_CREATE_DOCUMENT)
          .addCategory(Intent.CATEGORY_OPENABLE).setType("text/plain").putExtra(Intent.EXTRA_TITLE, name), SAVE));
    }
  }
}
