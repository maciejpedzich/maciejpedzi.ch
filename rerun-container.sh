docker container rm -f $(docker ps -aqf "ancestor=maciejpedzi.ch:latest")
docker run -d -p 8505:80 --name my_website maciejpedzi.ch:latest
