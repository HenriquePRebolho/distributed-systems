FROM node:22-alpine

USER root

WORKDIR /home/node

COPY --chown=node:node ./package.json ./package.json
COPY --chown=node:node ./package-lock.json ./package-lock.json

RUN npm install

COPY --chown=node:node . .

CMD ["node", "server.js"]
