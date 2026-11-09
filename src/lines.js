import { bitOf } from './day.js'

function pick(list, bot, bucket) {
  if (!list?.length) return 'On the plan.'
  const n = Math.abs(Math.floor((bot?.phase || 0) * 5) + bucket) % list.length
  return list[n]
}

const CALL = {
  'ci-failed': {
    think: (name) => `${name}: CI is red. Do not ship.`,
    say: (name) => `Fix the failed CI, ${name}. Keep the PR open.`,
    react: () => 'I will fix CI and come back.',
  },
  'ci-green': {
    think: (name) => `${name} is green. The plan can move.`,
    say: (name) => `CI is green, ${name}. Keep the PR open and take the next step.`,
    react: () => 'Green. Next plan step, then I report.',
  },
  'pr-open': {
    think: (name) => `${name}'s PR is still open.`,
    say: (name) => `Leave the PR open, ${name}. Get a review, then come back.`,
    react: () => 'I will keep it open and ask for a review.',
  },
  'pr-closed': {
    think: (name) => `${name} closed the PR. What is next?`,
    say: (name) => `PR is closed, ${name}. Start the next plan step.`,
    react: () => 'Closed. I will start the next step.',
  },
  plan: {
    think: (name, bit) => `${bit} still needs a next step.`,
    say: (name) => `Write the next plan step, ${name}, then report back.`,
    react: () => 'I will write the next step and come back.',
  },
  'sandbox-ok': {
    think: (name) => `${name}: sandbox isolation looks tight.`,
    say: (name) => `Sandbox passed, ${name}. Note the lock, then the next step.`,
    react: () => 'Isolation is tight. I will note it and come back.',
  },
  'sandbox-leak': {
    think: (name) => `${name}: a sandbox boundary looks open.`,
    say: (name) => `Lock that sandbox, ${name}. A leak is not done.`,
    react: () => 'I will close the leak and report again.',
  },
}

export function decisionFor(bot) {
  const name = bot.def?.name || bot.name
  const fact = bot.fact || 'plan'
  const pack = CALL[fact] || CALL.plan
  const bit = bitOf(bot.def?.id || bot.id)
  return {
    think: pack.think(name, bit),
    say: pack.say(name),
    react: pack.react(),
  }
}

export function ackFor(bot, order) {
  const name = bot.def?.name || bot.name
  if (order.fact === 'ci-failed') return `${name}: I will fix the failed CI.`
  if (order.fact === 'ci-green') return 'CI is green. I will take the next step.'
  if (order.fact === 'pr-open') return 'PR stays open. I will work the review.'
  if (order.fact === 'pr-closed') return 'PR is closed. Next plan step.'
  if (order.fact === 'sandbox-leak') return 'I will check the sandbox boundary.'
  if (order.fact === 'sandbox-ok') return 'I will confirm the sandbox is locked.'
  if (order.workPlace === 'copy') return 'I will run the copies.'
  if (order.workPlace === 'snack') return 'Coffee first, then the work.'
  if (order.workPlace === 'library') return 'I will read it in the library.'
  return 'On it. Starting at the desk.'
}

function exchange(fact, a, b) {
  const left = a.def?.name || a.name
  const right = b.def?.name || b.name
  if (fact === 'ci-failed') {
    return [`${left}: CI failed on my pass.`, `${right}: I will look at the red checks.`]
  }
  if (fact === 'ci-green') {
    return [`${left}: CI is green. PR stays open.`, `${right}: Then I will take the next plan step.`]
  }
  if (fact === 'pr-open') {
    return [`${left}: My PR is still open.`, `${right}: I will review it before anyone closes it.`]
  }
  if (fact === 'pr-closed') {
    return [`${left}: That PR is closed.`, `${right}: I will start the next plan step.`]
  }
  if (fact === 'sandbox-ok') {
    return [`${left}: Sandbox passed. Isolation looks tight.`, `${right}: I will note the lock and tell musk.`]
  }
  if (fact === 'sandbox-leak') {
    return [`${left}: Sandbox check failed. A boundary looks open.`, `${right}: I will follow up before anyone calls it locked.`]
  }
  return [`${left}: Next plan step is still open.`, `${right}: I will pick it up at my desk.`]
}

