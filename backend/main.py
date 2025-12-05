from fastapi import FastAPI, UploadFile, File, HTTPException, Depends, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uuid
from datetime import datetime
from typing import Optional, List

app = FastAPI()

# 配置CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 数据库连接配置（后续替换为实际连接）
DATABASE_URL = "postgresql://user:password@localhost/medi_bid_flow"

# 用户认证依赖（简化版，仅用于演示）
async def get_current_user():
    # 实际项目中应实现JWT认证
    return {"id": "user1", "company_id": "company1", "role": "admin"}

# 公司模型
class Company(BaseModel):
    id: str = str(uuid.uuid4())
    name: str
    created_at: datetime = datetime.now()

# 用户模型
class User(BaseModel):
    id: str = str(uuid.uuid4())
    username: str
    password: str
    company_id: str
    role: str  # admin, manager, operator
    created_at: datetime = datetime.now()

# 操作日志模型
class OperationLog(BaseModel):
    id: str = str(uuid.uuid4())
    user_id: str
    company_id: str
    operation_type: str  # create, update, delete
    resource_type: str   # project, product, knowledge, etc.
    resource_id: str
    content: str
    created_at: datetime = datetime.now()

# 项目模型
class Project(BaseModel):
    id: str = str(uuid.uuid4())
    name: str
    company_id: str
    status: str = "parsing"
    rfp_file_url: str
    owner_id: str
    created_at: datetime = datetime.now()

# RFP项模型
class RFPItem(BaseModel):
    id: str = str(uuid.uuid4())
    project_id: str
    company_id: str
    section_type: str
    content: str
    extracted_key: str
    extracted_value: str
    operator: str

# 产品参数模型
class ProductSpec(BaseModel):
    id: str = str(uuid.uuid4())
    company_id: str
    product_model: str
    param_name: str
    param_value: str
    is_core_param: bool = False

# 知识库切片模型
class KnowledgeChunk(BaseModel):
    id: str = str(uuid.uuid4())
    content: str
    embedding: list[float]
    metadata: dict
    company_id: str
    tenant_id: str

# 资质预警模型
class Qualification(BaseModel):
    id: str = str(uuid.uuid4())
    company_id: str
    name: str
    number: str
    expiry_date: datetime
    status: str = "valid"
    created_at: datetime = datetime.now()

# 投标文件模板模型
class BidTemplate(BaseModel):
    id: str = str(uuid.uuid4())
    company_id: str
    name: str
    file_url: str
    template_type: str  # 产品类型，如CT、MRI、超声等
    created_at: datetime = datetime.now()

# 标书生成任务模型
class BidGenerationTask(BaseModel):
    id: str = str(uuid.uuid4())
    company_id: str
    project_id: str
    template_id: str
    status: str = "pending"  # pending, processing, completed, failed
    progress: int = 0
    rfp_file_url: str
    result_file_url: Optional[str] = None
    error_message: Optional[str] = None
    created_at: datetime = datetime.now()
    updated_at: datetime = datetime.now()

# 生成的标书模型
class GeneratedBid(BaseModel):
    id: str = str(uuid.uuid4())
    company_id: str
    project_id: str
    task_id: str
    template_id: str
    file_url: str
    status: str = "draft"  # draft, reviewed, finalized
    ai_generated_content: dict
    manual_review_notes: Optional[str] = None
    created_at: datetime = datetime.now()
    updated_at: datetime = datetime.now()

# 模拟数据库
companies_db = []
users_db = []
operation_logs_db = []
projects_db = []
rfp_items_db = []
product_specs_db = []
knowledge_chunks_db = []
qualifications_db = []
bid_templates_db = []
bid_generation_tasks_db = []
generated_bids_db = []

# 初始化数据
# 添加示例公司
companies_db.append(Company(id="company1", name="示例公司1"))

