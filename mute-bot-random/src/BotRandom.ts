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
import { IExperimentLogs } from '@coast-team/mute-core/dist/types/src/misc/IExperimentLogs'
import { KeyState, Symmetric } from '@coast-team/mute-crypto'
import { SimpleDotPos } from 'dotted-logootsplit'
import { OpEditableReplicatedList } from 'dotted-logootsplit/dist/types/core/op-replicated-list'
import { appendFileSync, writeFileSync } from 'fs'
import { LogootSRopes, RenamableReplicableList } from 'mute-structs'
import * as os from 'os'
import { Subject } from 'rxjs'
import { buffer } from 'rxjs/operators'
import { delay, generateMuteCore, random, randomChar } from './helpers'
import { MessageType, NetworkNode } from './NetworkNode'
import { Message } from './proto'

const nbRenamingBots = 1
const renameOpInterval = 10

export class BotRandom {
  private network: NetworkNode
  private mutecore: MuteCoreTypes
  private botname: string
  private snapshot: number
  private objective: number
  private cptOperation: number
  private cptLocal: number
  private cptRemote: number
  private strategy: Strategy

  private bufferSize: number
  private logsnumber: number

  private start: boolean
  private messages$: Subject<{ streamId: StreamId; content: Uint8Array; senderId: number }>
  private crypto: Symmetric
  private localOps$: Subject<Array<TextDelete | TextInsert>>
  private bufferTrigger$: Subject<void>

  private index: number
  private isRenamingBot: boolean

  constructor(
    botname: string,
    master: string,
    port: number,
    adr: string,
    objective: number,
    snapshot: number,
    strategy: Strategy,
    buffer: number,
    logsnumber: number
  ) {
    this.messages$ = new Subject()
    this.localOps$ = new Subject()
    this.bufferTrigger$ = new Subject()

    this.start = true
    this.index = -1

    this.botname = botname
    this.snapshot = snapshot
    this.objective = objective
    this.strategy = strategy
    this.isRenamingBot = false

    if (this.strategy === Strategy.RENAMABLELOGOOTSPLIT) {
      const nbRenameOps = (objective / renameOpInterval) * nbRenamingBots
      this.objective += nbRenameOps

      const renamingBotsNames = Array.from({ length: nbRenamingBots }, (_, i) => `Bot${i}`)
      this.isRenamingBot = renamingBotsNames.includes(this.botname)
    }

    this.bufferSize = buffer
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

    console.log('doChanges(): start')
    let changeState = false

    for (let nbLocal = 0; nbLocal < nboperation; nbLocal++) {
      if (this.str.length >= 60000 && !changeState) {
        console.log('doChanges(): changing ratio of local ops to 50/50')
        currentpDeletion = 50
        changeState = true
      }

      const dep = random(99) < currentpDeplacement
      if (dep || this.index === -1) {
        this.index = random(this.str.length)
      }

      const myId = this.mutecore.myMuteCoreId
      const del = random(99) < currentpDeletion && this.index > 0
      if (del) {
        this.localOps$.next([new TextDelete(this.index - 1, 1, myId)])
        this.index--
      } else {
        const c = randomChar()
        this.localOps$.next([new TextInsert(this.index, c, myId)])
        this.index++
      }

      const randomTime = random(100) - 50
      const newTime = time + randomTime
      await delay(newTime)
    }
    console.log('doChanges(): end')
  }

  handleExperimentLog(log: IExperimentLogs) {
    this.cptOperation++
    if (log.type === 'local') {
      this.cptLocal++
    } else {
      this.cptRemote++
    }

    if (this.cptOperation % this.logsnumber === 0) {
      console.log(
        `handleExperimentLog(): ${this.cptOperation}\t(local: ${this.cptLocal}, remote: ${
          this.cptRemote
        })`
      )
    }

    if (this.cptOperation % this.snapshot === 0) {
      const filename = `./output/Snapshot.${this.cptOperation}.${this.botname}.json`
      writeFileSync(filename, JSON.stringify(log.struct))
    }

    if (this.cptOperation % this.bufferSize === 0) {
      this.bufferTrigger$.next()
    }

    if (
      this.strategy === Strategy.RENAMABLELOGOOTSPLIT &&
      this.isRenamingBot &&
      this.cptOperation % renameOpInterval === 0
    ) {
      console.log('handleExperimentLog(): triggering rename operation')
      setTimeout(() => {
        // Trigger rename op from a setTimeout(_, 0) to prevent a nested call of handleExperimentLog()
        this.localOps$.next([])
      }, 0)
    }

    if (this.checkObjective()) {
      this.terminate()
    }
  }

  saveLogsToFile(logs: IExperimentLogs[]) {
    if (logs.length > 0) {
      const prefix = this.start ? '[' : ',' + os.EOL
      this.start = false
      const logsAsStr = logs
        .map((log) => {
          const { struct, ...otherAttributes } = log
          return JSON.stringify(otherAttributes)
        })
        .join(',' + os.EOL)
      const str = prefix + logsAsStr

      const filename = `./output/Logs.${this.botname}.json`
      appendFileSync(filename, str)
    }
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

  public checkObjective(): boolean {
    return this.cptOperation >= this.objective
  }

  public async terminate() {
    this.bufferTrigger$.next()
    appendFileSync('./output/Logs.' + this.botname + '.json', ']')
    writeFileSync('./output/string.' + this.botname + '.txt', this.str)

    console.log('terminate(): data saved, waiting a bit before exiting')
    await delay(60000) // Stay online a bit to synchronise with other nodes if needed

    console.log('terminate(): exiting')
    process.exit(0)
  }

  // INIT NETWORK
  public initNetwork() {
    this.network.output$.subscribe((out) => {
      const decode = Message.decode(out.message)
      if (decode) {
        // console.log('receive', decode.streamId)
        this.messages$.next({
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
    this.mutecore.messageIn$ = this.messages$.asObservable()
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

    this.mutecore.localTextOperations$ = this.localOps$.asObservable()

    this.mutecore.experimentLogs$.pipe(buffer(this.bufferTrigger$)).subscribe((logs) => {
      this.saveLogsToFile(logs)
    })

    this.mutecore.experimentLogs$.subscribe((log) => {
      this.handleExperimentLog(log)
    })

    this.mutecore.collabJoin$.subscribe(() => {
      console.log('handleNewCollab(): synchronizing with new collaborator')
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
