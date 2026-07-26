---
name: lerwee-cot-scenario-builder
description: 乐维 AI 运维 CoT 场景从设计、开发、平台同步到 PromptHub 发布的完整制作流程。用于创建 MySQL/PostgreSQL/Nginx/主机等故障诊断、慢查询分析、连接压力分析、批量巡检等场景模板。涵盖表达式语法、输出标准化、风险分级、处置安全、平台创建、README/ZIP 打包和在线表格同步。触发词：做场景、新建场景、CoT 场景、场景模板、乐维场景、诊断场景、创建 CoT、场景开发。
---

# 乐维 CoT 场景制作

## 适用范围

本 skill 用于在乐维运维智能体平台创建或修复 AI 诊断场景（CoT 模板）。覆盖 MySQL、PostgreSQL、Nginx、主机、中间件和业务监控等对象的故障根因诊断、专项分析和批量巡检。

不用于普通聊天提示词、纯文本 Prompt 或与平台表达式无关的 AI 对话配置。

## 制作流程

1. 确认场景目标、适用对象和数据来源。
2. 编写 CoT 模板，按标准化输出格式设计。
3. 静态检查表达式语法、driver、rel、危险 SQL 和通用性。
4. 通过平台接口创建或更新场景，回读确认。
5. 交付测试：4 个代表对象执行，检查最终回答和 CoT。
6. 生成 README 和 ZIP，同步 PromptHub 和在线表格。

测试与验证使用 `lerwee-cot-scenario-testing`。

## 表达式语法

详细规则见 [references/expression-rules.md](references/expression-rules.md)。

核心表达式类型：

```text
{#host[subtype="子类型", groupid="分组ID"] | select:"single|multi" | id:"001"}
{#metric[...] | id:"002"}
{#alert[...] | id:"003"}
{#external_db[driver="mysql|pgsql", query="SELECT ...", rel="001"] | id:"004"}
{#automation[execution_mode="direct_script", script_type="1", script_content="...", rel="001"] | id:"005"}
```

关键规则：

- PostgreSQL 用 `driver="pgsql"`，MySQL 用 `driver="mysql"`。
- 不固定 `source_id`、IP、数据库名、账号或安装路径。
- `rel` 指向对象选择表达式的 ID。
- 操作系统自动化关联操作系统主机，不直接关联数据库或中间件对象。
- 指标名称必须核对平台模板中的真实映射名称，不得臆造。

## 输出标准化

完整标准见 [references/output-standard.md](references/output-standard.md)。

必须有：根因判定、关键证据、处理结论。

风险等级：

| 等级 | 含义 | 处理 |
|---|---|---|
| P0 | 紧急处理 | 立即处理 |
| P1 | 需要关注 | 人工检查并按制度处理 |
| P2 | 当前正常 | 无需立即处理 |

## 模板

场景 README 使用 [assets/scenario-readme-template.md](assets/scenario-readme-template.md)。

## 平台同步

详细流程见 [references/platform-sync.md](references/platform-sync.md)。

## 禁止

- 写入密码、令牌、Cookie 或内部固定 IP。
- 固定数据源 ID、数据库名、表名和安装路径。
- 未经测试直接同步或发布。
- 覆盖已有的不同场景。
- 为凑格式输出空表或无信息章节。