#!/usr/bin/sh

CONTAINER_NAME = $1;
PORT_PAIR = $2;
NETWORK_NAME = $3;
IMAGE_TAG = $4;

docker stop $CONTAINER_NAME && \
docker container rm $(docker ps -aqf "name=$CONTAINER_NAME") && \
docker run -d -p $PORT_PAIR --netwok $NETWORK_NAME --name $CONTAINER_NAME $IMAGE_TAG
