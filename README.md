# 医中标（MediBid-Flow）国内服务器部署指南

## 1. 部署脚本说明

### 1.1 脚本概述
- **脚本名称**：`deploy_cn.sh`
- **适用系统**：CentOS 8.4（国内服务器）
- **部署架构**：Web管理平台 + 后端API服务
- **主要功能**：一键部署医中标系统，包括系统更新、依赖安装、数据库配置、服务启动等

### 1.2 国内源优化

脚本已配置以下国内镜像源，大幅提升下载速度：

| 组件 | 国内源 | 说明 |
|------|--------|------|
| YUM | 阿里云 | 替换默认CentOS源为阿里云镜像 |
| PIP | 清华大学 | Python包管理工具国内源 |
| NPM | 淘宝镜像 | Node.js包管理工具国内源 |
| Node.js | 阿里云 | Node.js安装脚本国内源 |
| PostgreSQL | 阿里云 | PostgreSQL安装包国内源 |
| Git | Gitee | GitHub仓库镜像，加速Git克隆 |

## 2. 部署步骤

### 2.1 前置条件

1. **服务器要求**：
   - CentOS 8.4 64位操作系统
   - 至少4GB内存
   - 至少50GB磁盘空间
   - 可访问公网

2. **网络准备**：
   - 开放80端口（Web访问）
   - 开放8000端口（后端API）
   - 确保服务器可访问国内镜像源

### 2.2 执行部署

1. **上传代码到服务器**
   - 将医中标系统代码上传到服务器的`/opt/medi-bid-flow`目录
   - 目录结构：
     ```
     /opt/medi-bid-flow/
     ├── backend/          # 后端代码
     ├── frontend/         # 前端代码
     └── deploy_cn.sh      # 部署脚本
     ```

2. **赋予脚本执行权限**
   ```bash
   chmod +x /opt/medi-bid-flow/deploy_cn.sh
   ```

3. **执行部署脚本**
   ```bash
   cd /opt/medi-bid-flow
   ./deploy_cn.sh
   ```

4. **等待部署完成**
   - 部署过程约10-20分钟，取决于服务器配置和网络速度
   - 部署日志将保存到`/opt/medi-bid-flow/deploy.log`

### 2.3 验证部署

部署完成后，脚本会输出访问地址：

```
访问地址：
  - Web管理端：http://服务器IP
  - 后端API：http://服务器IP:8000
```

1. **验证Web管理端**：
   - 在浏览器中输入Web管理端地址
   - 能看到医中标系统登录页面，说明部署成功

2. **验证后端API**：
   - 访问`http://服务器IP:8000`
   - 能看到返回`{"message": "医中标 (MediBid-Flow) 后端服务运行中"}`，说明后端服务正常

## 3. 部署脚本配置

### 3.1 配置参数

脚本顶部可修改以下配置参数：

```bash
# 数据库配置
DB_NAME="medi_bid_flow"           # 数据库名称
DB_USER="medi_bid_user"           # 数据库用户名
DB_PASSWORD="medi_bid_password_2025"  # 数据库密码

# 服务配置
BACKEND_PORT="8000"               # 后端服务端口

# 目录配置
FRONTEND_DIR="/opt/medi-bid-flow/frontend"  # 前端代码目录
BACKEND_DIR="/opt/medi-bid-flow/backend"    # 后端代码目录
```

### 3.2 自定义配置

1. **修改数据库密码**：
   - 建议部署完成后修改数据库密码
   - 执行命令：`sudo -u postgres psql -c "ALTER USER medi_bid_user WITH PASSWORD '新密码';"`

2. **修改服务端口**：
   - 修改脚本中的`BACKEND_PORT`参数
   - 重新执行部署脚本

## 4. 服务管理

### 4.1 查看服务状态

```bash
# 查看后端服务状态
systemctl status medi-bid-flow-backend

# 查看Nginx服务状态
systemctl status nginx

# 查看PostgreSQL服务状态
systemctl status postgresql-13
```

