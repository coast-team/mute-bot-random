import * as program from 'commander'
import { BotRandom } from './BotRandom'

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
  .option('-m, --master [url]', 'Master Url')
  .option('-p, --port [port]', 'The bot server port', 20001)
  .parse(process.argv)

/*console.log('Start : port', program.port, ' - master', program.master)
const network = new NetworkNode(program.master, program.port)

const input = new Subject<string>()
network.input$ = input.asObservable()*/

new BotRandom('Bob', program.master, program.port)
