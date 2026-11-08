import { DEPARTMENTS, departmentOf } from './roster.js'
import { ZONE_CHIPS } from './layout.js'

const WHERE = {
  rest: 'In the lobby.',
  lobby: 'In the lobby.',
  lounge: 'In the rest room.',
  desk: 'At their desk.',
  'musk-desk': 'In the corner office.',
  'wait-desk': 'Waiting by their desk.',
  'wait-meeting': 'Waiting at the meeting room.',
  meeting: 'In the meeting room.',
  handoff: 'Reporting to musk.',
  library: 'In the library.',
  pantry: 'Getting coffee.',
  snack: 'At a snack bar.',
  copy: 'At the copier.',
}

function esc(value) {
  return String(value ?? '').replace(/[&<>"']/g, (char) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]
  ))
}

export function createUI({ onSimulate, onDay, onOps, onZone, onToggleRoster, onSelect }) {
  const root = document.getElementById('hud')
  root.innerHTML = `
    <div class="left-col">
      <div class="mast">
        <div class="brand panel">
          <h1>Grok Bot Office</h1>
          <p class="sub" lang="zh-Hant">獨立場景，與 xAI 無關</p>
          <p class="count" id="count"></p>
        </div>
        <div class="actions">
          <div class="badge" id="badge">ALL IDLE</div>
          <div class="day-clock" id="day-clock" hidden>
            <span id="day-time">9:00 AM</span>
            <span class="day-beat" id="day-beat">Morning</span>
          </div>
          <button type="button" class="primary" id="ops" aria-pressed="false">Operations</button>
          <button type="button" class="primary" id="sim" aria-pressed="false">Simulate work</button>
          <button type="button" class="primary" id="day" aria-pressed="false">Workday</button>
        </div>
      </div>
      <div class="zones" id="zones"></div>
      <section class="roster panel" id="roster" aria-label="Bots">
        <div class="roster-list" id="roster-list"></div>
      </section>
    </div>
    <section class="detail panel is-empty" id="detail" aria-live="polite"></section>
    <p class="hint">Drag to orbit · scroll or pinch to zoom · click a bot</p>
    <div class="cams">
      <button type="button" id="zoom-out" aria-label="Zoom out">−</button>
      <button type="button" id="zoom-in" aria-label="Zoom in">+</button>
      <button type="button" id="reset-view" aria-label="Show the whole floor">All</button>
    </div>
  `

  const els = {
    badge: root.querySelector('#badge'),
    ops: root.querySelector('#ops'),
    sim: root.querySelector('#sim'),
    day: root.querySelector('#day'),
    dayClock: root.querySelector('#day-clock'),
    dayTime: root.querySelector('#day-time'),
    dayBeat: root.querySelector('#day-beat'),
    count: root.querySelector('#count'),
    zones: root.querySelector('#zones'),
    roster: root.querySelector('#roster'),
    list: root.querySelector('#roster-list'),
    detail: root.querySelector('#detail'),
    zoomIn: root.querySelector('#zoom-in'),
    zoomOut: root.querySelector('#zoom-out'),
    reset: root.querySelector('#reset-view'),
  }

  let snapshot = null
  let selected = null
  let zone = 'all'
  let signature = ''
  let rosterOpen = window.matchMedia('(min-width: 900px)').matches

  els.zones.innerHTML = `
    <button type="button" class="chip bots-chip" id="bots-toggle" aria-pressed="${rosterOpen}">Bots</button>
    ${ZONE_CHIPS.map((chip) => `
      <button type="button" class="chip" data-zone="${chip.id}" aria-pressed="${chip.id === 'all'}">${esc(chip.label)}</button>
    `).join('')}
  `

  function paintRosterFlag() {
    els.roster.classList.toggle('is-open', rosterOpen)
    els.roster.hidden = false
    root.querySelector('#bots-toggle').setAttribute('aria-pressed', String(rosterOpen))
  }
  paintRosterFlag()

  root.querySelector('#bots-toggle').addEventListener('click', () => {
    rosterOpen = !rosterOpen
    paintRosterFlag()
    onToggleRoster?.(rosterOpen)
  })

  els.zones.addEventListener('click', (event) => {
    const button = event.target.closest('[data-zone]')
    if (!button) return
    zone = button.dataset.zone
    for (const chip of els.zones.querySelectorAll('[data-zone]')) {
      chip.setAttribute('aria-pressed', String(chip.dataset.zone === zone))
    }
    onZone(zone)
  })

  els.ops.addEventListener('click', () => {
    onOps(els.ops.getAttribute('aria-pressed') !== 'true')
  })
  els.sim.addEventListener('click', () => {
    onSimulate(els.sim.getAttribute('aria-pressed') !== 'true')
  })
  els.day.addEventListener('click', () => {
    onDay(els.day.getAttribute('aria-pressed') !== 'true')
  })

  els.list.addEventListener('click', (event) => {
    const button = event.target.closest('[data-id]')
    if (!button) return
    onSelect(button.dataset.id)
  })

  function paintSelection() {
    for (const button of els.list.querySelectorAll('.bot')) {
      const on = button.dataset.id === selected
      button.classList.toggle('is-selected', on)
      button.setAttribute('aria-current', on ? 'true' : 'false')
    }
  }

  function renderRoster(bots) {
    const scroll = els.list.scrollTop
    const groups = DEPARTMENTS.map((dept) => {
      const members = bots.filter((bot) => bot.dept === dept.id)
      const rows = members.map((bot) => `
        <button type="button" class="bot" data-id="${esc(bot.id)}">
          <span class="swatch" style="background:${esc(bot.color)}"></span>
          <span class="bot-copy">
            <span class="bot-name">${esc(bot.name)}</span>
            <span class="bot-role">${esc(bot.project || bot.repo || bot.role)}</span>
          </span>
          <span class="state is-${esc(bot.state)}">${esc(labelState(bot.state))}</span>
        </button>
      `).join('')
      return `
        <div class="dept">
          <h2>${esc(dept.label)}</h2>
          ${rows}
        </div>
      `
    }).join('')
    els.list.innerHTML = groups
    els.list.scrollTop = scroll
    paintSelection()
  }

  function renderDetail() {
    if (!snapshot || !selected) {
      els.detail.classList.add('is-empty')
      els.detail.innerHTML = `
        <h2>No bot selected</h2>
        <p>Choose someone in the rest area or on the roster. Idle bots sit there. Desks keep their nameplates.</p>
      `
      return
    }
    const bot = snapshot.bots.find((item) => item.id === selected)
    if (!bot) return
    const dept = departmentOf(bot.dept)
    els.detail.classList.remove('is-empty')
    const repo = bot.repo
      ? `<a href="https://github.com/${esc(bot.repo)}" target="_blank" rel="noopener noreferrer">${esc(bot.repo)}</a>`
      : ''
    const task = bot.task
      ? esc(bot.task)
      : 'No task'
    const simNote = snapshot.day
      ? '<p class="sim-note">Workday story in this browser. It is not written to status.</p>'
      : snapshot.mode === 'ops'
        ? '<p class="sim-note">Operations. Typed work stays in this browser. PR and CI are labeled GitHub or status.</p>'
        : snapshot.simulating
          ? '<p class="sim-note">Shown only while Simulate work is on. It is not written to status.</p>'
          : ''
    const prLine = bot.pr && bot.pr !== 'none'
      ? `<div><dt>PR</dt><dd>${esc(bot.pr)}${bot.prTitle ? ` · ${esc(bot.prTitle)}` : ''} · ${bot.prSource === 'github' ? 'GitHub' : 'status'}</dd></div>`
      : ''
    const ciLine = bot.ci && bot.ci !== 'none'
      ? `<div><dt>CI</dt><dd>${esc(bot.ci)} · ${bot.ciSource === 'github' ? 'GitHub' : 'status'}</dd></div>`
      : ''
    const planLine = bot.plan ? `<div><dt>Plan</dt><dd>${esc(bot.plan)}</dd></div>` : ''
    els.detail.innerHTML = `
      <p class="eyebrow">${esc(dept?.label || '')}</p>
      <h2>${esc(bot.name)}</h2>
      <p class="role">${esc(bot.role)}</p>
      <dl>
        <div><dt>State</dt><dd class="state is-${esc(bot.state)}">${esc(labelState(bot.state))}</dd></div>
        <div><dt>Where</dt><dd>${esc(WHERE[bot.place] || WHERE.rest)}</dd></div>
        <div><dt>Task</dt><dd>${task}</dd></div>
        ${planLine}
        ${prLine}
        ${ciLine}
        <div><dt>Desk</dt><dd>${esc(bot.focus)}</dd></div>
        ${bot.id === 'musk'
          ? '<div><dt>Reports</dt><dd>Everyone reports to musk.</dd></div>'
          : '<div><dt>Reports to</dt><dd>musk</dd></div>'}
        ${repo ? `<div><dt>Repo</dt><dd>${repo}</dd></div>` : ''}
      </dl>
      ${simNote}
    `
  }

  return {
    zoomIn: els.zoomIn,
    zoomOut: els.zoomOut,
    reset: els.reset,
    update(next) {
      snapshot = next
      const sign = next.bots.map((bot) => `${bot.id}:${bot.state}:${bot.place}:${bot.task}:${bot.pr || ''}:${bot.ci || ''}:${bot.prSource || ''}:${bot.ciSource || ''}`).join('|') + next.badge + next.note
      els.badge.textContent = next.badge
      els.badge.title = next.note
      const tone = next.day ? 'day' : next.mode === 'ops' ? 'ops' : next.badge === 'SIMULATION' ? 'sim' : next.badge === 'LIVE' ? 'live' : 'idle'
      els.badge.className = `badge is-${tone}`
      els.ops.setAttribute('aria-pressed', String(next.mode === 'ops'))
      els.ops.textContent = next.mode === 'ops' ? 'Stop operations' : 'Operations'
      els.sim.setAttribute('aria-pressed', String(next.mode === 'sim'))
      els.sim.textContent = next.mode === 'sim' ? 'Stop simulation' : 'Simulate work'
      els.day.setAttribute('aria-pressed', String(!!next.day))
      els.day.textContent = next.day ? 'Stop workday' : 'Workday'
      els.dayClock.hidden = !next.day
      els.dayTime.textContent = next.clock || ''
      els.dayBeat.textContent = next.beatLabel || ''
      document.body.classList.toggle('simulating', next.mode === 'sim')
      document.body.classList.toggle('day', !!next.day)
      document.body.classList.toggle('ops', next.mode === 'ops')
      const tally = { idle: 0, working: 0, waiting: 0, error: 0, done: 0 }
      for (const bot of next.bots) tally[bot.state] += 1
      els.count.textContent = next.day
        ? 'Click an idle bot to assign work. Nothing is saved.'
        : next.mode === 'ops'
          ? 'Live status. Click an idle bot to assign. Nothing is written.'
          : next.simulating
            ? 'Browser-only animation. Nothing is saved.'
            : tally.idle === next.bots.length
              ? `All ${next.bots.length} idle · lobby and rest room`
              : `${tally.working} working · ${tally.waiting} waiting · ${tally.error} stuck · ${tally.done} done`
      if (sign !== signature) {
        signature = sign
        renderRoster(next.bots)
        renderDetail()
      } else {
        paintSelection()
      }
    },
    setSelected(id) {
      selected = id
      paintSelection()
      renderDetail()
      if (id && window.matchMedia('(max-width: 900px)').matches) {
        rosterOpen = false
        paintRosterFlag()
      }
    },
    setZone(id) {
      zone = id
      for (const chip of els.zones.querySelectorAll('[data-zone]')) {
        chip.setAttribute('aria-pressed', String(chip.dataset.zone === zone))
      }
    },
    selectedId() {
      return selected
    },
  }
}

function labelState(state) {
  if (state === 'error') return 'Stuck'
  if (state === 'idle') return 'Idle'
  if (state === 'working') return 'Working'
  if (state === 'waiting') return 'Waiting'
  if (state === 'done') return 'Done'
  return state
}
