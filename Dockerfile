# Build stage
FROM oven/bun:latest AS builder
WORKDIR /app

# Copy package files
COPY package.json bun.lockb ./

# Install dependencies
RUN bun install --frozen-lockfile

# Copy source files
COPY . .

# Production stage
FROM oven/bun:latest AS release
WORKDIR /app

# Copy necessary files from builder
COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/src ./src

# Define build arguments
ARG COUCHBASE_URL
ARG COUCHBASE_USERNAME
ARG COUCHBASE_PASSWORD
ARG COUCHBASE_BUCKET
ARG COUCHBASE_SCOPE
ARG COUCHBASE_COLLECTION
ARG PORT
ARG BASE_URL

# Set environment variables
ENV NODE_ENV=production \
    PORT=${PORT:-3005} \
    BASE_URL=${BASE_URL:-http://localhost} \
    COUCHBASE_URL=${COUCHBASE_URL} \
    COUCHBASE_USERNAME=${COUCHBASE_USERNAME} \
    COUCHBASE_PASSWORD=${COUCHBASE_PASSWORD} \
    COUCHBASE_BUCKET=${COUCHBASE_BUCKET} \
    COUCHBASE_SCOPE=${COUCHBASE_SCOPE} \
    COUCHBASE_COLLECTION=${COUCHBASE_COLLECTION}

# Expose the port
EXPOSE ${PORT:-3005}

# Start the application
CMD ["bun", "run", "src/index.ts"]

