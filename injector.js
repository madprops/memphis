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

let middle_threshold = 20

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

    if (Math.abs(delta) < middle_threshold) {
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

let monitoring_interval = null

// 1. Initialize the watcher immediately on load
// We do this because you might have navigated to this page FROM the queue script
// and we need to keep watching for the NEXT video in the list.
start_monitoring()

window.addEventListener(`paste`, (e) => {
  let current_url = window.location.href
  let is_watching = (current_url.includes(`youtube.com/watch`) || current_url.includes(`youtu.be/`))

  if (!is_watching) {
    return
  }

  let active = document.activeElement
  let tag = active.tagName.toLowerCase()
  let is_editable = active.isContentEditable

  if ((tag === `input`) || (tag === `textarea`) || is_editable) {
    return
  }

  let paste_data = (e.clipboardData || window.clipboardData).getData(`text`)
  let youtube_regex = /^(https?:\/\/)?((www\.)?youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/

  let match = paste_data.match(youtube_regex)

  if (match) {
    e.preventDefault()
    let video_id = match[4]
    show_queue_prompt(video_id)
  }
})

let show_queue_prompt = (video_id) => {
  let prompt_container = document.createElement(`div`)
  let img_path = browser.runtime.getURL(`img/paste.jpg`)

  // I added a "Queue Count" indicator to the prompt text
  browser.storage.local.get({video_queue: []}).then((result) => {
    let current_count = result.video_queue.length

    prompt_container.innerHTML = `
      <div style="position:fixed;bottom:20px;right:20px;z-index:9999;background:#181818;color:white;padding:15px;border-radius:12px;box-shadow:0 4px 15px rgba(0,0,0,0.6);text-align:center;border:1px solid #333;font-family:Roboto, Arial, sans-serif;">
        <img src="${img_path}" style="width:180px;display:block;margin:0 auto 10px;border-radius:8px;">
        <p style="margin:10px 0;font-size:14px;">Nani?! Queue this video?</p>
        <p style="font-size:11px;color:#aaa;margin-bottom:10px;">${current_count} videos currently waiting</p>

        <div style="display:flex;justify-content:center;gap:10px;">
          <button id="confirm_queue" style="background:#3ea6ff;color:black;border:none;padding:8px 16px;border-radius:18px;cursor:pointer;font-weight:bold;">Yes!</button>
          <button id="cancel_queue" style="background:transparent;color:white;border:1px solid #aaa;padding:8px 16px;border-radius:18px;cursor:pointer;">No</button>
        </div>
      </div>
    `

    document.body.appendChild(prompt_container)

    document.getElementById(`confirm_queue`).onclick = () => {
      add_to_storage_queue(video_id)
      prompt_container.remove()
    }

    document.getElementById(`cancel_queue`).onclick = () => {
      prompt_container.remove()
    }
  })
}

// Helper to push to the array in storage
let add_to_storage_queue = (video_id) => {
  browser.storage.local.get({video_queue: []}).then((result) => {
    let queue = result.video_queue
    queue.push(video_id)

    browser.storage.local.set({video_queue: queue}).then(() => {
      show_toast(`Added to queue! (${queue.length} videos total)`)
    })
  })
}

let show_toast = (message) => {
  let toast = document.createElement(`div`)
  toast.innerHTML = message
  toast.style.cssText = `position:fixed;top:20px;left:50%;transform:translateX(-50%);background:rgba(0,0,0,0.8);color:white;padding:10px 20px;border-radius:5px;z-index:10000;font-family:sans-serif;pointer-events:none;transition:opacity 0.5s;`
  document.body.appendChild(toast)

  setTimeout(() => {
    toast.style.opacity = 0
    setTimeout(() => toast.remove(), 500)
  }, 3000)
}

function start_monitoring() {
  if (monitoring_interval) {
    clearInterval(monitoring_interval)
  }

  monitoring_interval = setInterval(() => {
    let video = document.querySelector(`video`)

    // Only check if video is playing and near the end
    if (video && (video.duration > 0) && !video.paused && !video.ended) {
      let time_left = video.duration - video.currentTime

      if (time_left < 1.0) {
        // Stop checking immediately so we don't trigger twice
        clearInterval(monitoring_interval)
        play_next_in_queue()
      }
    }
  }, 300)
}

let play_next_in_queue = () => {
  browser.storage.local.get({video_queue: []}).then((result) => {
    let queue = result.video_queue

    if (queue.length > 0) {
      // Get the first video (FIFO)
      let next_id = queue.shift()

      // Save the updated queue (minus the video we are about to play)
      browser.storage.local.set({video_queue: queue}).then(() => {
        console.log(`Nani-Queue: Playing next video ${next_id}`)
        window.location.href = `https://www.youtube.com/watch?v=${next_id}`
      })
    }
    else {
      console.log(`Queue empty, letting YouTube autoplay take over.`)
    }
  })
}