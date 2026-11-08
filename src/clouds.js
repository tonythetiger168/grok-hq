import * as THREE from 'three'
import { CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js'
import { decisionFor, pairLines, selfLine, thinkLine } from './lines.js'

const _headA = new THREE.Vector3()
const _headB = new THREE.Vector3()
const _hip = new THREE.Vector3()
const _screenA = new THREE.Vector3()
const _screenB = new THREE.Vector3()

function dist2(a, b) {
  const dx = a.root.position.x - b.root.position.x
  const dz = a.root.position.z - b.root.position.z
  return dx * dx + dz * dz
}

function ready(bot, elapsed) {
  return !bot.moving && bot.goals.length <= 1 && bot.spinLeft <= 0 && !bot.carrying && bot.quietUntil <= elapsed
}

function bestPair(list, minD, maxD, bucket) {
  const pairs = []
  const min2 = minD * minD
  const max2 = maxD * maxD
  for (let i = 0; i < list.length; i += 1) {
    for (let j = i + 1; j < list.length; j += 1) {
      const d = dist2(list[i], list[j])
      if (d >= min2 && d <= max2) pairs.push([list[i], list[j]])
    }
  }
  if (!pairs.length) return null
  pairs.sort((p, q) => p[0].def.id.localeCompare(q[0].def.id) || p[1].def.id.localeCompare(q[1].def.id))
  return pairs[Math.abs(bucket) % pairs.length]
}

function meetingPair(list, bucket) {
  const across = []
  const beside = []
  for (let i = 0; i < list.length; i += 1) {
    for (let j = i + 1; j < list.length; j += 1) {
      const d = Math.sqrt(dist2(list[i], list[j]))
      if (d > 1.7 && d < 3.4) across.push([list[i], list[j]])
      else if (d >= 0.8 && d <= 1.7) beside.push([list[i], list[j]])
    }
  }
  const pool = across.length ? across : beside
  if (!pool.length) return null
  pool.sort((p, q) => p[0].def.id.localeCompare(q[0].def.id) || p[1].def.id.localeCompare(q[1].def.id))
  return pool[Math.abs(bucket) % pool.length]
}

function nearest(bot, bots) {
  let best = Infinity
  for (const other of bots) {
    if (other === bot) continue
    const d = Math.sqrt(dist2(bot, other))
    if (d < best) best = d
  }
  return best
}

function propose(slot, bots, booked, elapsed) {
  const bucket = Math.floor(elapsed / 5)
  if (slot.role === 'errand') {
    const walker = bots.find((bot) => (
      bot.carrying && bot.routeKey === 'handoff' && !bot.holdStarted && bot.handoffCloud < 1 && bot.def.id !== 'musk' && !booked.has(bot)
    ))
    if (!walker) return null
    return {
      kind: 'think',
      a: walker,
      lineA: thinkLine(walker, bucket),
      hold: 2.5,
      flag: 1,
      center: 'think',
    }
  }
  if (slot.role === 'decide') {
    const musk = bots.find((bot) => bot.def.id === 'musk')
    if (!musk || musk.moving || booked.has(musk)) return null
    const visitor = bots.find((bot) => (
      bot.routeKey === 'handoff'
      && bot.holdStarted
      && !bot.moving
      && !bot.decided
      && bot.def.id !== 'musk'
      && !booked.has(bot)
    ))
    if (!visitor) return null
    const decision = decisionFor(visitor)
    return {
      kind: 'think',
      a: musk,
      lineA: decision.think,
      hold: 7.6,
      center: 'think',
      script: [
        { at: 0, kind: 'think', who: 'musk', text: decision.think },
        { at: 2.4, kind: 'speech', who: 'musk', text: decision.say },
        { at: 5.1, kind: 'speech', who: 'visitor', text: decision.react },
      ],
      b: visitor,
      musk,
      visitor,
      muskLine: decision.say,
      visitorLine: decision.react,
    }
  }
  if (slot.role === 'meet') {
    const meeting = bots.filter((bot) => ready(bot, elapsed) && bot.place === 'meeting' && !booked.has(bot))
    const meet = meetingPair(meeting, bucket)
    if (!meet) return null
    const [lineA, lineB] = pairLines('meet', meet[0], meet[1], bucket)
    return { kind: 'speech', a: meet[0], b: meet[1], lineA, lineB, hold: 3.4, maxDist: 3.8, center: 'pair' }
  }
  if (slot.role === 'pair') {
    const resting = bots.filter((bot) => ready(bot, elapsed) && ['rest', 'lobby', 'lounge', 'snack', 'pantry'].includes(bot.place) && (bot.state === 'idle' || bot.cup) && !booked.has(bot))
    const rest = bestPair(resting, 0.7, 2.35, bucket)
    if (!rest) return null
    const [lineA, lineB] = pairLines('rest', rest[0], rest[1], bucket)
    return { kind: 'speech', a: rest[0], b: rest[1], lineA, lineB, hold: 3.4, maxDist: 2.8, center: 'pair' }
  }
  if (slot.role === 'self') {
    const pool = bots.filter((bot) => ready(bot, elapsed) && !booked.has(bot) && (bot.state === 'idle' || bot.state === 'waiting' || bot.state === 'error'))
    const waiting = pool.filter((bot) => bot.state === 'waiting' || bot.state === 'error')
    const idle = pool.filter((bot) => bot.state === 'idle')
    const isolated = idle.filter((bot) => nearest(bot, bots) > 2.2)
    const choice = waiting.length ? waiting : (isolated.length ? isolated : idle)
    if (!choice.length) return null
    const bot = choice[Math.abs(bucket) % choice.length]
    return { kind: 'speech', a: bot, lineA: selfLine(bot, bucket), hold: 2.8, center: 'self' }
  }
  const busy = bots.some((bot) => bot.state === 'working' || bot.state === 'waiting' || bot.state === 'error' || bot.carrying)
  if (slot.role === 'muse-b' && !busy) return null
  const free = (bot) => ready(bot, elapsed) && !booked.has(bot)
  let choice = null
  if (slot.role === 'muse') {
    const working = bots.filter((bot) => free(bot) && bot.state === 'working' && ['desk', 'musk-desk', 'library', 'copy'].includes(bot.place))
    choice = working.length ? working[Math.abs(bucket) % working.length] : null
  }
  if (!choice) {
    const mood = bots.filter((bot) => free(bot) && (bot.state === 'error' || bot.state === 'waiting'))
    if (slot.role === 'muse-b' && mood.length) choice = mood[Math.abs(bucket + 1) % mood.length]
  }
  if (!choice && slot.role === 'muse') {
    const idle = bots.filter((bot) => free(bot) && bot.state === 'idle')
    if (idle.length) choice = idle[Math.abs(bucket + 3) % idle.length]
  }
  if (!choice && slot.role === 'muse-b') {
    const working = bots.filter((bot) => free(bot) && bot.state === 'working')
    if (working.length) choice = working[Math.abs(bucket + 2) % working.length]
  }
  if (!choice) return null
  return { kind: 'think', a: choice, lineA: thinkLine(choice, bucket), hold: 3.1, center: 'think' }
}

function makeElement(index) {
  const root = document.createElement('div')
  root.className = 'cloud is-speech'
  root.setAttribute('aria-hidden', 'true')
  const pop = document.createElement('div')
  pop.className = 'cloud-pop'
  const bob = document.createElement('div')
  bob.className = 'cloud-bob'
  bob.style.animationDelay = `${-index * 0.4}s`
  const body = document.createElement('div')
  body.className = 'cloud-body'
  const dot = document.createElement('i')
  dot.className = 'cloud-dot'
  const dotB = document.createElement('i')
  dotB.className = 'cloud-dot'
  dotB.hidden = true
  const line = document.createElement('span')
  line.className = 'cloud-line'
  const spark = document.createElement('i')
  spark.className = 'spark'
  body.append(spark)
  for (const name of ['a', 'b', 'c', 'd']) {
    const lobe = document.createElement('span')
    lobe.className = `lobe lobe-${name}`
    body.append(lobe)
  }
  body.append(dot, dotB, line)
  const tail = document.createElement('i')
  tail.className = 'cloud-tail'
  tail.append(document.createElement('b'))
  const puffs = document.createElement('span')
  puffs.className = 'cloud-puffs'
  puffs.append(document.createElement('i'), document.createElement('i'), document.createElement('i'))
  bob.append(body, tail, puffs)
  pop.append(bob)
  root.append(pop)
  return { root, pop, bob, line, dot, dotB, tail }
}

function setPhase(slot, name, reduce) {
  slot.pop.classList.remove('is-in', 'is-hold', 'is-out', 'is-still')
  if (reduce && (name === 'is-in' || name === 'is-hold')) slot.pop.classList.add('is-still')
  else if (name) slot.pop.classList.add(name)
  slot.bob.classList.toggle('is-live', name === 'is-hold' && !reduce)
}

function applyLine(slot) {
  const speaker = slot.speaker === 0 ? slot.a : slot.b
  slot.line.textContent = slot.speaker === 0 ? slot.lineA : (slot.lineB || slot.lineA)
  if (speaker?.def?.color) slot.root.style.setProperty('--who', speaker.def.color)
  const speech = slot.kind === 'speech'
  slot.dot.hidden = !speech
  if (!speech || !speaker) return
  slot.dot.style.background = slot.a.def.color
  if (slot.b) {
    slot.dotB.hidden = false
    slot.dotB.style.background = slot.b.def.color
    slot.dot.classList.toggle('is-quiet', slot.speaker !== 0)
    slot.dotB.classList.toggle('is-quiet', slot.speaker !== 1)
  } else {
    slot.dotB.hidden = true
    slot.dot.classList.remove('is-quiet')
  }
}

function crown(bot, out) {
  bot.head.getWorldPosition(out)
  out.y += 0.16 * (bot.head.scale.y || 1)
  return out
}

function lift(bot, out) {
  crown(bot, out)
  const top = out.y
  bot.hips.getWorldPosition(_hip)
  const tag = _hip.y + bot.label.position.y
  return bot.label.visible ? Math.max(top, tag) + 0.16 : top + 0.02
}

function aimTail(tail, from, to, camera, width, height) {
  _screenA.copy(from).project(camera)
  _screenB.copy(to).project(camera)
  if (_screenA.z > 1 || _screenB.z > 1) return
  const ax = (_screenA.x * 0.5 + 0.5) * width
  const ay = (-_screenA.y * 0.5 + 0.5) * height
  const bx = (_screenB.x * 0.5 + 0.5) * width
  const by = (-_screenB.y * 0.5 + 0.5) * height
  const rot = Math.atan2(by - ay, bx - ax) - Math.PI / 2
  tail.style.transform = `rotate(${rot}rad)`
}

function participantsOk(slot) {
  if (!slot.a) return false
  if (slot.role === 'decide') {
    const visitor = slot.visitor
    return !!(visitor && visitor.routeKey === 'handoff' && visitor.holdStarted && !visitor.moving && slot.musk && !slot.musk.moving)
  }
  if (slot.role === 'errand') {
    return slot.a.carrying && slot.a.routeKey === 'handoff' && !slot.a.holdStarted
  }
  if (slot.a.moving || (slot.b && slot.b.moving)) return false
  if (slot.b) {
    const limit = slot.maxDist || 3.2
    if (dist2(slot.a, slot.b) > limit * limit) return false
  }
  return true
}

function placeSlot(slot, camera, width, height) {
  const yA = lift(slot.a, _headA)
  if (slot.center === 'pair' && slot.b) {
    const yB = lift(slot.b, _headB)
    slot.object.position.set(
      (_headA.x + _headB.x) / 2,
      Math.max(yA, yB) + 0.2,
      (_headA.z + _headB.z) / 2,
    )
    slot.object.center.set(0.5, 0.5)
    const speaker = slot.speaker === 0 ? _headA : _headB
    if (width > 0) aimTail(slot.tail, slot.object.position, speaker, camera, width, height)
  } else if (slot.center === 'think') {
    slot.object.position.set(_headA.x, yA, _headA.z)
    slot.object.center.set(0.2, 1)
  } else {
    slot.object.position.set(_headA.x, yA, _headA.z)
    slot.object.center.set(0.5, 1)
    slot.tail.style.transform = 'rotate(0rad)'
  }
}

function activate(slot, idea, elapsed) {
  slot.phase = 'warm'
  slot.age = 0
  slot.hold = idea.hold
  slot.kind = idea.kind
  slot.center = idea.center
  slot.a = idea.a
  slot.b = idea.b || null
  slot.lineA = idea.lineA
  slot.lineB = idea.lineB || ''
  slot.speaker = 0
  slot.swapped = false
  slot.maxDist = idea.maxDist || 3.2
  slot.flag = idea.flag || 0
  slot.script = idea.script || null
  slot.scriptStep = -1
  slot.musk = idea.musk || null
  slot.visitor = idea.visitor || null
  slot.muskLine = idea.muskLine || ''
  slot.visitorLine = idea.visitorLine || ''
  slot.shared = false
  if (idea.visitor) idea.visitor.decided = true
  slot.root.dataset.think = idea.kind === 'think' ? String(Math.floor((idea.a?.phase || 0) * 2) % 3) : ''
  slot.root.classList.toggle('is-speech', idea.kind === 'speech')
  slot.root.classList.toggle('is-think', idea.kind === 'think')
  slot.object.visible = true
  setPhase(slot, null, false)
  applyLine(slot)
  const until = elapsed + idea.hold + 4.2
  idea.a.quietUntil = until
  if (idea.b) idea.b.quietUntil = until
  if (idea.flag) idea.a.handoffCloud = idea.flag
}

function finish(slot) {
  slot.phase = 'idle'
  slot.object.visible = false
  slot.a = null
  slot.b = null
  slot.rest = slot.cooldown
  setPhase(slot, null, false)
}

export function createCloudLayer() {
  const group = new THREE.Group()
  group.name = 'clouds'
  const roles = [
    { role: 'pair', cooldown: 1.3, rest: 0.45 },
    { role: 'meet', cooldown: 0.7, rest: 3.1 },
    { role: 'self', cooldown: 1.5, rest: 1.35 },
    { role: 'muse', cooldown: 1.2, rest: 2.15 },
    { role: 'muse-b', cooldown: 1.8, rest: 0.8 },
    { role: 'errand', cooldown: 0.35, rest: 0.25 },
    { role: 'decide', cooldown: 0.2, rest: 0.15 },
  ]
  const slots = roles.map((spec, index) => {
    const els = makeElement(index)
    const object = new CSS2DObject(els.root)
    object.position.set(0, -8, 0)
    object.visible = false
    object.center.set(0.5, 1)
    group.add(object)
    return {
      ...spec,
      ...els,
      object,
      phase: 'idle',
      age: 0,
      hold: 3,
      kind: 'speech',
      center: 'self',
      a: null,
      b: null,
      lineA: '',
      lineB: '',
      speaker: 0,
      swapped: false,
      maxDist: 3.2,
      flag: 0,
    }
  })
  return { group, slots }
}

export function updateClouds(layer, bots, camera, dt, elapsed, reduce, width, height, hooks = {}) {
  if (layer.pendingBark?.bot) {
    const slot = layer.slots.find((item) => item.role === 'self' && item.phase === 'idle')
    if (slot && !layer.slots.some((item) => item.a === layer.pendingBark.bot && item.phase !== 'idle')) {
      activate(slot, {
        kind: 'speech',
        a: layer.pendingBark.bot,
        lineA: layer.pendingBark.text,
        hold: 2.8,
        center: 'self',
      }, elapsed)
      layer.pendingBark = null
    }
  }

  const booked = new Set()
  for (const slot of layer.slots) {
    if (slot.phase !== 'idle' && slot.a) {
      booked.add(slot.a)
      if (slot.b) booked.add(slot.b)
    }
  }

  for (const slot of layer.slots) {
    if (slot.phase === 'idle') {
      slot.rest -= dt
      if (slot.rest > 0) continue
      const idea = propose(slot, bots, booked, elapsed)
      if (!idea) {
        slot.rest = slot.role === 'errand' || slot.role === 'deliver' ? 0.25 : 0.45
        continue
      }
      activate(slot, idea, elapsed)
      booked.add(idea.a)
      if (idea.b) booked.add(idea.b)
      placeSlot(slot, camera, width, height)
      continue
    }

    if (slot.phase === 'warm') {
      slot.phase = 'in'
      setPhase(slot, 'is-in', reduce)
      placeSlot(slot, camera, width, height)
      continue
    }

    if ((slot.phase === 'in' || slot.phase === 'hold') && !participantsOk(slot)) {
      slot.phase = 'out'
      slot.age = 0
      setPhase(slot, 'is-out', reduce)
    }

    slot.age += dt
    const fadeIn = reduce ? 0.01 : 0.28
    const fadeOut = reduce ? 0.01 : 0.36
    if (slot.phase === 'in' && slot.age >= fadeIn) {
      slot.phase = 'hold'
      slot.age = 0
      setPhase(slot, 'is-hold', reduce)
    } else if (slot.phase === 'hold' && slot.age >= slot.hold) {
      slot.phase = 'out'
      slot.age = 0
      setPhase(slot, 'is-out', reduce)
    } else if (slot.phase === 'out' && slot.age >= fadeOut) {
      finish(slot)
      continue
    }

    if (slot.script && (slot.phase === 'hold' || slot.phase === 'in')) {
      applyScript(slot, hooks)
    } else if (slot.phase === 'hold' && slot.b && slot.lineB && !slot.swapped && slot.age > slot.hold * 0.46) {
      slot.swapped = true
      slot.speaker = 1
      applyLine(slot)
      const fact = slot.b.fact || 'plan'
      hooks.onShare?.(slot.a.def.id, fact)
    }
    if (slot.a) placeSlot(slot, camera, width, height)
  }

  for (const bot of bots) {
    bot.lookAt = null
    bot.gaze = null
    if (bot.def.id === 'musk') bot.receiving = false
  }
  for (const slot of layer.slots) {
    if (slot.phase === 'idle' || slot.phase === 'out' || !slot.a) continue
    if (slot.kind === 'think') {
      if (slot.a.state !== 'error') slot.a.gaze = 'up'
    } else if (slot.b) {
      slot.a.lookAt = slot.b.root.position
      slot.b.lookAt = slot.a.root.position
    }
    if (slot.role === 'decide' && slot.musk && slot.visitor) {
      const musk = slot.musk
      const visitor = slot.visitor
      musk.receiving = true
      musk.receiveYaw = Math.atan2(visitor.root.position.x - musk.root.position.x, visitor.root.position.z - musk.root.position.z)
      musk.lookAt = visitor.root.position
      visitor.lookAt = musk.root.position
    }
  }
}

function applyScript(slot, hooks) {
  const step = [...slot.script].reverse().find((item) => slot.age >= item.at) || slot.script[0]
  if (slot.scriptStep === step.at) return
  slot.scriptStep = step.at
  slot.kind = step.kind
  slot.muskLine = step.who === 'musk' && step.kind === 'speech' ? step.text : slot.muskLine
  slot.visitorLine = step.who === 'visitor' ? step.text : slot.visitorLine
  if (step.kind === 'think') {
    slot.a = slot.musk
    slot.b = null
    slot.center = 'think'
    slot.speaker = 0
    slot.lineA = step.text
    slot.lineB = ''
  } else {
    slot.a = slot.musk
    slot.b = slot.visitor
    slot.center = 'pair'
    slot.speaker = step.who === 'visitor' ? 1 : 0
    slot.lineA = slot.muskLine
    slot.lineB = slot.visitorLine
    if (step.who === 'visitor' && !slot.shared) {
      slot.shared = true
      hooks.onShare?.(slot.visitor.def.id, slot.visitor.fact || 'plan')
    }
  }
  slot.root.dataset.think = step.kind === 'think' ? '1' : ''
  slot.root.classList.toggle('is-speech', step.kind === 'speech')
  slot.root.classList.toggle('is-think', step.kind === 'think')
  applyLine(slot)
}
