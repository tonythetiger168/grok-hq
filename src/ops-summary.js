/** Turn GitHub pull summaries into office words. No URLs, no made-up numbers. */

export const PR_STATES = ['open', 'closed', 'merged', 'none']
export const CI_STATES = ['green', 'failed', 'pending', 'none']

export function cleanOpsEnum(value, allowed) {
  if (value == null || value === '') return ''
  const text = String(value).trim().toLowerCase()
  return allowed.includes(text) ? text : ''
}

export function sanitizePlan(plan) {
  if (typeof plan !== 'string') return ''
  return plan.replace(/\s+/g, ' ').trim().slice(0, 80)
}

export function summarizePulls(pulls) {
  if (!Array.isArray(pulls) || !pulls.length) return { pr: 'none', ci: 'none', title: '' }
  const open = pulls.filter((pull) => pull?.state === 'OPEN')
  const chosen = open[0] || pulls[0]
  const pr = chosen?.state === 'OPEN' ? 'open' : chosen?.state === 'MERGED' ? 'merged' : 'closed'
  const checks = Array.isArray(chosen?.statusCheckRollup) ? chosen.statusCheckRollup : []
  const conclusions = checks.map((check) => String(check?.conclusion || check?.status || '').toUpperCase())
  let ci = 'none'
  if (conclusions.some((item) => ['FAILURE', 'CANCELLED', 'TIMED_OUT', 'STARTUP_FAILURE'].includes(item))) ci = 'failed'
  else if (conclusions.some((item) => ['PENDING', 'QUEUED', 'IN_PROGRESS', 'WAITING'].includes(item))) ci = 'pending'
  else if (conclusions.some((item) => ['SUCCESS', 'NEUTRAL', 'SKIPPED'].includes(item))) ci = 'green'
  const title = String(chosen?.title || '').replace(/\s+/g, ' ').trim().slice(0, 72)
  return { pr, ci, title }
}

export function factFromOps(pr, ci) {
  if (ci === 'failed') return 'ci-failed'
  if (pr === 'closed' || pr === 'merged') return 'pr-closed'
  if (ci === 'green' && pr === 'open') return 'ci-green'
  if (pr === 'open') return 'pr-open'
  if (ci === 'green') return 'ci-green'
  return 'plan'
}
