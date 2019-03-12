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



docker-compose -f `echo $1` up
echo "\nExperiment DONE !"