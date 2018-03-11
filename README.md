# EasyDockerWeb


## requirement

- Docker remote api with 2375 
- macOs or Linux
- Docker api >= v1.24

Run this docker command before.

```bash
docker run -p 2375:2375 -v /var/run/docker.sock:/var/run/docker.sock -d -e PORT=2375 shipyard/docker-proxy
```

## or

1. Set the following flag in the `daemon.json` file:

```json
{
    "hosts": ["tcp://127.0.0.1:2375", "unix:///var/run/docker.sock"]
}
```

2. Restart Docker

``` bash
$ sudo systemctl restart docker
```

## then

```bash
git clone https://github.com/qfdk/EasyDockerWeb.git
cd EasyDockerWeb
npm i 
npm start
```
## Docker

```bash
docker build -t coucou .
docker run -it -p 3000:3000 -v /var/run:/var/run coucou bash
# http://localhost:3000 enjory ;)
```
## images

![terminal](./images/terminal.png)

![containers](./images/containers.png)

![images](./images/images.png)