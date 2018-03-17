# EasyDockerWeb

A simple Web Ui for Docker using `xterm.js`, `Node.js` and `Socket.io`

## Quick start

```bash
docker run -it -d -p 3000:3000 -v /var/run/docker.sock:/var/run/docker.sock qfdk/easydockerweb
```

[http://localhost:3000](http://localhost:3000) enjory ;)

## Requirement

- Node.js
- Docker remote api >= v1.24
- macOs or Linux or windows

## Then

```bash
git clone https://github.com/qfdk/EasyDockerWeb.git
cd EasyDockerWeb
npm i 
npm start
```

## Build your docker image

```bash
docker build -t easy-docker-web .
docker run -p 3000:3000 -v /var/run/docker.sock:/var/run/docker.sock easy-docker-web
```
## Images

![overview](./images/overview.png)

![terminal](./images/terminal.png)

![newContainer](./images/newContainer.png)

![containers](./images/containers.png)

![images](./images/images.png)
