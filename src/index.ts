import { Strategy } from '@coast-team/mute-core'
import * as program from 'commander'
import * as http from 'http' // https is also possible
import { Bot } from 'netflux'
import { BotRandom } from './BotRandom'

export interface IParams {
  botname: string
  port: number
  crdt: Strategy
  key: string
  rtcConfiguration: {
    iceServers: Array<{ urls: string[] }>
  }
  signalingServer: 'ws://localhost:8010'
}

class App {
  private default: IParams = {
    botname: 'Jean-Paul',
    port: 20001,
    crdt: Strategy.LOGOOTSPLIT,
    key: 'test',
    rtcConfiguration: {
      iceServers: [
        {
          urls: ['stun:stun.l.google.com:19302'],
        },
      ],
    },
    signalingServer: 'ws://localhost:8010',
  }

  constructor(server: http.Server) {
    this.initParams()

    /*const bot = new BotRandom(this.default)
    bot.join(this.default.key)
    
    bot.onStateChange$.subscribe((state) => {
      if (state === WebGroupState.JOINED) {
        bot.doChanges()
      }
    })*/

    const bot = new Bot({
      url: 'ws://localhost:' + program.port,
      server,
      webGroupOptions: {
        rtcConfiguration: {
          iceServers: [
            {
              urls: ['stun:stun.l.google.com:19302'],
            },
          ],
        },
        signalingServer: 'ws://localhost:8010',
      },
    })

    bot.onWebGroup = (wg) => {
      console.log('On WebGroup : ', wg.key)
      const botrandom = new BotRandom('Jean-Paul', wg)
      setTimeout(() => {
        console.log('Changes start !')
        botrandom.doChanges(1000, 500, 0, 50)
      }, 2000)
    }
  }

  initParams() {
    // Retrieve version from package.json
    let version: string
    try {
      version = require('../package.json').version
    } catch (err) {
      try {
        version = require('./package.json').version
      } catch {
        log.error(err)
        version = ''
      }
    }

    program
      .version(version)
      .option('-n, --botname [name]', 'The name of the bot', this.default.botname)
      .option('-p, --port [port]', 'The bot server port', this.default.port)
      .parse(process.argv)
  }
}

const server = http.createServer()
new App(server)

server.on('error', (err) => {
  console.log('ERROR', err)
})
server.listen(program.port, '0.0.0.0')
