FROM node:22-alpine

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY index.js rabbitmq.js ./

ENV PORT=3002
EXPOSE 3002

CMD ["node", "index.js"]
