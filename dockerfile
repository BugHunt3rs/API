FROM node:22-slim

WORKDIR /app

COPY . .

RUN npm install && npm run build

EXPOSE 3000

CMD ["node", "dist/index.mjs"]
