let model
let stream
let isLooping = false
const $video = document.querySelector('video')
const $canvas = document.querySelector('canvas')
const ctx = $canvas.getContext('2d')

/**
 * Starts tracking with handpose
 */
async function startTracking() {
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
    loop()
  }
}

/**
 * Our main "game loop"
 */
async function loop() {
  const hands = await model.estimateHands($video)

  ctx.clearRect(0, 0, $canvas.width, $canvas.height)
  console.log(hands)

  hands.forEach((hand) => {
    drawHand(hand)
  })

  isLooping && requestAnimationFrame(() => isLooping && loop())
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
