# rsstodolist-node-server

rsstodolist-node-server is a node port of the Google App Engine rsstodolist application (https://rsstodolist.appspot.com).
Same functionality are expected but It can be host on your server.

## Requirements

- Node >= 10
- MariaDB

## Pre-requisites

- Copy `.env.sample` into `.env` (or .env.docker_compose if you are using docker-compose setup) and set the variables.

## Setup

### Run the migration file

Run the migration file `./rssdolist.sql` to create the rsstodolist database.

### Install packages and start the application

``` shell
npm install
npm start
```

## Setup with docker-compose

```shell
docker-compose up
```

## Setup with the DockerFile

### Run the migration file

Currently, you need to apply `rsstodolist.sql` manually on your database server.

### Build the image

As there is no currently public image, build the image for example like this:

```shell
docker build -t rsstodolist .
```

### Run the container

Run the container for example by linking a file containing environment variables.

```shell
docker run --env-file ./.env rsstodolist
```

or define needed environment variables within the command:

```shell
docker run -p 8080:6070 \
-e DATABASE_HOST=localhost \
-e DATABASE_PORT=3306 \
rsstodolist
```

