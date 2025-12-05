# 医中标（MediBid-Flow）系统部署指南

## 1. 云主机准备

### 1.1 连接云主机

使用SSH工具（如PuTTY、Xshell或终端）连接到CentOS 8.4云主机：

```bash
ssh root@your-server-ip
# 或使用密钥文件
ssh -i your-key.pem root@your-server-ip
```

### 1.2 系统更新

```bash
yum update -y
```

### 1.3 安装必要软件

```bash
# 安装Python 3.9
yum install -y python39 python39-devel python39-pip

# 安装Node.js 18
curl -fsSL https://rpm.nodesource.com/setup_18.x | bash -
yum install -y nodejs

# 安装PostgreSQL 13
yum install -y https://download.postgresql.org/pub/repos/yum/reporpms/EL-8-x86_64/pgdg-redhat-repo-latest.noarch.rpm
yum install -y postgresql13 postgresql13-server postgresql13-contrib

# 安装Nginx
yum install -y nginx

# 安装Git
yum install -y git
```

## 2. 数据库配置

### 2.1 初始化PostgreSQL

```bash
# 初始化数据库
/usr/pgsql-13/bin/postgresql-13-setup initdb

# 启动PostgreSQL并设置开机自启
systemctl enable --now postgresql-13
```

### 2.2 创建数据库和用户

```bash
# 切换到postgres用户
su - postgres

# 进入PostgreSQL命令行
psql

# 创建数据库
CREATE DATABASE medi_bid_flow;

# 创建用户
CREATE USER medi_bid_user WITH PASSWORD 'your-password';

# 授权
GRANT ALL PRIVILEGES ON DATABASE medi_bid_flow TO medi_bid_user;

# 退出PostgreSQL命令行
\q

# 退出postgres用户
exit
```

### 2.3 启用pgvector扩展

```bash
# 进入数据库
psql -U medi_bid_user -d medi_bid_flow

# 启用pgvector扩展
CREATE EXTENSION IF NOT EXISTS vector;

# 退出
\q
```

## 3. 项目部署

### 3.1 创建项目目录

```bash
mkdir -p /opt/medi-bid-flow
chown -R $USER:$USER /opt/medi-bid-flow
```

### 3.2 上传项目文件

使用SCP命令将项目文件上传到云主机：

```bash
# 在本地执行
scp -r G:\1\1\medi-bid-flow root@your-server-ip:/opt/
```

或者使用Git克隆（如果项目已上传到Git仓库）：

```bash
git clone your-git-repo-url /opt/medi-bid-flow
```

### 3.3 后端部署

```bash
cd /opt/medi-bid-flow/backend

# 创建虚拟环境
python3.9 -m venv venv

# 激活虚拟环境
source venv/bin/activate

# 升级pip
pip install --upgrade pip

# 安装依赖
pip install -r requirements.txt

# （可选）创建requirements.txt（如果不存在）
pip install fastapi uvicorn pydantic psycopg2-binary python-multipart python-dotenv
pip freeze > requirements.txt

# 修改数据库连接配置
# 编辑main.py，将数据库连接信息更新为实际配置
# DATABASE_URL = "postgresql://medi_bid_user:your-password@localhost/medi_bid_flow"

# 初始化数据库（如果需要）
python init_db.py

# 测试运行
uvicorn main:app --host 0.0.0.0 --port 8000 --reload

# （生产环境）使用systemd管理服务
# 创建systemd服务文件
cat > /etc/systemd/system/medi-bid-flow-backend.service << EOF
[Unit]
Description=MediBid-Flow Backend
After=network.target

[Service]
User=root
WorkingDirectory=/opt/medi-bid-flow/backend
ExecStart=/opt/medi-bid-flow/backend/venv/bin/uvicorn main:app --host 0.0.0.0 --port 8000
Restart=always

[Install]
WantedBy=multi-user.target
EOF

# 启动服务并设置开机自启
systemctl daemon-reload
systemctl enable --now medi-bid-flow-backend
```

### 3.4 前端部署

```bash
cd /opt/medi-bid-flow/frontend

# 安装依赖
npm install

# 修改API请求地址
# 编辑src/App.jsx或src/utils/axios.js，将API请求地址更新为实际后端地址

# 构建项目
npm run build

# 配置Nginx
cat > /etc/nginx/conf.d/medi-bid-flow.conf << EOF
server {
    listen 80;
    server_name your-domain.com;  # 或your-server-ip

    location / {
        root /opt/medi-bid-flow/frontend/dist;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
EOF

# 启动Nginx并设置开机自启
systemctl enable --now nginx

# 重启Nginx
systemctl restart nginx
```

## 4. 防火墙配置

