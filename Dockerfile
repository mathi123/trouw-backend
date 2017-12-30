FROM node:7.7.3

RUN mkdir /usr/app

COPY . /usr/app

COPY ./app/configuration.production.json /usr/app/app/configuration.json

WORKDIR /usr/app

RUN npm install

EXPOSE 3000

CMD [ "npm" , "start" ]