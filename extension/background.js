// AutoPrácticas - Background Service Worker

// Initialize badge on install
chrome.runtime.onInstalled.addListener(async () => {
  const result = await chrome.storage.local.get(['capturedEmails']);
  const count = (result.capturedEmails || []).length;
  updateBadge(count);
});

// Listen for messages from content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'updateBadge') {
    updateBadge(message.count);
  }
  return true;
});

// Update badge with count
function updateBadge(count) {
  if (count > 0) {
    chrome.action.setBadgeText({ text: count.toString() });
    chrome.action.setBadgeBackgroundColor({ color: '#6366f1' });
  } else {
    chrome.action.setBadgeText({ text: '' });
  }
}

// Update badge when storage changes
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === 'local' && changes.capturedEmails) {
    const newCount = (changes.capturedEmails.newValue || []).length;
    updateBadge(newCount);
  }
});
