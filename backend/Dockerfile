FROM node:22-alpine AS build

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY tsconfig.json ./
COPY prisma.config.ts ./
COPY prisma ./prisma
COPY src ./src

ARG DATABASE_URL
ENV DATABASE_URL=$DATABASE_URL

RUN npx prisma generate
RUN npm run build


FROM node:22-alpine

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY prisma.config.ts ./
COPY prisma ./prisma

COPY --from=build /app/dist ./dist
COPY --from=build /app/src/generated ./src/generated

EXPOSE 5001

CMD ["sh", "-c", "npx prisma migrate deploy && npx prisma db seed && node dist/src/server.js"]
