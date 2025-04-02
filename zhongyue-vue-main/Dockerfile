FROM --platform=linux/amd64 node:20-alpine as build-stage

WORKDIR /app

# 设置镜像加速
RUN npm config set registry https://registry.npmmirror.com && \
    npm install -g pnpm && \
    pnpm config set registry https://registry.npmmirror.com

# 安装依赖
COPY package.json pnpm-lock.yaml ./
RUN pnpm install

# 构建
COPY . .
# 创建 dist 目录
RUN mkdir -p /app/dist

# 构建并指定输出目录
RUN pnpm build --outDir /app/dist









EXPOSE 8080


# CMD ["sh", "-c", "pnpm install && pnpm dev"]

