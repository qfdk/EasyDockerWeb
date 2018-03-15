# EasyDockerWeb

A simple Web Ui for Docker using `xterm.js`, `Node.js` and `Socket.io`

## requirement

- Node.js
- Docker remote api >= v1.24
- macOs or Linux or windows

## then

```bash
git clone https://github.com/qfdk/EasyDockerWeb.git
cd EasyDockerWeb
npm i 
npm start
```

## Docker

```bash
docker build -t easy-docker-web .
docker run -it -p 3000:3000 -v /var/run/docker.sock:/var/run/docker.sock easy-docker-web
# http://localhost:3000 enjory ;)
```
## images

![terminal](./images/terminal.png)

![containers](./images/containers.png)

![images](./images/images.png)