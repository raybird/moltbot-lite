FROM node:22-slim

WORKDIR /app

RUN apt-get update \
  && apt-get install -y --no-install-recommends python3 python3-pip python3-venv make g++ curl \
  && rm -rf /var/lib/apt/lists/*

# Install uv (Python package manager for MCP servers)
RUN curl -LsSf https://astral.sh/uv/install.sh | sh
ENV PATH="/root/.local/bin:$PATH"

# Install gemini-cli globally
RUN npm install -g @google/gemini-cli

COPY package.json package-lock.json ./
RUN npm install

COPY src ./src
COPY tsconfig.json ./

RUN npm run build

ENV NODE_ENV=production

CMD ["node", "dist/main.js"]
