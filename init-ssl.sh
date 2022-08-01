#!/bin/bash

mkdir -p ./data/certbot/etc/live/$1

echo "[SSL] Ensured Certbot SSL Directory" 

cp ./certbot/local/fullchain.pem  ./data/certbot/etc/live/$1/fullchain.pem

echo "[SSL] Copied temporary SSL Cert to ./data/certbot/etc/live/$1/fullchain.pem" 

cp ./certbot/local/privkey.pem  ./data/certbot/etc/live/$1/privkey.pem

echo "[SSL] Copied temporary SSL Key to ./data/certbot/etc/live/$1/privkey.pem" 
echo "" 
