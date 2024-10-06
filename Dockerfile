# Install dependencies only when needed
# Stage 0
FROM node:lts AS deps
WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package.json and pnpm-lock.yaml (if you have one)
COPY package.json pnpm-lock.yaml* ./
COPY /prisma ./prisma

# Install all dependencies (including dev dependencies)
RUN pnpm install --frozen-lockfile

# Rebuild the source code only when needed
# Stage 1
FROM node:lts AS builder
WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

COPY . .
COPY --from=deps /app/node_modules ./node_modules

# Add pnpm and node_modules/.bin to PATH
ENV PATH /app/node_modules/.bin:$PATH

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

# Ensure tsconfig.json is present
COPY tsconfig.json .

# Run Prisma generate
RUN npx prisma generate

# Run the build command
RUN pnpm run build

# Production image, copy only production files
# Stage 2
FROM node:lts AS prod

USER root

# Install pnpm
RUN npm install -g pnpm

WORKDIR /app

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/.env ./.env
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules ./node_modules

# Install only production dependencies
RUN pnpm install --prod

# Run Prisma generate again in the production stage
RUN npx prisma generate

CMD ["pnpm", "start"]