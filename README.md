# rsstodolist-node-server

rsstodolist is an URL oriented to-read-list based on an RSS XML feed. Typical use case is to save web pages to read later on a RSS reader, or to send links to friends.

That application is hosted on fly.io at https://rsstodolist.eu/.
For more reliability and privacy, I _strongly_ suggest you to self-host that application.

Thanks to [Loïc Fürhoff](https://github.com/imagoiq), it can be hosted in a convenient way via docker.


## Requirements

- Node >= 20
- MariaDB or Postgres

or

- docker


## Pre-requisites

Copy `.env.sample` into `.env` (or `.env.docker_compose` if you are using docker-compose setup) and set the variables according your need.

The app will try to determine it’s root url. If it isn’t correct, you can specify it via `ROOT_URL` env variable.

The `PUBLIC` env variable should only be used for public instance (it disable /list and add some messages about self-hosting).


## 1. Setup with docker-compose

```shell
docker-compose -f ./docker/docker-compose.yml build
docker-compose -f ./docker/docker-compose.yml up
```

## 2. Setup with the DockerFile

### Run the migration file

You need to apply `sql/rsstodolist.mysql` or `sql/rsstodolist.postgres` manually on your database server.

### Build the image

As there is no currently public image, build the image for example like this:

```shell
npm run docker-build
# or
docker build -t rsstodolist -f ./Dockerfile .
```

### Run the container

Run the container for example by linking a file containing environment variables.

```shell
docker run --env-file ./.env rsstodolist
```

or define needed environment variables within the command:

```shell
docker run -p 8080:6070 \
-e DATABASE_HOST=127.0.0.1 \
-e DATABASE_PORT=3306 \
rsstodolist
```

## 3. Setup via node & MariaDB

### Run the migration file

Run the migration file to create the rsstodolist database.

### Install packages and start the application

``` shell
npm install
npm start
```

## Commands

You can use `npm run dump` to extract all databases rows into a CSV file format.