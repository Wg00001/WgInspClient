# 构建镜像
docker build -t wginsp-client .

# 运行容器
docker run -d -p 3001:80 --name wginsp-client --network=host wginsp-client
docker run -d -p 3001:80 --name wginsp-client wginsp-client