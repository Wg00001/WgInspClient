# 使用官方 Node.js LTS (长期支持) 版本作为基础镜像
FROM node:lts-alpine AS development

# 设置工作目录
WORKDIR /app

# 复制 package.json 和 package-lock.json (或 yarn.lock)
COPY package*.json ./

# 安装项目依赖
RUN npm install

# 复制项目所有文件到工作目录
COPY . .

# 构建应用
RUN npm run build

# 生产阶段
FROM node:lts-alpine AS production

WORKDIR /app

# 从构建阶段复制构建好的静态文件
COPY --from=development /app/build /app/build

# 安装 serve 来服务静态文件
RUN npm install -g serve

# 暴露端口 (React 应用通常运行在 3000 端口)
EXPOSE 3000

# 启动应用的命令
CMD ["serve", "-s", "build", "-l", "3000"] 