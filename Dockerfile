FROM node:18

WORKDIR .

COPY package*.json .

RUN npm ci --omit=dev

COPY . .

# Env
ENV BOT_TOKEN=
ENV ADMIN_LOGS_ID=
ENV CLIENT_ID=

#Expose for future DashBoard
EXPOSE 8080


CMD ["node", "index.js"]
