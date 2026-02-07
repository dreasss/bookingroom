FROM node:20-alpine
WORKDIR /app
COPY package.json tsconfig.json next.config.js ./
RUN npm install
COPY src ./src
CMD ["npm", "run", "dev", "--", "-H", "0.0.0.0"]