```bash
# 开放80和443端口（HTTP和HTTPS）
firewall-cmd --permanent --add-port=80/tcp
firewall-cmd --permanent --add-port=443/tcp

# 开放8000端口（如果需要直接访问后端）
firewall-cmd --permanent --add-port=8000/tcp

# 重新加载防火墙配置
firewall-cmd --reload
```

## 5. SSL证书配置（可选）

使用Let's Encrypt获取免费SSL证书：

```bash
# 安装Certbot
yum install -y epel-release
yum install -y certbot python3-certbot-nginx

# 获取证书
certbot --nginx -d your-domain.com

# 自动续期配置（已自动添加）
# 可以使用以下命令测试续期
certbot renew --dry-run
```

## 6. 访问系统

部署完成后，您可以通过以下方式访问系统：

- **Web管理端**：http://your-domain.com 或 http://your-server-ip
- **后端API**：http://your-domain.com/api 或 http://your-server-ip:8000

## 7. 监控和维护

### 7.1 查看服务状态

```bash
# 查看后端服务状态
systemctl status medi-bid-flow-backend

# 查看Nginx状态
systemctl status nginx

# 查看PostgreSQL状态
systemctl status postgresql-13
```

### 7.2 查看日志

```bash
# 查看后端日志
journalctl -u medi-bid-flow-backend -f

# 查看Nginx访问日志
tail -f /var/log/nginx/access.log

# 查看Nginx错误日志
tail -f /var/log/nginx/error.log

# 查看PostgreSQL日志
tail -f /var/lib/pgsql/13/data/log/postgresql-Mon.log
```

### 7.3 更新项目

```bash
# 后端更新
cd /opt/medi-bid-flow/backend
git pull
source venv/bin/activate
pip install -r requirements.txt
systemctl restart medi-bid-flow-backend

# 前端更新
cd /opt/medi-bid-flow/frontend
git pull
npm install
npm run build
systemctl restart nginx
```

## 8. 注意事项

1. **安全配置**：
   - 建议使用非root用户运行服务
   - 定期更新系统和软件
   - 配置防火墙规则
   - 考虑使用CDN加速前端资源

2. **性能优化**：
   - 调整Nginx配置以优化性能
   - 考虑使用PM2管理Node.js进程
   - 配置PostgreSQL性能参数

3. **数据备份**：
   - 定期备份数据库
   - 备份项目配置文件
   - 考虑使用自动备份工具

4. **扩展建议**：
   - 配置负载均衡（如果需要）
   - 考虑使用Docker容器化部署
   - 配置CI/CD流水线

# 附录

## A. 常见问题

### Q1: 无法访问系统
- 检查防火墙是否开放相应端口
- 检查Nginx和后端服务是否正常运行
- 检查域名解析是否正确

### Q2: 数据库连接失败
- 检查数据库服务是否运行
- 检查数据库连接配置是否正确
- 检查数据库用户权限

### Q3: 前端页面空白
- 检查Nginx配置是否正确指向前端dist目录
- 检查前端构建是否成功
- 检查浏览器控制台是否有错误信息

### Q4: 后端API无法访问
- 检查后端服务是否运行
- 检查防火墙是否开放8000端口
- 检查Nginx反向代理配置是否正确

## B. 配置文件位置

- **后端主文件**：`/opt/medi-bid-flow/backend/main.py`
- **前端构建目录**：`/opt/medi-bid-flow/frontend/dist`
- **Nginx配置**：`/etc/nginx/conf.d/medi-bid-flow.conf`
- **后端服务配置**：`/etc/systemd/system/medi-bid-flow-backend.service`
- **PostgreSQL配置**：`/var/lib/pgsql/13/data/postgresql.conf`

## C. 端口占用情况

| 服务 | 端口 | 用途 |
|------|------|------|
| Nginx | 80/443 | 前端访问 |
| FastAPI | 8000 | 后端API |
| PostgreSQL | 5432 | 数据库 |

## D. 系统架构

```
┌─────────────────────────────────────────────────────────────┐
│                      客户端浏览器                           │
└───────────────────────┬─────────────────────────────────────┘
                        │
┌───────────────────────▼─────────────────────────────────────┐
│                        Nginx                               │
│  ┌───────────────────────────────────────────────────────┐ │
│  │           静态资源服务 (前端dist目录)                │ │
│  └────────────────────────────┬────────────────────────┘ │
│                               │                         │
│  ┌────────────────────────────▼────────────────────────┐ │
│  │               反向代理到后端API (8000端口)          │ │
│  └────────────────────────────┬────────────────────────┘ │
└───────────────────────────────┼───────────────────────────┘
                                │
┌───────────────────────────────▼───────────────────────────┐
│                        FastAPI                            │
└───────────────────────────────┬───────────────────────────┘
                                │
┌───────────────────────────────▼───────────────────────────┐
│                        PostgreSQL                         │
└─────────────────────────────────────────────────────────────┘
```