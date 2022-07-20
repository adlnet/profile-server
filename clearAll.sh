#!/bin/bash
echo '#####################################################'
echo 'Stopping all running containers'
echo '#####################################################'
docker stop $(docker ps -a -q) --force

echo ''
echo '#####################################################'
echo 'Removing all stopped containers'
echo '#####################################################'
docker rm $(docker ps -a -q) --force

echo ''
echo '#####################################################'
echo 'Removing all images'
echo '#####################################################'
docker rmi $(docker images -a -q) --force

echo ''
echo '#####################################################'
echo 'Removing all volumes'
echo '#####################################################'
docker volume rm $(docker volume ls -q) --force

echo ''
echo '#####################################################'
echo 'Removing all networks'
echo '#####################################################'
docker network rm $(docker network ls -q)

echo ''
echo "Done nuking everything!"