# 添加示例用户
users_db.append(User(id="user1", username="admin", password="123456", company_id="company1", role="admin"))
users_db.append(User(id="user2", username="manager", password="123456", company_id="company1", role="manager"))
users_db.append(User(id="user3", username="operator", password="123456", company_id="company1", role="operator"))

# 操作日志记录函数
def log_operation(user, operation_type, resource_type, resource_id, content):
    log = OperationLog(
        user_id=user["id"],
        company_id=user["company_id"],
        operation_type=operation_type,
        resource_type=resource_type,
        resource_id=resource_id,
        content=content
    )
    operation_logs_db.append(log)

# 用户认证API
@app.post("/api/login")
async def login(username: str = Form(...), password: str = Form(...)):
    # 简化的登录逻辑，实际项目中应实现密码加密和验证
    user = next((u for u in users_db if u.username == username and u.password == password), None)
    if user:
        # 记录登录日志
        log_operation({"id": user.id, "company_id": user.company_id}, "login", "user", user.id, f"用户{username}登录成功")
        return {"token": "fake-jwt-token", "user": {"id": user.id, "username": user.username, "company_id": user.company_id, "role": user.role}}
    raise HTTPException(status_code=401, detail="用户名或密码错误")

# 获取当前用户信息
@app.get("/api/users/me")
async def get_current_user_info(current_user: dict = Depends(get_current_user)):
    return current_user

# 用户管理API - 仅管理员可访问

# 获取用户列表
@app.get("/api/admin/users/")
async def get_all_users(current_user: dict = Depends(get_current_user)):
    # 验证当前用户是否为管理员
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="只有管理员可以访问此接口")
    
    # 只返回当前公司的用户
    return [user for user in users_db if user.company_id == current_user["company_id"]]

# 创建新用户
@app.post("/api/admin/users/")
async def create_user(user: User, current_user: dict = Depends(get_current_user)):
    # 验证当前用户是否为管理员
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="只有管理员可以访问此接口")
    
    # 确保用户属于当前公司
    user.company_id = current_user["company_id"]
    
    # 检查用户名是否已存在
    if any(u.username == user.username for u in users_db):
        raise HTTPException(status_code=400, detail="用户名已存在")
    
    # 添加到数据库
    users_db.append(user)
    
    # 记录操作日志
    log_operation(current_user, "create", "user", user.id, f"创建用户：{user.username}")
    
    return user

# 更新用户信息
@app.put("/api/admin/users/{user_id}")
async def update_user(user_id: str, updated_user: User, current_user: dict = Depends(get_current_user)):
    # 验证当前用户是否为管理员
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="只有管理员可以访问此接口")
    
    # 查找用户
    user_index = next((i for i, u in enumerate(users_db) if u.id == user_id), None)
    if user_index is None:
        raise HTTPException(status_code=404, detail="用户不存在")
    
    # 确保用户属于当前公司
    if users_db[user_index].company_id != current_user["company_id"]:
        raise HTTPException(status_code=403, detail="无法修改其他公司的用户")
    
    # 检查用户名是否已被其他用户使用
    if any(u.username == updated_user.username and u.id != user_id for u in users_db):
        raise HTTPException(status_code=400, detail="用户名已存在")
    
    # 更新用户信息
    users_db[user_index] = updated_user
    
    # 记录操作日志
    log_operation(current_user, "update", "user", user_id, f"更新用户：{updated_user.username}")
    
    return updated_user

# 删除用户
@app.delete("/api/admin/users/{user_id}")
async def delete_user(user_id: str, current_user: dict = Depends(get_current_user)):
    # 验证当前用户是否为管理员
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="只有管理员可以访问此接口")
    
    # 查找用户
    user_index = next((i for i, u in enumerate(users_db) if u.id == user_id), None)
    if user_index is None:
        raise HTTPException(status_code=404, detail="用户不存在")
    
    # 确保用户属于当前公司
    if users_db[user_index].company_id != current_user["company_id"]:
        raise HTTPException(status_code=403, detail="无法删除其他公司的用户")
    
    # 记录操作日志
    log_operation(current_user, "delete", "user", user_id, f"删除用户：{users_db[user_index].username}")
    
    # 删除用户
    del users_db[user_index]
    
    return {"message": "用户删除成功"}

