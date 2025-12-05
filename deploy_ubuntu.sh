#!/bin/bash

# 医中标系统一键部署脚本 (Ubuntu 20.04/22.04)
echo "============================================="
echo "医中标系统一键部署脚本"
echo "版本: 1.0.0"
echo "适用于 Ubuntu 20.04/22.04 LTS"
echo "============================================="

# 检查是否以root用户运行
if [ "$EUID" -ne 0 ]; then  
  echo "请以root用户运行此脚本: sudo $0"
  exit 1
fi

# 定义颜色
green() { echo -e "\033[32m$1\033[0m"; }
red() { echo -e "\033[31m$1\033[0m"; }
yellow() { echo -e "\033[33m$1\033[0m"; }

# 安装基本依赖
green "1. 安装基本依赖..."
apt update && apt upgrade -y
apt install -y git curl wget build-essential nginx postgresql postgresql-contrib python3-pip python3-venv

# 配置PostgreSQL
green "2. 配置PostgreSQL..."
systemctl start postgresql
systemctl enable postgresql

# 创建数据库和用户
sudo -u postgres psql -c "CREATE DATABASE medibid;"
sudo -u postgres psql -c "CREATE USER medibiduser WITH PASSWORD 'medibidpassword';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE medibid TO medibiduser;"
sudo -u postgres psql -c "ALTER ROLE medibiduser WITH SUPERUSER;"

# 配置Node.js环境
green "3. 配置Node.js环境..."
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs
node -v && npm -v

# 克隆项目
green "4. 克隆项目..."
cd /opt
git clone https://github.com/yourusername/medi-bid-flow.git
target_dir="/opt/medi-bid-flow"
cd "$target_dir"

# 配置后端
green "5. 配置后端..."
cd backend
# 创建虚拟环境
python3 -m venv venv
source venv/bin/activate
# 安装依赖
pip install -r requirements.txt
# 配置环境变量
echo "DATABASE_URL=postgresql://medibiduser:medibidpassword@localhost/medibid" > .env
echo "SECRET_KEY=your-secret-key-here" >> .env
# 初始化数据库
python -m alembic upgrade head
# 退出虚拟环境
deactivate

# 配置前端
green "6. 配置前端..."
cd ../frontend
# 安装依赖
npm install
# 构建前端
npm run build

# 配置Nginx
green "7. 配置Nginx..."
cat > /etc/nginx/sites-available/medibid << EOF
server {
    listen 80;
    server_name _;

    # 前端静态文件
    location / {
        root /opt/medi-bid-flow/frontend/dist;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    # 后端API代理
    location /api {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF

# 启用站点
ln -sf /etc/nginx/sites-available/medibid /etc/nginx/sites-enabled/
# 测试Nginx配置
nginx -t
# 重启Nginx
systemctl restart nginx
systemctl enable nginx

# 配置后端服务
green "8. 配置后端服务..."
cat > /etc/systemd/system/medibid-backend.service << EOF
[Unit]
Description=Medibid Backend Service
After=network.target postgresql.service

[Service]
User=root
WorkingDirectory=/opt/medi-bid-flow/backend
ExecStart=/opt/medi-bid-flow/backend/venv/bin/uvicorn main:app --host 0.0.0.0 --port 8000
Restart=always

[Install]
WantedBy=multi-user.target
EOF

# 启用并启动服务
systemctl daemon-reload
systemctl enable medibid-backend
systemctl start medibid-backend

# 显示部署结果
green "============================================="
green "部署完成!"
green "============================================="
yellow "系统访问地址: http://$(curl -s ifconfig.me)"
yellow "后端API地址: http://$(curl -s ifconfig.me)/api"
yellow "默认数据库: medibid"
yellow "数据库用户: medibiduser"
yellow "数据库密码: medibidpassword"
green "============================================="
red "注意: 请及时修改数据库密码和SECRET_KEY!"
green "============================================="