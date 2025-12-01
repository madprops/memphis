browser.browserAction.onClicked.addListener((tab) => {
    browser.tabs.sendMessage(tab.id, {action: `toggle_overlay`})
        .catch((error) => console.error(`Error sending message:`, error))
})

// Allow content scripts to call insecure slide endpoints through the background context
browser.runtime.onMessage.addListener((message, sender, send_response) => {
    if (message.action === `slide_fetch`) {
        fetch(message.endpoint, {method: `GET`})
            .then(async (response) => {
                let payload = (await response.text()).trim()

                send_response({
                    success: true,
                    payload,
                    ok: response.ok,
                    status: response.status,
                })
            })
            .catch((error) => {
                console.error(`Slide fetch failed`, error)
                send_response({success: false, error: error.message})
            })

        return true
    }
})