
---
name: lerwee-cot-api-tester
description: 乐维 AI 运维 CoT 场景纯接口测试器。通过 CDP 提取登录 token 后全程 HTTP 调用完成测试，不点击任何 UI 元素。用于场景创建或修改后的快速回归验证，速度比浏览器点击快 5-10 倍。触发词：接口测试、纯接口测试、API 测试场景、快速回归、api-test、CDP token 测试。
---

# 乐维 CoT 纯接口测试器

## 核心原理

CDP 连接已登录浏览器提取 accessToken，然后全程 HTTP 调用 select-data -> build -> chat-stream，不点击任何 UI。

## 与浏览器测试的区别

| 维度 | 浏览器点击 | 本工具（纯接口） |
|---|---|---|
| 单场景耗时 | 3-5 分钟 | 20-40 秒 |
| 4 对象回归 | 15-20 分钟 | 2-3 分钟 |
| 稳定性 | 依赖元素选择器和渲染 | 纯 HTTP，无 UI 干扰 |
| CoT 获取 | 需点击弹窗 | SSE 直接解析 |
| token 过期 | 整个流程卡住 | 重新提取即可 |
| 适用场景 | 最终验收 | 日常快速回归 |

## 前置条件

1. 有一个已登录乐维平台的可见 Chromium（CDP 模式）。
2. Chromium 监听 CDP 端口：1.79 用 9322，3.92 用 9323。
3. Playwright 已安装在 npx 缓存。

## 用法

详细参数和示例见 references/usage.md。

### 基本测试

    node scripts/api-test.mjs --cdp http://127.0.0.1:9322 --scene "场景名称" --objects "对象1,对象2" --multi

### 列出所有场景

    node scripts/api-test.mjs --cdp http://127.0.0.1:9322 --list-scenes

### 只列候选对象（不执行测试）

    node scripts/api-test.mjs --cdp http://127.0.0.1:9322 --scene "场景名称" --list-only

### 单选场景（数据库类）

    node scripts/api-test.mjs --cdp http://127.0.0.1:9323 --scene "PostgreSQL连接压力" --objects "监控系统-PostgreSQL"

## 测试链路

CDP 提取 token -> GET list 找场景ID -> GET view 取模板 -> POST select-data 获取候选对象 -> POST build 执行表达式采集 -> POST chat-stream 获取模型回答和 CoT -> 自动检查 -> 保存结果

## 自动检查项

- 最终回答是否存在"处理结论"。
- 是否有 {#...} 残留表达式。
- CoT 中是否有 SQL 不合法错误。
- 是否有乱码问号。
- 最终回答是否过短。

## CDP 端口

- 1.79 CDP 端口：9322
- 3.92 CDP 端口：9323
- 启动脚本：tools/start-detached-visible-179.py 和 tools/start-detached-visible-392.py

## 结果保存

结果保存在 C:/Users/chenhansheng/Documents/乐维线下培训方案输出/api-test-results/ 目录。

每个测试生成一个 JSON 文件，包含：场景名、场景ID、对象列表、最终回答全文、CoT 全文、自动检查问题列表、时间戳和 session ID。

## 使用边界

- 本工具用于快速回归，不替代最终浏览器验收。
- 单次检查通过的场景仍需按 4 对象规则验证代表性。
- build 会真实执行表达式（包括 external_db 查询和 automation 脚本），调用前必须确认危险 SQL 和命令已拦截。
- token 有效期有限，过期后重新运行即可自动提取。
- 不在脚本中保存 token、密码或 Cookie。

## 与其他 skill 的关系

- 制造场景用 lerwee-cot-scenario-builder。
- 浏览器最终验收用 lerwee-cot-scenario-testing。
- 本工具用于两者之间的快速回归。
- 测试通过后用 lerwee-cot-scenario-sync 同步发布。
