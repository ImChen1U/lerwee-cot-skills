---
name: lerwee-cot-scenario-testing
description: 乐维 AI 运维 CoT 场景的真实数据测试、CoT 检查、浏览器验证和安全测试流程。用于场景创建或修改后的验证：接口回归（select-data 到 build 到 chat-stream）、浏览器冒烟、4 对象代表性回归、数据源安全测试和结果记录。触发词：测试场景、验证场景、场景测试、CoT 测试、检查 CoT、查看 CoT、场景回归、安全测试、external_db 测试。
---

# 乐维 CoT 场景测试验证

## 适用范围

本 skill 用于场景创建或修改后的验证。覆盖接口回归、浏览器冒烟、代表性回归和数据源安全测试。

不用于场景制作本身，制作使用 `lerwee-cot-scenario-builder`。

## 测试分层

1. 接口回归：通过 select-data 到 build 到 chat-stream 完成数据、模型回答和 CoT 检查。
2. 浏览器冒烟：验证对象选择、流式显示、Markdown 渲染和 CoT 弹窗。
3. 代表性回归：每个场景选 4 个代表对象。
4. 安全测试（仅 external_db 场景）：验证只读限制。

详细规则见 [references/test-procedures.md](references/test-procedures.md)。

## 接口调用链

已验证的真实执行链：

```text
select-form -> select-data 到 build 到 chat-stream
```

```text
POST /backend_api/lerwee/prompt-template/select-form
POST /backend_api/lerwee/prompt-template/select-data
POST /backend_api/lerwee/prompt-template/build
POST /backend_api/stream/lerwee/chat-stream
```

详细接口说明见 [references/runtime-api.md](references/runtime-api.md)。

## 代表性回归规则

- 同类对象存在异常监控状态：选 2 正常 + 2 异常。
- 无异常监控状态：选 4 个数据路径不同的正常对象。
- 单选场景分 4 次执行；多选场景可一次选 4 个。
- 每次必须打开"查看 CoT"。

## 通过标准

- 最终回答存在"处理结论"。
- 无 {#...} 残留表达式。
- 无 SQL 不合法或数据库方言错配。
- 告警列只使用近 7 天未恢复告警。
- Markdown 表格列数一致，无长破折号损坏。
- 数据不足时写"暂无法判断"，不伪造 P2。
- P0/P1 动作包含执行位置、确认条件和风险。

## 浏览器环境

详细环境配置见 [references/browser-env.md](references/browser-env.md)。

关键信息：

- Chromium 路径：C:\Users\chenhansheng\AppData\Local\ms-playwright\chromium-1217\chrome-win64\chrome.exe
- 1.79 CDP 端口：9322
- 3.92 CDP 端口：9323
- 3.92 profile：C:\Users\chenhansheng\.codex\browser\profile-392
- 启动前清残留 chrome 进程。

## 安全测试

仅用于验证 external_db 场景能否绕过只读限制。详细方案见 [references/security-testing.md](references/security-testing.md)。

分级：

- A 级：静态拦截，不调用 build。
- B 级：只读执行，加超时保护。
- C 级：隔离写入，仅影响专用测试表的 canary 行。

## 禁止

- 用 Codex 内置浏览器替代可见 Chromium 做最终验收。
- 同时启动多个使用同一 profile 的 Chromium。
- 只看最终回答不看 CoT。
- 高风险语句在真实数据库执行。
- 无变化重复执行整批场景。
- 把密码、令牌、Cookie 写入脚本或文档。