const MEET = {
  'grok-bot': ['Do we have copies for standup?', 'Anything blocked before musk?'],
  'helios-forge': ['CI is red on the helios pass.', 'Should the PR stay open?'],
  aevum: ['I can pair on the failed checks.', 'Want me on the open PR?'],
  quant: ['No fake figures. PR is open.', 'CI is green on my page.'],
  linkup: ['Messenger PR is still open.', 'I can take a review.'],
  vectorbt: ['I will study the failure, not a score.', 'Notes are ready to copy.'],
}

const MEET_REPLY = {
  'grok-bot': ['Copies are on the machine.', 'I will file a short note.'],
  'helios-forge': ['I will fix CI and come back.', 'PR stays open until CI is green.'],
  aevum: ['I will compare notes after this.', 'Failed checks first.'],
  quant: ['Review first, then we talk close.', 'Green is not merged.'],
  linkup: ['I will pass that to wavelive.', 'Open PR, I will say so.'],
  vectorbt: ['I will tell the table if CI flips.', 'Next step is written down.'],
}

export function pairLines(context, a, b, bucket) {
  const fact = a.fact && a.fact !== 'plan'
    ? a.fact
    : (b.fact && b.fact !== 'plan' ? b.fact : (a.fact || b.fact || 'plan'))
  if (a.place === 'servers' || context === 'servers' || b.place === 'servers') {
    return exchange(fact.startsWith('sandbox') ? fact : 'sandbox-leak', a, b)
  }
  if (fact && fact !== 'plan' && (context === 'rest' || context === 'snack' || context === 'lobby' || a.place === 'snack' || a.place === 'library')) {
    return exchange(fact, a, b)
  }
  if (a.place === 'meeting' || context === 'meet') {
    if (fact && fact !== 'plan') return exchange(fact, a, b)
    const ask = pick(MEET[a.def.id] || ['Anything blocked on the pass?', 'Is CI green or red?'], a, bucket)
    const reply = pick(MEET_REPLY[b.def.id] || ['I will take a piece and report.', 'PR stays where it is.'], b, bucket + 1)
    return [ask, reply]
  }
  if (a.place === 'snack' || a.place === 'pantry' || a.cup === 'sip') {
    return [
      pick([`Coffee. Where is ${bitOf(a.def.id)}?`, 'Sip first. CI or plan?'], a, bucket),
      pick([`${bitOf(b.def.id)} is next.`, 'I heard a PR is still open.'], b, bucket),
    ]
  }
  if (a.def.id === 'musk') {
    return ['Bring the PR state, not a novel.', pick(['Open, and CI is green.', 'CI failed. PR stays open.'], b, bucket)]
  }
  return [
    pick([
      `How is ${bitOf(a.def.id)}?`,
      'Did musk assign a follow-up?',
      'Is that PR open or closed?',
    ], a, bucket),
    pick([
      `${bitOf(b.def.id)}: I will work it at the desk.`,
      'I will fix CI if it is red.',
      'I will report once the step is done.',
    ], b, bucket),
  ]
}

export function selfLine(bot, bucket) {
  const bit = bitOf(bot.def.id)
  if (bot.bark) return bot.bark
  if (bot.place === 'copy') return pick(['Copies for the standup.', 'One stack for musk.', 'The machine can take this page.'], bot, bucket)
  if (bot.place === 'servers') {
    if (bot.fact === 'sandbox-ok') {
      return pick([
        'Sandbox passed. Isolation looks tight.',
        'Permissions match the jail. I will tell musk.',
      ], bot, bucket)
    }
    return pick([
      'Sandbox check failed. A boundary looks open.',
      'This sandbox needs a follow-up before anyone calls it locked.',
      'Permissions first. Then I tell musk.',
    ], bot, bucket)
  }
  if (bot.cup === 'sip' || bot.cup === 'hand') return pick(['Coffee, then the plan.', 'Cup down after this thought.', 'Warm cup. Cold CI if it is red.'], bot, bucket)
  if (bot.follow === 'lock-sandbox') return 'I will lock the sandbox and tell musk.'
  if (bot.follow === 'fix-ci') return 'I will fix CI and come back.'
  if (bot.follow === 'review-pr') return 'Review the open PR, then musk.'
  if (bot.follow === 'next-step') return 'Next plan step. Then I report.'
  if (bot.state === 'waiting') return 'Waiting on a look before the next step.'
  if (bot.state === 'error') return 'Blocked. I should tell musk.'
  return pick([
    `Note to self: ${bit}.`,
    'Say the PR state in one line.',
    'Green or red, then the next step.',
    'Lobby can wait. The plan cannot.',
  ], bot, bucket)
}

