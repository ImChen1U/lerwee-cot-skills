# 场景运行时接口

页面点击"开始对话"后的真实调用链。这些是页面内部接口，依赖浏览器登录态。

## 1. 读取场景

GET /backend_api/lerwee/prompt-template/view?id=场景ID

返回场景名称、描述、完整 CoT 和元数据。

## 2. 解析表单

POST /backend_api/lerwee/prompt-template/select-form
请求体：{"text":"完整CoT模板"}

## 3. 获取候选对象

POST /backend_api/lerwee/prompt-template/select-data
请求体：{"text":"完整CoT模板"}

返回 selectExpressions：表达式 ID、类型、单选/多选、表头、候选行、总数和错误。

## 4. 执行表达式

POST /backend_api/lerwee/prompt-template/build
请求体：{"text":"CoT模板","selections":{"001":["select-data返回的对象行"]}}

真实执行 host、metric、alert、external_db 和 automation。返回已替换为真实数据的完整提示词。

build 会触发真实数据采集，调用前必须完成危险 SQL、危险命令、对象范围和数据源类型检查。

## 5. 调用模型

POST /backend_api/stream/lerwee/chat-stream
请求体：{"message":"build返回的output","prompt_id":"","session_id":"","template_id":"场景ID"}
返回 text/event-stream

事件类型：
- session：会话 ID、Prompt ID、模板 ID
- reasoning：CoT 思考内容
- 回答事件：最终诊断文本
- 错误和结束事件

## 平台管理接口

场景管理使用带签名的开放接口：

POST /backend_api/api/v6/lerwee/prompt-template-list
POST /backend_api/api/v6/lerwee/prompt-template-create
POST /backend_api/api/v6/lerwee/prompt-template-update

签名规则：排除 sign，按键排序，排除空值和数组，拼接 键名+值，前面加 API Secret，SHA1 小写。

## 参考文件

- 脱敏抓包：C:\Users\chenhansheng\Documents\乐维线下培训方案输出\scene-runtime-api-discovery.json
- 抓包脚本：C:\Users\chenhansheng\Documents\乐维线下培训方案输出\tools\discover-scene-runtime-api.mjs
- 签名脚本：C:\Users\chenhansheng\Documents\乐维线下培训方案输出\tools\lerwee-scene-api.py