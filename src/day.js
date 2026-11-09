import { ROSTER } from './roster.js'

export const DAY_START = 9 * 60
export const DAY_END = 18 * 60
export const DAY_SPAN = DAY_END - DAY_START
export const DAY_SECONDS = 210

const STANDUP = ['grok-bot', 'helios-forge', 'aevum', 'quant', 'linkup', 'vectorbt']

const REPORTS = [
  { id: 'grok-bot', start: 10 * 60, end: 10 * 60 + 44, fact: 'pr-open', ci: 'green', follow: 'next-step' },
  { id: 'helios-forge', start: 10 * 60 + 50, end: 11 * 60 + 34, fact: 'ci-failed', ci: 'failed', follow: 'fix-ci' },
  { id: 'quant', start: 11 * 60 + 40, end: 12 * 60 + 14, fact: 'pr-open', ci: 'green', follow: 'review-pr' },
  { id: 'aevum', start: 13 * 60 + 10, end: 13 * 60 + 54, fact: 'ci-failed', ci: 'failed', follow: 'fix-ci' },
  { id: 'linkup', start: 14 * 60, end: 14 * 60 + 44, fact: 'pr-closed', ci: 'green', follow: 'next-step' },
  { id: 'duckdb', start: 14 * 60 + 50, end: 15 * 60 + 34, fact: 'sandbox-leak', ci: '', follow: 'lock-sandbox' },
  { id: 'freqtrade', start: 15 * 60 + 40, end: 16 * 60 + 24, fact: 'pr-open', ci: 'green', follow: 'keep-open' },
  { id: 'helios-forge', start: 16 * 60 + 30, end: 17 * 60 + 12, fact: 'ci-green', ci: 'green', follow: 'keep-open', update: true },
]

const WATCH = [
  { id: 'minisim', start: 14 * 60 + 20, end: 16 * 60, task: 'On watch. Shared access is still leaking.' },
]

const COPIES = [
  { id: 'grok-bot', start: 9 * 60 + 6, end: 9 * 60 + 20, task: 'Copies for standup' },
  { id: 'skfolio', start: 16 * 60 + 8, end: 16 * 60 + 24, task: 'Copies of the plan for musk' },
]

const EXCHANGES = [
  { start: 10 * 60 + 46, end: 10 * 60 + 58, a: 'linkup', b: 'wavelive', fact: 'ci-failed', where: 'snack', spot: 0 },
  { start: 13 * 60 + 56, end: 14 * 60 + 8, a: 'aevum', b: 'julang', fact: 'ci-failed', where: 'library', spot: 0 },
  { start: 13 * 60 + 16, end: 14 * 60 + 20, a: 'minisim', b: 'duckdb', fact: 'sandbox-leak', where: 'servers', spot: 0 },
  { start: 14 * 60 + 46, end: 15 * 60, a: 'quant', b: 'julang', fact: 'pr-open', where: 'snack', spot: 3 },
  { start: 17 * 60 + 14, end: 17 * 60 + 26, a: 'helios-forge', b: 'vectorbt', fact: 'ci-green', where: 'lobby', spot: 0 },
]

const BITS = {
  musk: 'the stack',
  'grok-bot': 'the assistant note',
  'dr-eggbot': 'the silhouette',
  'helios-forge': 'the helios pass',
  aevum: 'the aevum pass',
  zaolang: 'the zaolang pass',
  julang: 'the julang pass',
  minisim: 'the minisim pass',
  quant: 'the quant pass',
  linkup: 'the linkup pass',
  wavelive: 'the wavelive pass',
  vectorbt: 'the vectorbt notes',
  'agent-display': 'the display pass',
  apscheduler: 'the schedule pass',
  duckdb: 'the duckdb pass',
  skfolio: 'the folder of notes',
  ccxt: 'the exchange notes',
  cryptofeed: 'the feed notes',
  freqtrade: 'the rule notes',
  quantstats: 'the chart notes',
  'lightweight-charts': 'the chart sketch',
}

function unit(id) {
  let h = 2166136261
  for (let i = 0; i < id.length; i += 1) h = Math.imul(h ^ id.charCodeAt(i), 16777619)
  return (h >>> 0) / 4294967296
}

export function bitOf(id) {
  return BITS[id] || 'the pass'
}

export function officeMinute(simT) {
  const t = ((simT % DAY_SECONDS) + DAY_SECONDS) % DAY_SECONDS
  return DAY_START + (t / DAY_SECONDS) * DAY_SPAN
}

export function simTForMinute(minute) {
  const clamped = Math.min(DAY_END - 0.01, Math.max(DAY_START, minute))
  return ((clamped - DAY_START) / DAY_SPAN) * DAY_SECONDS
}

