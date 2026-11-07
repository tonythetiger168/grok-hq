import { readFileSync } from 'node:fs'
import { DEPARTMENTS, ROSTER } from '../src/roster.js'
import { assertLayout } from '../src/layout.js'
import { blankBots, mergeStatus, STATES } from '../src/status-model.js'

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

console.log(`ok ${ROSTER.length} bots`)
