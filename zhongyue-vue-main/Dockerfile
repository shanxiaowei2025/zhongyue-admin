# 使用 Node.js 20 Alpine 作为基础镜像
FROM node:20-alpine

WORKDIR /app

# 设置镜像加速和 pnpm
RUN npm config set registry https://registry.npmmirror.com && \
    npm install -g pnpm && \
    pnpm config set registry https://registry.npmmirror.com && \
    npm install -g serve

# 复制依赖文件
COPY package.json pnpm-lock.yaml ./
RUN pnpm install

# 复制源代码
COPY . .

# 构建应用
RUN pnpm build

# 暴露端口
EXPOSE 8080

# 使用 serve 启动打包后的应用，修改监听地址为 0.0.0.0
CMD ["serve", "-s", "dist", "-l", "tcp://0.0.0.0:8080"]