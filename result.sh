#! /bin/bash

# Start demonstration : ./start.sh [docker-compose file]

if [[ $# -lt 2 ]]
then
  echo "Invalid Argument : ./result.sh snapshot config"
  exit 1
fi

image=`docker images -a | grep resultexploit`
if [[ -z $image ]]
then 
  docker build -t resultexploit ./result-exploit/
fi

cp $1 ./results-exploit/input/snapshot.json
cp $2 ./results-exploit/input/config.json

docker stack deploy -c ./results-exploit/docker-compose.yml result