export function thinkLine(bot, bucket) {
  const bit = bitOf(bot.def.id)
  if (bot.carrying || bot.place === 'handoff') {
    return pick([
      `Taking ${bit} to musk.`,
      'PR state first, story second.',
      'Say if CI is green or failed.',
    ], bot, bucket)
  }
  if (bot.def.id === 'musk') {
    const fact = bot.fact || 'plan'
    if (fact === 'ci-failed') return 'Red CI. Who owns the fix?'
    if (fact === 'pr-open') return 'Open PR. Who reviews it?'
    if (fact === 'pr-closed') return 'Closed. What plan step is next?'
    if (fact === 'ci-green') return 'Green. Do not merge on habit.'
    if (fact === 'sandbox-ok') return 'Sandbox passed. Who notes the lock?'
    if (fact === 'sandbox-leak') return 'Sandbox leak. Who locks the boundary?'
    return 'Who still owes a plan step?'
  }
  if (bot.place === 'copy') return pick(['These copies are for standup.', 'One page on the PR, not a book.'], bot, bucket)
  if (bot.place === 'rec') return pick(['One game of ping-pong.', 'The arcade can wait one point.', 'Break now. The plan is still there.'], bot, bucket)
  if (bot.place === 'library') return pick([`Library: next step for ${bit}.`, 'Read the failure, skip the trivia.', 'An open PR needs a note, not a number.'], bot, bucket)
  if (bot.place === 'servers' || bot.fact === 'sandbox-ok' || bot.fact === 'sandbox-leak') {
    if (bot.fact === 'sandbox-ok') {
      return pick([
        'Sandbox passed. Isolation looks tight.',
        'Jail and permissions both hold.',
      ], bot, bucket)
    }
    if (bot.fact === 'sandbox-leak') {
      return pick([
        'A sandbox boundary looks open. Follow up.',
        'Do not call a leak locked.',
        'The jail is open. musk should hear it.',
      ], bot, bucket)
    }
    return pick([
      'Sandbox passed. Isolation looks tight.',
      'A sandbox boundary looks open. Follow up.',
    ], bot, bucket)
  }
  if (bot.place === 'snack' || bot.place === 'pantry' || bot.place === 'lobby' || bot.place === 'rest' || bot.place === 'lounge') {
    return pick([
      `Chewing on ${bit}.`,
      'If CI is red, I go back to the desk.',
      'Snack now. Report when the step is real.',
      'Lobby thought: what do I tell musk?',
    ], bot, bucket)
  }
  if (bot.place === 'meeting') return pick(['Say the blocker in one line.', 'Copies, CI, then the ask.'], bot, bucket)
  if (bot.fact === 'ci-failed' || bot.follow === 'fix-ci') return `Where did CI fail on ${bit}?`
  if (bot.fact === 'pr-open' || bot.follow === 'review-pr') return `What is still open on ${bit}?`
  if (bot.fact === 'pr-closed') return `Closed. Next step for ${bit}.`
  if (bot.fact === 'ci-green') return `Green CI. Next step for ${bit}.`
  if (bot.state === 'waiting' || bot.state === 'error') return 'I should report this blocker.'
  return pick([
    `Next step for ${bit}.`,
    'Plan first. PR second.',
    'I will report when this step is honest.',
  ], bot, bucket)
}
