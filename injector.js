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
let drag_origin_element = null
let scroll_threshold = 20

document.addEventListener(`mousedown`, (e) => {
    if (e.button !== 1) {
        return
    }

    if (should_ignore_middle_click(e.target)) {
        is_middle_dragging = false
        drag_origin_element = null
        return
    }

    is_middle_dragging = true
    drag_start_y = e.clientY
    drag_origin_element = e.target
}, true)

document.addEventListener(`mousemove`, (e) => {
    if (!is_middle_dragging) {
        return
    }

    let drag_distance = Math.abs(drag_start_y - e.clientY)

    if (drag_distance > scroll_threshold) {
        e.preventDefault()
    }
}, true)

document.addEventListener(`mouseup`, (e) => {
    if (!is_middle_dragging || e.button !== 1) {
        return
    }

    let drag_distance = drag_start_y - e.clientY
    let handled = false

    if (Math.abs(drag_distance) > scroll_threshold) {
        if (drag_distance > 0) {
            scroll_to_limit(drag_origin_element || e.target, `top`)
        }
        else {
            scroll_to_limit(drag_origin_element || e.target, `bottom`)
        }

        handled = true
    }

    is_middle_dragging = false
    drag_start_y = 0
    drag_origin_element = null

    if (handled) {
        e.preventDefault()
    }
}, true)

let should_ignore_middle_click = (element) => {
    let el = element

    while (el) {
        if (el.nodeType !== 1) {
            el = el.parentElement
            continue
        }

        let tag = el.tagName

        if (tag === `INPUT` || tag === `TEXTAREA` || tag === `SELECT`) {
            return true
        }

        if (el.isContentEditable) {
            return true
        }

        el = el.parentElement
    }

    return false
}

const SCROLLABLE_OVERFLOW_VALUES = [
    `auto`,
    `scroll`,
    `overlay`,
]

let can_scroll = (element) => {
    if (!element) {
        return false
    }

    if (element === document.body || element === document.documentElement) {
        return true
    }

    let style = window.getComputedStyle(element)

    if (!style) {
        return false
    }

    let overflow_y = style.overflowY
    let overflow = style.overflow

    if (!SCROLLABLE_OVERFLOW_VALUES.includes(overflow_y) && !SCROLLABLE_OVERFLOW_VALUES.includes(overflow)) {
        return false
    }

    return element.scrollHeight > element.clientHeight
}

let find_scroll_target = (element) => {
    let el = element

    while (el) {
        if (can_scroll(el)) {
            return el
        }

        el = el.parentElement
    }

    return document.scrollingElement || document.documentElement
}

let scroll_to_limit = (element, position) => {
    let target = find_scroll_target(element)

    if (!target) {
        return
    }

    let to_top = position === `top`

    if (target === document.body || target === document.documentElement || target === document.scrollingElement) {
        let max_top = Math.max((target.scrollHeight - window.innerHeight), 0)
        let top_value = to_top ? 0 : max_top
        window.scrollTo({top: top_value, behavior: `smooth`})
        return
    }

    let desired_top = to_top ? 0 : Math.max((target.scrollHeight - target.clientHeight), 0)

    if (typeof target.scrollTo === `function`) {
        target.scrollTo({top: desired_top, behavior: `smooth`})
        return
    }

    target.scrollTop = desired_top
}


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