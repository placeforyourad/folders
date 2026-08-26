FROM node:20-alpine

WORKDIR /app

RUN apk add --no-cache openssl

RUN rm -f /root/.npmrc

COPY package.json ./
RUN npm install --registry https://registry.npmjs.org/

COPY . .

RUN npx prisma generate

ENTRYPOINT ["sh", "-c", "npx prisma migrate deploy && node index.js"]