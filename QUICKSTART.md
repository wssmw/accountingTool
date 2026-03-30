# 快速启动指南

## 方法一：使用 Docker Compose（最简单）

```bash
# 1. 启动所有服务（数据库 + 应用）
docker-compose up -d

# 2. 查看日志
docker-compose logs -f

# 3. 访问 API
# http://localhost:3000

# 4. 停止服务
docker-compose down
```

## 方法二：本地开发

### 1. 启动 MySQL 数据库

**选项 A：使用 Docker 只启动数据库**

```bash
docker run -d \
  --name accounting_db \
  -e MYSQL_ROOT_PASSWORD=password \
  -e MYSQL_DATABASE=couple_accounting \
  -p 3306:3306 \
  mysql:8.0-alpine
```

**选项 B：使用本地 MySQL 安装**

- 安装 MySQL 8.0+
- 创建数据库：`CREATE DATABASE couple_accounting;`
- 更新 `.env` 文件中的 `DATABASE_URL`

### 2. 安装依赖（如果还没有）

```bash
npm install
```

### 3. 配置环境变量

```bash
# .env 文件已创建，默认配置：
# DATABASE_URL=mysql://root:password@localhost:3306/couple_accounting
# JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
# PORT=3000
```

### 4. 生成 Prisma 客户端

```bash
npm run prisma:generate
```

### 5. 运行数据库迁移

```bash
npm run prisma:migrate
```

系统会提示你输入迁移名称，例如：`init`

### 6. 启动开发服务器

```bash
npm run dev
```

服务器将在 `http://localhost:3000` 启动

## 测试 API

### 1. 健康检查

```bash
curl http://localhost:3000/health
```

### 2. 用户注册

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "name": "测试用户",
    "role": "husband"
  }'
```

### 3. 用户登录

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

### 4. 创建家庭（使用登录返回的 token）

```bash
curl -X POST http://localhost:3000/api/couples/create \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "role": "husband"
  }'
```

### 5. 创建记账记录

```bash
curl -X POST http://localhost:3000/api/records \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "amount": 100.50,
    "type": "expense",
    "category": "food",
    "person": "husband",
    "date": "2024-01-15",
    "note": "午餐"
  }'
```

### 6. 获取统计信息

```bash
curl -X GET "http://localhost:3000/api/statistics/summary" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## 其他有用命令

```bash
# 打开 Prisma Studio（数据库可视化工具）
npm run prisma:studio

# 构建生产版本
npm run build

# 启动生产服务器
npm run start

# 重置数据库（慎用！）
npm run prisma:migrate reset
```

## 常见问题

### Q: 端口 3000 已被占用

修改 `.env` 文件中的 `PORT=3001`，然后重启服务器

### Q: 数据库连接失败

1. 确认 MySQL 正在运行
2. 检查 `.env` 中的 `DATABASE_URL` 是否正确
3. 确认数据库 `couple_accounting` 已创建

### Q: Prisma 迁移失败

```bash
# 重新生成迁移
npx prisma migrate reset
npx prisma migrate dev
```

### Q: 忘记 JWT_SECRET

修改 `.env` 文件中的 `JWT_SECRET` 为任意随机字符串，然后重启服务器

## 下一步

1. 修改 `.env` 中的 `JWT_SECRET` 为安全随机字符串
2. 根据实际需求调整配置
3. 开发移动端应用对接 API
4. 考虑添加 WebSocket 实时同步功能
5. 部署到生产环境

祝使用愉快！
