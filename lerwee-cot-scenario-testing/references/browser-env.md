# 浏览器测试环境

## Chromium

C:\Users\chenhansheng\AppData\Local\ms-playwright\chromium-1217\chrome-win64\chrome.exe

不用系统 Chrome（会崩溃）。不用 Codex 内置浏览器做最终验收。

## 持久化 profile

| 环境 | profile 目录 | CDP 端口 |
|---|---|---|
| 1.79 | C:\Users\chenhansheng\.codex\browser\profile-179 | 9322 |
| 3.92 | C:\Users\chenhansheng\.codex\browser\profile-392 | 9323 |

同一 profile 只允许一个 Chromium 进程占用。

## 启动方式

1. 启动前清残留：Get-Process chrome | Stop-Process -Force
2. 用 launchPersistentContext 启动，指定 executablePath 和 profile 目录。
3. 开启 CDP 端口。
4. 登录态有效直接复用，失效时用环境变量传入账密登录。
5. 启动后保持运行，测试期间不关闭。

## CDP 连接检查

Invoke-RestMethod http://127.0.0.1:9322/json/version

返回版本和 webSocketDebuggerUrl 才表示可连接。

## 常见问题

- 系统 Chrome 崩溃：旧 profile 与新版 chromium 不兼容，用全新空 profile。
- node_repl const 残留：用 globalThis 存长期变量，局部变量用块作用域。
- iframe 取不到：用 page.frames() 不是 ctx.frames()。
- 启动报 Browser is already in use：先 taskkill 清残留。

## 已验证脚本

C:\Users\chenhansheng\Documents\乐维线下培训方案输出\tools\open-392-session.mjs
C:\Users\chenhansheng\Documents\乐维线下培训方案输出\tools\test-392-batch-worker.mjs
C:\Users\chenhansheng\Documents\乐维线下培训方案输出\tools\discover-scene-runtime-api.mjs