# 更新用户角色
@app.post("/api/admin/users/{user_id}/role")
async def update_user_role(user_id: str, role: str = Form(...), current_user: dict = Depends(get_current_user)):
    # 验证当前用户是否为管理员
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="只有管理员可以访问此接口")
    
    # 验证角色有效性
    valid_roles = ["admin", "manager", "operator"]
    if role not in valid_roles:
        raise HTTPException(status_code=400, detail=f"无效的角色，有效值为：{', '.join(valid_roles)}")
    
    # 查找用户
    user_index = next((i for i, u in enumerate(users_db) if u.id == user_id), None)
    if user_index is None:
        raise HTTPException(status_code=404, detail="用户不存在")
    
    # 确保用户属于当前公司
    if users_db[user_index].company_id != current_user["company_id"]:
        raise HTTPException(status_code=403, detail="无法修改其他公司的用户")
    
    # 更新用户角色
    old_role = users_db[user_index].role
    users_db[user_index].role = role
    
    # 记录操作日志
    log_operation(current_user, "update", "user_role", user_id, f"更新用户{users_db[user_index].username}角色：{old_role} → {role}")
    
    return {"message": "角色更新成功", "user": users_db[user_index]}

# 项目管理API
@app.post("/api/projects/")
async def create_project(project: Project, current_user: dict = Depends(get_current_user)):
    # 确保项目属于当前公司
    project.company_id = current_user["company_id"]
    project.owner_id = current_user["id"]
    projects_db.append(project)
    # 记录操作日志
    log_operation(current_user, "create", "project", project.id, f"创建项目：{project.name}")
    return project

@app.get("/api/projects/")
async def get_projects(current_user: dict = Depends(get_current_user)):
    # 只返回当前公司的项目
    return [p for p in projects_db if p.company_id == current_user["company_id"]]

@app.get("/api/projects/{project_id}")
async def get_project(project_id: str, current_user: dict = Depends(get_current_user)):
    project = next((p for p in projects_db if p.id == project_id and p.company_id == current_user["company_id"]), None)
    if project:
        return project
    raise HTTPException(status_code=404, detail="项目不存在")

@app.put("/api/projects/{project_id}")
async def update_project(project_id: str, updated_project: Project, current_user: dict = Depends(get_current_user)):
    for i, project in enumerate(projects_db):
        if project.id == project_id and project.company_id == current_user["company_id"]:
            updated_project.company_id = current_user["company_id"]
            updated_project.id = project_id
            projects_db[i] = updated_project
            # 记录操作日志
            log_operation(current_user, "update", "project", project_id, f"更新项目：{updated_project.name}")
            return updated_project
    raise HTTPException(status_code=404, detail="项目不存在")

@app.delete("/api/projects/{project_id}")
async def delete_project(project_id: str, current_user: dict = Depends(get_current_user)):
    for i, project in enumerate(projects_db):
        if project.id == project_id and project.company_id == current_user["company_id"]:
            deleted_project = projects_db.pop(i)
            # 记录操作日志
            log_operation(current_user, "delete", "project", project_id, f"删除项目：{deleted_project.name}")
            return {"message": "项目删除成功"}
    raise HTTPException(status_code=404, detail="项目不存在")

# 文件上传API
@app.post("/api/upload-rfp/")
async def upload_rfp(file: UploadFile = File(...), current_user: dict = Depends(get_current_user)):
    # 这里将实现文件上传和解析逻辑
    # 记录操作日志
    log_operation(current_user, "upload", "rfp", "", f"上传RFP文件：{file.filename}")
    return {"filename": file.filename, "message": "文件上传成功，等待解析"}

