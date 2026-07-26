# 乐维 CoT 场景制作与测试验证 Skill 套件

本仓库包含两个 Codex Skill，用于乐维运维智能体平台的 AI 场景（CoT）开发和测试。

## Skill 列表

### lerwee-cot-scenario-builder

场景制作。覆盖从设计、CoT 编写、表达式检查、平台创建更新到 README/ZIP 打包和 PromptHub 发布的完整流程。

适用场景：MySQL、PostgreSQL、Nginx、主机、中间件和业务监控的故障根因诊断、慢查询分析、连接压力分析和批量巡检。

包含：

- 表达式语法规则（host、metric、alert、external_db、automation）
- 输出标准化（根因判定、关键证据、处理结论、风险分级）
- 平台同步流程（签名接口、回读确认、PromptHub、在线表格）
- README 模板

### lerwee-cot-scenario-testing

场景测试。覆盖接口回归、浏览器冒烟、代表性回归和数据源安全测试。

包含：

- 运行时接口调用链（select-form -> select-data -> build -> chat-stream）
- 4 对象代表性回归规则（2 正常 + 2 异常）
- 浏览器环境配置（Chromium、CDP、profile、常见问题）
- external_db 安全测试方案（A/B/C 分级）

### lerwee-cot-scenario-sync

场景同步发布。场景测试通过后同步到平台、PromptHub 和在线表格。

包含：

- 平台回读确认（1.79 / 3.92）
- README 和 ZIP 生成（使用原 UUID）
- PromptHub 上传和版本管理
- 企业微信在线表格更新和回读验收

## 安装

将两个目录复制到 Codex skills 目录：

```powershell
Copy-Item -LiteralPath ".\lerwee-cot-scenario-builder" -Destination "$env:USERPROFILE\.codex\skills" -Recurse -Force
Copy-Item -LiteralPath ".\lerwee-cot-scenario-testing" -Destination "$env:USERPROFILE\.codex\skills" -Recurse -Force
```

Codex 重启后自动发现。

## 使用

在 Codex 对话中说：

- "做一个 MySQL 慢查询分析场景" -> 自动触发 builder
- "测试这个场景" -> 自动触发 testing
- "同步到 PromptHub" -> 自动触发 sync
- "修复 Nginx 场景" -> 自动触发 builder
- "验证 PostgreSQL 场景的 CoT" -> 自动触发 testing

也可以显式调用：

- `$lerwee-cot-scenario-builder`
- `$lerwee-cot-scenario-testing`
- `$lerwee-cot-scenario-sync`

## 环境要求

- 乐维运维智能体平台（1.79 或 3.92 测试环境）
- PromptHub（8.97）
- 可见 Chromium + Playwright（用于浏览器测试）
- 平台 API Secret（通过环境变量传入，不写入文件）

## 安全

- API Secret、账号密码、Cookie 和 Token 不写入脚本、文档、日志或 Git。
- external_db 只允许只读 SQL。
- automation 只允许只读采集命令。
- 危险命令在保存和执行前同时拦截。
