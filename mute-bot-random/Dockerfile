FROM node:latest

USER node
RUN mkdir /home/node/app
WORKDIR /home/node/app
RUN mkdir dist
RUN mkdir output

COPY ./dist /home/node/app/dist
COPY package.json /home/node/app

RUN npm i