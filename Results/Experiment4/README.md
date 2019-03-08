# Experiment 4

## Condition

5 bots, started with the following commands and params :
	- npm start -- -n Bot0 -p 20001 --operation 1000 --delay 10000 --time 500 -o 5000 -s 500 --deletion 20 --deplacement 5
	- npm start -- -n Bot1 -m ws://localhost:20001 -p 20002 --operation 1000 --delay 10000 --time 500 -o 5000 -s 500 --deletion 20 --deplacement 5
	- npm start -- -n Bot2 -m ws://localhost:20001 -p 20003 --operation 1000 --delay 10000 --time 500 -o 5000 -s 500 --deletion 20 --deplacement 5
	- npm start -- -n Bot3 -m ws://localhost:20001 -p 20004 --operation 1000 --delay 10000 --time 500 -o 5000 -s 500 --deletion 20 --deplacement 5
	- npm start -- -n Bot4 -m ws://localhost:20001 -p 20005 --operation 1000 --delay 10000 --time 500 -o 5000 -s 500 --deletion 20 --deplacement 5


CORRECTION DU BOT :
	Modification de la maniere dont l'index d'une operation est calculée : on prend en compte les ajout par les ope distante qui se font avant l'index courant

