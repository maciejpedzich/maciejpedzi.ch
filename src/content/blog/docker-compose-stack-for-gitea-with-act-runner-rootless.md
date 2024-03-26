---
title: docker compose stack for gitea with act runner (rootless)
description: learn how to set up a rootless docker compose stack for self-hosting gitea with a postgres database and act runner
pubDate: 2024-02-26T00:28:12.934Z
draft: true
categories:
  - project homelabtop
tags:
  - docker
  - linux
  - self-hosted
---

If you're looking to set up a rootless Docker Compose stack for Gitea with a PostgresSQL database and an Act runner instance that spins up workflow containers on the host's Docker Engine, then read on and enjoy!

## preface

This article assumes that you've already [set up the Docker daemon to run as a non-root user](https://docs.docker.com/engine/security/rootless/#install). For this stack, I used [Compose file version 3](https://docs.docker.com/compose/compose-file/compose-file-v3/).

## network and volumes

## postgres database

## gitea server

## obtaining runner registration token

## act runner

## full docker-compose.yml

This is more or less how the entire `compose.yml` file should look like:

```yml
version: "3"

networks:
  net:
    external: false

volumes:
  data:
    driver: local
  config:
    driver: local
  runner_data:
    driver: local
  db_data:
    driver: local

services:
  server:
    image: gitea/gitea:1.21-rootless
    container_name: gitea
    restart: always
    environment:
      - USER_UID=1000
      - USER_GID=1000
      - GITEA__database__DB_TYPE=postgres
      - GITEA__database__HOST=db:5432
      - GITEA__database__NAME=${POSTGRES_DB}
      - GITEA__database__USER=${POSTGRES_USER}
      - GITEA__database__PASSWD=${POSTGRES_PASSWORD}
    networks:
      - net
    dns:
      - 8.8.8.8
    volumes:
      - data:/var/lib/gitea
      - config:/etc/gitea
      - /etc/timezone:/etc/timezone:ro
      - /etc/localtime:/etc/localtime:ro
    ports:
      - ${GITEA_PORT}:3000
      - ${GITEA_SSH_PORT}:22
    depends_on:
      - db

  runner:
    image: vegardit/gitea-act-runner:0.2.6
    container_name: act_runner
    restart: always
    environment:
      GITEA_INSTANCE_INSECURE: true
      GITEA_RUNNER_UID: 0
      GITEA_RUNNER_GID: 0
      GITEA_INSTANCE_URL: http://gitea:3000
      GITEA_RUNNER_REGISTRATION_TOKEN: ${RUNNER_REGISTRATION_TOKEN}
      GITEA_RUNNER_JOB_CONTAINER_NETWORK: gitea_net
    networks:
      - net
    volumes:
      - runner_data:/data
      - /run/user/1000/docker.sock:/var/run/docker.sock
      - /etc/timezone:/etc/timezone:ro
      - /etc/localtime:/etc/localtime:ro
    depends_on:
      - server

  db:
    image: postgres:16-alpine
    restart: always
    environment:
      - POSTGRES_DB=${POSTGRES_DB}
      - POSTGRES_USER=${POSTGRES_USER}
      - POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
    networks:
      - net
    volumes:
      - db_data:/var/lib/postgresql/data
```

## running a sample action
