FROM node:18-alpine

# Add pkg to use wait-for-it script.
RUN apk add --no-cache bash coreutils

# The application will be mounted into this directory.
WORKDIR /usr/app

# Install dependencies.
COPY ./package.json ./package-lock.json /usr/app/
RUN npm ci && \
    npm cache clean --force

# Bundle app source.
COPY ./src/ /usr/app/src/
COPY ./docker/wait-for-it.sh /usr/app/

EXPOSE 6070

CMD [ "sh", "-c", "./wait-for-it.sh ${DATABASE_HOST:-localhost}:${DATABASE_PORT:-3306} -t 90 -- npm start" ]
