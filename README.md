# Glip GitHub Chatbot

This project is for tutorial purpose. 
It shows you how to integrate Glip chatbot with a third party service (GitHub).


## Setup

```
yarn install
yarn proxy
cp .env.sample .env
```

Edit `.env` file

If you are not familar with the process of setting up a Glip chatbot, please read [this tutorial](https://github.com/tylerlong/glip-ping-chatbot/tree/express).


## Run

```
yarn server
```


## Create database tables

```
curl -X PUT -u admin:password https://<chatbot-server>/admin/setup-database
```
