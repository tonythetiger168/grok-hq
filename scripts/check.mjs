import { readFileSync } from 'node:fs'
import { DEPARTMENTS, ROSTER } from '../src/roster.js'
import { assertLayout, routeThrough, zoneAt } from '../src/layout.js'
import { blankBots, mergeStatus, STATES } from '../src/status-model.js'
import { formatOfficeTime, workdayAt } from '../src/day.js'
import { factFromOps, summarizePulls } from '../src/ops-summary.js'
import { arrangeOps, createStatus } from '../src/status.js'

assertLayout(ROSTER)

const ids = new Set(ROSTER.map((bot) => bot.id))
const names = new Set(ROSTER.map((bot) => bot.name))
if (ids.size !== ROSTER.length || names.size !== ROSTER.length) {
  throw new Error('Roster ids or names are not unique')
}
if (ROSTER.length !== 21) throw new Error(`Expected 21 bots, found ${ROSTER.length}`)

for (const bot of ROSTER) {
  if (!DEPARTMENTS.some((dept) => dept.id === bot.dept)) {
    throw new Error(`Unknown department for ${bot.name}`)
  }
  if (!bot.color || !bot.role || !bot.sim) throw new Error(`Incomplete roster row ${bot.name}`)
}

const file = JSON.parse(readFileSync(new URL('../public/status.json', import.meta.url), 'utf8'))
const seeded = mergeStatus(blankBots(), file)
if (seeded.errors.length) throw new Error(seeded.errors.join('\n'))
if (seeded.bots.length !== ROSTER.length) throw new Error('Seed did not cover the roster')
for (const bot of seeded.bots) {
  if (!STATES.includes(bot.state)) throw new Error(`Bad seeded state for ${bot.name}`)
  if (!names.has(bot.name)) throw new Error(`Unexpected name ${bot.name}`)
}

const updated = mergeStatus(seeded.bots, { name: 'quant', state: 'working', task: '  reading notes \n', pr: 'open', ci: 'failed', plan: 'review the pass' })
const quant = updated.bots.find((bot) => bot.name === 'quant')
if (quant.state !== 'working' || quant.task !== 'reading notes') {
  throw new Error('POST merge failed')
}
if (quant.pr !== 'open' || quant.ci !== 'failed' || quant.plan !== 'review the pass') {
  throw new Error('PR, CI, and plan should be kept')
}
const kept = mergeStatus(updated.bots, { name: 'quant', state: 'done', task: 'report' })
const keptQuant = kept.bots.find((bot) => bot.name === 'quant')
if (keptQuant.pr !== 'open' || keptQuant.ci !== 'failed' || keptQuant.plan !== 'review the pass') {
  throw new Error('Omitting PR or CI should keep the previous values')
}
const badPr = mergeStatus(blankBots(), { name: 'quant', state: 'working', pr: '42' })
if (!badPr.errors.length || badPr.bots.find((bot) => bot.name === 'quant').state !== 'idle') {
  throw new Error('A bad PR value should be rejected')
}
const openFail = summarizePulls([{ state: 'OPEN', title: 'Fix clock', statusCheckRollup: [{ conclusion: 'FAILURE' }] }])
if (openFail.pr !== 'open' || openFail.ci !== 'failed' || /http/.test(JSON.stringify(openFail))) {
  throw new Error('Open PR with a failed check')
}
const merged = summarizePulls([{ state: 'MERGED', title: 'Ship', statusCheckRollup: [{ conclusion: 'SUCCESS' }] }])
if (merged.pr !== 'merged' || merged.ci !== 'green') throw new Error('Merged PR should stay a word, not a number')
if (summarizePulls([]).pr !== 'none') throw new Error('No pulls is none')
if (factFromOps('open', 'failed') !== 'ci-failed') throw new Error('Failed CI wins')
if (factFromOps('merged', 'green') !== 'pr-closed') throw new Error('Merged is closed for the office')
if (factFromOps('open', 'green') !== 'ci-green') throw new Error('Open and green')
if (factFromOps('', '') !== 'plan') throw new Error('Missing ops fields are a plan')
const opsRows = arrangeOps([
  { id: 'musk', state: 'idle', pr: '', ci: '' },
  { id: 'quant', state: 'done', pr: 'open', ci: 'green', task: 'Reporting' },
  { id: 'helios-forge', state: 'working', pr: 'open', ci: 'failed', task: 'Pass' },
  { id: 'aevum', state: 'working', pr: 'merged', ci: 'green', task: 'Pass' },
  { id: 'grok-bot', state: 'idle', pr: '', ci: '' },
])
const handing = opsRows.filter((row) => row.place === 'handoff')
if (handing.length !== 1 || handing[0].id !== 'quant' || handing[0].fact !== 'ci-green') {
  throw new Error('Operations should send one done bot to musk')
}
if (opsRows.filter((row) => row.place === 'meeting').length !== 2) throw new Error('Operations standup')
if (opsRows.find((row) => row.id === 'musk').place !== 'musk-desk') throw new Error('musk should read from the office')
if (opsRows.find((row) => row.id === 'grok-bot').place !== 'rest') throw new Error('Idle stays in the lobby')
const reset = mergeStatus(updated.bots, { reset: true })
if (reset.bots.some((bot) => bot.state !== 'idle')) throw new Error('Reset failed')
const rejected = mergeStatus(blankBots(), { name: 'nobody', state: 'working' })
if (!rejected.errors.length || rejected.bots.some((bot) => bot.state !== 'idle')) {
  throw new Error('Unknown bot should be rejected')
}

