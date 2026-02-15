# Chrome Web Store Privacy Information Form

Use this information to fill out the Chrome Web Store privacy form.

---

## 1. Single Purpose Description

**Answer (copy this):**

This extension provides a timer for daily drawing practice sessions using local photo folders. Users can select folders from their computer, configure timer intervals (photo count, duration per photo, breaks), and practice drawing with automatic photo rotation. The extension displays images from locally selected folders, provides audio cues for transitions, and tracks recent sessions for quick access—all data remains on the user's device.

---

## 2. Storage Permission Justification

**Answer (copy this):**

The `storage` permission is required to save user preferences and settings locally on their device. This includes:
- Timer configuration (photo count, duration per photo, warm-up/cool-down periods)
- Display preferences (thumbnail size, cover mode, fullscreen settings)
- Sound pack selection
- Shuffle and subfolder inclusion preferences
- Break interval settings

All data is stored locally using Chrome's `chrome.storage` API and is never transmitted to external servers. The extension also uses IndexedDB (which doesn't require explicit permission) to store recent session folder handles for quick access to previously used folders. Without the storage permission, users would need to reconfigure all settings each time they use the extension.

---

## 3. Remote Code

**Answer:** Select **"No, I am not using Remote code"**

**Justification (if asked):**

All JavaScript code is included directly in the extension package. The extension does not:
- Load external JavaScript files via `<script>` tags
- Use dynamic imports pointing to external URLs
- Execute code via `eval()` or similar functions
- Load WebAssembly modules from external sources

All functionality is self-contained within the extension's packaged files.

---

## 4. Data Usage

### What user data do you plan to collect?

**Answer:** Check **NONE** of the boxes. The extension does not collect any of the listed data types.

**Explanation:**

The extension only stores local data on the user's device:
- **Settings and preferences** (timer intervals, display options, sound preferences) - stored locally using Chrome Storage API
- **Recent session folder handles** - stored locally in IndexedDB for quick access to previously selected folders
- **Folder names and timestamps** - stored locally to display recent sessions

**Important:** 
- No data is transmitted to external servers
- No data is shared with third parties
- All data remains on the user's device
- The extension only accesses folders the user explicitly selects via the File System Access API

### Certifications

**Check all three boxes:**

✅ **I do not sell or transfer user data to third parties, outside of the approved use cases**

✅ **I do not use or transfer user data for purposes that are unrelated to my item's single purpose**

✅ **I do not use or transfer user data to determine creditworthiness or for lending purposes**

---

## 5. Privacy Policy URL

**Answer (copy this):**

```
https://raw.githubusercontent.com/yunpulin/daily-sketch/main/privacy-policy.html
```

**Note:** This is the raw GitHub URL that serves the HTML privacy policy as a rendered webpage. Make sure this URL is publicly accessible before submitting.

---

## Summary Checklist

Before submitting, verify:

- [ ] Single purpose description is clear and under 1,000 characters
- [ ] Storage permission justification explains why it's needed
- [ ] Remote code is set to "No"
- [ ] No data collection boxes are checked
- [ ] All three certification boxes are checked
- [ ] Privacy policy URL is accessible and renders correctly
- [ ] Privacy policy accurately describes the extension's data handling

---

## Additional Notes

- The extension uses the File System Access API (via user interaction) to read image files from folders users select. This is not a permission that needs to be declared in the manifest, but it's mentioned in the privacy policy.

- All data storage is local-only:
  - `chrome.storage` API for settings
  - `localStorage` for application preferences
  - `IndexedDB` for recent session folder handles

- The extension does not make any network requests or transmit data externally.

