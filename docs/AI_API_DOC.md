# 医中标（MediBid-Flow）AI工具接口说明

## 1. 接口概述

医中标系统提供了以下AI相关接口，用于实现智能投标辅助功能：

| 接口名称 | 路径 | 方法 | 功能描述 |
|---------|------|------|----------|
| 上传招标文件 | /api/upload-rfp | POST | 上传并解析招标文件，提取关键信息 |
| 生成标书章节 | /api/ai/generate-section | POST | 根据需求生成标书特定章节 |
| 生成偏离表 | /api/generate-deviation-table | POST | 自动生成技术规格偏离表 |

## 2. 接口详细说明

### 2.1 上传招标文件

**路径**：`/api/upload-rfp`
**方法**：`POST`
**功能**：上传招标文件PDF或Word文件，系统将使用AI工具解析提取招标参数、资质要求、废标条款等信息。

**请求参数**：
- `file`：文件（必填），支持PDF、Word格式，单个文件不超过50MB

**响应示例**：
```json
{
  "filename": "招标文件.pdf",
  "message": "文件上传成功，等待解析",
  "project_id": "123e4567-e89b-12d3-a456-426614174000"
}
```

### 2.2 生成标书章节

**路径**：`/api/ai/generate-section`
**方法**：`POST`
**功能**：根据项目需求和指定章节类型，使用AI生成标书内容。

**请求参数**：
- `project_id`：项目ID（必填）
- `requirement_text`：需求文本（必填），例如："请提供针对三甲医院的CT设备维保方案，要求响应时间小于2小时。"
- `section_type`：章节类型（必填），例如："technical_maintenance"、"after_sales_service"、"implementation_case"等

**响应示例**：
```json
{
  "content": "根据项目123的需求，生成technical_maintenance部分：请提供针对三甲医院的CT设备维保方案，要求响应时间小于2小时。",
  "sources": ["2023年协和医院中标书"]
}
```

### 2.3 生成偏离表

**路径**：`/api/generate-deviation-table`
**方法**：`POST`
**功能**：自动对比招标参数与我方产品参数，生成技术规格偏离表。

**请求参数**：
- `project_id`：项目ID（必填）
- `product_model`：产品型号（可选），如果不提供，将使用项目默认产品

**响应示例**：
```json
{
  "table": [
    {
      "param_name": "扫描速度",
      "tender_value": "100mm/s",
      "our_value": "120mm/s",
      "deviation": "正偏离",
      "remark": ""
    },
    {
      "param_name": "探测器排数",
      "tender_value": "≥64排",
      "our_value": "128排",
      "deviation": "无偏离",
      "remark": ""
    }
  ],
  "message": "技术规格偏离表生成成功",
  "deviation_summary": {
    "positive": 1,
    "negative": 0,
    "no_deviation": 1,
    "total": 2
  }
}
```

## 3. AI调用逻辑

### 3.1 核心流程：RAG（检索增强生成）写标书

1. **Query Expansion**：将用户需求扩展，例如："CT维保" -> "CT 维修 保养 售后 响应时间"
2. **Vector Search**：在知识库中检索相似度最高的Top-5文本块
3. **Re-ranking**：使用Rerank模型对Top-5进行相关性精排，选出Top-3
4. **Prompt Construction**：构建包含上下文和指令的提示词
5. **LLM Inference**：调用本地DeepSeek模型生成文本
6. **Response**：返回生成的文本和引用来源

### 3.2 核心流程：技术偏离表自动生成

1. **NLP提取**：AI读取招标文件中的参数行，提取 (参数名, 运算符, 目标值)
2. **SQL匹配**：在产品参数库中查找我方产品的对应参数
3. **逻辑比对**：比对我方数值与招标数值，判定偏离类型
4. **生成表格**：自动生成符合招标格式的Excel表格数据

## 4. 本地部署AI模型

系统支持以下AI模型的本地部署：

- **LLM**：DeepSeek-7B-Chat 或 Qwen-14B（通过vLLM或Ollama部署）
- **Embedding**：BGE-M3（用于文本向量化）
- **Vector DB**：Milvus 或 Pgvector（用于向量存储和检索）

## 5. 调用示例

### Python示例

```python
import requests

# 上传招标文件
url = "http://localhost:8000/api/upload-rfp"
files = {"file": open("招标文件.pdf", "rb")}
response = requests.post(url, files=files)
print(response.json())

# 生成标书章节
url = "http://localhost:8000/api/ai/generate-section"
params = {
    "project_id": "123",
    "requirement_text": "请提供针对三甲医院的CT设备维保方案，要求响应时间小于2小时。",
    "section_type": "technical_maintenance"
}
response = requests.post(url, params=params)
print(response.json())

# 生成偏离表
url = "http://localhost:8000/api/generate-deviation-table"
params = {"project_id": "123"}
response = requests.post(url, params=params)
print(response.json())
```

### JavaScript示例

```javascript
// 上传招标文件
const formData = new FormData();
formData.append('file', fileInput.files[0]);

fetch('http://localhost:8000/api/upload-rfp', {
  method: 'POST',
  body: formData
})
.then(response => response.json())
.then(data => console.log(data));

// 生成标书章节
fetch('http://localhost:8000/api/ai/generate-section', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
  },
  body: new URLSearchParams({
    'project_id': '123',
    'requirement_text': '请提供针对三甲医院的CT设备维保方案，要求响应时间小于2小时。',
    'section_type': 'technical_maintenance'
  })
})
.then(response => response.json())
.then(data => console.log(data));
```

## 6. 错误处理

| 错误码 | 描述 | 解决方案 |
|-------|------|----------|
| 400 | 参数错误 | 检查请求参数是否完整和正确 |
| 401 | 未授权 | 检查API密钥或登录状态 |
| 404 | 接口不存在 | 检查请求路径是否正确 |
| 500 | 服务器错误 | 检查服务器日志，联系技术支持 |
| 503 | AI服务不可用 | 检查AI模型部署状态 |

## 7. 性能优化建议

1. 对于大型招标文件，建议先压缩再上传
2. 生成章节时，提供具体的需求描述可以获得更准确的结果
3. 定期更新产品参数库，确保偏离表生成的准确性
4. 对于高频调用，建议使用缓存机制减少API请求次数

## 8. 安全注意事项

1. 所有API调用建议使用HTTPS协议
2. 生产环境中，建议限制CORS允许的源
3. 定期更新AI模型，修复安全漏洞
4. 对敏感数据进行加密处理

# 附录

## A. 章节类型枚举

| 类型代码 | 描述 |
|---------|------|
| technical_maintenance | 技术维保方案 |
| after_sales_service | 售后服务承诺 |
| implementation_case | 医院实施案例 |
| technical_response | 技术参数响应 |
| commercial_proposal | 商务方案 |
| qualification_document | 资质文件说明 |

## B. 偏离类型枚举

| 类型 | 描述 |
|------|------|
| 正偏离 | 我方参数优于招标要求 |
| 无偏离 | 我方参数完全符合招标要求 |
| 负偏离 | 我方参数不符合招标要求 |

## C. 状态码说明

| 状态码 | 描述 |
|-------|------|
| 200 | 请求成功 |
| 201 | 资源创建成功 |
| 400 | 请求参数错误 |
| 401 | 未授权访问 |
| 403 | 禁止访问 |
| 404 | 资源不存在 |
| 500 | 服务器内部错误 |
| 503 | 服务不可用 |