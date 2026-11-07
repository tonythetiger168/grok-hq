import * as THREE from 'three'
import { CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js'

const MEET_A = ['Quick standup.', 'Anything blocked?', 'I can take the next pass.', 'Then it goes to musk.', 'Same plan as the board.']
const MEET_B = ['Nothing blocked.', 'I will bring the folder.', 'Sounds right.', 'musk gets the handoff.', 'On it.']
const REST_A = ['Quiet in the rest area.', 'Desks are empty for now.', 'We still report to musk.', 'Good seat.', 'No task yet.']
const REST_B = ['Fine by me.', 'Nameplates are still up.', "Corner office is musk's.", 'I will sit this one out.', 'Until there is work.']
const MUSK_REST = ['The team reports here.', 'I am in the rest area too.', 'Bring work when it is done.', 'Quiet morning.']
const MUSK_REPLY = ['Leave it with me.', 'I will review it.', 'Noted.']
const SELF_IDLE = ['Talking it through.', 'Note to self.', 'That outline holds.', 'Just muttering.', 'I will wait for a task.']
const SELF_WAIT = ['Waiting on a look.', 'I can wave from here.', 'Still by the door.', 'Need a person for this.']
const THINK_IDLE = ['Nothing queued.', 'Resting until there is work.', 'Desk can wait.', 'Hmm.']
const THINK_WAIT = ['Waiting on a look.', 'Need a person for this.']
const THINK_ERROR = ['Stuck on a question.', 'This needs a nudge.']
const THINK_ERRAND = ['Taking this to musk.', 'Folder is ready.', 'Walk it to the corner office.']
const DELIVER_A = ['For you, musk.', 'Finished pass.', 'Folder from my desk.']
const THINK_MUSK = ['Reviewing the pile.', 'Who is next?', 'Handoffs come here.', 'The corner office is open.']

const _headA = new THREE.Vector3()
const _headB = new THREE.Vector3()
const _hip = new THREE.Vector3()
const _screenA = new THREE.Vector3()
const _screenB = new THREE.Vector3()

function pick(list, bot, bucket) {
  if (!list.length) return 'Hmm.'
  const n = Math.abs(Math.floor((bot?.phase || 0) * 8) + bucket) % list.length
  return list[n]
}

function clip(text, max) {
  const clean = String(text).replace(/\s+/g, ' ').trim()
  if (clean.length <= max) return clean
  return `${clean.slice(0, max - 1).trim()}…`
}

function dist2(a, b) {
  const dx = a.root.position.x - b.root.position.x
  const dz = a.root.position.z - b.root.position.z
  return dx * dx + dz * dz
}

function ready(bot, elapsed) {
  return !bot.moving && bot.goals.length <= 1 && bot.spinLeft <= 0 && !bot.carrying && bot.quietUntil <= elapsed
}

function workLine(bot, bucket) {
  if (bot.def.id === 'musk') return pick(THINK_MUSK, bot, bucket)
  const sim = (bot.def.sim || 'the work').replace(/^(studying|reviewing|growing)\s+/i, '')
  const task = (bot.task || '').replace(/^Simulated\s*·\s*/i, '').trim()
  const bank = ['One more pass.', 'Reading the notes.', 'Checking the shape.', 'Almost there.']
  if (sim && !/\d{2,}/.test(sim)) bank.push(clip(sim, 28))
  if (task && !/^simulated/i.test(bot.task || '') && task.length <= 42 && !/\d{2,}/.test(task)) {
    bank.push(clip(task, 34))
  }
  return pick(bank, bot, bucket)
}

function thinkLine(bot, bucket) {
  if (bot.carrying && bot.routeKey === 'handoff' && !bot.holdStarted) return pick(THINK_ERRAND, bot, bucket)
  if (bot.state === 'error') return pick(THINK_ERROR, bot, bucket)
  if (bot.state === 'waiting') return pick(THINK_WAIT, bot, bucket)
  if (bot.state === 'working') return workLine(bot, bucket)
  return pick(THINK_IDLE, bot, bucket)
}

function selfLine(bot, bucket) {
  if (bot.def.id === 'musk') return pick(['Note to self.', 'The floor is quiet.', 'Talking it through.'], bot, bucket)
  if (bot.state === 'waiting') return pick(SELF_WAIT, bot, bucket)
  if (bot.state === 'error') return pick(THINK_ERROR, bot, bucket)
  return pick(SELF_IDLE, bot, bucket)
}

function pairLines(context, a, b, bucket) {
  const first = a.def.id === 'musk'
    ? pick(MUSK_REST, a, bucket)
    : pick(context === 'meet' ? MEET_A : REST_A, a, bucket)
  const second = b.def.id === 'musk'
    ? pick(MUSK_REPLY, b, bucket)
    : pick(context === 'meet' ? MEET_B : REST_B, b, bucket + 1)
  return [first, second]
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
  if (slot.role === 'deliver') {
    const musk = bots.find((bot) => bot.def.id === 'musk')
    if (!musk || musk.moving || booked.has(musk)) return null
    const visitor = bots.find((bot) => (
      bot.routeKey === 'handoff' && bot.holdStarted && !bot.moving && bot.handoffCloud < 2 && bot.def.id !== 'musk' && !booked.has(bot)
    ))
    if (!visitor) return null
    return {
      kind: 'speech',
      a: visitor,
      b: musk,
      lineA: pick(DELIVER_A, visitor, bucket),
      lineB: pick(MUSK_REPLY, musk, bucket),
      hold: 3.3,
      flag: 2,
      maxDist: 6,
      center: 'pair',
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
    const resting = bots.filter((bot) => ready(bot, elapsed) && bot.place === 'rest' && bot.state === 'idle' && !booked.has(bot))
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
    const working = bots.filter((bot) => free(bot) && bot.state === 'working' && (bot.place === 'desk' || bot.place === 'musk-desk'))
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
    { role: 'deliver', cooldown: 0.4, rest: 0.3 },
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

export function updateClouds(layer, bots, camera, dt, elapsed, reduce, width, height) {
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

    if (slot.phase === 'hold' && slot.b && slot.lineB && !slot.swapped && slot.age > slot.hold * 0.46) {
      slot.swapped = true
      slot.speaker = 1
      applyLine(slot)
    }
    if (slot.a) placeSlot(slot, camera, width, height)
  }

  for (const bot of bots) {
    bot.lookAt = null
    bot.gaze = null
  }
  for (const slot of layer.slots) {
    if (slot.phase === 'idle' || slot.phase === 'out' || !slot.a) continue
    if (slot.kind === 'think') {
      if (slot.a.state !== 'error') slot.a.gaze = 'up'
    } else if (slot.b) {
      slot.a.lookAt = slot.b.root.position
      slot.b.lookAt = slot.a.root.position
    }
  }
}
