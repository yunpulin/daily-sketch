# Privacy Policy for Daily Sketching Extension

**Last Updated:** [2025-11-14]

## Overview

Daily Sketching is a Chrome extension that provides a timer for practicing drawing with local photo folders. This privacy policy explains how the extension handles your data.

## Data Collection and Storage

### Local Storage Only

**All data is stored locally on your device. No data is transmitted to external servers or third parties.**

The extension uses the following local storage mechanisms:

1. **Chrome Storage API** (`chrome.storage`)
   - Stores your timer settings (photo count, duration, sound preferences, etc.)
   - Stored locally in your browser

2. **IndexedDB**
   - Stores recent session information:
     - Folder names you've selected
     - Folder handles (for quick access to previously used folders)
     - Timestamps of when folders were last accessed
   - Limited to the 10 most recent sessions
   - All data remains on your device

3. **LocalStorage**
   - Stores application settings and preferences
   - Stored locally in your browser

### File System Access

The extension uses the **File System Access API** to:
- Allow you to select local folders containing photos
- Read image files from your selected folders
- Display images for your drawing practice

**Important:**
- The extension only accesses folders you explicitly select
- No files are modified, copied, or uploaded
- Folder access requires your explicit permission each time
- Folder handles are stored locally (in IndexedDB) only to enable quick access to recently used folders

## Permissions

The extension requests the following permissions:

- **Storage**: Used to save your settings and preferences locally
- **File System Access** (via user interaction): Used to read image files from folders you select

## Data Sharing

**We do not collect, share, or transmit any data to external servers or third parties.** All data remains on your device.

## Data Deletion

You can delete stored data at any time by:
- Removing the extension from Chrome (this deletes all stored data)
- Clearing your browser's storage data for the extension
- Using the extension's settings to clear recent sessions

## Changes to This Policy

If we make changes to this privacy policy, we will update the "Last Updated" date at the top of this document.

## Contact

If you have questions about this privacy policy or how the extension handles your data, please contact us through the Chrome Web Store listing or the extension's support channel.

## Compliance

This extension complies with:
- Chrome Web Store Developer Program Policies
- General Data Protection Regulation (GDPR) - as no personal data is collected or transmitted
- All data processing occurs locally on your device

---

**Summary:** Your privacy is important to us. This extension operates entirely locally on your device and does not collect, transmit, or share any data with external parties.