if (formatOfficeTime(9 * 60 + 5) !== '9:05 AM') throw new Error('Morning clock')
if (formatOfficeTime(12 * 60) !== '12:00 PM') throw new Error('Noon clock')
if (formatOfficeTime(13 * 60) !== '1:00 PM') throw new Error('Afternoon clock')
if (formatOfficeTime(18 * 60) !== '6:00 PM') throw new Error('Evening clock')

for (const minute of [9 * 60 + 10, 10 * 60 + 10, 12 * 60, 14 * 60 + 20, 17 * 60 + 40]) {
  const rows = workdayAt(minute)
  const handing = rows.filter((row) => row.place === 'handoff')
  if (handing.length > 1) throw new Error(`Overlapping reports at ${minute}`)
}
const reporting = workdayAt(10 * 60 + 10).find((row) => row.place === 'handoff')
if (!reporting || reporting.fact !== 'pr-open') throw new Error('Morning report should be an open PR')
const after = workdayAt(10 * 60 + 50).find((row) => row.id === 'grok-bot')
if (!after || after.place === 'handoff') throw new Error('Follow-up should leave musk')
if (!/plan|PR|CI/i.test(after.task)) throw new Error('Follow-up task should stay on the plan')

const doors = routeThrough(-2, 1.6, -9, -6.6)
if (doors.length < 2) throw new Error('Desks should reach musk through the report path')
if (zoneAt(-9.2, 7.6) !== 'rest') throw new Error('Lobby should be the compact entrance')
if (zoneAt(-0.4, 7.6) !== 'lounge') throw new Error('Rest should be its own room')
if (zoneAt(6.6, 3.6) !== 'meeting') throw new Error('Meeting should sit on its own carpet')
if (zoneAt(10.6, 1.6) !== 'coffee') throw new Error('Coffee should be its own room')
if (!routeThrough(-9.2, 7.6, 11.45, 1.15).length) throw new Error('Coffee room should be reachable from the lobby')
if (!routeThrough(-9.2, 7.6, -0.4, 7.6).length) throw new Error('Rest room should be reachable from the lobby')
if (zoneAt(-9, -6.6) !== 'lead') throw new Error('musk keeps the glass corner')
if (zoneAt(14.8, 1.6) !== 'printers') throw new Error('Printers should be its own room')
if (!routeThrough(-9.2, 7.6, 14.15, 1.55).length) throw new Error('Printers should be reachable from the lobby')
if (!routeThrough(-2, 1.6, 14.15, 1.55).length) throw new Error('Copying should walk in from the desks')
if (!routeThrough(-9.2, 7.6, -9, -2.4).length) throw new Error('Snack nook should be reachable from the lobby')
const wind = workdayAt(17 * 60 + 40).find((row) => row.id === 'aevum')
if (!wind || wind.place !== 'lounge') throw new Error('Wind-down should walk into the rest room')
if (!routeThrough(-2, 1.6, 13, -6.5).length) throw new Error('Library should be reachable from the desks')
if (zoneAt(2.3, -8) !== 'vacant') throw new Error('The former office should stay empty')
if (zoneAt(3.6, 0.7) !== 'huddle') throw new Error('Small meeting should be its own room')
if (zoneAt(7.3, -6.5) !== 'allhands') throw new Error('Large meeting should be its own room')
if (!routeThrough(-2, 1.6, 6.6, 3.6).length) throw new Error('Standup should reach the medium meeting room')
if (zoneAt(7.85, 7.45) !== 'rec') throw new Error('Rec should be its own room')
if (!routeThrough(-9.2, 7.6, 6.15, 7.45).length) throw new Error('Rec should be reachable from the lobby')
if (!routeThrough(-2, 1.6, 14.55, 7.55).length) throw new Error('Rec should be reachable from the desks')
if (zoneAt(13.2, 10.6) !== 'balcony') throw new Error('Balcony should sit outside the rec room')
if (!routeThrough(7.85, 7.45, 12.2, 10.5).length) throw new Error('Balcony should be reachable from Rec')

const office = createStatus()
if (office.assign('quant', '   ').ok) throw new Error('Empty assign should fail')
const given = office.assign('quant', 'Fix the failed CI on the open PR')
if (!given.ok) throw new Error('Idle assign should work')
const assigned = office.snapshot().bots.find((bot) => bot.id === 'quant')
if (assigned.state === 'idle' || assigned.fact !== 'ci-failed') throw new Error('Assign did not start the CI work')
if (office.assign('quant', 'Something else').ok) throw new Error('Busy assign should fail')

console.log(`ok ${ROSTER.length} bots`)
