/** Active team. public/team.json is the file people edit. */

const HAIR_STYLES = ['crop', 'swept', 'tuft', 'quiff', 'bun', 'side', 'bob', 'part', 'bangs', 'curly']
const SEAT_LIMIT = 21

let state = emptyState()

export let ROSTER = []
export let DEPARTMENTS = []

function emptyState() {
  return {
    leaderId: '',
    leaderName: 'lead',
    groups: [],
    bots: [],
    cast: emptyCast(),
  }
}

function emptyCast() {
  return { standup: [], reports: [], watch: [], copies: [], exchanges: [] }
}

function slug(value, fallback) {
  const clean = String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
  return clean || fallback
}

function buildCast(bots, leaderId) {
  const team = bots.filter((bot) => bot.id !== leaderId)
  if (!team.length) return emptyCast()
  const at = (index) => team[index % team.length].id
  const other = (id) => team.find((bot) => bot.id !== id)?.id || id
  const slots = [
    { start: 600, end: 644, fact: 'pr-open', ci: 'green', follow: 'next-step' },
    { start: 650, end: 694, fact: 'ci-failed', ci: 'failed', follow: 'fix-ci' },
    { start: 700, end: 734, fact: 'pr-open', ci: 'green', follow: 'review-pr' },
    { start: 790, end: 834, fact: 'ci-failed', ci: 'failed', follow: 'fix-ci' },
    { start: 840, end: 884, fact: 'pr-closed', ci: 'green', follow: 'next-step' },
    { start: 890, end: 934, fact: 'sandbox-leak', ci: '', follow: 'lock-sandbox' },
    { start: 940, end: 984, fact: 'pr-open', ci: 'green', follow: 'keep-open' },
    { start: 990, end: 1032, fact: 'ci-green', ci: 'green', follow: 'keep-open', update: true },
  ]
  const reports = slots.map((slot, index) => ({ ...slot, id: at(index) }))
  const sandbox = reports.find((item) => item.fact === 'sandbox-leak')
  const partner = other(sandbox.id)
  const exchanges = [
    { start: 646, end: 658, a: at(2), b: at(3), fact: 'ci-failed', where: 'snack', spot: 0 },
    { start: 836, end: 848, a: at(4), b: at(5), fact: 'ci-failed', where: 'library', spot: 0 },
    { start: 796, end: 840, a: partner, b: sandbox.id, fact: 'sandbox-leak', where: 'servers', spot: 0 },
    { start: 840, end: 888, a: partner, b: sandbox.id, fact: 'sandbox-leak', where: 'security', spot: 0 },
    { start: 886, end: 900, a: at(1), b: at(4), fact: 'pr-open', where: 'snack', spot: 3 },
    { start: 1034, end: 1046, a: at(0), b: at(2), fact: 'ci-green', where: 'lobby', spot: 0 },
  ].filter((item) => item.a !== item.b)
  return {
    standup: team.slice(0, Math.min(6, team.length)).map((bot) => bot.id),
    reports,
    watch: [{
      id: partner,
      start: 888,
      end: 960,
      task: 'On watch. The security desk still shows the leak.',
    }],
    copies: [
      { id: at(0), start: 546, end: 560, task: 'Copies for standup' },
      { id: at(1), start: 968, end: 984, task: 'Copies of the plan' },
    ],
    exchanges,
  }
}

function cleanCast(raw, ids) {
  const known = (id) => ids.has(id)
  const reports = (Array.isArray(raw?.reports) ? raw.reports : [])
    .filter((item) => known(item?.id))
    .map((item) => ({
      id: item.id,
      start: Number(item.start),
      end: Number(item.end),
      fact: String(item.fact || 'plan'),
      ci: item.ci || '',
      follow: String(item.follow || 'next-step'),
      update: !!item.update,
    }))
    .filter((item) => Number.isFinite(item.start) && Number.isFinite(item.end) && item.end > item.start)
  if (!reports.length) return null
  return {
    standup: (Array.isArray(raw.standup) ? raw.standup : []).filter(known),
    reports,
    watch: (Array.isArray(raw.watch) ? raw.watch : [])
      .filter((item) => known(item?.id))
      .map((item) => ({
        id: item.id,
        start: Number(item.start),
        end: Number(item.end),
        task: String(item.task || 'On watch.'),
      })),
    copies: (Array.isArray(raw.copies) ? raw.copies : [])
      .filter((item) => known(item?.id))
      .map((item) => ({
        id: item.id,
        start: Number(item.start),
        end: Number(item.end),
        task: String(item.task || 'Copies'),
      })),
    exchanges: (Array.isArray(raw.exchanges) ? raw.exchanges : [])
      .filter((item) => known(item?.a) && known(item?.b) && item.a !== item.b)
      .map((item) => ({
        start: Number(item.start),
        end: Number(item.end),
        a: item.a,
        b: item.b,
        fact: String(item.fact || 'plan'),
        where: String(item.where || 'snack'),
        spot: Number(item.spot) || 0,
      })),
  }
}

