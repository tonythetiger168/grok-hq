import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { ROSTER } from '../src/roster.js'
import { summarizePulls } from '../src/ops-summary.js'

const exec = promisify(execFile)
let cache = { at: 0, map: null, note: '' }

function runGh(repo) {
  return exec('gh', [
    'pr', 'list',
    '--repo', repo,
    '--state', 'all',
    '--limit', '5',
    '--json', 'state,title,updatedAt,statusCheckRollup',
  ], { timeout: 20000, maxBuffer: 2_000_000 })
}

export async function githubOps() {
  if (cache.map && Date.now() - cache.at < (cache.ttl || 60_000)) return cache
  const repos = [...new Set(ROSTER.map((bot) => bot.repo).filter(Boolean))]
  const map = {}
  let failed = 0
  await Promise.all(repos.map(async (repo) => {
    try {
      const { stdout } = await runGh(repo)
      const pulls = JSON.parse(stdout)
      pulls.sort((a, b) => String(b.updatedAt || '').localeCompare(String(a.updatedAt || '')))
      map[repo] = { ...summarizePulls(pulls), live: true }
    } catch {
      failed += 1
      map[repo] = { pr: '', ci: '', title: '', live: false }
    }
  }))
  const github = failed === repos.length ? 'unavailable' : failed ? 'partial' : 'live'
  const note = github === 'unavailable'
    ? 'GitHub could not be read. PR and CI come only from status fields.'
    : github === 'partial'
      ? 'Some repos could not be read from GitHub. The rest are live. No usage numbers.'
      : 'PR and CI are from GitHub for roster repos. Status fields override them. No usage numbers.'
  const ttl = github === 'unavailable' ? 5_000 : 60_000
  cache = { at: Date.now(), ttl, map, note, github }
  return cache
}

export function enrichBots(bots, github) {
  return bots.map((bot) => {
    const roster = ROSTER.find((item) => item.name === bot.name)
    const remote = roster?.repo ? github.map?.[roster.repo] : null
    const pr = bot.pr || (remote?.live ? remote.pr : '')
    const ci = bot.ci || (remote?.live ? remote.ci : '')
    return {
      ...bot,
      pr: pr || '',
      ci: ci || '',
      prTitle: !bot.pr && remote?.live ? (remote.title || '') : '',
      prSource: bot.pr ? 'status' : (remote?.live && remote.pr ? 'github' : ''),
      ciSource: bot.ci ? 'status' : (remote?.live && remote.ci ? 'github' : ''),
    }
  })
}
