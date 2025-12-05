import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT

# 数据库连接参数
DB_NAME = "medi_bid_flow"
DB_USER = "user"
DB_PASSWORD = "password"
DB_HOST = "localhost"
DB_PORT = "5432"

try:
    # 连接到PostgreSQL服务器
    conn = psycopg2.connect(
        user=DB_USER,
        password=DB_PASSWORD,
        host=DB_HOST,
        port=DB_PORT
    )
    conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
    cursor = conn.cursor()
    
    # 创建数据库
    cursor.execute(f"CREATE DATABASE {DB_NAME};")
    print(f"数据库 {DB_NAME} 创建成功")
    
    # 关闭连接
    cursor.close()
    conn.close()
    
    # 连接到新创建的数据库
    conn = psycopg2.connect(
        database=DB_NAME,
        user=DB_USER,
        password=DB_PASSWORD,
        host=DB_HOST,
        port=DB_PORT
    )
    cursor = conn.cursor()
    
    # 启用pgvector扩展
    cursor.execute("CREATE EXTENSION IF NOT EXISTS vector;")
    print("pgvector扩展启用成功")
    
    # 创建项目表
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS projects (
        id UUID PRIMARY KEY,
        name VARCHAR(255),
        status VARCHAR(50),
        rfp_file_url TEXT,
        owner_id UUID,
        created_at TIMESTAMP
    );
    """)
    print("项目表创建成功")
    
    # 创建RFP项表
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS rfp_items (
        id UUID PRIMARY KEY,
        project_id UUID REFERENCES projects(id),
        section_type VARCHAR(50),
        content TEXT,
        extracted_key VARCHAR(100),
        extracted_value VARCHAR(100),
        operator VARCHAR(20)
    );
    """)
    print("RFP项表创建成功")
    
    # 创建产品参数表
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS product_specs (
        id UUID PRIMARY KEY,
        product_model VARCHAR(100),
        param_name VARCHAR(100),
        param_value VARCHAR(100),
        is_core_param BOOLEAN
    );
    """)
    print("产品参数表创建成功")
    
    # 创建知识库切片表
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS knowledge_chunks (
        id UUID PRIMARY KEY,
        content TEXT,
        embedding vector(1024),
        metadata JSONB,
        tenant_id UUID
    );
    """)
    print("知识库切片表创建成功")
    
    # 提交事务
    conn.commit()
    
    # 关闭连接
    cursor.close()
    conn.close()
    
    print("数据库初始化完成")
    
except Exception as e:
    print(f"数据库初始化失败: {e}")
