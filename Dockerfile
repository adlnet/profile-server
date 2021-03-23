 FROM node:12-alpine
 ENV NODE_ENV=production
 WORKDIR /app
 COPY ["package.json", "yarn.lock", "./"]
 RUN yarn install --production
 COPY . .

 WORKDIR ./client
 COPY ["package.json", "yarn.lock", "./"]
 RUN yarn install --production

 WORKDIR ..
 EXPOSE 3005
 CMD ["node", "server.js"]