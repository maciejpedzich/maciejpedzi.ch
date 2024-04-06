#!/usr/bin/sh

docker stop $CONTAINER_NAME && \
docker container rm $(docker ps -aqf "name=$CONTAINER_NAME") && \
docker run -d -p $PORT_PAIR --netwok $NETWORK_NAME --name $CONTAINER_NAME $IMAGE_TAG
