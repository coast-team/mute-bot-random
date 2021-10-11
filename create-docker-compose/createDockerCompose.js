const fs = require("fs");

const conf = JSON.parse(fs.readFileSync("./config.json"));
const nbOperationsPerBot = conf.objective / conf.nbBots

function generateCommand(index) {
  const additionalArg = index !== 0 ? "-m ws://bot0:20001" : ""
  const basicInfos = `-n Bot${index} ${additionalArg} --address bot${index} -p 20001 --delay ${conf.delay}`

  const opsInfos = `-o ${conf.objective} --nb-operations ${nbOperationsPerBot} --operation-interval ${conf.operationInterval} --deletion ${conf.deletion} --move ${conf.move}`
  const renameOpsInfos = conf.strategy === "rls" ?
    `--nb-renaming-bots ${conf.nbRenamingBots} --rename-op-interval ${conf.renameOpInterval}` : ""
  const crdtInfos = `--strategy ${conf.strategy} ${opsInfos} ${renameOpsInfos}`

  const logInfos = `--snapshot ${conf.snapshot} --buffer-size ${conf.bufferSize} --log-interval ${conf.logInterval}`

  return `npm start -- ${basicInfos} ${crdtInfos} ${logInfos}`
}

function generateComposePerBot(index) {
  return `  bot${index}:
    image: botrandom:2.0.1
    user: 'node'
    volumes:
      - type: bind
        source: ../../Results/\${BOTRANDOM_EXPERIMENT_NAME}
        target: /home/node/app/output
    deploy:
      restart_policy:
        condition: none
    command:
      - bash
      - -c
      - |
        ${generateCommand(index)}
`
}

const botsConfig = Array.from({ length: conf.nbBots }).map((_, index) => { return generateComposePerBot(index) }).join([""])

const str = `version: '3.2'
services:
${botsConfig}`

fs.writeFileSync(`./docker-compose/docker-compose-${Date.now()}.yml`, str)
