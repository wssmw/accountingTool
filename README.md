# 夫妻记账工具后端 API

基于 Node.js + Express + TypeScript + Prisma + MySQL 的 RESTful API 服务

## 技术栈

- **运行时**: Node.js 20+
- **框架**: Express
- **语言**: TypeScript
- **ORM**: Prisma
- **数据库**: MySQL 8.0
- **认证**: JWT
- **容器化**: Docker & Docker Compose

## 功能特性

- ✅ 用户注册、登录、JWT 认证
- ✅ 家庭管理（创建家庭、邀请码加入）
- ✅ 记账记录 CRUD 操作
- ✅ 多维度统计分析
- ✅ 数据权限控制
- ✅ 软删除
- ✅ 分页查询
- ✅ 请求频率限制
- ✅ 日志记录
- ✅ Docker 容器化部署

## 快速开始

### 前置要求

- Node.js 20+
- MySQL 8.0+ 或 Docker

### 方式一：使用 Docker Compose（推荐）

```bash
# 启动数据库和应用
docker-compose up -d

# 查看日志
docker-compose logs -f

# 停止服务
docker-compose down
```

### 方式二：本地开发

1. **安装依赖**

```bash
npm install
```

2. **配置环境变量**

```bash
cp .env.example .env
# 编辑 .env 文件，配置 MySQL 数据库连接
```

3. **生成 Prisma 客户端**

```bash
npm run prisma:generate
```

4. **运行数据库迁移**

```bash
npm run prisma:migrate
```

5. **启动开发服务器**

```bash
npm run dev
```

服务器将在 `http://localhost:3000` 启动

## API 文档

### 认证接口

#### 用户注册

```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "name": "张三",
  "role": "husband"
}
```

#### 用户登录

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

#### 获取当前用户信息

```http
GET /api/auth/me
Authorization: Bearer <access_token>
```

#### 刷新 Access Token

```http
POST /api/auth/refresh-access-token
Content-Type: application/json

{
  "refreshToken": "<refresh_token>"
}
```

**双 Token 机制说明：**

- **Access Token**: 有效期 15 分钟，用于 API 请求认证
- **Refresh Token**: 有效期 7 天，用于刷新 Access Token
- 登录/注册成功后，同时返回 `accessToken` 和 `refreshToken`
- Access Token 过期后，使用 Refresh Token 获取新的 Access Token
- Refresh Token 过期后，需要重新登录

### 家庭管理接口

#### 创建家庭

```http
POST /api/couples/create
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "role": "husband"
}
```

#### 加入家庭

```http
POST /api/couples/join
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "inviteCode": "ABC123"
}
```

#### 获取家庭信息

```http
GET /api/couples/info
Authorization: Bearer <access_token>
```

### 记账记录接口

#### 创建记账记录

```http
POST /api/records
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "amount": 100.50,
  "type": "expense",
  "category": "food",
  "person": "husband",
  "date": "2024-01-15",
  "note": "午餐"
}
```

#### 获取记账记录列表

```http
GET /api/records?page=1&limit=20&type=expense&start_date=2024-01-01&end_date=2024-01-31&person=husband
Authorization: Bearer <access_token>
```

#### 获取按日期分组的记账明细

```http
GET /api/records/grouped-by-date?page=1&limit=50&type=expense&start_date=2024-01-01&end_date=2024-01-31&person=husband
Authorization: Bearer <access_token>
```

接口返回示例（`data.list` 为按天分组）：

```json
{
  "success": true,
  "statusCode": 200,
  "data": {
    "list": [
      {
        "date": "2024-01-15",
        "totalIncome": 200,
        "totalExpense": 112,
        "balance": 88,
        "records": []
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 50,
      "total": 120,
      "totalPages": 3
    }
  },
  "timestamp": 1711111111
}
```

#### 获取单条记录

```http
GET /api/records/:id
Authorization: Bearer <access_token>
```

#### 更新记账记录

```http
PUT /api/records/:id
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "amount": 150.00,
  "note": "晚餐"
}
```

#### 删除记账记录

```http
DELETE /api/records/:id
Authorization: Bearer <access_token>
```

### 统计分析接口

#### 获取主页概览（总余额/总收入/总支出/最近记录）

```http
GET /api/statistics/home-overview?limit=10
Authorization: Bearer <access_token>
```

#### 获取汇总统计

```http
GET /api/statistics/summary?start_date=2024-01-01&end_date=2024-01-31
Authorization: Bearer <access_token>
```

#### 按分类统计

```http
GET /api/statistics/by-category?start_date=2024-01-01&end_date=2024-01-31
Authorization: Bearer <access_token>
```

#### 按人员统计

```http
GET /api/statistics/by-person?start_date=2024-01-01&end_date=2024-01-31
Authorization: Bearer <access_token>
```

#### 按月份统计

```http
GET /api/statistics/by-month?year=2024
Authorization: Bearer <access_token>
```

## 数据分类

### 支出分类

- `food` - 餐饮
- `transport` - 交通
- `shopping` - 购物
- `entertainment` - 娱乐
- `house` - 住房
- `medical` - 医疗
- `education` - 教育
- `other_expense` - 其他支出

### 收入分类

- `salary` - 工资
- `bonus` - 奖金
- `investment` - 投资
- `other_income` - 其他收入

## 响应格式

### 成功响应

```json
{
  "success": true,
  "data": {},
  "message": "操作成功",
  "timestamp": 1234567890
}
```

