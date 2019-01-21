import { Observable, Subject } from 'rxjs'
import * as WebSocket from 'ws'

export enum MessageType {
  PEERS_LIST_QUERY,
  PEERS_LIST_RESPONSE,
  CONNECTION,
  CONNECTION_RESPONSE,
  MESSAGE,
}

export interface INetworkMessage {
  type: MessageType
  content?: any
}

export interface INetworkNodeInfo {
  id: number
  url: string
  ws: WebSocket
}

export class NetworkNode {
  private myId: number
  private masterUrl: string
  private myUrl: string
  private peerList: INetworkNodeInfo[]
  private server: WebSocket.Server

  private output: Subject<string>
  private memberJoin: Subject<number>
  private memberLeave: Subject<number>

  constructor(id: number, masterUrl: string, port: number) {
    this.myId = id

    this.output = new Subject()
    this.memberJoin = new Subject()
    this.memberLeave = new Subject()

    this.masterUrl = masterUrl
    this.myUrl = 'ws://localhost:' + port
    this.peerList = []

    this.server = new WebSocket.Server({ port })
    this.initServer()

    // Connection au master
    if (this.masterUrl) {
      const wsMaster = this.connect(this.masterUrl)
      wsMaster.onopen = () => {
        this.send(wsMaster, {
          type: MessageType.CONNECTION,
          content: { url: this.myUrl, id: this.myId },
        })
        this.send(wsMaster, { type: MessageType.PEERS_LIST_QUERY })
      }
    }
  }

  // --------------------------------------------------------------------------------------
  public connect(url: string): WebSocket {
    const ws = new WebSocket(url)

    ws.onopen = () => {
      this.send(ws, { type: MessageType.CONNECTION, content: { id: this.myId, url: this.myUrl } })
    }
    ws.onmessage = (data) => {
      this.receive(data.target, data.data)
    }
    ws.onclose = (event) => {
      this.removePeer(event.target.url)
    }
    return ws
  }

  public broascast(message: INetworkMessage) {
    this.peerList.forEach(({ ws }) => {
      this.send(ws, message)
    })
  }

  public send(target: WebSocket, data: INetworkMessage) {
    target.send(JSON.stringify(data))
  }

  public receive(from: WebSocket, data: WebSocket.Data) {
    const message = JSON.parse(data.toString())
    switch (message.type) {
      case MessageType.PEERS_LIST_QUERY:
        console.log(`---> PEER_LIST_QUERY`)
        this.send(from, {
          type: MessageType.PEERS_LIST_RESPONSE,
          content: this.peerAddresse(),
        })
        break

      case MessageType.PEERS_LIST_RESPONSE:
        console.log(`---> PEER_LIST_RESPONSE`, message.content)
        const array = message.content
        array.forEach((value: string) => {
          if (value !== this.myUrl) {
            this.connect(value)
          }
        })
        break

      case MessageType.CONNECTION:
        console.log(`---> CONNECTION`, message.content)
        from.url = message.content.url
        this.addPeer({ id: message.content.id, url: message.content.url, ws: from })
        this.send(from, {
          type: MessageType.CONNECTION_RESPONSE,
          content: { id: this.myId, url: this.myUrl },
        })
        break

      case MessageType.CONNECTION_RESPONSE:
        console.log(`---> CONNECTION_RESPONSE`, message.content)
        this.addPeer({ id: message.content.id, url: message.content.url, ws: from })
        break

      case MessageType.MESSAGE:
        console.log(`---> MESSAGE`)
        this.output.next(message.content)
        break
    }
  }

  // --------------------------------------------------------------------------------------
  public set input$(source: Observable<string>) {
    source.subscribe((msge: string) => {
      this.broascast({ type: MessageType.MESSAGE, content: msge })
    })
  }

  public get output$(): Observable<string> {
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

  private addPeer(info: INetworkNodeInfo) {
    this.peerList.push(info)
    this.memberJoin.next(info.id)
    console.log('Peer JOIN : ', this.peerListToString())
  }

  private removePeer(url: string) {
    const index = this.peerList.findIndex((value) => {
      return url === value.url
    })
    this.memberLeave.next(this.peerList[index].id)
    this.peerList.splice(index, 1)
    console.log('server : Peer LEAVE : ', this.peerListToString())
  }

  private peerListToString() {
    return this.peerList.map(({ id, url }) => {
      return { id, url }
    })
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
