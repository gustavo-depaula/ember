# The reviewer: the Claude Code CLI behind a small queue (runner.mjs). Built by `wrangler deploy`
# and, for `wrangler dev`, by the local Docker.
FROM node:22-slim

RUN apt-get update \
  && apt-get install -y --no-install-recommends ca-certificates \
  && rm -rf /var/lib/apt/lists/*

# Pinned: the runner depends on this version's flags and on the shape of its stream-json events.
RUN npm install -g @anthropic-ai/claude-code@2.1.296 && npm cache clean --force

WORKDIR /app
COPY runner.mjs directory-mcp.mjs ./
RUN mkdir /work && chown node:node /work

USER node
ENV HOME=/home/node WORK_DIR=/work PORT=8080
EXPOSE 8080
CMD ["node", "/app/runner.mjs"]