# AI生成API
@app.post("/api/ai/generate-section")
async def generate_section(project_id: str, requirement_text: str, section_type: str, current_user: dict = Depends(get_current_user)):
    # 验证项目属于当前公司
    project = next((p for p in projects_db if p.id == project_id and p.company_id == current_user["company_id"]), None)
    if not project:
        raise HTTPException(status_code=404, detail="项目不存在")
    # 记录操作日志
    log_operation(current_user, "generate", "ai", project_id, f"生成{section_type}部分")
    # 这里将实现AI生成逻辑
    return {
        "content": f"根据项目{project_id}的需求，生成{section_type}部分：{requirement_text}",
        "sources": ["2023年协和医院中标书"]
    }

# 偏离表生成API
@app.post("/api/generate-deviation-table")
async def generate_deviation_table(project_id: str, current_user: dict = Depends(get_current_user)):
    # 验证项目属于当前公司
    project = next((p for p in projects_db if p.id == project_id and p.company_id == current_user["company_id"]), None)
    if not project:
        raise HTTPException(status_code=404, detail="项目不存在")
    # 记录操作日志
    log_operation(current_user, "generate", "deviation_table", project_id, "生成偏离表")
    # 这里将实现偏离表生成逻辑
    return {
        "table": [
            {"param_name": "扫描速度", "tender_value": "100mm/s", "our_value": "120mm/s", "deviation": "正偏离", "remark": ""},
            {"param_name": "探测器排数", "tender_value": ">=64排", "our_value": "128排", "deviation": "无偏离", "remark": ""}
        ],
        "message": "技术规格偏离表生成成功"
    }

# 产品参数管理API
@app.post("/api/product-specs/")
async def create_product_spec(spec: ProductSpec, current_user: dict = Depends(get_current_user)):
    spec.company_id = current_user["company_id"]
    product_specs_db.append(spec)
    # 记录操作日志
    log_operation(current_user, "create", "product_spec", spec.id, f"创建产品参数：{spec.param_name}")
    return spec

@app.get("/api/product-specs/")
async def get_product_specs(current_user: dict = Depends(get_current_user)):
    # 只返回当前公司的产品参数
    return [s for s in product_specs_db if s.company_id == current_user["company_id"]]

# 知识库管理API
@app.post("/api/knowledge-chunks/")
async def create_knowledge_chunk(chunk: KnowledgeChunk, current_user: dict = Depends(get_current_user)):
    chunk.company_id = current_user["company_id"]
    knowledge_chunks_db.append(chunk)
    # 记录操作日志
    log_operation(current_user, "create", "knowledge", chunk.id, "创建知识库切片")
    return chunk

@app.get("/api/knowledge-chunks/")
async def get_knowledge_chunks(current_user: dict = Depends(get_current_user)):
    # 只返回当前公司的知识库切片
    return [c for c in knowledge_chunks_db if c.company_id == current_user["company_id"]]

# 模板管理API

# 上传模板
@app.post("/api/bid-templates/upload")
async def upload_bid_template(
    file: UploadFile = File(...),
    name: str = Form(...),
    template_type: str = Form(...),
    current_user: dict = Depends(get_current_user)
):
    # 这里将实现文件上传逻辑
    template = BidTemplate(
        company_id=current_user["company_id"],
        name=name,
        file_url=f"/uploads/templates/{file.filename}",
        template_type=template_type
    )
    bid_templates_db.append(template)
    log_operation(current_user, "create", "bid_template", template.id, f"上传投标模板：{name}")
    return template

# 获取模板列表
@app.get("/api/bid-templates/")
async def get_bid_templates(current_user: dict = Depends(get_current_user)):
    return [t for t in bid_templates_db if t.company_id == current_user["company_id"]]

# 获取单个模板
@app.get("/api/bid-templates/{template_id}")
async def get_bid_template(template_id: str, current_user: dict = Depends(get_current_user)):
    template = next((t for t in bid_templates_db if t.id == template_id and t.company_id == current_user["company_id"]), None)
    if template:
        return template
    raise HTTPException(status_code=404, detail="模板不存在")

