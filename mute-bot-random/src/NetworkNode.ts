import { Observable, Subject } from 'rxjs'
import * as WebSocket from 'ws'
import { NetworkMessage } from './proto'

export enum MessageType {
  CONNECTION,
  CONNECTION_RESPONSE,
  MESSAGE,
}

export interface INetworkMessageInfo {
  type: MessageType
  senderId: number
  content?: any
}

export interface INetworkNodeInfo {
  id: number
  url: string
  ws: WebSocket
}

export class NetworkNode {
  // --------------------------------------------------------------------------------------
  public set input$(source: Observable<string>) {
    source.subscribe((msge: string) => {
      this.broascast({ type: MessageType.MESSAGE, senderId: this.myId, content: msge })
    })
  }

  public get output$(): Observable<any> {
    return this.output.asObservable()
  }

  public get memberJoin$(): Observable<number> {
    return this.memberJoin.asObservable()
  }

  public get memberLeave$(): Observable<number> {
    return this.memberLeave.asObservable()
  }

  public get id() {
    return this.myId
  }
  private myId: number
  private masterUrl: string
  private myUrl: string
  private peerList: INetworkNodeInfo[]
  private server: WebSocket.Server

  private output: Subject<{ sender: number; message: any }>
  private memberJoin: Subject<number>
  private memberLeave: Subject<number>

  constructor(id: number, masterUrl: string, port: number, adr: string) {
    this.myId = id

    this.output = new Subject()
    this.memberJoin = new Subject()
    this.memberLeave = new Subject()

    this.masterUrl = masterUrl
    this.myUrl = 'ws://' + adr + ':' + port
    this.peerList = []

    this.server = new WebSocket.Server({ port })
    this.initServer()

    // Connection au master
    if (this.masterUrl) {
      const wsMaster = this.connect(this.masterUrl)
      wsMaster.onopen = () => {
        this.send(wsMaster, {
          type: MessageType.CONNECTION,
          senderId: this.myId,
        })
      }
    }
  }

  // --------------------------------------------------------------------------------------
  public connect(url: string): WebSocket {
    const ws = new WebSocket(url)

    ws.onopen = () => {
      this.send(ws, {
        type: MessageType.CONNECTION,
        senderId: this.myId,
      })
    }
    ws.onmessage = (data) => {
      this.receive(data.target, data.data)
    }
    ws.onclose = (event) => {
      this.removePeer(event.target.url)
    }
    return ws
  }

  public broascast(message: INetworkMessageInfo) {
    this.peerList.forEach(({ ws }) => {
      this.send(ws, message)
    })
  }

  public sendTo(id: number, message: INetworkMessageInfo) {
    const index = this.peerList.findIndex((value) => {
      return id === value.id
    })
    this.send(this.peerList[index].ws, message)
  }

  public receive(from: WebSocket, data: WebSocket.Data) {
    const message = NetworkMessage.decode(data as Uint8Array)
    switch (message.type) {
      case MessageType.CONNECTION:
        // console.log(`---> CONNECTION`, message.connection)
        const connection = message.connection
        if (connection && connection.url) {
          from.url = connection.url
          this.addPeer({ id: message.senderId, url: connection.url, ws: from })
          this.send(from, {
            type: MessageType.CONNECTION_RESPONSE,
            senderId: this.myId,
          })
        }
        break

      case MessageType.CONNECTION_RESPONSE:
        // console.log(`---> CONNECTION_RESPONSE`, message.connectionResponse)
        const connectionResponse = message.connectionResponse
        if (connectionResponse && connectionResponse.url && connectionResponse.list) {
          this.addPeer({ id: message.senderId, url: connectionResponse.url, ws: from })
          const array = connectionResponse.list
          array.forEach((value: string) => {
            if (value !== this.myUrl && !this.hasPeer(value)) {
              this.connect(value)
            }
          })
        }
        break

      case MessageType.MESSAGE:
        // console.log(`---> MESSAGE`, message.senderId)
        this.output.next({ sender: message.senderId, message: message.mutecoreMessage })
        break
    }
  }

  private send(target: WebSocket, data: INetworkMessageInfo) {
    let msg = {}
    switch (data.type) {
      case MessageType.CONNECTION:
        msg = NetworkMessage.create({
          type: data.type,
          senderId: data.senderId,
          connection: { url: this.myUrl },
        })
        break
      case MessageType.CONNECTION_RESPONSE:
        msg = NetworkMessage.create({
          type: data.type,
          senderId: data.senderId,
          connectionResponse: { url: this.myUrl, list: this.peerAddresse() },
        })
        break
      case MessageType.MESSAGE:
        msg = NetworkMessage.create({
          type: data.type,
          senderId: data.senderId,
          mutecoreMessage: data.content,
        })
        break
      default:
        throw new Error('error while sending data : data.type unknown')
    }
    target.send(NetworkMessage.encode(msg).finish())
  }

  private addPeer(info: INetworkNodeInfo) {
    this.peerList.push(info)
    this.memberJoin.next(info.id)
    console.log('Peer JOIN : ', this.peerListToString())
  }

  private removePeer(url: string) {
    const index = this.peerList.findIndex((value) => {
      return url === value.url
    })
    if (index !== -1) {
      this.memberLeave.next(this.peerList[index].id)
      this.peerList.splice(index, 1)
      console.log('Peer LEAVE : ', this.peerListToString())
    }
  }

  private peerListToString() {
    return this.peerList.map(({ id, url }) => {
      return { id, url }
    })
  }

  private hasPeer(url: string): boolean {
    const index = this.peerList.findIndex((value) => {
      return url === value.url
    })
    return index !== -1
  }

  private peerAddresse(): string[] {
    return this.peerList.map(({ url }) => url)
  }

  private initServer() {
    this.server.on('connection', (ws) => {
      ws.onmessage = (data) => {
        this.receive(data.target, data.data)
      }

      ws.onclose = (event) => {
        this.removePeer(event.target.url)
      }
    })
  }
}

// --------------------------------------------------------------------------------------
