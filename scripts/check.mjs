import { readFileSync } from 'node:fs'
import { DEPARTMENTS, ROSTER } from '../src/roster.js'
import { assertLayout } from '../src/layout.js'
import { blankBots, mergeStatus, STATES } from '../src/status-model.js'
import { formatOfficeTime, workdayAt } from '../src/day.js'
import { routeThrough } from '../src/layout.js'
import { createStatus } from '../src/status.js'

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

const updated = mergeStatus(seeded.bots, { name: 'quant', state: 'working', task: '  reading notes \n' })
const quant = updated.bots.find((bot) => bot.name === 'quant')
if (quant.state !== 'working' || quant.task !== 'reading notes') {
  throw new Error('POST merge failed')
}
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

const doors = routeThrough(12, -12, -16, -12)
if (!doors.length) throw new Error('Product should walk through a doorway to musk')

const office = createStatus()
if (office.assign('quant', '   ').ok) throw new Error('Empty assign should fail')
const given = office.assign('quant', 'Fix the failed CI on the open PR')
if (!given.ok) throw new Error('Idle assign should work')
const assigned = office.snapshot().bots.find((bot) => bot.id === 'quant')
if (assigned.state === 'idle' || assigned.fact !== 'ci-failed') throw new Error('Assign did not start the CI work')
if (office.assign('quant', 'Something else').ok) throw new Error('Busy assign should fail')

console.log(`ok ${ROSTER.length} bots`)