# 删除模板
@app.delete("/api/bid-templates/{template_id}")
async def delete_bid_template(template_id: str, current_user: dict = Depends(get_current_user)):
    for i, template in enumerate(bid_templates_db):
        if template.id == template_id and template.company_id == current_user["company_id"]:
            deleted_template = bid_templates_db.pop(i)
            log_operation(current_user, "delete", "bid_template", template_id, f"删除投标模板：{deleted_template.name}")
            return {"message": "模板删除成功"}
    raise HTTPException(status_code=404, detail="模板不存在")

# 标书生成任务API

# 创建生成任务
@app.post("/api/bid-generation-tasks/")
async def create_bid_generation_task(
    project_id: str = Form(...),
    template_id: str = Form(...),
    rfp_file_url: str = Form(...),
    current_user: dict = Depends(get_current_user)
):
    # 验证项目和模板是否属于当前公司
    project = next((p for p in projects_db if p.id == project_id and p.company_id == current_user["company_id"]), None)
    template = next((t for t in bid_templates_db if t.id == template_id and t.company_id == current_user["company_id"]), None)
    
    if not project:
        raise HTTPException(status_code=404, detail="项目不存在")
    if not template:
        raise HTTPException(status_code=404, detail="模板不存在")
    
    # 创建生成任务
    task = BidGenerationTask(
        company_id=current_user["company_id"],
        project_id=project_id,
        template_id=template_id,
        rfp_file_url=rfp_file_url,
        status="processing",
        progress=10
    )
    bid_generation_tasks_db.append(task)
    log_operation(current_user, "create", "bid_generation_task", task.id, f"创建标书生成任务：{project.name}")
    return task

# 获取任务列表
@app.get("/api/bid-generation-tasks/")
async def get_bid_generation_tasks(current_user: dict = Depends(get_current_user)):
    return [t for t in bid_generation_tasks_db if t.company_id == current_user["company_id"]]

# 获取单个任务
@app.get("/api/bid-generation-tasks/{task_id}")
async def get_bid_generation_task(task_id: str, current_user: dict = Depends(get_current_user)):
    task = next((t for t in bid_generation_tasks_db if t.id == task_id and t.company_id == current_user["company_id"]), None)
    if task:
        return task
    raise HTTPException(status_code=404, detail="任务不存在")

# 取消任务
@app.post("/api/bid-generation-tasks/{task_id}/cancel")
async def cancel_bid_generation_task(task_id: str, current_user: dict = Depends(get_current_user)):
    task = next((t for t in bid_generation_tasks_db if t.id == task_id and t.company_id == current_user["company_id"]), None)
    if task:
        task.status = "cancelled"
        task.updated_at = datetime.now()
        log_operation(current_user, "update", "bid_generation_task", task_id, f"取消标书生成任务")
        return task
    raise HTTPException(status_code=404, detail="任务不存在")

