FROM node:9-alpine
ADD . /src
RUN apk update && apk add bash
RUN cd /src; npm install
# Time zone option, if you live in China pleace set it to Asia/Shanghai
RUN ln -sf /usr/share/zoneinfo/Europe/Paris /etc/localtime
EXPOSE  3000
CMD node /src/bin/www