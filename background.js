// In Manifest V3, browserAction is replaced by action
browser.action.onClicked.addListener((tab) => {
  browser.tabs.sendMessage(tab.id, {action: `toggle_overlay`})
    .catch((error) => console.error(`Error sending message:`, error))
})