# ====================================================
# Section 1: Base Image Setup
# Purpose: Sets up the foundation with Node.js and pnpm
# ====================================================
FROM node:26.2.0-alpine3.23 AS base

# Remove existing yarn installations to ensure pnpm is the primary package manager
RUN rm -f /usr/local/bin/yarn /usr/local/bin/yarnpkg \
    && npm install -g corepack@0.35.0 \
    && corepack enable pnpm


# ====================================================
# Section 2: Dependencies Installation and Build
# Purpose: Installs all required dependencies and builds the Next.js application
# ====================================================
FROM base AS builder

# Install compatibility libraries for Node.js on Alpine Linux
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat

# Set working directory for the application
WORKDIR /app

# Copy package management files
COPY package.json pnpm-lock.yaml ./

RUN --mount=type=cache,id=pnpm,target=/root/.local/share/pnpm/store \
    pnpm fetch

# Install dependencies with pnpm cache optimization
# Mounts cache to speed up subsequent builds
RUN --mount=type=cache,id=pnpm,target=/root/.local/share/pnpm/store \
    pnpm install --frozen-lockfile --offline

# Copy remaining source
COPY . .

# Environment variables for optimized production build
ARG GIT_SHA=development
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# Build the Next.js application.
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
FROM node:26.2.0-alpine3.23 AS runner

# Set working directory
WORKDIR /workastra-desk

# Configure environment for production
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
ENV NEXT_TELEMETRY_DISABLED=1

# Create non-root user and group for improved security
RUN addgroup -g 1001 -S workastra && adduser -S workastra-desk -u 1001 -G workastra

# Copy production assets
COPY --from=builder --chown=workastra-desk:workastra /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown workastra-desk:workastra .next

# Copy built application from builder stage
# Uses standalone output from Next.js for optimized deployment
COPY --from=builder --chown=workastra-desk:workastra /app/.next/standalone ./
COPY --from=builder --chown=workastra-desk:workastra /app/.next/static ./.next/static

# Switch to non-root user for security
USER workastra-desk

# Expose the application port
EXPOSE 3000

# Start the Next.js server
CMD ["node", "--env-file", "configs/.env.production", "server.js"]
