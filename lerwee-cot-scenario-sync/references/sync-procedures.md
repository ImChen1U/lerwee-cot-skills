# 同步发布流程

## 环境

| 用途 | 地址 |
|---|---|
| 1.79 场景平台 | http://192.168.1.79:8180 |
| 3.92 场景平台 | http://192.168.3.92 |
| PromptHub | http://192.168.8.97:3871 |
| 在线表格同步出口 | 192.168.8.97 |

账号和密钥只在当前会话通过环境变量传入。

## 1. 平台回读确认

同步前必须确认目标平台场景正文与标准源逐字一致。

- GET /backend_api/lerwee/prompt-template/view?id=场景ID
- 核对名称、分组、描述、状态和完整 CoT。
- 不只看接口返回成功，必须逐字回读。
- 1.79 和 3.92 使用同一标准源，回读确认两边一致。

如果平台内容不是最新，先用 builder 的平台同步流程更新，再回来继续。

## 2. README 生成

- 使用 builder 的 assets/scenario-readme-template.md。
- README 必须与 CoT 使用同一标准源。
- 场景名称、适用范围、判定规则、处置建议必须与 CoT 一致。
- 不包含密码、令牌、内部固定 IP 或环境特例。

## 3. ZIP 打包

- ZIP 包含 CoT 文件和 README。
- 文件名格式：prompt-templates-{UUID}.zip。
- 使用原场景 UUID，不生成新 UUID。
- 单场景独立包和合并包分开。

参考脚本：
C:\Users\chenhansheng\Documents\乐维线下培训方案输出\tools\build-prompt-template-package.mjs

## 4. PromptHub 上传

### 认证

- 使用 JWT Token 认证。
- Token 由 PromptHub 服务端 JWT_SECRET 生成，30 分钟有效。
- Token 只在当前会话环境变量中使用。

### 上传步骤

1. GET /api/prompts?scope=all 获取现有 Prompt 列表。
2. 按场景名称或 UUID 找到目标 Prompt。
3. PUT /api/prompts/{id} 更新 Prompt 内容。
4. POST /api/prompts/{id}/assets/upload 上传 README。
5. POST /api/prompts/{id}/assets/upload 上传 ZIP。
6. POST /api/prompts/{id}/versions 创建新版本，填写变更说明。

### 验收

- GET /api/prompts/{id} 确认内容已更新。
- GET /api/prompts/{id}/assets/readme/preview 确认 README 预览正确。
- GET /api/prompts/{id}/assets/zip/download 下载 ZIP，计算 SHA-256 与本地对比。
- 确认 Prompt 数量没有意外增加。

参考脚本：
C:\Users\chenhansheng\Documents\乐维线下培训方案输出\tools\sync-single-prompthub.py
C:\Users\chenhansheng\Documents\乐维线下培训方案输出\tools\sync-selected-prompthub.py

### 单场景验证

- 使用上传前实时快照判断标题变化。
- 不使用可能过期的全库历史基线。

## 5. 企业微信在线表格

### 出口

固定通过 8.97 远端执行，避免本机出口 IP 白名单变化。

### 更新规则

- 按场景名称或 UUID 原行更新。
- 不新增重复行。
- 更新字段：描述、README 链接、ZIP 链接、UUID。
- 开发列：有场景开发完成的写"完成"。
- 测试列：保持空白。
- 边框格式：与已有行一致。

### 回读检查

- 描述、README 链接、ZIP 链接正确。
- UUID 匹配。
- 无重复行。
- 边框格式无差异。

参考脚本：
C:\Users\chenhansheng\Documents\乐维线下培训方案输出\tools\sync-wecom-cot-scenes.py

## 6. 最终验收清单

- [ ] 平台正文与标准源逐字一致
- [ ] README 内容与 CoT 匹配
- [ ] ZIP 使用原 UUID，文件完整
- [ ] PromptHub README 预览正确
- [ ] PromptHub ZIP 下载 SHA-256 匹配
- [ ] PromptHub 版本已创建
- [ ] 在线表格原行更新，无重复
- [ ] 在线表格测试列空白
- [ ] 所有步骤有记录

## 失败处理

### PromptHub Token 过期

- 重新生成 Token（30 分钟有效）。
- 继续未完成的步骤，不重跑已通过步骤。

### 在线表格 IP 白名单失败

- 确认通过 8.97 远端执行。
- 检查 8.97 连接是否正常。

### ZIP SHA-256 不匹配

- 重新打包。
- 重新上传。
- 重新验证。

### 场景名称在平台找不到

- 确认场景已创建。
- 检查名称是否有空格或全角字符差异。
- 不用相似标题覆盖。