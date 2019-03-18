#! /bin/bash

# Start demonstration : ./start.sh [docker-compose file]

if [[ $# -ne 1 ]]
then
  echo "Invalid Argument : ./start.sh [docker-compose file]"
  exit 1
fi


image=`docker images -a | grep botrandom`
if [[ -z $image ]]
then 
  docker build -t botrandom ./mute-bot-random/
fi

name=`date +'%s'`
mkdir "./Results/$name"

export BOTRANDOM_EXPERIMENT_NAME=$name



docker stack deploy -c `echo $1` experiment