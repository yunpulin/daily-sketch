// Opens timer.html in a new tab when you click the extension icon.
chrome.action.onClicked.addListener(() => {
  chrome.tabs.create({ url: chrome.runtime.getURL('timer.html') });
});
