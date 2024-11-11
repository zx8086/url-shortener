# Dockerfile

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

ARG COUCHBASE_URL="couchbase://localhost"
ARG COUCHBASE_USERNAME="Administrator"
ARG COUCHBASE_PASSWORD="password"
ARG COUCHBASE_BUCKET="url-shortener"
ARG COUCHBASE_SCOPE="_default"
ARG COUCHBASE_COLLECTION="urls"
ARG PORT="3005"
ARG BASE_URL="http://localhost"

# Set environment variables
ENV NODE_ENV=production
ENV PORT=$PORT
ENV BASE_URL=$BASE_URL
ENV COUCHBASE_URL=$COUCHBASE_URL
ENV COUCHBASE_USERNAME=$COUCHBASE_USERNAME
ENV COUCHBASE_PASSWORD=$COUCHBASE_PASSWORD
ENV COUCHBASE_BUCKET=$COUCHBASE_BUCKET
ENV COUCHBASE_SCOPE=$COUCHBASE_SCOPE
ENV COUCHBASE_COLLECTION=$COUCHBASE_COLLECTION

# Expose the port
EXPOSE $PORT

# Start the application
CMD ["bun", "run", "src/index.ts"]
