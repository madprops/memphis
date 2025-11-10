// Listen for messages from the background script
browser.runtime.onMessage.addListener((message) => {
    if (message.action === `toggle_overlay`) {
        toggle_overlay()
        return Promise.resolve({success: true})
    }
})

let overlay_on = false
let overlay = null
let middle_drag = {
    active: false,
    start_y: 0,
    target: null,
}
let MIDDLE_THRESHOLD = 20

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

document.addEventListener(`mousedown`, (event) => {
    if (event.button !== 1) {
        return
    }

    middle_drag.active = true
    middle_drag.start_y = event.clientY
    middle_drag.target = event.target
    event.preventDefault()
})

document.addEventListener(`mouseup`, (event) => {
    if (event.button !== 1) {
        return
    }

    if (!middle_drag.active) {
        return
    }

    let delta = middle_drag.start_y - event.clientY
    middle_drag.active = false

    if (Math.abs(delta) < MIDDLE_THRESHOLD) {
        return
    }

    if (delta > 0) {
        handle_middle_scroll(`top`, middle_drag.target)
    }
    else {
        handle_middle_scroll(`bottom`, middle_drag.target)
    }

    event.preventDefault()
})

document.addEventListener(`mouseleave`, () => {
    middle_drag.active = false
})

function handle_middle_scroll(direction, source) {
    let target = resolve_scroll_target(source)

    if (direction === `top`) {
        scroll_element(target, 0)
    }
    else {
        let bottom = get_scroll_bottom(target)
        scroll_element(target, bottom)
    }
}

function resolve_scroll_target(node) {
    let current = node

    while (current && current !== document.body) {
        let style = window.getComputedStyle(current)
        let overflow_y = style ? style.overflowY : ``

        if (current.scrollHeight > current.clientHeight && overflow_y !== `visible`) {
            return current
        }

        current = current.parentElement
    }

    return document.scrollingElement || document.documentElement || document.body
}

function scroll_element(target, value) {
    if (!target) {
        return
    }

    if (target === document.body || target === document.documentElement) {
        window.scrollTo({top: value, behavior: 'smooth'})
        return
    }

    target.scrollTo({top: value, behavior: 'smooth'})
}

function get_scroll_bottom(target) {
    if (!target) {
        return 0
    }

    if (target === document.body || target === document.documentElement) {
        let element = document.scrollingElement || document.documentElement || document.body
        return element.scrollHeight
    }

    return target.scrollHeight - target.clientHeight
}