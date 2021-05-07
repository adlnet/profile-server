 FROM node:14-alpine 
 ENV NODE_ENV=production
 
 COPY ./profile-server /app
 WORKDIR /app
 
 RUN apk update || : && apk add python
 
 WORKDIR /app/profile-server
 RUN yarn
# CMD ["node", "server.js"]
 CMD ["yarn", "test"]
