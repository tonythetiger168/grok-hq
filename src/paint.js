import * as THREE from 'three'

const CJK = '"PingFang TC", "Noto Sans CJK TC", "Noto Sans TC", "Microsoft JhengHei", "WenQuanYi Micro Hei", sans-serif'

export function roundRect(ctx, x, y, w, h, r) {
  const radius = Math.min(r, w / 2, h / 2)
  ctx.beginPath()
  ctx.moveTo(x + radius, y)
  ctx.arcTo(x + w, y, x + w, y + h, radius)
  ctx.arcTo(x + w, y + h, x, y + h, radius)
  ctx.arcTo(x, y + h, x, y, radius)
  ctx.arcTo(x, y, x + w, y, radius)
  ctx.closePath()
}

export function canvasTexture(width, height, draw) {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  draw(ctx, width, height)
  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.anisotropy = 8
  tex.needsUpdate = true
  return { tex, canvas, ctx }
}

export function nameplateTexture(name, color) {
  return canvasTexture(1024, 256, (ctx) => {
    ctx.clearRect(0, 0, 1024, 256)
    roundRect(ctx, 12, 40, 1000, 176, 56)
    ctx.fillStyle = 'rgba(247, 244, 238, 0.96)'
    ctx.fill()
    ctx.beginPath()
    ctx.arc(118, 128, 42, 0, Math.PI * 2)
    ctx.fillStyle = color
    ctx.fill()
    ctx.fillStyle = '#241f1a'
    ctx.textAlign = 'left'
    ctx.textBaseline = 'middle'
    let size = 104
    do {
      ctx.font = `600 ${size}px Outfit, sans-serif`
      size -= 4
    } while (ctx.measureText(name).width > 780 && size > 60)
    ctx.fillText(name, 186, 132)
  }).tex
}

export function signTexture(title, sub) {
  return canvasTexture(1024, 384, (ctx, w, h) => {
    ctx.fillStyle = '#f6f1e8'
    ctx.fillRect(0, 0, w, h)
    ctx.strokeStyle = '#241f1a'
    ctx.lineWidth = 22
    ctx.strokeRect(16, 16, w - 32, h - 32)
    ctx.fillStyle = '#241f1a'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    if (sub) {
      ctx.font = '600 124px Outfit, sans-serif'
      ctx.fillText(title, 512, 150)
      ctx.font = '500 64px Outfit, sans-serif'
      ctx.fillStyle = '#5c564e'
      ctx.fillText(sub, 512, 262)
    } else {
      ctx.font = '600 140px Outfit, sans-serif'
      ctx.fillText(title, 512, 196)
    }
  }).tex
}

export function carpetTexture(text) {
  return canvasTexture(2048, 384, (ctx) => {
    ctx.clearRect(0, 0, 2048, 384)
    ctx.fillStyle = 'rgba(36, 31, 26, 0.5)'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    let size = 168
    do {
      ctx.font = `600 ${size}px Outfit, sans-serif`
      size -= 6
    } while (ctx.measureText(text).width > 1900 && size > 80)
    ctx.fillText(text, 1024, 196)
  }).tex
}

export function glassWordTexture(name = 'musk') {
  const word = String(name || 'lead').toUpperCase().slice(0, 12)
  return canvasTexture(1024, 320, (ctx) => {
    ctx.clearRect(0, 0, 1024, 320)
    ctx.fillStyle = 'rgba(28, 36, 34, 0.82)'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    let size = word.length > 6 ? 96 : 150
    ctx.font = `600 ${size}px Outfit, sans-serif`
    while (ctx.measureText(word).width > 900 && size > 64) {
      size -= 8
      ctx.font = `600 ${size}px Outfit, sans-serif`
    }
    ctx.fillText(word, 512, 118)
    ctx.font = '500 64px Outfit, sans-serif'
    ctx.fillText(`reports to ${name}`, 512, 210)
  }).tex
}

export function skyTexture() {
  return canvasTexture(64, 512, (ctx, w, h) => {
    const gradient = ctx.createLinearGradient(0, 0, 0, h)
    gradient.addColorStop(0, '#c5d6e2')
    gradient.addColorStop(0.45, '#e4eef3')
    gradient.addColorStop(1, '#f3e4d2')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, w, h)
  }).tex
}

export function glyphTexture(kind) {
  return canvasTexture(256, 256, (ctx) => {
    ctx.clearRect(0, 0, 256, 256)
    ctx.beginPath()
    ctx.arc(128, 128, 108, 0, Math.PI * 2)
    ctx.fillStyle = kind === 'bang' ? '#c6453c' : '#2f6d54'
    ctx.fill()
    ctx.strokeStyle = '#fffaf6'
    ctx.fillStyle = '#fffaf6'
    ctx.lineWidth = 22
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    if (kind === 'bang') {
      ctx.font = '700 150px Outfit, sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText('!', 128, 136)
    } else {
      ctx.beginPath()
      ctx.moveTo(74, 132)
      ctx.lineTo(114, 172)
      ctx.lineTo(186, 92)
      ctx.stroke()
    }
  }).tex
}