export function formatOfficeTime(minute) {
  const whole = Math.floor(minute)
  let h = Math.floor(whole / 60) % 24
  const min = ((whole % 60) + 60) % 60
  const ap = h >= 12 ? 'PM' : 'AM'
  h = h % 12 || 12
  return `${h}:${String(min).padStart(2, '0')} ${ap}`
}

export function clockDate(minute) {
  const whole = Math.floor(minute)
  const h = Math.floor(whole / 60) % 24
  const min = ((whole % 60) + 60) % 60
  return new Date(2026, 0, 6, h, min, 0)
}

export function parseClock(value) {
  if (!value) return null
  const match = String(value).trim().match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm)?$/i)
  if (!match) return null
  let h = Number(match[1])
  const min = Number(match[2] || 0)
  const ap = (match[3] || '').toLowerCase()
  if (ap === 'pm' && h < 12) h += 12
  if (ap === 'am' && h === 12) h = 0
  if (!ap && h <= 7) h += 12
  if (h > 23 || min > 59) return null
  return h * 60 + min
}

export function beatAt(minute) {
  if (minute < 9 * 60 + 16) return 'gather'
  if (minute < 9 * 60 + 42) return 'standup'
  if (minute < 12 * 60 + 18) return 'focus'
  if (minute < 13 * 60 + 5) return 'lunch'
  if (minute < 16 * 60 + 15) return 'afternoon'
  if (minute < 17 * 60 + 22) return 'wrap'
  return 'wind'
}

export function beatTitle(beat) {
  return {
    gather: 'Morning in the lobby',
    standup: 'Standup',
    focus: 'On the plan',
    lunch: 'Lunch',
    afternoon: 'Afternoon',
    wrap: 'Wrap-up',
    wind: 'Wind-down',
  }[beat] || ''
}

function activeReport(minute) {
  return REPORTS.find((item) => minute >= item.start && minute < item.end) || null
}

function followOf(id, minute) {
  const past = REPORTS.filter((item) => item.id === id && minute >= item.end && minute < item.end + 48)
  return past[past.length - 1] || null
}

function watchOf(id, minute) {
  return WATCH.find((item) => item.id === id && minute >= item.start && minute < item.end) || null
}

function exchangeOf(id, minute) {
  return EXCHANGES.find((item) => minute >= item.start && minute < item.end && (item.a === id || item.b === id)) || null
}

function heardFollow(id, minute) {
  const past = EXCHANGES.filter((item) => item.b === id && minute >= item.end && minute < item.end + 28)
  return past[past.length - 1] || null
}

export function parseWork(text) {
  const clean = String(text || '').replace(/\s+/g, ' ').trim()
  if (!clean) return null
  const clipped = clean.slice(0, 80)
  const t = clipped.toLowerCase()
  let fact = 'plan'
  let ci = ''
  if (/sandbox|breach|jail/.test(t)) {
    fact = /leak|fail|open|loose|red|breach|escape|shared/.test(t) ? 'sandbox-leak' : 'sandbox-ok'
    ci = ''
  } else if (/fail|red|broken/.test(t)) {
    fact = 'ci-failed'
    ci = 'failed'
  } else if (/green|passing/.test(t)) {
    fact = 'ci-green'
    ci = 'green'
  } else if (/clos/.test(t)) {
    fact = 'pr-closed'
    ci = 'green'
  } else if (/open/.test(t) && /pr|pull/.test(t)) {
    fact = 'pr-open'
    ci = 'green'
  } else if (/ci|check/.test(t)) {
    fact = 'ci-failed'
    ci = 'failed'
  } else if (/pr|pull/.test(t)) {
    fact = 'pr-open'
    ci = 'green'
  } else if (/follow/.test(t)) {
    fact = 'plan'
  }
  let workPlace = 'desk'
  if (/sandbox|breach|jail/.test(t)) workPlace = 'servers'
  else if (/ping|pong|arcade|jukebox/.test(t)) workPlace = 'rec'
  else if (/balcony|outside/.test(t)) workPlace = 'balcony'
  else if (/copy|print/.test(t)) workPlace = 'copy'
  else if (/coffee|snack|tea|lobby/.test(t)) workPlace = 'snack'
  else if (/library|read/.test(t)) workPlace = 'library'
  const follow = fact === 'sandbox-leak'
    ? 'lock-sandbox'
    : fact === 'ci-failed'
      ? 'fix-ci'
      : fact === 'pr-closed'
        ? 'next-step'
        : fact === 'pr-open'
          ? 'review-pr'
          : 'next-step'
  return { text: clipped, fact, ci, follow, workPlace }
}

