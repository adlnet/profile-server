FROM node:16-alpine as builder
ENV NODE_ENV=production
 
COPY ./profile-server/client /client
WORKDIR /client

RUN yarn install && yarn build


FROM node:16-alpine

RUN apk update || : && apk add python3

COPY ./profile-server /app
COPY --from=builder /client/build /app/client/build

WORKDIR /app

RUN yarn
RUN yarn install

CMD ["yarn", "start"]
