import {
  FixDataState,
  MetaDataType,
  MuteCoreTypes,
  Strategy,
  StreamId,
  Streams as MuteCoreStreams,
  TextDelete,
  TextInsert,
} from '@coast-team/mute-core'
import { KeyState, Symmetric } from '@coast-team/mute-crypto'
import { EditableOpAvlList, SimpleDotPos } from 'dotted-logootsplit'
import { OpEditableReplicatedList } from 'dotted-logootsplit/dist/types/core/op-replicated-list'
import { appendFileSync, writeFileSync } from 'fs'
import { LogootSRopes, RenamableReplicableList, Stats } from 'mute-structs'
import * as os from 'os'
import { Subject } from 'rxjs'
import { bufferTime, map } from 'rxjs/operators'
import { delay, generateMuteCore, random, randomChar } from './helpers'
import { MessageType, NetworkNode } from './NetworkNode'
import { Message } from './proto'

export interface IDocContentOperation {
  index: number
  text?: string // Present only when it is an Insert operation
  length?: number // Present only when it is a Delete operation
}

export class BotRandom {
  private network: NetworkNode
  private mutecore: MuteCoreTypes
  private botname: string
  private snapshot: number
  private cptOperation: number
  private cptLocal: number
  private cptRemote: number
  private strategy: Strategy

  private buffer: number
  private logsnumber: number

  private start: boolean
  private messageSubject: Subject<{ streamId: StreamId; content: Uint8Array; senderId: number }>
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
    this.crypto = new Symmetric()

    this.mutecore = generateMuteCore(this.strategy, this.botname)
    this.initMuteCore()

    this.network = new NetworkNode(this.mutecore.myMuteCoreId, master, port, adr)
    this.initNetwork()

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
    const currentpDeplacement = pDeplacement
    let currentpDeletion = pDeletion

    console.log('START :')
    let changeState = false

    for (let nbLocal = 0; nbLocal < nboperation; nbLocal++) {
      if (this.str.length >= 60000 && !changeState) {
        console.log('Change rate : 50/50')
        currentpDeletion = 50
        changeState = true
      }

      const dep = random(99) < currentpDeplacement
      if (dep || this.index === -1) {
        this.index = random(this.str.length)
        // console.log('---')
      }

      const del = random(99) < currentpDeletion && this.index > 0
      if (del) {
        // console.log(`Delete ${this.index - 1}`)
        this.docChanges.next([{ index: this.index - 1, length: 1 }])
        this.index--
      } else {
        const c = randomChar()
        // console.log(`Insert ${this.index} \t${c}`)
        this.docChanges.next([{ index: this.index, text: c }])
        this.index++
      }

      const randomTime = random(100) - 50
      const newTime = time + randomTime
      await delay(newTime)
    }
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
    writeFileSync('./output/string.' + this.botname + '.txt', this.str)
    /* await writeFileSync(
      './Results.' + this.botname + ':' + this.network.id + '.json',
      JSON.stringify(data)
    ) */
    console.log('Data Saved')
  }

  // INIT NETWORK
  public initNetwork() {
    this.network.output$.subscribe((out) => {
      const decode = Message.decode(out.message)
      if (decode) {
        // console.log('receive', decode.streamId)
        this.messageSubject.next({
          streamId: { type: decode.streamId, subtype: decode.subtype },
          content: decode.content,
          senderId: out.sender,
        })
      }
    })
  }

  // INIT MUTECORE
  public initMuteCore() {
    // Metadata
    this.mutecore.remoteMetadataUpdate$.subscribe(({ type, data }) => {
      // console.log(`${this.botname} - Metadata update type:${type}, data : `, data)
      if (type === MetaDataType.FixData) {
        const { cryptoKey } = data as FixDataState
        if (cryptoKey) {
          this.crypto.importKey(cryptoKey)
        }
      }
    })

    // I/O
    this.mutecore.messageIn$ = this.messageSubject.asObservable()
    this.mutecore.messageOut$.subscribe(({ streamId, content, recipientId }) => {
      if (
        streamId.type === MuteCoreStreams.DOCUMENT_CONTENT &&
        this.crypto &&
        this.crypto.state === KeyState.READY
      ) {
        console.log('OUT', recipientId)
        this.crypto
          .encrypt(content)
          .then((encryptedContent) => this.send(streamId.type, encryptedContent, recipientId))
          .catch((err) => console.error('Failed to encrypt a message: ', err))
      } else {
        this.send(streamId.type, content, recipientId)
      }
    })

    this.mutecore.remoteTextOperations$.subscribe(({ operations }) => {
      operations.forEach((ope) => {
        if (ope instanceof TextInsert && ope.index < this.index) {
          this.index += ope.content.length
        } else if (ope instanceof TextDelete && ope.index < this.index) {
          this.index -= ope.length
        }
      })
    })

    this.mutecore.localTextOperations$ = this.docChanges.asObservable().pipe(
      map((ops) => {
        return ops.map(({ index, text, length }) => {
          if (length) {
            return new TextDelete(index, length, this.mutecore.myMuteCoreId)
          } else if (text) {
            return new TextInsert(index, text, this.mutecore.myMuteCoreId)
          } else {
            throw new Error('Operation not recognize')
          }
        })
      })
    )

    this.mutecore.experimentLogs$
      .pipe(bufferTime(5000, undefined, this.buffer))
      .subscribe((values) => {
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
          if (
            this.botname === 'Master' &&
            this.strategy === Strategy.RENAMABLELOGOOTSPLIT &&
            this.cptOperation % 30000 === 0
          ) {
            console.log('Trigger rename')
            this.docChanges.next([])
          }
        })
        appendFileSync(
          './output/Logs.' + this.botname + '.json',
          str // prefix + JSON.stringify(logs),
        )
      })

    this.mutecore.collabJoin$.subscribe(() => {
      console.log('New collaborator')
      this.mutecore.synchronize()
    })
  }

  get str(): string {
    switch (this.strategy) {
      case Strategy.LOGOOTSPLIT:
        return (this.mutecore.state.sequenceCRDT as LogootSRopes).str
      case Strategy.RENAMABLELOGOOTSPLIT:
        return (this.mutecore.state.sequenceCRDT as RenamableReplicableList).str
      case Strategy.DOTTEDLOGOOTSPLIT:
        return (this.mutecore.state.sequenceCRDT as OpEditableReplicatedList<
          SimpleDotPos,
          string
        >).concatenated('')
      default:
        return ''
    }
  }
}
