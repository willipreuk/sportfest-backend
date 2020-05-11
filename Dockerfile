FROM node:12.16.3-alpine

WORKDIR /usr/src/app

COPY package*.json ./
RUN apk --no-cache --virtual build-dependencies add \
    python \
    make \
    g++ \
    && npm ci \
    && apk del build-dependencies

COPY . .

ENV NODE_ENV=production
EXPOSE 4000
CMD ["npm", "start"]
