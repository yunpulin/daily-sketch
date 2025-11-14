# Daily Sketching - Chrome Extension

A Chrome extension for daily drawing practice using local photo folders. Set custom intervals, shuffle photos, and track your sketching sessions—all data stays on your device.

## Features

- ⏱️ **Customizable Timer**: Set photo count, duration per photo, warm-up, and cool-down periods
- 🎲 **Shuffle Mode**: Randomize photo order for varied practice
- 📁 **Local Folder Support**: Select folders from your computer using the File System Access API
- 📊 **Session Tracking**: Keep track of your recent sessions
- 🎨 **Thumbnail View**: Browse all photos in a thumbnail grid
- 🔊 **Sound Packs**: Choose from multiple sound options or turn sounds off
- 🖼️ **Display Options**: Edge-to-edge (cover) mode and fullscreen support
- 💾 **Privacy First**: All data stored locally—nothing is transmitted to external servers

## Installation

### From Chrome Web Store
*(Coming soon - link will be added when published)*

### Manual Installation (Developer Mode)

1. Clone or download this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" (toggle in the top right)
4. Click "Load unpacked"
5. Select the folder containing this extension
6. The extension should now appear in your extensions list

## Usage

1. Click the extension icon in your Chrome toolbar
2. Click "Choose Folder" to select a folder containing your reference photos
3. Configure your settings:
   - Number of photos to practice with
   - Seconds per photo
   - Shuffle mode
   - Break intervals
   - Sound preferences
4. Click "Play" to start your practice session
5. Use keyboard shortcuts for quick navigation:
   - `Space` - Play/Pause
   - `→` - Next photo
   - `←` - Previous photo
   - `F` - Toggle fullscreen
   - `?` - Show help

## Permissions

- **Storage**: Used to save your settings and preferences locally
- **File System Access**: Used to read image files from folders you select (requires user interaction)

## Privacy

This extension operates entirely locally on your device. All data (settings, recent sessions, folder handles) is stored locally using Chrome's storage APIs and IndexedDB. No data is collected, transmitted, or shared with external servers.

See [PRIVACY_POLICY.md](PRIVACY_POLICY.md) for detailed information.

## Development

### Project Structure

```
daily-sketch/
├── manifest.json          # Extension manifest
├── background.js          # Service worker
├── timer.html            # Main UI
├── styles.css            # Stylesheet
├── icons/                # Extension icons
├── js/                   # JavaScript modules
│   ├── constants.js
│   ├── dom.js
│   ├── controls.js
│   ├── utils.js
│   ├── storage.js
│   ├── cache.js
│   ├── preload.js
│   ├── thumbnails.js
│   ├── folder.js
│   ├── sessions.js
│   ├── order.js
│   ├── render.js
│   ├── timer_engine.js
│   ├── hud.js
│   └── init.js
├── PRIVACY_POLICY.md     # Privacy policy (markdown)
└── privacy-policy.html   # Privacy policy (HTML, for hosting)
```

### Building for Distribution

1. Ensure all files are in place
2. Create a ZIP file containing:
   - `manifest.json`
   - `background.js`
   - `timer.html`
   - `styles.css`
   - `icons/` folder (all icon files)
   - `js/` folder (all JavaScript files)
3. Do not include:
   - `.git/` folder
   - `.gitignore`
   - `README.md`
   - `PRIVACY_POLICY.md` (unless needed)
   - `privacy-policy.html` (unless needed)
   - Any hidden files or development files

## Browser Compatibility

- Chrome 102+ (File System Access API support required)
- Edge 102+ (Chromium-based)

## License

See [LICENSE](LICENSE) file for details.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Support

For issues, questions, or feature requests, please use the GitHub Issues page.

---

**Note**: This extension requires the File System Access API, which is only available in Chromium-based browsers (Chrome, Edge) and requires user interaction to access folders.

