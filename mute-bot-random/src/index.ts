import { Strategy } from '@coast-team/mute-core'
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
  .option('--address [adr]', 'the adress of the node for exemple ws://[adr]:20001', 'localhost')
  .option('--buffer [nb]', 'write logs in file every nb operations', 10)
  .option('--logsnumber [nb]', 'logs every nb operation in the console', 100)
  .option(
    '-s, --snapshot [nbOperation]',
    'save a snapshot of the structure every [nbOperation] operations',
    10
  )
  .option('--strategy [strat]', 'The strategy to use', 'ls')
  .parse(process.argv)

console.log('Start : port', program.port, ' - master', program.master)
// new NetworkNode(program.port, program.master, program.port)

let strat = Strategy.LOGOOTSPLIT
switch (program.strategy) {
  case 'dls':
    strat = Strategy.DOTTEDLOGOOTSPLIT
    break
  case 'fifodls':
    strat = Strategy.FIFODOTTEDLOGOOTSPLIT
    break
  default:
    break
}

const bot = new BotRandom(
  program.namebot,
  program.master,
  program.port,
  program.address,
  program.snapshot,
  strat,
  program.buffer,
  program.logsnumber
)

setTimeout(() => {
  bot.doChanges(
    program.operation,
    parseInt(program.time, 10),
    program.deletion,
    program.deplacement
  )
}, program.delay)

const interval = setInterval(() => {
  if (bot.checkObjective(program.objective)) {
    clearInterval(interval)
    bot.terminate()
    // Wait for a while before exiting
    // Allow to run the anti-entropy mechanism to help other nodes
    setTimeout(() => {
      console.log('Exit')
      process.exit(0)
    }, 60000)
  }
}, 1000)
