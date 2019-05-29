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
import { EditableOpAvlList, SimpleDotPos } from 'dotted-logootsplit'
import { OpEditableReplicatedList } from 'dotted-logootsplit/dist/types/core/op-replicated-list'
import { appendFile, appendFileSync, writeFileSync } from 'fs'
import { LogootSRopes, Stats } from 'mute-structs'
import * as os from 'os'
import { Subject } from 'rxjs'
import { bufferCount, map } from 'rxjs/operators'
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
  private cptLocal: number
  private cptRemote: number
  private strategy: Strategy = Strategy.DOTTEDLOGOOTSPLIT

  private buffer: number
  private logsnumber: number
  private nbLocal: number

  private start: boolean
  private messageSubject: Subject<{ streamId: number; content: Uint8Array; senderId: number }>
  private crypto: Symmetric
  private docChanges: Subject<IDocContentOperation[]>

  private index: number

  constructor(
    botname: string,
    master: string,
    port: number,
    adr: string,
    snapshot: number,
    strategy: Strategy,
    buffer: number,
    logsnumber: number
  ) {
    this.messageSubject = new Subject()
    this.docChanges = new Subject()
    this.synchronize = () => {}

    this.start = true
    this.index = -1

    this.botname = botname
    this.snapshot = snapshot
    this.strategy = strategy
    this.buffer = buffer
    this.logsnumber = logsnumber
    this.cptOperation = 0
    this.cptLocal = 0
    this.cptRemote = 0
    this.nbLocal = 0
    this.crypto = new Symmetric()
    this.mutecore = this.initMuteCore()
    this.network = this.initNetwork(this.mutecore.myMuteCoreId, master, port, adr)

    // Collaborators
    this.mutecore.memberJoin$ = this.network.memberJoin$
    this.mutecore.memberLeave$ = this.network.memberLeave$

    console.log(`${this.botname} - State : `, this.str)
    console.log(`${this.botname} - Network : ${this.network.id}`)
  }

  public async doChanges(
    nboperation: number,
    time: number,
    pDeletion: number,
    pDeplacement: number
  ) {
    const stats = { insertion: 0, deletion: 0, deplacement: 0, str: 0 }

    this.nbLocal = 0
    console.log('START :')
    while (this.nbLocal < nboperation) {
      const dep = this.random(99) < pDeplacement
      if (dep || this.index === -1) {
        this.index = this.random(this.str.length)
        // console.log('---')
        stats.deplacement++
      }

      const del = this.random(99) < pDeletion && this.index > 0
      if (del) {
        // console.log(`Delete ${this.index - 1}`)
        this.docChanges.next([{ index: this.index - 1, length: 1 }])
        this.index--
        stats.deletion++
      } else {
        const c = this.randomChar()
        // console.log(`Insert ${this.index} \t${c}`)
        this.docChanges.next([{ index: this.index, text: c }])
        this.index++
        stats.insertion++
      }

      await this.wait(time)
      this.nbLocal++
    }
    stats.str = this.str.length
    this.index = -1
    console.log('FINISH : Waiting for objective...')
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
      return this.cptOperation >= nboperation
    } else {
      throw new Error('checkObjective : the request number of operation to check is invalid')
    }
  }

  public terminate() {
    let stats = ''
    if (this.mutecore.state.sequenceCRDT instanceof LogootSRopes) {
      stats = new Stats(this.mutecore.state.sequenceCRDT).toString()
    } else if (this.mutecore.state.sequenceCRDT instanceof EditableOpAvlList) {
      stats = 'Not Implemented yet'
    }
    const data = {
      vector: Array.from(this.mutecore.state.vector),
      sequenceCRDT: this.mutecore.state.sequenceCRDT,
      stats,
    }
    console.log(data.stats)
    appendFileSync('./output/Logs.' + this.botname + '.json', ']')
    /* await writeFileSync(
      './Results.' + this.botname + ':' + this.network.id + '.json',
      JSON.stringify(data)
    ) */
    console.log('Data Saved')
  }

  // INIT NETWORK
  public initNetwork(id: number, master: string, port: number, adr: string) {
    const network = new NetworkNode(id, master, port, adr)

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

    mutecore.remoteTextOperations$.subscribe(({ operations }) => {
      operations.forEach((ope) => {
        if (ope instanceof TextInsert && ope.index < this.index) {
          this.index += ope.content.length
        } else if (ope instanceof TextDelete && ope.index < this.index) {
          this.index -= ope.length
        }
      })
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

    mutecore.experimentLogs$.pipe(bufferCount(this.buffer)).subscribe((values) => {
      let str = ''
      values.forEach((value) => {
        // console.log(value.operation)
        let prefix = ',' + os.EOL
        if (this.start) {
          prefix = '['
          this.start = false
        }

        const { struct, ...logs } = value
        str += prefix + JSON.stringify(logs)

        this.cptOperation++
        if (value.type === 'local') {
          this.cptLocal++
        } else {
          this.cptRemote++
        }

        if (this.cptOperation % this.logsnumber === 0) {
          console.log(
            'Operations : ' +
              this.cptOperation +
              `\t(local: ${this.cptLocal}, remote : ${this.cptRemote})`
          )
        }
        if (this.cptOperation % this.snapshot === 0) {
          writeFileSync(
            './output/Snapshot.' + this.cptOperation + '.' + this.botname + '.json',
            JSON.stringify(struct)
          )
        }
      })
      appendFileSync(
        './output/Logs.' + this.botname + '.json',
        str // prefix + JSON.stringify(logs),
      )
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

  get str(): string {
    switch (this.strategy) {
      case Strategy.LOGOOTSPLIT:
        return (this.mutecore.state.sequenceCRDT as LogootSRopes).str
      case Strategy.DOTTEDLOGOOTSPLIT:
        return (this.mutecore.state.sequenceCRDT as OpEditableReplicatedList<
          SimpleDotPos,
          string
        >).concatenated('')
      default:
        return ''
    }
  }

  private random(max: number) {
    return Math.floor(Math.random() * (max + 1))
  }

  private randomChar() {
    const available = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ !:;.?'
    return available.charAt(this.random(available.length - 1))
  }
}
