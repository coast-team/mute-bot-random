import { MuteCoreFactory, MuteCoreTypes, StateStrategy, Strategy } from '@coast-team/mute-core'

const available = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ !:;.?'
const avatar = 'https://www.shareicon.net/data/256x256/2015/11/26/184857_dice_256x256.png'

export async function delay(milisecond: number): Promise<null> {
  return new Promise<null>((resolve) => setTimeout(resolve, milisecond))
}

export function generateMuteCore(strategy: Strategy, botname: string): MuteCoreTypes {
  const state = StateStrategy.emptyState(strategy)
  if (!state) {
    throw new Error('state is null')
  }

  return MuteCoreFactory.createMuteCore({
    strategy,
    profile: {
      displayName: botname,
      login: 'bot.random',
      avatar,
    },
    docContent: state,
    metaTitle: {
      title: 'Untitled Document',
      titleModified: 0,
    },
    metaFixData: {
      docCreated: Date.now(),
      cryptoKey: '',
    },
    metaLogs: {
      share: false,
      vector: new Map<number, number>(),
    },
    metaPulsar: {
      activatePulsar: false,
    },
  })
}

export function random(max: number) {
  return Math.floor(Math.random() * (max + 1))
}

export function randomChar() {
  return available.charAt(random(available.length - 1))
}
