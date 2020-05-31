# rsstodolist-node-server

rsstodolist-node-server is a node port of the Google App Engine rsstodolist application (http://rsstodolist.appspot.com).
Same functionality are expected but It can be host on your server.

## Pre-requisites

You’ll need node >= 10 and MariaDB.

You’ll need to run rssdolist.sql to create database rsstodolist.

Then, you’ll have to copy `parameters.json.dist` to `parameters.json`, update value inside and then launch node.
