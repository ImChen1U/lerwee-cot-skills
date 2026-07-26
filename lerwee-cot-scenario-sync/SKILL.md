---
name: lerwee-cot-scenario-sync
description: 乐维 CoT 场景测试通过后的同步发布流程。覆盖平台同步回读、README 和 ZIP 生成、PromptHub 上传版本、企业微信在线表格更新和最终验收。用于场景测试通过后发布到所有交付渠道。触发词：同步场景、发布场景、上传 PromptHub、更新在线表格、场景同步、场景发布、打包场景、生成 ZIP、生成 README。
---

# 乐维 CoT 场景同步发布

## 适用范围

场景已通过测试（使用 lerwee-cot-scenario-testing 验证），需要同步到所有交付渠道时使用。

不用于场景制作或测试，前置步骤必须已完成。

## 同步目标

1. 平台回读确认（1.79 / 3.92）
2. README 生成
3. ZIP 打包
4. PromptHub 上传和版本管理
5. 企业微信在线表格更新

详细流程见 [references/sync-procedures.md](references/sync-procedures.md)。

## 执行前提

- 场景已通过 4 对象测试。
- 用户已确认平台测试结果。
- 有更新前快照。
- 标准 CoT 源文件已定稿。
- 场景 UUID 已知。

## 执行顺序

1. 确认平台场景正文与标准源逐字一致。
2. 生成 README（使用 builder 的模板）。
3. 打包 ZIP（CoT + README，使用原 UUID）。
4. 上传 PromptHub：只替换目标 Prompt 的 README 和 ZIP。
5. 更新在线表格：按场景名称或 UUID 原行更新。
6. 全部回读验收。

## 禁止

- 在用户确认测试通过前执行任何同步。
- 覆盖不同场景。
- 新增重复行。
- 把密码、令牌、Cookie 写入脚本或文档。
- 跳过回读验证。

## 完成标准

- 平台正文与标准源一致。
- README 内容与 CoT 匹配。
- ZIP 内文件完整，使用原 UUID。
- PromptHub README 预览正确，ZIP 下载 SHA-256 匹配。
- 在线表格原行更新，无重复，无格式差异。
- 测试列保持空白。
- 所有步骤有记录，已通过的步骤不重复执行。