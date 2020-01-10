var fs = require("fs");

var file = "version: '3.2'\nservices: \n";
var conf = JSON.parse(fs.readFileSync("./config.json"));

var cptBot = 1;
var master = "";
var commandArgs = "";

conf.bots.forEach(obj => {
  if (obj.master) {
    file += `  ${obj.botname.toLowerCase()}:\n`;
    master = obj.botname;
    commandArgs = "--address " + obj.botname.toLowerCase();
  } else {
    file += `  ${obj.botname.toLowerCase()}:\n`;
    file += "    depends_on:\n" + `      - ${master.toLowerCase()}\n`;
    commandArgs = "-m ws://master:20001 --address " + obj.botname.toLowerCase();
    cptBot++;
  }

  file +=
    "    image: botrandom:latest\n" +
    '    user: "node"\n' +
    "    volumes:\n" +
    "      - type: bind\n" +
    "        source: ../../Results/${BOTRANDOM_EXPERIMENT_NAME}\n" +
    "        target: /home/node/app/output\n" +
    "    deploy:\n" +
    "      restart_policy:\n" +
    "        condition: none\n" +
    "    command:\n" +
    "      - bash\n" +
    "      - -c\n" +
    "      - |\n" +
    //"        npm i\n" +
    "        npm start --" +
    ` -n ${obj.botname}` +
    ` ${commandArgs}` +
    " -p 20001" +
    ` -o ${conf.objective}` +
    ` --delay ${conf.delay}` +
    ` --time ${obj.time}` +
    ` -s ${conf.snapshot}` +
    ` --deletion ${obj.deletion}` +
    ` --deplacement ${obj.move}` +
    ` --operation ${obj.operation}` +
    ` --strategy ${conf.strategy}` +
    " && sync \n";
});

fs.writeFileSync(
  "./docker-compose/docker-compose-" + Date.now() + ".yml",
  file
);
