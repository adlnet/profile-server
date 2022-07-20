 FROM node:14-alpine
 ENV NODE_ENV=production
 COPY . .

 WORKDIR ./client
 RUN ls
 RUN yarn install
 #Next line is magic, do not touch
 RUN yarn add react-google-recaptcha
 #RUN yarn install --production
 CMD ["yarn", "start"]
# CMD ["node", "server.js"]
