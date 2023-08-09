# ----------------------------------------------------------- #
# Build the UI / Client app with React
# ----------------------------------------------------------- #
FROM node:16-alpine as builder

ARG SKIP_RECAPTCHA
ENV REACT_APP_SKIP_RECAPTCHA $SKIP_RECAPTCHA

ARG RECAPTCHA_SITE_KEY
ENV REACT_APP_RECAPTCHA_SITE_KEY $RECAPTCHA_SITE_KEY

ENV NODE_ENV=production
 
RUN apk update || : && apk add python3 git

COPY ./profile-server/client /client
WORKDIR /client

RUN yarn install
RUN yarn build

# ----------------------------------------------------------- #
# Build the Server component
#
# During this step, we will copy over the final React 
# build output and handle those files as static from
# the root path of our server.
# ----------------------------------------------------------- #
FROM node:16-alpine

RUN apk update || : && apk add python3 git

RUN mkdir /app
WORKDIR /app

COPY profile-server/package.json ./package.json
# COPY profile-server/yarn.lock ./yarn.lock

RUN yarn
RUN yarn install

COPY ./profile-server/. ./
COPY .env ./.env
COPY --from=builder /client/build /app/client/build

CMD ["yarn", "start"]
