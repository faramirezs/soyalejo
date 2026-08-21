FROM node:22-bookworm-slim AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . ./
RUN npm run bootstrap && npm run build && rm -f data.db-shm data.db-wal

FROM node:22-bookworm-slim

WORKDIR /app

ENV NODE_ENV=production \
    HOST=0.0.0.0 \
    PORT=4321

COPY --from=build /app/package.json /app/package-lock.json ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/seed ./seed
COPY --from=build /app/data.db ./data.db
COPY --from=build /app/uploads ./uploads

EXPOSE 4321

CMD ["npm", "run", "start"]