function factTask(bot, fact) {
  const bit = bitOf(bot.id)
  if (fact === 'sandbox-leak') return `Sandbox breach: shared access is leaking on ${bit}`
  if (fact === 'sandbox-ok') return `Sandbox check: isolation looks tight on ${bit}`
  if (fact === 'ci-failed') return `Plan: failed CI on ${bit}`
  if (fact === 'ci-green') return `Plan: CI is green on ${bit}`
  if (fact === 'pr-open') return `Plan: PR still open for ${bit}`
  if (fact === 'pr-closed') return `Plan: PR closed on ${bit}`
  return `Plan: next step for ${bit}`
}

function followTask(follow, bot) {
  const bit = bitOf(bot.id)
  if (follow === 'fix-ci') return `Fixing failed CI on ${bit}`
  if (follow === 'lock-sandbox') return `Locking down the sandbox on ${bit}. Then I re-check.`
  if (follow === 'review-pr') return `Reviewing the open PR for ${bit}`
  if (follow === 'keep-open') return `Keeping the PR open on ${bit}`
  if (follow === 'write-plan') return `Writing the next plan step for ${bit}`
  if (follow === 'close-pr') return `Closing the PR for ${bit}`
  return `Next plan step for ${bit}`
}

function focusRow(bot, minute) {
  const u = unit(bot.id)
  const block = Math.floor(minute / 28)
  const roll = (u + block * 0.173) % 1
  const facts = ['plan', 'pr-open', 'ci-green', 'ci-failed', 'pr-closed', 'sandbox-ok', 'sandbox-leak']
  const fact = facts[(block + Math.floor(u * 5)) % facts.length]
  const spot = Math.floor(u * 7)
  if (roll < 0.38) return { state: 'working', place: 'desk', fact, task: factTask(bot, fact), spot, cup: 'none' }
  if ((fact === 'sandbox-ok' || fact === 'sandbox-leak') && roll < 0.52) {
    const tight = fact === 'sandbox-ok'
    return {
      state: 'working',
      place: 'servers',
      fact,
      task: tight ? 'Sandbox passed. Isolation looks tight.' : 'Sandbox check: a boundary looks open.',
      spot: spot % 2,
      cup: 'none',
    }
  }
  if (roll < 0.5) return { state: 'working', place: 'library', fact, task: `Reading the plan for ${bitOf(bot.id)}`, spot: spot % 3, cup: 'none' }
  if (roll < 0.62) return { state: 'idle', place: 'snack', fact, task: `Snack break, still on ${bitOf(bot.id)}`, spot: spot % 7, cup: roll < 0.58 ? 'sip' : 'hand' }
  if (roll < 0.74) return { state: 'idle', place: 'pantry', fact, task: 'Coffee in the kitchen, then the plan', spot: spot % 3, cup: 'hand' }
  if (roll < 0.86) return { state: 'idle', place: 'rec', fact, task: 'A game in the rec room, then the plan', spot: spot % 4, cup: 'none' }
  if (roll < 0.93) return { state: 'idle', place: 'balcony', fact, task: 'A minute on the balcony', spot: spot % 2, cup: 'none' }
  return { state: 'idle', place: 'lounge', fact, task: 'Resting with the plan', spot: spot % 4, cup: 'sip' }
}

function row(bot, extra) {
  return {
    state: 'idle',
    place: 'lobby',
    meetIndex: 0,
    spot: 0,
    task: '',
    beat: '',
    cup: 'none',
    fact: 'plan',
    ci: '',
    follow: '',
    returnPlace: 'desk',
    bark: '',
    ...extra,
    id: bot.id,
  }
}

