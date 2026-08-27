FROM node:20-alpine

RUN apk add --no-cache openssl

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

RUN npx prisma generate

COPY entrypoint.sh /usr/local/bin/entrypoint.sh

RUN adduser -D appuser
USER appuser

ENTRYPOINT ["sh", "/usr/local/bin/entrypoint.sh"]
CMD ["node", "index.js"]