FROM node:20-alpine
WORKDIR /app
COPY package.json tsconfig.json ./
COPY prisma ./prisma
RUN npm install
RUN npx prisma generate
COPY src ./src
COPY test ./test
CMD ["npm", "run", "start:dev"]
