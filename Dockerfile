FROM node:7.7.3

RUN mkdir /usr/app

COPY . /usr/app

WORKDIR /usr/app

RUN npm install

EXPOSE 3000

CMD [ "npm" , "start" ]