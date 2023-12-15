# EasyDockerWeb

A simple Web Ui for Docker using `xterm.js`, `Node.js` and `Socket.io`.

With this solution you will be able to create your owner SAS service.


- If you need to use docker cluster, [https://portainer.io/](https://portainer.io/) may be a good choice.
- search image by name
- terminal
- log

## Quick start

Set EDW_USERNAME and EDW_PASSWORD to overwrite the default username and password.

*PS:* Default username and password are **admin/admin.**

```bash
docker run -it -d -p 3000:3000 -e EDW_USERNAME='admin' -e EDW_PASSWORD='admin' -v /var/run/docker.sock:/var/run/docker.sock qfdk/easydockerweb
```

[http://localhost:3000](http://localhost:3000) enjoy ;)

## Requirement

- Node.js
- Docker remote api >= v1.24
- macOS or Linux or windows

## Development mode

```bash
git clone https://github.com/qfdk/EasyDockerWeb.git
cd EasyDockerWeb
yarn
yarn start
```

## Build your owner docker image

```bash
git clone https://github.com/qfdk/EasyDockerWeb.git
cd EasyDockerWeb
docker build -t easy-docker-web .
docker run -p 3000:3000 -v /var/run/docker.sock:/var/run/docker.sock easy-docker-web
```

## 中文

简单的 docker 管理程序，使用了express socket.io 来实现前后端通讯.

- 容器增删改查
- 容器交互
- 日志查看
- 系统状态查看
- 镜像获取
- 计划使用react重构 https://github.com/qfdk/EasyDockerWeb/tree/react
- 添加git actions

## Images
![login](./images/login.png)

![overview](./images/overview.png)

![terminal](./images/terminal.png)

![newContainer](./images/newContainer.png)

![containers](./images/containers.png)

![images](./images/images.png)

![pull](./images/pull.png)

![pull2](./images/pull2.png)

## Sponsor
<a href="https://www.jetbrains.com/?from=EasyDockerWeb"><img src="images/jetbrains-variant-4.svg" alt="JetBrains" width="200"/></a>

## React.js web ui (removed)

```bash
cd web-ui
yarn
yarn start
```
[http://localhost:4000](http://localhost:4000)
