#!/usr/bin/sh

docker stop my_website && \
docker container rm $(docker ps -aqf "name=my_website") && \
docker run -d -p 8505:80 --netwok my_network --name my_website maciejpedzi.ch:latest
