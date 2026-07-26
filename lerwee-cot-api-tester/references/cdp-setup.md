
# CDP 环境配置

## Chromium 路径

C:UserschenhanshengAppDataLocalms-playwrightchromium-1217chrome-win64chrome.exe

## CDP 端口分配

| 平台 | 地址 | CDP 端口 | Profile 目录 |
|---|---|---|---|
| 1.79 | http://192.168.1.79:8180 | 9322 | C:Userschenhansheng.codexrowserprofile-179 |
| 3.92 | http://192.168.3.92 | 9323 | C:Userschenhansheng.codexrowserprofile-392 |

## 启动方式

使用已验证的 Python 启动脚本，会启动可见 Chromium 并监听 CDP 端口：

    python tools/start-detached-visible-179.py
    python tools/start-detached-visible-392.py

## 登录要求

CDP 连接后会从 localStorage 读取 accessToken。必须先在浏览器中手动登录乐维平台，确保页面停留在乐维域名下。

如果 token 过期，API 调用会返回 401。此时在浏览器重新登录即可，脚本不需要修改。

## 残留进程清理

启动前清理残留 Chrome 进程（注意不要关闭正在使用的浏览器）：

    taskkill /F /IM chrome.exe

## 验证 CDP 可用

    curl http://127.0.0.1:9322/json/version

返回 JSON 包含 webSocketDebuggerUrl 即表示 CDP 端口可用。
