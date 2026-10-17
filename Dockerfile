FROM node:24-bookworm-slim AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci --no-audit --no-fund
COPY . .
RUN npm run build

FROM node:24-bookworm-slim
WORKDIR /app
ENV NODE_ENV=production HOST=0.0.0.0 PORT=3000
COPY --from=build /app/dist ./dist
COPY --from=build /app/server ./server
COPY --from=build /app/data/chiptuning.csv ./data/chiptuning.csv
COPY --from=build /app/data/catalog-seed.json ./data/catalog-seed.json
RUN mkdir .private && chown node:node .private
USER node
VOLUME /app/.private
EXPOSE 3000
CMD ["node", "server/index.mjs"]