export function workdayAt(minute, intel = new Map()) {
  const beat = beatAt(minute)
  const report = activeReport(minute)
  return ROSTER.map((bot) => {
    let next = row(bot, { beat })
    if (bot.id === 'musk') {
      if (minute < 9 * 60 + 6 || minute >= 17 * 60 + 35) {
        next = row(bot, {
          beat,
          place: minute < 10 * 60 ? 'lobby' : 'lounge',
          task: minute < 10 * 60 ? 'Opening the office' : 'Wind-down in the rest room',
        })
      } else {
        next = row(bot, {
          beat,
          state: 'working',
          place: 'musk-desk',
          task: report ? 'Hearing a report' : 'Reading plan, PR, and CI updates',
          fact: report?.fact || 'plan',
        })
      }
    } else if (report && report.id === bot.id) {
      next = row(bot, {
        beat,
        state: 'done',
        place: 'handoff',
        fact: report.fact,
        ci: report.ci,
        follow: report.follow,
        returnPlace: 'desk',
        task: String(report.fact).startsWith('sandbox')
          ? (report.fact === 'sandbox-leak' ? 'Reporting the sandbox breach' : 'Reporting the sandbox check')
          : report.update ? 'Update for musk' : 'Reporting plan, PR, and CI',
      })
    } else {
      const copy = COPIES.find((item) => item.id === bot.id && minute >= item.start && minute < item.end)
      const watch = watchOf(bot.id, minute)
      const exchange = exchangeOf(bot.id, minute)
      const heard = heardFollow(bot.id, minute)
      const follow = followOf(bot.id, minute)
      if (copy) {
        next = row(bot, { beat, state: 'working', place: 'copy', task: copy.task, fact: 'plan' })
      } else if (watch) {
        next = row(bot, {
          beat,
          state: 'working',
          place: 'servers',
          fact: 'sandbox-leak',
          spot: 1,
          task: watch.task,
        })
      } else if (exchange) {
        const listener = exchange.b === bot.id
        next = row(bot, {
          beat,
          state: exchange.where === 'servers' ? 'working' : 'idle',
          place: exchange.where === 'library'
            ? 'library'
            : exchange.where === 'lobby'
              ? 'lobby'
              : exchange.where === 'servers'
                ? 'servers'
                : 'snack',
          spot: exchange.spot + (listener ? 1 : 0),
          fact: exchange.fact,
          cup: exchange.where === 'snack' ? 'sip' : 'none',
          task: exchange.where === 'servers'
            ? (exchange.fact === 'sandbox-leak'
              ? (listener ? 'Hearing the sandbox breach' : 'Raising the sandbox alarm')
              : (listener ? 'Hearing the sandbox check' : 'Checking sandbox security'))
            : (listener ? 'Hearing a plan update' : 'Sharing a plan update'),
        })
      } else if (heard) {
        next = row(bot, {
          beat,
          state: 'working',
          place: String(heard.fact).startsWith('sandbox') ? 'servers' : 'desk',
          fact: heard.fact,
          task: factTask(bot, heard.fact).replace('Plan:', 'After the chat:'),
        })
      } else if (follow && beat !== 'wind' && beat !== 'lunch') {
        next = row(bot, {
          beat,
          state: 'working',
          place: follow.follow === 'lock-sandbox'
            ? 'servers'
            : follow.follow === 'write-plan' && minute < follow.end + 16
              ? 'copy'
              : 'desk',
          fact: follow.fact,
          follow: follow.follow,
          ci: follow.ci,
          task: followTask(follow.follow, bot),
        })
      } else if (beat === 'gather') {
        const u = unit(bot.id)
        next = row(bot, {
          beat,
          place: u > 0.72 ? 'snack' : 'lobby',
          spot: Math.floor(u * 3),
          cup: u < 0.6 ? 'sip' : 'none',
          task: 'Settling in. Coffee, then the pass.',
        })
      } else if (beat === 'standup') {
        const meet = STANDUP.indexOf(bot.id)
        if (meet >= 0) {
          next = row(bot, { beat, state: 'working', place: 'meeting', meetIndex: meet, task: 'Standup: plan, PRs, and CI', fact: 'plan' })
        } else if (unit(bot.id) < 0.35) {
          next = row(bot, { beat, place: 'lounge', cup: 'sip', task: 'Waiting in the rest room' })
        } else {
          next = row(bot, { beat, ...focusRow(bot, minute), beat })
        }
      } else if (beat === 'lunch') {
        const u = unit(bot.id)
        next = row(bot, {
          beat,
          place: u < 0.22 ? 'lounge' : u < 0.42 ? 'rec' : u < 0.68 ? 'snack' : 'pantry',
          spot: Math.floor(u * 7),
          cup: 'sip',
          task: 'Lunch. The plan can sit.',
        })
      } else if (beat === 'wind') {
        next = row(bot, { beat, place: 'lounge', spot: Math.floor(unit(bot.id) * 4), cup: unit(bot.id) < 0.4 ? 'sip' : 'none', task: 'Wind-down in the rest room.' })
      } else {
        next = row(bot, { beat, ...focusRow(bot, minute) })
      }
    }

    const info = intel.get(bot.id)
    if (
      info
      && bot.id !== 'musk'
      && next.place !== 'handoff'
      && next.place !== 'meeting'
      && next.place !== 'copy'
      && next.place !== 'servers'
    ) {
      next = {
        ...next,
        state: 'working',
        place: String(info.fact).startsWith('sandbox') ? 'servers' : info.fact === 'pr-open' ? 'library' : 'desk',
        fact: info.fact,
        task: `Using what I heard: ${factTask(bot, info.fact)}`,
      }
    }
    return { ...bot, ...next, origin: 'day' }
  })
}
