# Stage 0
FROM node:lts AS deps
WORKDIR /app

COPY package.json ./
COPY /prisma ./prisma

RUN npm install

# Stage 1
FROM node:lts AS builder
WORKDIR /app

COPY . .
COPY --from=deps /app/node_modules ./node_modules
ARG DATABASE_URL
ARG TOKEN
ARG ADMIN_ROLE
ARG TOURNAMENT_JOIN_LEAVE_CHANNEL
ARG TOURNAMENT_INFO_CHANNEL

ENV DATABASE_URL=$DATABASE_URL
ENV TOKEN=$TOKEN
ENV ADMIN_ROLE=$ADMIN_ROLE
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV TOURNAMENT_JOIN_LEAVE_CHANNEL=$TOURNAMENT_JOIN_LEAVE_CHANNEL
ENV TOURNAMENT_INFO_CHANNEL=$TOURNAMENT_INFO_CHANNEL
RUN npm run build

# Stage 2
FROM node:lts AS prod

USER root

WORKDIR /app

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/.env ./.env
COPY --from=builder /app/prisma ./prisma

# Add this line to ensure Prisma CLI is available
RUN npm install prisma --save-dev

CMD ["npm", "start"]