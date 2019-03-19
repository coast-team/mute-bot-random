# Mute Bot Random Experiments

## Description

This project provide tools to experiment CRDT performances, in a collaboration.

In order to simulate a collaboration, a bot has been developed. It plays randomly an insert or a deletion in a document, with a probability to move in this. (cf. [mute-bot-random](###mute-bot-random))

---

## How to start an experiment

Requirements : you need to install **docker** before using this script

You can start an experiment with the start.sh script : `./start.sh ./path/docker-compose-file [number_of_experiment_simultaneous]`

Or by using docker stack directly :

```
mkdir './Results/myName'
export BOTRANDOM_EXPERIMENT_NAME=myName
docker stack deploy -c 'compose_file' experiment_stack_name
```

---

## Elements

The project is divided in four parts :

- _create-docker-compose_ : create a custom docker-compose file with your experiment's configuration
- _mute-bot-random_ : the bot source code
- _Results_ : some results done
- _results-exploit_ : tools in order to verify the snapshots integrity

### create-docker-compose

The configuration of the experiment is in `config.json`.
The JSON's structure is :

- _objective_: the total number of operation targeted
- _delay_: the time in ms before the bots will start the experiment
- _snapshot_: the number of operation between two snapshots
- _bots_ : the list of bots
  - _master_ : true if it's the master
  - _botname_ : The name of the bot. Take attention to have a unique name in the experiment
  - _time_ : the time between each operation
  - _operation_ : the number of operation the bot will operate
  - _deletion_ : the probability to have a delete operation in %
  - _move_ : the probability to move in the document before an operation in %

Usage : `node createDockerCompose.js`. The docker-compose file generated is created and placed in the docker-compose folder with the name `docker-compose-[timestamp].yml`

### mute-bot-random

You can build the project with `npm run build`

Usage: `npm start -- [options]`

```
Options:
  -V, --version                   output the version number
  -m, --master [url]              Master Url
  -p, --port [port]               The bot server port (default: 20001)
  -n, --namebot [name]            the name of the bot (default: "Bob")
  -o, --objective [nbOperations]  The number of operation (default: 10)
  --operation [nbOperations]      THe number of operation the bot will make (default: 10)
  --deletion [deletion]           The probability to have a deletion instead of an insertion (default: 0)
  --deplacement [deplacement]     The probability to move the cursor (default: 0)
  --time [ms]                     The time between each operations (default: 1000)
  --delay [ms]                    The time before starting (default: 5000)
  --address [adr]                 the adress of the node for exemple ws://[adr]:20001 (default: "localhost")
  -s, --snapshot [nbOperation]    save a snapshot of the structure every [nbOperation] operations (default: 10)
  -h, --help                      output usage information
```

### Results

Results are save in a folder with timestamp as name. There is two kind of file :

- Logs : all operation made and received by a node are in this file `Logs.[botname].json`
- Snapshot : The serialized sequence crdt given with a certain number operations `Snaphot.[nbOperation].[botname].json`

### result-exploit

You can build the project with `npm run build`

The first function is to compare str from snapshots in the `./input` folder.
You have to copy Snapshot file you want to compare in that folders, and only these.
You can run `npm run start`

The second, is experiment on an other operation apply on a specific snapshot. This measure time to apply an operation on the structure. You can run `npm start -- -e /snapshot/path`
