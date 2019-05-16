#! /bin/bash

# Start demonstration : ./start.sh [docker-compose file]

if [[ $# -lt 1 ]]
then
  echo "Invalid Argument : ./start.sh docker-compose-file [nb_parrallele_experiment]"
  exit 1
fi

nb=1

if [[ $# -eq 2 ]]
then
  nb=$2
fi

image=`docker images -a | grep botrandom`
if [[ -z $image ]]
then 
  docker build -t botrandom ./mute-bot-random/
fi



for i in `seq 1 $2`
do
  name=`date +'%s'`
  mkdir "./Results/$name"
  export BOTRANDOM_EXPERIMENT_NAME=$name
  chmod a+w "./Results/$name"


  docker stack deploy -c `echo $1` `echo "experiment$i"`
done