export function usageTexture() {
  return canvasTexture(1600, 900, (ctx, w, h) => {
    ctx.fillStyle = '#f7f3ec'
    ctx.fillRect(0, 0, w, h)
    ctx.strokeStyle = '#e0d8cc'
    ctx.lineWidth = 8
    ctx.strokeRect(16, 16, w - 32, h - 32)

    ctx.fillStyle = '#241f1a'
    ctx.textAlign = 'left'
    ctx.textBaseline = 'middle'
    ctx.font = `600 84px ${CJK}`
    ctx.fillText('每週用量', 80, 120)
    ctx.font = '500 40px Outfit, sans-serif'
    ctx.fillStyle = '#5c564e'
    ctx.fillText('Weekly usage — connect later', 80, 190)

    const frames = [80, 560, 1040]
    for (const x of frames) {
      roundRect(ctx, x, 280, 420, 420, 28)
      ctx.fillStyle = '#fbf9f5'
      ctx.fill()
      ctx.strokeStyle = '#d9d0c4'
      ctx.lineWidth = 4
      ctx.stroke()
    }

    ctx.font = `500 32px ${CJK}`
    ctx.fillStyle = '#6d675f'
    ctx.fillText('尚未連接 · 沒有數字', 80, 780)
    ctx.font = '500 28px Outfit, sans-serif'
    ctx.fillText('No figures until a usage source is connected.', 80, 830)
  }).tex
}

export function digitalClockTexture() {
  const pack = canvasTexture(1024, 320, () => {})
  return {
    tex: pack.tex,
    draw(label, sub = 'OFFICE TIME') {
      const ctx = pack.ctx
      ctx.clearRect(0, 0, 1024, 320)
      ctx.fillStyle = '#24312e'
      ctx.fillRect(0, 0, 1024, 320)
      ctx.fillStyle = '#e7c56a'
      ctx.fillRect(0, 0, 1024, 14)
      ctx.fillStyle = '#f7f3ea'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.font = '600 150px Outfit, sans-serif'
      ctx.fillText(label || '9:00 AM', 512, 145)
      ctx.font = '500 40px Outfit, sans-serif'
      ctx.fillStyle = '#e7c56a'
      ctx.fillText(sub, 512, 250)
      pack.tex.needsUpdate = true
    },
  }
}

export function clockCanvas() {
  const pack = canvasTexture(256, 256, () => {})
  return {
    tex: pack.tex,
    canvas: pack.canvas,
    draw(date) {
      const ctx = pack.ctx
      const w = 256
      ctx.clearRect(0, 0, w, w)
      ctx.beginPath()
      ctx.arc(128, 128, 120, 0, Math.PI * 2)
      ctx.fillStyle = '#f7f4ee'
      ctx.fill()
      ctx.lineWidth = 8
      ctx.strokeStyle = '#2a312f'
      ctx.stroke()
      ctx.save()
      ctx.translate(128, 128)
      for (let i = 0; i < 12; i += 1) {
        const angle = (i / 12) * Math.PI * 2
        ctx.beginPath()
        ctx.moveTo(Math.sin(angle) * 92, -Math.cos(angle) * 92)
        ctx.lineTo(Math.sin(angle) * 104, -Math.cos(angle) * 104)
        ctx.lineWidth = i % 3 === 0 ? 6 : 3
        ctx.strokeStyle = '#241f1a'
        ctx.stroke()
      }
      const hours = date.getHours() % 12
      const minutes = date.getMinutes()
      const seconds = date.getSeconds()
      const hourAngle = ((hours + minutes / 60) / 12) * Math.PI * 2
      const minuteAngle = ((minutes + seconds / 60) / 60) * Math.PI * 2
      strokeHand(ctx, hourAngle, 58, 8)
      strokeHand(ctx, minuteAngle, 84, 5)
      ctx.restore()
      ctx.beginPath()
      ctx.arc(128, 128, 6, 0, Math.PI * 2)
      ctx.fillStyle = '#c6453c'
      ctx.fill()
      pack.tex.needsUpdate = true
    },
  }
}

function strokeHand(ctx, angle, length, width) {
  ctx.beginPath()
  ctx.moveTo(0, 0)
  ctx.lineTo(Math.sin(angle) * length, -Math.cos(angle) * length)
  ctx.lineWidth = width
  ctx.lineCap = 'round'
  ctx.strokeStyle = '#241f1a'
  ctx.stroke()
}
