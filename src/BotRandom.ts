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
import { appendFile, appendFileSync, writeFileSync } from 'fs'
import { Stats } from 'mute-structs'
import * as os from 'os'
import { Subject } from 'rxjs'
import { map } from 'rxjs/operators'
import { MessageType, NetworkNode } from './NetworkNode'
import { Message } from './proto'

export interface IDocContentOperation {
  index: number
  text?: string // Present only when it is an Insert operation
  length?: number // Present only when it is a Delete operation
}

export class BotRandom {
  public static AVATAR = 'https://www.shareicon.net/data/256x256/2015/11/26/184857_dice_256x256.png'

  private synchronize: () => void
  private network: NetworkNode
  private mutecore: MuteCoreTypes
  private botname: string
  private snapshot: number
  private cptOperation: number
  private strategy: Strategy = Strategy.LOGOOTSPLIT

  private start: boolean

  private messageSubject: Subject<{ streamId: number; content: Uint8Array; senderId: number }>

  private crypto: Symmetric

  private docChanges: Subject<IDocContentOperation[]>

  constructor(botname: string, master: string, port: number, snapshot: number) {
    this.messageSubject = new Subject()
    this.docChanges = new Subject()
    this.synchronize = () => {}

    this.start = true

    this.botname = botname
    this.snapshot = snapshot
    this.cptOperation = 0
    this.crypto = new Symmetric()
    this.mutecore = this.initMuteCore()
    this.network = this.initNetwork(this.mutecore.myMuteCoreId, master, port)

    // Collaborators
    this.mutecore.memberJoin$ = this.network.memberJoin$
    this.mutecore.memberLeave$ = this.network.memberLeave$

    console.log(`${this.botname} - State : `, this.mutecore.state.sequenceCRDT.str)
    console.log(`${this.botname} - Network : ${this.network.id}`)
  }

  public async doChanges(
    nboperation: number,
    time: number,
    pDeletion: number,
    pDeplacement: number
  ) {
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
    console.log('Final str : ', this.mutecore.state.sequenceCRDT.str)
  }

  public wait(milisecond: number) {
    return new Promise((resolve) => setTimeout(resolve, milisecond))
  }

  public send(streamId: number, content: Uint8Array, id?: number) {
    const msg = Message.create({ streamId, content })
    if (id) {
      this.network.sendTo(id, {
        type: MessageType.MESSAGE,
        senderId: this.network.id,
        content: Message.encode(msg).finish(),
      })
    } else {
      this.network.broascast({
        type: MessageType.MESSAGE,
        senderId: this.network.id,
        content: Message.encode(msg).finish(),
      })
    }
  }

  public checkObjective(nboperation: number) {
    if (nboperation > 0) {
      const vector = this.mutecore.state.vector
      let currentOperationNumber = 0
      vector.forEach((value) => {
        currentOperationNumber += value + 1
      })
      return currentOperationNumber >= nboperation
    } else {
      throw new Error('checkObjective : the request number of operation to check is invalid')
    }
  }

  public async terminate() {
    const data = {
      vector: Array.from(this.mutecore.state.vector),
      sequenceCRDT: this.mutecore.state.sequenceCRDT,
      stats: new Stats(this.mutecore.state.sequenceCRDT).toString(),
    }
    console.log(data.stats)
    await appendFileSync('./Logs.' + this.botname + ':' + this.network.id + '.json', ']')
    /* await writeFileSync(
      './Results.' + this.botname + ':' + this.network.id + '.json',
      JSON.stringify(data)
    ) */
    console.log('Data Saved')
  }

  // INIT NETWORK
  public initNetwork(id: number, master: string, port: number) {
    const network = new NetworkNode(id, master, port)

    network.output$.subscribe((out) => {
      const decode = Message.decode(out.message)
      if (decode) {
        // console.log('receive', decode.streamId)
        this.messageSubject.next({
          streamId: decode.streamId,
          content: decode.content,
          senderId: out.sender,
        })
      }
    })

    return network
  }

  // INIT MUTECORE

  public initMuteCore() {
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
      // console.log(`${this.botname} - Metadata update type:${type}, data : `, data)
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
      if (
        streamId === MuteCoreStreams.DOCUMENT_CONTENT &&
        this.crypto &&
        this.crypto.state === KeyState.READY
      ) {
        console.log('OUT', recipientId)
        this.crypto
          .encrypt(content)
          .then((encryptedContent) => this.send(streamId, encryptedContent, recipientId))
          .catch((err) => console.error('Failed to encrypt a message: ', err))
      } else {
        this.send(streamId, content, recipientId)
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

    mutecore.experimentLogs$.subscribe((value) => {
      // console.log(value)
      let prefix = ',' + os.EOL
      if (this.start) {
        prefix = '['
        this.start = false
      }

      const { struct, ...logs } = value
      appendFile(
        './output/Logs.' + this.botname + ':' + this.network.id + '.json',
        prefix + JSON.stringify(logs),
        (err) => {
          if (err) {
            throw err
          }
        }
      )
      this.cptOperation++
      if (this.cptOperation % this.snapshot === 0) {
        writeFileSync(
          './output/Snapshot-' +
            this.cptOperation +
            '-' +
            this.botname +
            '-' +
            this.network.id +
            '.json',
          JSON.stringify(struct)
        )
      }
    })

    // Synchronization mechanism
    this.synchronize = () => {
      mutecore.synchronize()
    }
    mutecore.collabJoin$.subscribe(() => {
      console.log('New collaborator')
      this.synchronize()
    })

    return mutecore
  }

  destroy() {
    this.messageSubject.complete()
  }

  get str() {
    return this.mutecore.state.sequenceCRDT.str
  }

  private random(max: number) {
    return Math.floor(Math.random() * (max + 1))
  }

  private randomChar() {
    const available = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ !:;.?'
    return available.charAt(this.random(available.length - 1))
  }
}
