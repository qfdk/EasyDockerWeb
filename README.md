# EasyDockerWeb

A simple Web UI for Docker using `xterm.js`, `Node.js` and `Socket.IO`.

Features:
- Container management (create, start, stop, remove)
- Compose / Standalone container grouping with collapsible sections
- Interactive terminal (xterm.js)
- Real-time log viewer
- System overview dashboard
- Image search and pull
- Simple authentication

## Tech Stack

| Component | Version |
|-----------|---------|
| Node.js   | LTS     |
| Express   | 4.x     |
| Socket.IO | 4.x     |
| EJS       | 5.x     |
| Dockerode | 4.x     |
| xterm.js  | 4.x     |

## Quick Start

### Method 1: Using build script (Recommended)
```bash
git clone https://github.com/qfdk/EasyDockerWeb.git
cd EasyDockerWeb
chmod +x build.sh
./build.sh
```

### Method 2: Manual deployment
```bash
# Build the image
docker build -t easy-docker-web .

# Run the container (credentials are required)
docker run -d \
  --name easy-docker-web \
  -p 127.0.0.1:3000:3000 \
  -v /var/run/docker.sock:/var/run/docker.sock \
  -e EDW_USERNAME='your_username' \
  -e EDW_PASSWORD='a-strong-password' \
  -e EDW_SESSION_SECRET="$(openssl rand -hex 32)" \
  easy-docker-web
```

Access the web interface at [http://localhost:3000](http://localhost:3000)

> ⚠️ **Security:** EasyDockerWeb has full control of the Docker socket, which is equivalent to root on the host.
> It refuses to start unless `EDW_USERNAME` and `EDW_PASSWORD` are set (min. 8 characters, no default values).
> Bind it to localhost or put it behind a TLS reverse proxy; set `EDW_COOKIE_SECURE=true` when served over HTTPS.
> See [SECURITY.md](SECURITY.md) to report a vulnerability.

## Requirements

- Docker Engine with Remote API >= v1.24
- Linux, macOS, or Windows with Docker installed

## Development Mode

```bash
git clone https://github.com/qfdk/EasyDockerWeb.git
cd EasyDockerWeb
pnpm install
pnpm start
```

## 中文说明

简单的 Docker 管理工具，基于 Express + Socket.IO 实现前后端通讯。

功能特点：
- 容器管理（创建、启动、停止、删除）
- Compose / 独立容器分组显示，支持折叠
- 交互式终端（xterm.js）
- 实时日志查看
- 系统概览面板
- 镜像搜索和拉取
- 简单的身份验证

### 快速开始

#### 方式一：使用构建脚本（推荐）
```bash
git clone https://github.com/qfdk/EasyDockerWeb.git
cd EasyDockerWeb
chmod +x build.sh
./build.sh
```

#### 方式二：手动部署
```bash
# 构建镜像
docker build -t easy-docker-web .

# 运行容器
docker run -d \
  --name easy-docker-web \
  -p 127.0.0.1:3000:3000 \
  -v /var/run/docker.sock:/var/run/docker.sock \
  -e EDW_USERNAME='你的用户名' \
  -e EDW_PASSWORD='强密码' \
  -e EDW_SESSION_SECRET="$(openssl rand -hex 32)" \
  easy-docker-web
```

访问地址：[http://localhost:3000](http://localhost:3000)

> ⚠️ 必须设置 `EDW_USERNAME` 和 `EDW_PASSWORD`（至少 8 位，不能用默认值），否则程序拒绝启动。Docker socket 等同宿主机 root 权限，请只绑定本机或放在 HTTPS 反向代理之后。

## Screenshots

### Login
![login](./images/login.png)

### Overview Dashboard
![overview](./images/overview.png)

### Image Management
![images](./images/images.png)

### Pull Image (with autocomplete)
![pull](./images/pull.png)

### Interactive Terminal
![terminal](./images/terminal.png)

## Sponsor
<a href="https://www.jetbrains.com/?from=EasyDockerWeb"><img src="images/jetbrains-variant-4.svg" alt="JetBrains" width="200"/></a>
