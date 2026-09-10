FROM node:20-alpine

RUN apk add --no-cache openssl

COPY package.json package-lock.json ./
COPY frontend/package.json frontend/package.json
RUN npm ci

COPY . .

RUN npx prisma generate

RUN adduser -D appuser
USER appuser

ENTRYPOINT ["sh", "entrypoint.sh"]
CMD ["node", "src/main.js"]