### 4.2 重启服务

```bash
# 重启后端服务
systemctl restart medi-bid-flow-backend

# 重启Nginx服务
systemctl restart nginx

# 重启PostgreSQL服务
systemctl restart postgresql-13
```

### 4.3 停止服务

```bash
# 停止后端服务
systemctl stop medi-bid-flow-backend

# 停止Nginx服务
systemctl stop nginx

# 停止PostgreSQL服务
systemctl stop postgresql-13
```

## 5. 日志管理

### 5.1 部署日志
- **日志文件**：`/opt/medi-bid-flow/deploy.log`
- **查看方式**：`tail -f /opt/medi-bid-flow/deploy.log`

### 5.2 服务日志

1. **后端服务日志**：
   ```bash
   journalctl -u medi-bid-flow-backend -f
   ```

2. **Nginx日志**：
   ```bash
   # 访问日志
   tail -f /var/log/nginx/access.log
   
   # 错误日志
   tail -f /var/log/nginx/error.log
   ```

3. **PostgreSQL日志**：
   ```bash
   tail -f /var/lib/pgsql/13/data/log/postgresql-Mon.log
   ```

## 6. 常见问题排查

### 6.1 部署失败

1. **查看部署日志**：
   ```bash
   tail -n 100 /opt/medi-bid-flow/deploy.log
   ```

2. **常见错误原因**：
   - 网络问题：无法访问国内镜像源
   - 权限问题：脚本未以root用户执行
   - 磁盘空间不足：检查服务器磁盘使用情况
   - 端口被占用：检查80和8000端口是否被占用

### 6.2 服务无法启动

1. **查看服务状态和日志**：
   ```bash
   systemctl status medi-bid-flow-backend
   journalctl -u medi-bid-flow-backend -n 50
   ```

2. **常见错误原因**：
   - 数据库连接失败：检查数据库配置和服务状态
   - 端口被占用：检查8000端口是否被其他进程占用
   - 依赖缺失：检查Python依赖是否安装完整

### 6.3 Web页面无法访问

1. **检查Nginx服务**：
   ```bash
   systemctl status nginx
   ```

2. **检查防火墙配置**：
   ```bash
   firewall-cmd --list-ports
   ```

3. **检查前端构建文件**：
   ```bash
   ls -la /opt/medi-bid-flow/frontend/dist/
   ```

## 7. 安全建议

1. **修改默认密码**：
   - 部署完成后立即修改数据库密码
   - 修改系统默认用户密码

2. **配置SSL证书**：
   - 建议为Web服务配置HTTPS
   - 可使用Let's Encrypt免费证书

3. **配置防火墙**：
   - 只开放必要端口（80/443/8000）
   - 限制IP访问范围

4. **定期备份**：
   - 定期备份数据库
   - 定期备份代码和配置文件

5. **更新系统**：
   - 定期执行系统更新
   - 定期更新依赖包

## 8. 版本更新

### 8.1 升级系统

1. **备份数据**：
   ```bash
   # 备份数据库
   pg_dump -U medi_bid_user medi_bid_flow > medi_bid_flow_backup.sql
   
   # 备份配置文件
   cp /opt/medi-bid-flow/backend/main.py main.py.bak
   ```

2. **更新代码**：
   ```bash
   cd /opt/medi-bid-flow
   git pull origin main
   ```

3. **重新部署**：
   ```bash
   ./deploy_cn.sh
   ```

## 9. 联系方式

- **技术支持**：contact@example.com
- **文档更新**：2025-12-04
- **版本**：v1.0.0

---

**注意事项**：
1. 脚本需以root用户执行
2. 首次部署建议在全新的CentOS 8.4系统上执行
3. 部署过程中请勿中断脚本执行
4. 如遇问题，请查看部署日志或联系技术支持
