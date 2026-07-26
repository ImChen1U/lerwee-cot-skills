# 平台同步流程

## 环境

| 用途 | 地址 |
|---|---|
| 1.79 场景平台 | http://192.168.1.79:8180 |
| 3.92 场景平台 | http://192.168.3.92 |
| PromptHub | http://192.168.8.97:3871 |
| 在线表格同步出口 | 192.168.8.97 |

账号和密钥只在当前会话通过环境变量传入，不写入脚本、文档或 Obsidian。

## 创建或更新顺序

1. 按场景名称在平台精确查找，禁止全盘递归搜索。
2. 读取当前场景正文并保存更新前快照。
3. 只修改一份标准源模板，先做静态检查。
4. 使用同一份标准源同步目标平台。
5. 更新后立即重新读取，逐字核对名称、分组、描述和 CoT。
6. 不只看接口返回成功，必须回读确认。

## 接口

场景管理使用平台开放接口（带签名）：

POST /backend_api/api/v6/lerwee/prompt-template-list
POST /backend_api/api/v6/lerwee/prompt-template-create
POST /backend_api/api/v6/lerwee/prompt-template-update
POST /backend_api/api/v6/lerwee/prompt-template-delete
POST /backend_api/api/v6/lerwee/prompt-group
POST /backend_api/api/v6/lerwee/prompt-group-save
POST /backend_api/api/v6/lerwee/prompt-group-delete

每个请求附加 timestamp + sign（SHA1）。参考实现在项目 tools/lerwee-scene-api.py。

## README 和 ZIP

- README 使用 scenario-readme-template.md。
- README、ZIP、平台 CoT 必须使用同一标准源和原 UUID。
- 用户确认平台测试通过后才生成。

## PromptHub 同步

- 使用单场景清单上传。
- 只替换目标 Prompt 的 README 和 ZIP。
- 验证目标资产元数据、README 预览、下载 SHA-256 和 Prompt 数量。
- 上传前实时快照判断标题变化，不用过期基线。

## 在线表格同步

- 固定通过 8.97 远端执行。
- 按场景名称或 UUID 原行更新，不新增重复行。
- 回读检查：描述、README 链接、ZIP 链接、UUID、开发列和边框格式。
- 测试列保持空白。

## 禁止

- 在用户确认平台测试前上传 PromptHub 或在线表格。
- 为了验证单场景重复执行整批场景。
- 全盘搜索；只搜索已知工作目录、具体文件类型和精确场景名称。