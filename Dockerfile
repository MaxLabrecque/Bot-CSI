FROM node:18

WORKDIR .

COPY package*.json .

RUN npm ci --omit=dev

COPY . .

CMD ["node", "index.js"]