### 错误响应

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "金额必须大于 0"
  },
  "timestamp": 1234567890
}
```

## 错误码说明

| 错误码                  | 说明                 |
| ----------------------- | -------------------- |
| `UNAUTHORIZED`          | 未授权               |
| `INVALID_TOKEN`         | 无效的 Token         |
| `TOKEN_EXPIRED`         | Token 已过期         |
| `VALIDATION_ERROR`      | 数据验证失败         |
| `USER_NOT_FOUND`        | 用户不存在           |
| `EMAIL_EXISTS`          | 邮箱已被注册         |
| `INVALID_CREDENTIALS`   | 邮箱或密码错误       |
| `NOT_IN_COUPLE`         | 用户未加入家庭       |
| `ALREADY_IN_COUPLE`     | 用户已加入家庭       |
| `INVALID_INVITE_CODE`   | 邀请码无效           |
| `COUPLE_FULL`           | 家庭已满员           |
| `RECORD_NOT_FOUND`      | 记录不存在           |
| `FORBIDDEN`             | 无权限操作           |
| `RATE_LIMIT_EXCEEDED`   | 请求过于频繁         |
| `REFRESH_TOKEN_EXPIRED` | Refresh Token 已过期 |
| `INVALID_REFRESH_TOKEN` | 无效的 Refresh Token |

## 环境变量

| 变量名                         | 说明                 | 默认值                  |
| ------------------------------ | -------------------- | ----------------------- |
| `DATABASE_URL`                 | MySQL 连接字符串     | -                       |
| `JWT_SECRET`                   | JWT 密钥             | -                       |
| `JWT_ACCESS_TOKEN_EXPIRES_IN`  | Access Token 有效期  | `15m`                   |
| `JWT_REFRESH_TOKEN_EXPIRES_IN` | Refresh Token 有效期 | `7d`                    |
| `PORT`                         | 服务器端口           | `3000`                  |
| `NODE_ENV`                     | 运行环境             | `development`           |
| `CORS_ORIGIN`                  | 允许的 CORS 源       | `http://localhost:5173` |

## 生产环境部署

### 1. 配置生产环境变量

复制并编辑生产环境配置文件：

```bash
cp .env.production .env.production
# 编辑 .env.production 文件，设置生产环境的配置
```

### 2. 部署方式

#### 方式一：使用部署脚本

```bash
# 给部署脚本添加执行权限
chmod +x deploy.sh

# 运行部署脚本
./deploy.sh
```

#### 方式二：使用 Docker

```bash
# 构建生产镜像
docker build -t accounting-api -f Dockerfile.prod .

# 运行容器
docker run -d \
  --name accounting-api \
  -p 3000:3000 \
  -e NODE_ENV=production \
  -v $(pwd)/.env.production:/app/.env.production \
  accounting-api
```

#### 方式三：手动部署

```bash
# 安装依赖（生产环境）
npm install --production

# 构建应用
npm run build

# 启动应用
NODE_ENV=production npm start
```

### 3. 生产环境注意事项

- **数据库**：使用独立的 MySQL 数据库，配置强密码
- **JWT 密钥**：使用至少 32 位的随机字符串作为 JWT 密钥
- **CORS**：设置为具体的前端域名，不要使用通配符
- **HTTPS**：在生产环境使用 HTTPS 协议
- **监控**：配置日志监控和错误报警
- **备份**：定期备份数据库

### 4. 持续集成/持续部署 (CI/CD)

可以使用 GitHub Actions、Jenkins 等工具实现自动化部署。

## 开发命令

```bash
# 开发模式
npm run dev

# 构建生产版本
npm run build

# 启动生产服务器
npm run start

# Prisma 相关
npm run prisma:generate    # 生成 Prisma 客户端
npm run prisma:migrate     # 运行数据库迁移
npm run prisma:studio      # 打开 Prisma Studio
```

## 项目结构

```
accountingTool/
├── prisma/
│   └── schema.prisma          # 数据库模型定义
├── src/
│   ├── config/
│   │   ├── index.ts           # 配置管理
│   │   └── constants.ts       # 常量定义
│   ├── controllers/
│   │   ├── authController.ts
│   │   ├── coupleController.ts
│   │   ├── recordController.ts
│   │   └── statisticsController.ts
│   ├── database/
│   │   └── prisma.ts          # Prisma 客户端实例
│   ├── middleware/
│   │   ├── auth.ts            # JWT 认证中间件
│   │   ├── errorHandler.ts    # 错误处理中间件
│   │   └── validation.ts      # 数据验证中间件
│   ├── routes/
│   │   ├── authRoutes.ts
│   │   ├── coupleRoutes.ts
│   │   ├── recordRoutes.ts
│   │   └── statisticsRoutes.ts
│   ├── services/
│   │   ├── authService.ts
│   │   ├── coupleService.ts
│   │   ├── recordService.ts
│   │   └── statisticsService.ts
│   ├── types/
│   │   └── index.ts           # TypeScript 类型定义
│   ├── utils/
│   │   ├── helpers.ts         # 工具函数
│   │   └── logger.ts          # 日志配置
│   └── server.ts              # 应用入口
├── docker-compose.yml
├── Dockerfile
├── Dockerfile.prod
├── .env.example
├── .env.production
├── deploy.sh
└── package.json
```

## 安全性

- 密码使用 bcrypt 加密（盐值轮次 ≥ 10）
- JWT Token 认证，Access Token 15 分钟，Refresh Token 7 天
- 所有 API 接口（除登录注册外）需要 JWT 验证
- 使用参数化查询防止 SQL 注入
- 请求频率限制（15 分钟内最多 100 个请求）
- CORS 配置，仅允许前端域名访问
- Helmet 安全头设置

## 数据权限

- 用户只能查看和操作自己家庭的记账数据
- 家庭成员可以看到对方的记账记录
- 只有记录创建人可以编辑/删除该记录

## License

ISC
