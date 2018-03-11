# EasyDockerWeb


## Before all

- Docker remote api with 2375 

or run this commande before.


```bash
docker run -p 2375:2375 -v /var/run/docker.sock:/var/run/docker.sock -d -e PORT=2375 shipyard/docker-proxy
```

