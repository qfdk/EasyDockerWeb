FROM node:9-alpine
ADD . /src
RUN apk update && apk add bash
RUN cd /src; npm install
RUN ln -sf /usr/share/zoneinfo/Europe/Paris /etc/localtime
EXPOSE  3000
CMD node /src/bin/www