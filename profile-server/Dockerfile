 FROM node:14-alpine
 ENV NODE_ENV=production
 COPY . .

 WORKDIR ./client
 RUN ls
 RUN yarn install
# RUN yarn install --production
 CMD ["yarn", "start"]
# CMD ["node", "server.js"]
