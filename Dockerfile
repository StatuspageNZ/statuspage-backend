FROM node:12

WORKDIR /usr/src/app

COPY ./src/package*.json ./

RUN npm install
# If you are building your code for production
# RUN npm ci --only=production

# Bundle app source
COPY ./src .

EXPOSE 8080
CMD [ "node", "index.js" ]