# AI生成标书API
@app.post("/api/ai/generate-bid")
async def generate_bid(
    project_id: str = Form(...),
    template_id: str = Form(...),
    rfp_file_url: str = Form(...),
    current_user: dict = Depends(get_current_user)
):
    # 这里将实现AI生成标书的核心逻辑
    
    # 1. 验证权限和资源
    project = next((p for p in projects_db if p.id == project_id and p.company_id == current_user["company_id"]), None)
    template = next((t for t in bid_templates_db if t.id == template_id and t.company_id == current_user["company_id"]), None)
    
    if not project:
        raise HTTPException(status_code=404, detail="项目不存在")
    if not template:
        raise HTTPException(status_code=404, detail="模板不存在")
    
    # 2. 创建生成任务
    task = BidGenerationTask(
        company_id=current_user["company_id"],
        project_id=project_id,
        template_id=template_id,
        rfp_file_url=rfp_file_url,
        status="processing",
        progress=30
    )
    bid_generation_tasks_db.append(task)
    
    # 3. 模拟AI生成过程（实际项目中这里将调用AI模型）
    # 解析RFP文件
    # 提取产品参数
    # 匹配模板
    # 生成标书内容
    
    # 4. 更新任务状态
    task.status = "completed"
    task.progress = 100
    task.result_file_url = f"/uploads/generated_bids/{project_id}_bid.pdf"
    task.updated_at = datetime.now()
    
    # 5. 创建生成的标书
    generated_bid = GeneratedBid(
        company_id=current_user["company_id"],
        project_id=project_id,
        task_id=task.id,
        template_id=template_id,
        file_url=task.result_file_url,
        ai_generated_content={
            "product_specs": [
                {"param_name": "扫描速度", "value": "120mm/s", "source": "产品库", "status": "matched"},
                {"param_name": "探测器排数", "value": "128排", "source": "产品库", "status": "matched"}
            ],
            "qualifications": [
                {"name": "医疗器械经营许可证", "status": "valid", "expiry_date": "2026-12-31"}
            ],
            "deviation_table": [
                {"param_name": "扫描速度", "tender_value": "100mm/s", "our_value": "120mm/s", "deviation": "正偏离"}
            ],
            "need_review": [
                {"section": "价格表", "reason": "AI无法自动生成价格，需人工填写"},
                {"section": "售后服务承诺", "reason": "需根据项目具体情况调整"}
            ]
        }
    )
    generated_bids_db.append(generated_bid)
    
    log_operation(current_user, "generate", "generated_bid", generated_bid.id, f"AI生成标书：{project.name}")
    
    return {
        "task": task,
        "generated_bid": generated_bid
    }

# 获取生成的标书列表
@app.get("/api/generated-bids/")
async def get_generated_bids(current_user: dict = Depends(get_current_user)):
    return [b for b in generated_bids_db if b.company_id == current_user["company_id"]]

# 获取单个生成的标书
@app.get("/api/generated-bids/{bid_id}")
async def get_generated_bid(bid_id: str, current_user: dict = Depends(get_current_user)):
    bid = next((b for b in generated_bids_db if b.id == bid_id and b.company_id == current_user["company_id"]), None)
    if bid:
        return bid
    raise HTTPException(status_code=404, detail="生成的标书不存在")

# 标记标书为已审核
@app.post("/api/generated-bids/{bid_id}/review")
async def review_generated_bid(
    bid_id: str,
    status: str = Form(...),
    manual_review_notes: Optional[str] = Form(None),
    current_user: dict = Depends(get_current_user)
):
    bid = next((b for b in generated_bids_db if b.id == bid_id and b.company_id == current_user["company_id"]), None)
    if bid:
        bid.status = status
        bid.manual_review_notes = manual_review_notes
        bid.updated_at = datetime.now()
        log_operation(current_user, "update", "generated_bid", bid_id, f"审核标书，状态：{status}")
        return bid
    raise HTTPException(status_code=404, detail="生成的标书不存在")

# 操作日志API
@app.get("/api/operation-logs/")
async def get_operation_logs(
    current_user: dict = Depends(get_current_user),
    operation_type: Optional[str] = None,
    resource_type: Optional[str] = None,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None
):
    # 只返回当前公司的操作日志
    logs = [log for log in operation_logs_db if log.company_id == current_user["company_id"]]
    
    # 应用操作类型过滤
    if operation_type:
        logs = [log for log in logs if log.operation_type == operation_type]
    
    # 应用资源类型过滤
    if resource_type:
        logs = [log for log in logs if log.resource_type == resource_type]
    
    # 应用日期范围过滤
    if start_date:
        logs = [log for log in logs if log.created_at >= start_date]
    
    if end_date:
        logs = [log for log in logs if log.created_at <= end_date]
    
    return logs

# 根路由
@app.get("/")
async def root():
    return {"message": "医中标 (MediBid-Flow) 后端服务运行中"}