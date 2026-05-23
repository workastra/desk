# ====================================================
# Section 1: Base Image Setup
# Purpose: Sets up the foundation with Node.js and pnpm
# ====================================================
FROM node:26.2.0-alpine3.23 AS base

# Remove existing yarn installations to ensure pnpm is the primary package manager
RUN rm -f /usr/local/bin/yarn /usr/local/bin/yarnpkg \
    && npm install -g corepack@0.35.0 \
    && corepack enable pnpm

# Configure pnpm store location for Docker caching
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"


# ====================================================
# Section 2: Dependencies Installation and Build
# Purpose: Installs all required dependencies and builds the Next.js application
# ====================================================
FROM base AS builder

# Install compatibility libraries for Node.js on Alpine Linux
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat
WORKDIR /app

# 1. Copy ONLY dependency manifests first to lock in Docker layer caching
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# 2. Install dependencies using BuildKit cache mounts for blazing fast rebuilds
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm install --frozen-lockfile

# 3. Copy remaining source code (Changes here won't re-trigger dependency downloads)
COPY . .

# Environment variables for optimized production build
ARG GIT_SHA=development
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# Build the Next.js application
#
# NEXT_PUBLIC_* environment variables are evaluated at build time and
# inlined into the client-side bundle, as documented by Next.js.
#
# Action required:
# Define all required NEXT_PUBLIC_* variables during the build process.
# Runtime overrides will not be reflected in the client.
RUN NEXT_PUBLIC_APP_VERSION="$(node -p "require('./package.json').version")"+${GIT_SHA} \
    pnpm run build


# ====================================================
# Section 3: Production Runtime
# Purpose: Minimal image for running the application
# ====================================================
# Inheriting from base keeps image layers consistent and handles versioning in one place
FROM base AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
ENV NEXT_TELEMETRY_DISABLED=1

# Create non-root user and group for improved security
RUN addgroup -g 1001 -S workastra && adduser -S workastra-desk -u 1001 -G workastra

# Pre-create the directory structure so we can safely assign permissions ahead of time
RUN mkdir -p public .next && chown -R workastra-desk:workastra /app

# Copy production assets with correct user ownership from the start
COPY --from=builder --chown=workastra-desk:workastra /app/public ./public

# Copy built application from builder stage (using standalone output)
COPY --from=builder --chown=workastra-desk:workastra /app/.next/standalone ./
COPY --from=builder --chown=workastra-desk:workastra /app/.next/static ./.next/static

USER workastra-desk
EXPOSE 3000

# Start the Next.js server using the native node environment loader
CMD ["node", "--env-file=configs/.env.production", "server.js"]
