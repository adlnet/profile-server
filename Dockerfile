# ----------------------------------------------------------- #
# Build the UI / Client app with React
# ----------------------------------------------------------- #
FROM node:16-alpine as builder

ARG RECAPTCHA_SITE_KEY
ENV REACT_APP_RECAPTCHA_SITE_KEY $RECAPTCHA_SITE_KEY
ENV NODE_ENV=production
 
COPY ./profile-server/client /client
WORKDIR /client

RUN yarn install && yarn build

# ----------------------------------------------------------- #
# Build the Server component
#
# During this step, we will copy over the final React 
# build output and handle those files as static from
# the root path of our server.
# ----------------------------------------------------------- #
FROM node:16-alpine

RUN apk update || : && apk add python3

COPY ./profile-server /app
COPY .env /app/.env
COPY --from=builder /client/build /app/client/build

WORKDIR /app

RUN yarn
RUN yarn install

CMD ["yarn", "start"]
