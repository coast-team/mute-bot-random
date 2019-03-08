var fs = require("fs");

var file = "version: '3'\nservices: \n";
var conf = JSON.parse(fs.readFileSync("./config.json"));

var cptBot = 1;
var commandArgs = "";

conf.bots.forEach(obj => {
  if (obj.master) {
    file += "  master:\n";
    commandArgs = "--address master";
  } else {
    file += "  bot" + cptBot + ":\n";
    file += "    depends_on:\n" + "      - master\n";
    commandArgs = "-m ws://master:20001 --address bot" + cptBot;
    cptBot++;
  }

  file +=
    '    image: "node:latest"\n' +
    '    user: "node"\n' +
    "    working_dir: /home/node/app\n" +
    "    volumes:\n" +
    "      - ./botrandom/:/home/node/app\n" +
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
    "\n";
});

fs.writeFileSync(
  "./docker-compose/docker-compose-" + Date.now() + ".yml",
  file
);
