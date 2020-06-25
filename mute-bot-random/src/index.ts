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
  .option('-m, --master [url]', 'the URL of the master bot')
  .option('-p, --port [port]', 'the bot server port', 20001)
  .option('-n, --namebot [name]', 'the name of the bot', 'Bot0')
  .option('-o, --objective [nbOperations]', 'the number of operations of the simulation', 10)
  .option('--nb-operations [nbOperations]', 'the number of operations the bot will perform', 10)
  .option(
    '--deletion [deletion]',
    'the probability to perform a deletion instead of an insertion',
    20
  )
  .option('--move [move]', 'the probability to move the cursor before each local operation', 0)
  .option('--operation-interval [ms]', 'the time between each operations', 1000)
  .option('--delay [ms]', 'the initial delay before starting the simulation', 5000)
  .option('--address [adr]', 'the address of the node, for example ws://[adr]:20001', 'localhost')
  .option('--buffer-size [nb]', 'save logs in file every [nb] operations', 10)
  .option('--log-interval [nb]', 'log every [nb] operation in the console', 100)
  .option(
    '-s, --snapshot [nbOperation]',
    'save a snapshot of the structure every [nbOperation] operations',
    10
  )
  .option('--strategy [strat]', 'The strategy to use', 'ls')
  .parse(process.argv)

console.log('Start : port', program.port, ' - master', program.master)

const port = parseInt(program.port, 10)
const objective = parseInt(program.objective, 10)
const snapshot = parseInt(program.snapshot, 10)
const bufferSize = parseInt(program.bufferSize, 10)
const logInterval = parseInt(program.logInterval, 10)
const nbOperations = parseInt(program.nbOperations, 10)
const operationInterval = parseInt(program.operationInterval, 10)
const pDeletion = parseInt(program.deletion, 10)
const pMove = parseInt(program.move, 10)
const delay = parseInt(program.delay, 10)

let strat = Strategy.LOGOOTSPLIT
switch (program.strategy) {
  case 'dls':
    strat = Strategy.DOTTEDLOGOOTSPLIT
    break
  case 'fifodls':
    strat = Strategy.FIFODOTTEDLOGOOTSPLIT
    break
  case 'rls':
    strat = Strategy.RENAMABLELOGOOTSPLIT
    break
  default:
    break
}

const bot = new BotRandom(
  program.namebot,
  program.master,
  port,
  program.address,
  objective,
  snapshot,
  strat,
  bufferSize,
  logInterval
)

setTimeout(() => {
  bot.doChanges(nbOperations, operationInterval, pDeletion, pMove)
}, delay)
