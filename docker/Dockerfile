# Multi-stage Dockerfile for Platform Project
# Frontend (React 19 + Vite) + Backend (Express + Node.js)

# =============================================================================
# Stage 1: Frontend Build
# =============================================================================
FROM node:20-alpine AS frontend-builder

WORKDIR /app/frontend

# Copy frontend package files
COPY src/frontend/package*.json ./

# Install dependencies
RUN npm ci --only=production=false

# Copy frontend source
COPY src/frontend/ ./

# Build frontend
RUN npm run build

# =============================================================================
# Stage 2: Backend Build
# =============================================================================
FROM node:20-alpine AS backend-builder

WORKDIR /app/backend

# Copy backend package files
COPY src/backend/package*.json ./

# Install dependencies
RUN npm ci --only=production=false

# Copy backend source
COPY src/backend/ ./

# Build backend (TypeScript compilation)
RUN npm run build

# =============================================================================
# Stage 3: Production Runtime
# =============================================================================
FROM node:20-alpine AS runtime

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

WORKDIR /app

# Copy backend compiled code and dependencies
COPY --from=backend-builder --chown=nodejs:nodejs /app/backend/dist ./backend/dist
COPY --from=backend-builder --chown=nodejs:nodejs /app/backend/package*.json ./backend/

# Copy frontend built assets
COPY --from=frontend-builder --chown=nodejs:nodejs /app/frontend/dist ./frontend/dist

# Install only production dependencies for backend
WORKDIR /app/backend
RUN npm ci --only=production && npm cache clean --force

# Switch to non-root user
USER nodejs

# Expose backend port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/1/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start backend server
CMD ["node", "dist/server.js"]

# =============================================================================
# Stage 4: Development
# =============================================================================
FROM node:20-alpine AS development

# Install development tools
RUN apk add --no-cache git

WORKDIR /app

# Copy package files for both frontend and backend
COPY src/frontend/package*.json ./frontend/
COPY src/backend/package*.json ./backend/

# Install all dependencies (including dev dependencies)
WORKDIR /app/frontend
RUN npm install

WORKDIR /app/backend
RUN npm install

# Copy source code
WORKDIR /app
COPY src/ ./src/

# Expose ports for frontend (Vite) and backend
EXPOSE 5173 3000

# Default command for development
CMD ["sh", "-c", "cd /app/backend && npm run dev & cd /app/frontend && npm run dev"]
