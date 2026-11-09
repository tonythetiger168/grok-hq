import '@fontsource/outfit/latin-400.css'
import '@fontsource/outfit/latin-500.css'
import '@fontsource/outfit/latin-600.css'
import '@fontsource/fraunces/latin-600.css'
import './style.css'

import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { CSS2DObject, CSS2DRenderer } from 'three/addons/renderers/CSS2DRenderer.js'
import { ROSTER, DEPARTMENTS, leaderId, setTeam } from './roster.js'
import { PRESETS, assertLayout } from './layout.js'
import { buildOffice, updateOffice } from './office.js'
import { createBot, focusPoint, setBotHighlight, updateBot } from './bots.js'
import { createCloudLayer, updateClouds } from './clouds.js'
import { createStatus, dayStartFromUrl, wantsDay, wantsOps, wantsSimulation } from './status.js'
import { createUI } from './ui.js'

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

const boot = document.getElementById('boot')

function fail(message) {
  boot.classList.remove('is-hidden')
  boot.textContent = message
}

async function main() {
  const params = new URLSearchParams(location.search)
  const teamName = params.get('team')
  const teamFile = teamName && /^[a-z0-9-]+$/.test(teamName) ? `/team.${teamName}.json` : '/team.json'
  const teamResponse = await fetch(teamFile)
  if (!teamResponse.ok) throw new Error(`Could not read ${teamFile}`)
  setTeam(await teamResponse.json())
  const ORDER = DEPARTMENTS.flatMap((dept) => ROSTER.filter((bot) => bot.dept === dept.id))
  assertLayout(ROSTER, leaderId())
  await Promise.all([
    document.fonts.load('600 32px Outfit'),
    document.fonts.load('600 32px Fraunces'),
    document.fonts.ready,
  ])

  const viewport = document.getElementById('viewport')
  let renderer
  try {
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' })
  } catch {
    fail('This browser could not start WebGL.')
    return
  }
  if (!renderer.getContext()) {
    fail('This browser could not start WebGL.')
    return
  }

  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
  renderer.outputColorSpace = THREE.SRGBColorSpace
  renderer.toneMapping = THREE.NeutralToneMapping
  renderer.toneMappingExposure = 1.05
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFSoftShadowMap
  renderer.setClearColor('#d5e0db')
  renderer.domElement.addEventListener('webglcontextlost', (event) => {
    event.preventDefault()
    fail('WebGL was interrupted. Reload the page.')
  })

  const scene = new THREE.Scene()
  scene.background = new THREE.Color('#d5e0db')

  const camera = new THREE.PerspectiveCamera(36, 1, 0.08, 180)
  const preset = PRESETS.all
  camera.position.set(...preset.pos)

  const controls = new OrbitControls(camera, renderer.domElement)
  controls.target.set(...preset.target)
  controls.enableDamping = true
  controls.dampingFactor = 0.08
  controls.maxPolarAngle = Math.PI / 2.08
  controls.minPolarAngle = 0.16
  controls.minDistance = 3.4
  controls.maxDistance = 64
  controls.zoomSpeed = 0.72
  controls.rotateSpeed = 0.75
  controls.panSpeed = 0.65
  controls.update()

  const hemi = new THREE.HemisphereLight('#f7f4ee', '#d8cbb8', 0.78)
  scene.add(hemi)
  const key = new THREE.DirectionalLight('#fff3e2', 2.45)
  key.position.set(-12, 26, -16)
  key.castShadow = true
  key.shadow.mapSize.set(2048, 2048)
  key.shadow.camera.left = -40
  key.shadow.camera.right = 40
  key.shadow.camera.top = 40
  key.shadow.camera.bottom = -40
  key.shadow.camera.near = 1
  key.shadow.camera.far = 72
  key.shadow.bias = -0.00035
  key.shadow.normalBias = 0.028
  key.target.position.set(0, 0, -1)
  scene.add(key, key.target)
  scene.add(new THREE.DirectionalLight('#f6f1e8', 0.72).translateX(14).translateY(8).translateZ(18))

  const office = buildOffice(ROSTER)
  scene.add(office.group)
  const bots = ROSTER.map((def) => createBot(def, {
    lounge: office.lounge.get(def.id),
    desk: office.desks.get(def.id),
  }))
  for (const bot of bots) scene.add(bot.root)
  const byId = new Map(bots.map((bot) => [bot.def.id, bot]))

  const maxAniso = renderer.capabilities.getMaxAnisotropy()
  scene.traverse((object) => {
    const material = object.material
    if (material?.map) material.map.anisotropy = maxAniso
  })

  const pickables = []
  scene.traverse((object) => {
    if ((object.isMesh || object.isSprite) && object.userData.botId) pickables.push(object)
  })
  const clouds = createCloudLayer()
  scene.add(clouds.group)

  viewport.appendChild(renderer.domElement)
  const labels = new CSS2DRenderer()
  labels.domElement.className = 'label-layer'
  labels.domElement.style.pointerEvents = 'none'
  viewport.appendChild(labels.domElement)

  const status = createStatus()
  let selected = null
  let hovered = null
  let cameraGoal = null
  let follow = null
  const head = new THREE.Vector3()
  const raycaster = new THREE.Raycaster()
  const pointer = new THREE.Vector2()

  function refreshLabels() {
    for (const bot of bots) {
      const isSelected = bot.def.id === selected
      bot.label.visible = isSelected || bot.def.id === hovered
      const offer = bot.def.id === hovered && bot.state === 'idle'
      bot.stateEl.hidden = !isSelected && !offer
      bot.stateEl.textContent = offer && !isSelected ? 'Click to assign' : stateWord(bot.state)
      bot.stateEl.className = `tag-state is-${bot.state}`
    }
  }

  function refreshHighlights() {
    for (const bot of bots) {
      const mode = bot.def.id === selected ? 'selected' : bot.def.id === hovered ? 'hover' : 'none'
      setBotHighlight(bot, mode)
    }
  }

  function placeCamera(pos, target, immediate) {
    follow = null
    if (immediate) {
      camera.position.copy(pos)
      controls.target.copy(target)
      controls.update()
      cameraGoal = null
      return
    }
    cameraGoal = { pos, target }
  }

  function frame(id, immediate = false) {
    const shot = PRESETS[id] || PRESETS.all
    placeCamera(new THREE.Vector3(...shot.pos), new THREE.Vector3(...shot.target), immediate)
  }

  function focusBot(bot, immediate = false) {
    focusPoint(bot, head)
    const offset = camera.position.clone().sub(controls.target)
    if (offset.lengthSq() < 0.01) offset.set(3, 2.2, 4)
    offset.y = offset.y * 0.35 + 1.8
    offset.setLength(4.6)
    const pos = head.clone().add(offset)
    if (immediate) {
      follow = null
      placeCamera(pos, head.clone(), true)
      return
    }
    follow = { id: bot.def.id, offset }
    cameraGoal = { pos, target: head.clone() }
  }

  function select(id, immediate = false) {
    selected = id
    ui.setSelected(id)
    refreshHighlights()
    refreshLabels()
    if (id) {
      focusBot(byId.get(id), immediate)
      openAssign(byId.get(id))
    }
  }

  function setHover(id) {
    if (hovered === id) return
    hovered = id
    refreshHighlights()
    refreshLabels()
    renderer.domElement.style.cursor = id ? 'pointer' : ''
  }

  function createAssignCloud() {
    const root = document.createElement('form')
    root.className = 'assign-cloud'
    const pop = document.createElement('div')
    pop.className = 'assign-pop'
    const input = document.createElement('input')
    input.maxLength = 80
    input.placeholder = 'Assign work…'
    input.setAttribute('aria-label', 'Assign work')
    const hint = document.createElement('p')
    hint.className = 'assign-hint'
    hint.textContent = 'Enter to assign. Esc to close.'
    pop.append(input, hint)
    root.append(pop)
    root.addEventListener('submit', (event) => {
      event.preventDefault()
      const bot = assign.target
      if (!bot) return
      const result = status.assign(bot.def.id, input.value)
      if (!result.ok && result.reason === 'empty') {
        hint.textContent = 'Type the work first.'
        return
      }
      if (!result.ok) {
        hint.textContent = 'Busy right now.'
        return
      }
      hideAssign()
    })
    root.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        event.stopPropagation()
        hideAssign()
      }
    })
    const object = new CSS2DObject(root)
    object.center.set(0.5, 1)
    object.visible = false
    return { object, root, input, hint, target: null, timer: 0 }
  }

  function openAssign(bot) {
    if (!bot) return
    window.clearTimeout(assign.timer)
    assign.target = bot
    bot.head.add(assign.object)
    assign.object.position.set(0, 0.55, 0)
    assign.object.visible = true
    const idle = status.canAssign(bot.def.id)
    assign.input.hidden = !idle
    if (idle) {
      assign.input.value = ''
      assign.hint.textContent = 'Enter to assign. Esc to close.'
      assign.input.focus()
    } else {
      assign.hint.textContent = 'Busy right now. Try an idle bot.'
      assign.timer = window.setTimeout(hideAssign, 2200)
    }
  }

  function hideAssign() {
    assign.object.visible = false
    assign.target = null
    assign.input.blur()
  }

  const assign = createAssignCloud()
  scene.add(assign.object)

  const ui = createUI({
    onOps(on) {
      status.setMode(on ? 'ops' : 'off')
      if (on) status.poll()
      const url = new URL(location.href)
      if (on) url.searchParams.set('ops', '1')
      else url.searchParams.delete('ops')
      url.searchParams.delete('simulate')
      url.searchParams.delete('day')
      url.searchParams.delete('at')
      url.searchParams.delete('demo')
      if (url.hash === '#demo' || url.hash === '#simulate' || url.hash === '#day' || url.hash === '#ops') url.hash = ''
      history.replaceState(null, '', url)
    },
    onSimulate(on) {
      status.setMode(on ? 'sim' : 'off')
      const url = new URL(location.href)
      if (on) url.searchParams.set('simulate', '1')
      else url.searchParams.delete('simulate')
      url.searchParams.delete('day')
      url.searchParams.delete('ops')
      url.searchParams.delete('at')
      url.searchParams.delete('demo')
      if (url.hash === '#demo' || url.hash === '#simulate' || url.hash === '#day' || url.hash === '#ops') url.hash = ''
      history.replaceState(null, '', url)
    },
    onDay(on) {
      status.setMode(on ? 'day' : 'off')
      const url = new URL(location.href)
      if (on) url.searchParams.set('day', '1')
      else url.searchParams.delete('day')
      url.searchParams.delete('simulate')
      url.searchParams.delete('ops')
      url.searchParams.delete('demo')
      url.searchParams.delete('at')
      if (url.hash === '#demo' || url.hash === '#simulate' || url.hash === '#day' || url.hash === '#ops') url.hash = ''
      history.replaceState(null, '', url)
    },
    onZone(id) {
      frame(id)
    },
    onSelect(id) {
      select(id)
    },
  })

  ui.zoomIn.addEventListener('click', () => {
    follow = null
    cameraGoal = null
    controls.dollyIn(0.86)
  })
  ui.zoomOut.addEventListener('click', () => {
    follow = null
    cameraGoal = null
    controls.dollyOut(0.86)
  })
  ui.reset.addEventListener('click', () => {
    ui.setZone('all')
    frame('all')
  })

  status.on((snap) => {
    const prev = new Map(bots.map((bot) => [bot.def.id, bot.state]))
    for (const item of snap.bots) {
      const bot = byId.get(item.id)
      if (!bot) continue
      if (prev.get(item.id) !== item.state) {
        if (item.state === 'done' && item.place !== 'handoff') bot.spinLeft = Math.PI * 2
        else if (item.state !== 'done') bot.spinLeft = 0
      }
      bot.state = item.state
      bot.place = item.place || 'rest'
      bot.meetIndex = item.meetIndex || 0
      bot.spot = item.spot || 0
      bot.task = item.task || ''
      bot.beat = item.beat || ''
      bot.fact = item.fact || 'plan'
      bot.follow = item.follow || ''
      bot.cup = item.cup || 'none'
      bot.returnPlace = item.returnPlace || 'desk'
      bot.ci = item.ci || ''
      if (item.bark && item.bark !== bot.bark) {
        bot.bark = item.bark
        clouds.pendingBark = { bot, text: item.bark }
      } else if (!item.bark) {
        bot.bark = ''
      }
    }
    ui.update(snap)
    refreshLabels()
  })

  if (wantsOps()) status.setMode('ops')
  else if (wantsDay()) status.setMode('day', dayStartFromUrl())
  else if (wantsSimulation()) status.setMode('sim')
  const zoneAlias = { lobby: 'rest' }
  const zoneParam = zoneAlias[params.get('zone')] || params.get('zone')
  if (zoneParam && PRESETS[zoneParam]) {
    ui.setZone(zoneParam)
    frame(zoneParam, true)
  }
  status.poll()
  window.setInterval(() => status.poll(), 4000)

  const requested = params.get('bot')
  if (requested) {
    const bot = bots.find((item) => (
      item.def.id === requested || item.def.name.toLowerCase() === requested.toLowerCase()
    ))
    if (bot) select(bot.def.id, true)
  }

  controls.addEventListener('start', () => {
    cameraGoal = null
    follow = null
  })

  let pointerDown = null
  renderer.domElement.addEventListener('pointerdown', (event) => {
    pointerDown = { x: event.clientX, y: event.clientY }
  })
  renderer.domElement.addEventListener('pointermove', (event) => {
    setHover(pick(event))
  })
  renderer.domElement.addEventListener('pointerup', (event) => {
    if (!pointerDown) return
    const dx = event.clientX - pointerDown.x
    const dy = event.clientY - pointerDown.y
    pointerDown = null
    if (dx * dx + dy * dy > 36) return
    const id = pick(event)
    if (id) select(id)
    else {
      selected = null
      ui.setSelected(null)
      refreshHighlights()
      refreshLabels()
    }
  })
  renderer.domElement.addEventListener('pointerleave', () => setHover(null))

  window.addEventListener('keydown', (event) => {
    if (event.metaKey || event.ctrlKey || event.altKey) return
    if (event.target instanceof HTMLElement && event.target.closest('input, textarea, select')) return
    if (event.key === 'Escape') {
      selected = null
      follow = null
      ui.setSelected(null)
      refreshHighlights()
      refreshLabels()
    } else if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault()
      const ids = ORDER.map((bot) => bot.id)
      const current = ids.indexOf(selected)
      const step = event.key === 'ArrowDown' ? 1 : -1
      const next = current === -1 ? (step > 0 ? 0 : ids.length - 1) : (current + step + ids.length) % ids.length
      select(ids[next])
    } else if (event.key === 'r' || event.key === 'R') {
      ui.setZone('all')
      frame('all')
    }
  })

  function pick(event) {
    const rect = renderer.domElement.getBoundingClientRect()
    pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
    pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1
    raycaster.setFromCamera(pointer, camera)
    const hits = raycaster.intersectObjects(pickables, false)
    return hits.find((hit) => hit.object.userData.botId)?.object.userData.botId || null
  }

  function resize() {
    const width = viewport.clientWidth
    const height = Math.max(viewport.clientHeight, 1)
    camera.aspect = width / height
    camera.updateProjectionMatrix()
    renderer.setSize(width, height, false)
    renderer.domElement.style.width = '100%'
    renderer.domElement.style.height = '100%'
    labels.setSize(width, height)
  }
  resize()
  window.addEventListener('resize', resize)

  const clock = new THREE.Clock()
  const stateById = new Map()
  let elapsed = 0

  function frameLoop() {
    const dt = Math.min(clock.getDelta(), 0.05)
    elapsed += dt
    status.tick(dt)
    for (const bot of bots) updateBot(bot, dt, elapsed, reduceMotion)
    updateClouds(
      clouds,
      bots,
      camera,
      dt,
      elapsed,
      reduceMotion,
      renderer.domElement.clientWidth,
      renderer.domElement.clientHeight,
      { onShare: (id, fact) => status.hear(id, fact) },
    )
    stateById.clear()
    for (const bot of bots) stateById.set(bot.def.id, { state: bot.state, ci: bot.ci })
    const copying = bots.some((bot) => bot.place === 'copy' && !bot.moving)
    const breach = bots.some((bot) => bot.fact === 'sandbox-leak')
    updateOffice(office, elapsed, stateById, status.clockSample(), copying, breach)
    if (follow) {
      const bot = byId.get(follow.id)
      if (bot) {
        focusPoint(bot, head)
        cameraGoal = { pos: head.clone().add(follow.offset), target: head.clone() }
      }
    }
    if (cameraGoal) {
      const blend = 1 - Math.exp(-4.2 * dt)
      camera.position.lerp(cameraGoal.pos, blend)
      controls.target.lerp(cameraGoal.target, blend)
      if (camera.position.distanceTo(cameraGoal.pos) < 0.04 && controls.target.distanceTo(cameraGoal.target) < 0.04 && !follow) {
        cameraGoal = null
      }
    }
    controls.update()
    labels.render(scene, camera)
    renderer.render(scene, camera)
    requestAnimationFrame(frameLoop)
  }

  boot.classList.add('is-hidden')
  requestAnimationFrame(frameLoop)
}

function stateWord(state) {
  if (state === 'error') return 'Stuck'
  if (state === 'working') return 'Working'
  if (state === 'waiting') return 'Waiting'
  if (state === 'done') return 'Done'
  return 'Idle'
}

main().catch((error) => {
  console.error(error)
  fail('The office could not be opened.')
})
