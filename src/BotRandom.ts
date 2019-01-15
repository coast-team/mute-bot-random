import {
  FixDataState,
  MetaDataType,
  MuteCoreFactory,
  MuteCoreTypes,
  StateStrategy,
  Strategy,
  Streams as MuteCoreStreams,
  TextDelete,
  TextInsert,
} from '@coast-team/mute-core'
import { KeyState, Symmetric } from '@coast-team/mute-crypto'
import { DataType, WebGroup, WebGroupState } from 'netflux'
import { BehaviorSubject, Observable, Subject } from 'rxjs'
import { map } from 'rxjs/operators'
import { Message } from './proto'

export interface IDocContentOperation {
  index: number
  text?: string // Present only when it is an Insert operation
  length?: number // Present only when it is a Delete operation
}

export class BotRandom {
  get onStateChange$(): Observable<WebGroupState> {
    return this.stateSubject.asObservable()
  }
  public static AVATAR = 'https://www.shareicon.net/data/256x256/2015/11/26/184857_dice_256x256.png'

  private synchronize: () => void
  private mutecore: MuteCoreTypes
  private wg: WebGroup
  private botname: string
  private strategy: Strategy = Strategy.LOGOOTSPLIT

  private memberJoinSubject: Subject<number>
  private memberLeaveSubject: Subject<number>
  private messageSubject: Subject<{ streamId: number; content: Uint8Array; senderId: number }>
  private stateSubject: BehaviorSubject<WebGroupState>

  private crypto: Symmetric

  private docChanges: Subject<IDocContentOperation[]>

  constructor(botname: string, wg: WebGroup) {
    this.memberJoinSubject = new Subject()
    this.memberLeaveSubject = new Subject()
    this.messageSubject = new Subject()
    this.stateSubject = new BehaviorSubject(WebGroupState.LEFT)
    this.docChanges = new Subject()
    this.synchronize = () => {}

    this.botname = botname
    this.wg = wg
    this.crypto = new Symmetric()
    this.initWebGroup()
    this.mutecore = this.initMuteCore()

    console.log(`${this.botname} - State : `, this.mutecore.state.sequenceCRDT.str)
  }

  async doChanges(nboperation: number, time: number, pDeplacement: number, pDeletion: number) {
    const stats = { insertion: 0, deletion: 0, deplacement: 0, str: 0 }

    let cpt = 0
    let index = -1

    while (cpt < nboperation) {
      const dep = this.random(99) < pDeplacement
      if (dep || index === -1) {
        index = this.random(this.mutecore.state.sequenceCRDT.str.length)
        console.log('---')
        stats.deplacement++
      }

      const del = this.random(99) < pDeletion && index > 0
      if (del) {
        console.log(`Delete ${index - 1}`)
        this.docChanges.next([{ index: index - 1, length: 1 }])
        index--
        stats.deletion++
      } else {
        const c = this.randomChar()
        console.log(`Insert ${index} \t${c}`)
        this.docChanges.next([{ index, text: c }])
        index++
        stats.insertion++
      }

      await this.wait(time)
      cpt++
    }
    stats.str = this.mutecore.state.sequenceCRDT.str.length
    console.log('Stats : ', stats)
  }

  wait(milisecond: number) {
    return new Promise((resolve) => setTimeout(resolve, milisecond))
  }

  join(key: string) {
    this.wg.join(key)
  }

  send(streamId: number, content: Uint8Array, id?: number) {
    const msg = Message.create({ streamId, content })
    if (id === undefined) {
      this.wg.send(Message.encode(msg).finish())
    } else {
      id = id === 0 ? this.randomMember() : id
      this.wg.sendTo(id, Message.encode(msg).finish())
    }
  }

  // INIT WEBGROUP

  initWebGroup() {
    this.wg.onStateChange = (state: WebGroupState) => {
      console.log('State : ', state)
      this.stateSubject.next(state)
    }

    this.wg.onMemberJoin = (id) => this.memberJoinSubject.next(id)
    this.wg.onMemberLeave = (id) => this.memberLeaveSubject.next(id)
    this.wg.onMessage = (senderId, bytes: DataType) => {
      try {
        const { streamId, content } = Message.decode(bytes as Uint8Array)

        if (streamId === MuteCoreStreams.DOCUMENT_CONTENT) {
          this.crypto
            .decrypt(content)
            .then((decryptedContent) => {
              this.messageSubject.next({ senderId, streamId, content: decryptedContent })
            })
            .catch((err) =>
              console.log('Failed to decrypt document content: ', JSON.stringify(err))
            )
        } else {
          this.messageSubject.next({ senderId, streamId, content })
        }
      } catch (err) {
        console.log('Message from network decode error: ', err.message)
      }
    }
  }

  // INIT MUTECORE

  initMuteCore() {
    const state = StateStrategy.emptyState(this.strategy)
    if (!state) {
      throw new Error('state is null')
    }

    const mutecore = MuteCoreFactory.createMuteCore({
      strategy: this.strategy,
      profile: {
        displayName: this.botname,
        login: 'bot.random',
        avatar: BotRandom.AVATAR,
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
    })

    // Metadata
    mutecore.remoteMetadataUpdate$.subscribe(({ type, data }) => {
      console.log(`${this.botname} - Metadata update type:${type}, data : `, data)
      if (type === MetaDataType.FixData) {
        const { cryptoKey } = data as FixDataState
        if (cryptoKey) {
          this.crypto.importKey(cryptoKey)
        }
      }
    })

    // I/O
    mutecore.messageIn$ = this.messageSubject.asObservable()
    mutecore.messageOut$.subscribe(({ streamId, content, recipientId }) => {
      if (this.wg.members.length > 1) {
        if (
          streamId === MuteCoreStreams.DOCUMENT_CONTENT &&
          this.crypto &&
          this.crypto.state === KeyState.READY
        ) {
          this.crypto
            .encrypt(content)
            .then((encryptedContent) => this.send(streamId, encryptedContent, recipientId))
            .catch((err) => console.error('Failed to encrypt a message: ', err))
        } else {
          this.send(streamId, content, recipientId)
        }
      }
    })

    mutecore.localTextOperations$ = this.docChanges.asObservable().pipe(
      map((ops) => {
        return ops.map(({ index, text, length }) => {
          if (length) {
            return new TextDelete(index, length, mutecore.myMuteCoreId)
          } else if (text) {
            return new TextInsert(index, text, mutecore.myMuteCoreId)
          } else {
            throw new Error('Operation not recognize')
          }
        })
      })
    )

    // Collaborators
    mutecore.memberJoin$ = this.memberJoinSubject.asObservable()
    mutecore.memberLeave$ = this.memberLeaveSubject.asObservable()

    // Synchronization mechanism
    this.synchronize = () => {
      if (this.wg.members.length > 1) {
        if (this.crypto) {
          if (this.crypto.state === KeyState.READY) {
            mutecore.synchronize()
          }
        } else {
          mutecore.synchronize()
        }
      }
    }
    mutecore.collabJoin$.subscribe(() => this.synchronize())

    return mutecore
  }

  destroy() {
    this.memberJoinSubject.complete()
    this.memberLeaveSubject.complete()
    this.messageSubject.complete()
  }

  private random(max: number) {
    return Math.floor(Math.random() * (max + 1))
  }

  private randomChar() {
    const available = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ !:;.?'
    return available.charAt(this.random(available.length - 1))
  }

  private randomMember(): number {
    const otherMembers = this.wg.members.filter((i) => i !== this.wg.myId)
    return otherMembers[Math.ceil(Math.random() * otherMembers.length) - 1]
  }
}
