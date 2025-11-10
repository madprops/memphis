// Listen for messages from the background script
browser.runtime.onMessage.addListener((message) => {
    if (message.action === `toggle_overlay`) {
        toggle_overlay()
        return Promise.resolve({success: true})
    }
})

let overlay_on = false
let overlay = null

// Middle click drag scroll functionality
let is_middle_dragging = false
let drag_start_y = 0
let scroll_threshold = 20

document.addEventListener(`mousedown`, (e) => {
    if (e.button === 1) {
        is_middle_dragging = true
        drag_start_y = e.clientY
    }
}, true)

document.addEventListener(`mousemove`, (e) => {
    if (is_middle_dragging) {
        e.preventDefault()
    }
}, true)

document.addEventListener(`mouseup`, (e) => {
    if (is_middle_dragging && e.button === 1) {
        let drag_distance = drag_start_y - e.clientY

        if (Math.abs(drag_distance) > scroll_threshold) {
            if (drag_distance > 0) {
                window.scrollTo({top: 0, behavior: `smooth`})
            }
            else {
                window.scrollTo({top: document.documentElement.scrollHeight, behavior: `smooth`})
            }
        }

        is_middle_dragging = false
        drag_start_y = 0
        e.preventDefault()
    }
}, true)


// Function to toggle the overlay
function toggle_overlay() {
    if (overlay_on) {
        if (overlay) {
            overlay.remove()
            overlay = null
        }

        overlay_on = false
    }
    else {
        overlay = document.createElement(`div`)
        overlay.style.position = `fixed`
        overlay.style.top = `0`
        overlay.style.left = `0`
        overlay.style.width = `100%`
        overlay.style.height = `100%`
        overlay.style.backgroundColor = `teal`
        overlay.style.zIndex = `2147483647`
        document.body.appendChild(overlay)
        overlay_on = true
    }
}