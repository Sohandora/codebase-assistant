FROM node:20-alpine

WORKDIR /app

# Install git because the backend clones GitHub repositories
RUN apk add --no-cache git

COPY package*.json ./

RUN npm ci --omit=dev

COPY . .

EXPOSE 5000

CMD ["node", "server.js"]