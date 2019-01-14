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

  doChanges() {
    this.docChanges.next([{ index: 0, text: 'H' }])
    this.docChanges.next([{ index: 1, text: 'e' }])
    this.docChanges.next([{ index: 2, text: 'l' }])
    this.docChanges.next([{ index: 3, text: 'l' }])
    this.docChanges.next([{ index: 4, text: 'o' }])

    console.log(`${this.botname} - State : `, this.mutecore.state.sequenceCRDT.str)
  }

  join(key: string) {
    this.wg.join(key)
  }

  send(streamId: number, content: Uint8Array, id?: number) {
    const msg = Message.create({ streamId, content })
    if (id === undefined) {
      console.log(`${this.botname} - broadcast message ${streamId}`)
      this.wg.send(Message.encode(msg).finish())
    } else {
      id = id === 0 ? this.randomMember() : id
      console.log(`${this.botname} - send message ${streamId}`)
      this.wg.sendTo(id, Message.encode(msg).finish())
    }
  }

  initWebGroup() {
    this.wg.onStateChange = (state: WebGroupState) => {
      this.stateSubject.next(state)
      console.log(`${this.botname} - State change : `, state)
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
        title: '',
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

  private randomMember(): number {
    const otherMembers = this.wg.members.filter((i) => i !== this.wg.myId)
    return otherMembers[Math.ceil(Math.random() * otherMembers.length) - 1]
  }
}
