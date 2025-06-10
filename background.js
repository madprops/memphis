browser.browserAction.onClicked.addListener((tab) => {
    browser.tabs.sendMessage(tab.id, {action: `toggle_overlay`})
        .catch(error => console.error(`Error sending message:`, error))
})