export function normalizeTeam(raw) {
  const groupsIn = Array.isArray(raw?.groups) ? raw.groups : []
  const groups = groupsIn
    .map((group, index) => ({
      id: slug(group?.id || group?.label, `group-${index + 1}`),
      label: String(group?.label || group?.id || `Group ${index + 1}`).trim().slice(0, 40),
      blurb: String(group?.blurb || '').trim().slice(0, 80),
    }))
    .filter((group) => group.id)
  if (!groups.some((group) => group.id === 'team')) {
    groups.push({ id: 'team', label: 'Team', blurb: 'The desk hall' })
  }
  const groupIds = new Set(groups.map((group) => group.id))
  const botsIn = Array.isArray(raw?.bots) ? raw.bots : []
  const used = new Set()
  const bots = []
  for (const rawBot of botsIn) {
    const name = String(rawBot?.name || '').trim().slice(0, 40)
    if (!name) continue
    let id = slug(rawBot?.id || name, '')
    if (!id) continue
    let next = id
    let n = 2
    while (used.has(next)) {
      next = `${id}-${n}`
      n += 1
    }
    id = next
    used.add(id)
    const group = groupIds.has(rawBot?.group) ? rawBot.group : groupIds.has(rawBot?.dept) ? rawBot.dept : 'team'
    const repo = typeof rawBot?.repo === 'string' && rawBot.repo.includes('/')
      ? rawBot.repo.trim().replace(/^https:\/\/github\.com\//, '').replace(/\.git$/, '')
      : null
    bots.push({
      id,
      name,
      dept: group,
      role: String(rawBot?.role || 'On the team.').trim().slice(0, 140),
      repo,
      focus: String(rawBot?.focus || groups.find((item) => item.id === group)?.label || 'Desk').slice(0, 40),
      color: /^#[0-9a-fA-F]{6}$/.test(rawBot?.color || '') ? rawBot.color : '#5c6b7a',
      accent: /^#[0-9a-fA-F]{6}$/.test(rawBot?.accent || '') ? rawBot.accent : '#e7e4de',
      accessory: rawBot?.accessory || null,
      hair: HAIR_STYLES.includes(rawBot?.hair) ? rawBot.hair : null,
      hairColor: /^#[0-9a-fA-F]{6}$/.test(rawBot?.hairColor || '') ? rawBot.hairColor : null,
      outfit: rawBot?.outfit || null,
      body: rawBot?.body || null,
      sim: String(rawBot?.sim || rawBot?.role || 'at the desk').trim().slice(0, 80),
      bit: rawBot?.bit ? String(rawBot.bit).slice(0, 40) : null,
      project: rawBot?.project ? String(rawBot.project).slice(0, 40) : null,
      extras: rawBot?.desk === 'files' || rawBot?.desk === 'studio' ? rawBot.desk : null,
      leader: false,
    })
  }
  if (bots.length < 2) throw new Error('A team needs a leader and at least one other bot.')
  if (bots.length > SEAT_LIMIT) throw new Error(`This floor fits ${SEAT_LIMIT} bots.`)
  const leaderKey = String(raw?.leader || '').trim().toLowerCase()
  const leader = bots.find((bot) => bot.id === leaderKey || bot.name.toLowerCase() === leaderKey) || bots[0]
  leader.leader = true
  const cast = cleanCast(raw?.cast, used) || buildCast(bots, leader.id)
  return {
    leaderId: leader.id,
    leaderName: leader.name,
    groups,
    bots,
    cast,
  }
}

export function setTeam(raw) {
  state = normalizeTeam(raw)
  ROSTER = state.bots
  DEPARTMENTS = state.groups
  return state
}

export function getRoster() {
  return ROSTER
}

export function getGroups() {
  return DEPARTMENTS
}

export function getCast() {
  return state.cast
}

export function leaderId() {
  return state.leaderId
}

export function leaderName() {
  return state.leaderName
}

export function isLeader(id) {
  return !!id && id === state.leaderId
}

export function departmentOf(id) {
  return state.groups.find((group) => group.id === id) || null
}

export function botById(id) {
  return state.bots.find((bot) => bot.id === id) || null
}

