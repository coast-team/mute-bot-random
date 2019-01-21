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
  .option('-n, --namebot [name]', 'the name of the bot', 'Bob')
  .parse(process.argv)

console.log('Start : port', program.port, ' - master', program.master)
// new NetworkNode(program.port, program.master, program.port)

const bot = new BotRandom(program.namebot, program.master, program.port)

setTimeout(() => {
  bot.doChanges(10, 1000, 0, 0)
}, 10000)
