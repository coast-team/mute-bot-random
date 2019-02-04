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
  .option('-o, --objective [nbOperations]', 'The number of operation', 10)
  .option('--operation [nbOperations]', 'THe number of operation the bot will make', 10)
  .option('--deletion [deletion]', 'The probability to have a deletion instead of an insertion', 0)
  .option('--deplacement [deplacement]', 'The probability to move the cursor', 0)
  .option('--time [ms]', 'The time between each operations', 1000)
  .option('--delay [ms]', 'The time before starting', 5000)
  .parse(process.argv)

console.log('Start : port', program.port, ' - master', program.master)
// new NetworkNode(program.port, program.master, program.port)

const bot = new BotRandom(program.namebot, program.master, program.port)

setTimeout(() => {
  bot.doChanges(program.operation, program.time, program.deletion, program.deplacement)
}, program.delay)

setInterval(() => {
  if (bot.checkObjective(program.objective)) {
    console.log('FINISH')
    bot.saveData().then(() => {
      console.log('Data saved')
      process.exit(0)
    })
  }
}, 1000)
