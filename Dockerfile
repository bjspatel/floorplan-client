FROM node:9-alpine

RUN apk add --no-cache tini
ENTRYPOINT ["/sbin/tini", "--"]

# Install the app
WORKDIR /app
COPY package.json package-lock.json ./
ENV NODE_ENV production
ENV NPM_CONFIG_LOGLEVEL warn
RUN npm install
COPY . .

# Run container as unprivilidged user
USER node

EXPOSE 3000

# Run node directly
CMD [ "node", "app" ]
