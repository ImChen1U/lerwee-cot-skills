
# 用法详解

## 命令参数

| 参数 | 必需 | 说明 |
|---|---|---|
| --cdp | 是 | CDP 连接地址，如 http://127.0.0.1:9322 |
| --scene | 否 | 场景名称（模糊匹配），不传时配合 --list-scenes |
| --objects | 否 | 对象名称列表，逗号分隔 |
| --multi | 否 | 多选模式（多选场景用） |
| --list-only | 否 | 只列候选对象，不执行测试 |
| --list-scenes | 否 | 只列所有场景名 |
| --timeout | 否 | chat-stream 超时秒数，默认 120 |
| --out | 否 | 结果输出目录，默认 api-test-results |

## 场景选择策略

### 多选场景（主机类）

选 4 个代表对象，有异常监控状态时选 2 正常 + 2 异常：

    node scripts/api-test.mjs --cdp http://127.0.0.1:9322 --scene "主机CPU与负载压力分析" --objects "obj1,obj2,obj3,obj4" --multi

### 单选场景（数据库类）

逐个对象测试，每次传一个：

    node scripts/api-test.mjs --cdp http://127.0.0.1:9323 --scene "PostgreSQL连接压力" --objects "监控系统-PostgreSQL"

### 只看候选对象不执行

先用 --list-only 确认有哪些对象可选：

    node scripts/api-test.mjs --cdp http://127.0.0.1:9322 --scene "主机CPU" --list-only

## 输出说明

控制台输出包含：
- token 提取状态（只显示前 12 字符）
- 场景ID 和模板长度
- 候选对象表达式列表
- 选中对象数量
- build 输出长度
- chat-stream session ID
- 最终回答长度和 CoT 长度
- 自动检查问题列表
- 最终回答预览（前 500 字）
- 结果文件路径

JSON 结果文件包含完整回答和 CoT 全文，可用于后续分析。
