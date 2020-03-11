let model
let stream
let isLooping = false
let canScroll = false
let hasSetOrigin = false
let scrollOrigin = [0, 0]
let scrollSpeed = 2.5
const $video = document.querySelector('video')
const $canvas = document.querySelector('canvas')
const ctx = $canvas.getContext('2d')
const $iframe = document.querySelector('iframe')
const $button = document.querySelector('button')

/**
 * Starts tracking with handpose
 */
async function startTracking() {
  $button.innerHTML = 'loading...'
  $button.setAttribute('disabled', true)

  model = await handpose.load()
  getMediaStream()
  isLooping = true
}

/**
 * Captures the media stream and attaches it to the video element
 */
async function getMediaStream() {
  stream = await navigator.mediaDevices.getUserMedia({ audio: false, video: true })
  $video.srcObject = stream
  $video.onloadedmetadata = () => {
    $video.play()
    $canvas.width = $video.width
    $canvas.height = $video.height
    $button.remove()
    loop()
  }
}

/**
 * Our main "game loop"
 */
async function loop() {
  const hands = await model.estimateHands($video)

  ctx.clearRect(0, 0, $canvas.width, $canvas.height)

  hands.forEach((hand) => {
    drawHand(hand)
    checkForScrollGesture(hand)
    scrollPage(hand)
  })

  isLooping && requestAnimationFrame(() => isLooping && loop())
}

/**
 * Checks for scrolling gesture
 */
function checkForScrollGesture(hand) {
  let thumb = hand.landmarks[4]
  let pointer = hand.landmarks[8]
  let a = thumb[0] - pointer[0]
  let b = thumb[1] - pointer[1]
  let dist = Math.sqrt(a * a + b * b)

  if (dist < 40) {
    canScroll = true
  } else {
    canScroll = false
    hasSetOrigin = false
  }

  if (canScroll && !hasSetOrigin) {
    hasSetOrigin = true
    scrollOrigin = [window.scrollY, thumb[1]]
  }
}

/**
 * Scrolls the page
 */
function scrollPage(hand) {
  if (canScroll) {
    let scroll = (scrollOrigin[1] - hand.landmarks[4][1]) * scrollSpeed

    window.scrollTo(0, scrollOrigin[0] + scroll)
  }
}

/**
 * Draws the hands on a canvas
 */
window.focusPoint = 0
function drawHand(hand) {
  hand.landmarks.forEach((point, i) => {
    let radius = 3
    ctx.fillStyle = '#000'

    if ([4, 8, 12, 16, 20].includes(i)) {
      ctx.fillStyle = '#f00'
      radius = 6
    }

    ctx.beginPath()
    ctx.arc(point[0], point[1], radius, 0, 2 * Math.PI)
    ctx.stroke()
    ctx.fill()
  })
}
