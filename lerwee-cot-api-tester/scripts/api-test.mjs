
/**
 * 乐维 CoT 场景纯接口测试器 v2
 * CDP 提取 token + page.evaluate 发请求，天然解决 Cookie/跨域/Host
 */
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const { chromium } = require("C:/Users/chenhansheng/AppData/Local/npm-cache/_npx/9833c18b2d85bc59/node_modules/playwright");
const fs = require("node:fs");

// ---------- 参数 ----------
const args = process.argv.slice(2);
const getArg = (n) => { const i = args.indexOf("--" + n); return i >= 0 ? args[i + 1] : null; };
const hasFlag = (n) => args.includes("--" + n);
const cdpUrl = getArg("cdp") || "http://127.0.0.1:9322";
const sceneName = getArg("scene");
const objectsArg = getArg("objects") || "";
const isMulti = hasFlag("multi");
const listOnly = hasFlag("list-only");
const listScenes = hasFlag("list-scenes");
const timeoutSec = Number(getArg("timeout") || 120);
const outDir = getArg("out") || "C:/Users/chenhansheng/Documents/乐维线下培训方案输出/api-test-results";

// ---------- CDP 连接 + page 上下文 ----------
async function connect() {
  const browser = await chromium.connectOverCDP(cdpUrl);
  const ctx = browser.contexts()[0];
  let page = ctx.pages().find(p => /192.168./.test(p.url())) || ctx.pages()[0];
  if (!page) page = await ctx.newPage();
  const baseUrl = await page.evaluate(() => location.origin);
  const token = await page.evaluate(() => localStorage.getItem("accessToken") || "");
  if (!token) throw new Error("CDP 页面未找到 accessToken，请确认浏览器已登录乐维平台");
  return { browser, page, baseUrl, token };
}

// ---------- 在浏览器环境内发请求 ----------
async function apiGet(page, token, path) {
  return await page.evaluate(async ({ t, p }) => {
    const res = await fetch(p, { headers: { Authorization: "Bearer " + t, "x-requested-with": "XMLHttpRequest" } });
    const text = await res.text();
    let json; try { json = JSON.parse(text); } catch { json = null; }
    return { status: res.status, json, text };
  }, { t: token, p: path });
}

async function apiPost(page, token, path, body) {
  return await page.evaluate(async ({ t, p, b }) => {
    const res = await fetch(p, { method: "POST", headers: { "Content-Type": "application/json", Authorization: "Bearer " + t, "x-requested-with": "XMLHttpRequest" }, body: JSON.stringify(b) });
    const text = await res.text();
    let json; try { json = JSON.parse(text); } catch { json = null; }
    return { status: res.status, json, text };
  }, { t: token, p: path, b: body });
}

// ---------- SSE 流读取 ----------
async function streamChat(page, token, path, body, timeoutMs) {
  return await page.evaluate(async ({ t, p, b, timeoutMs }) => {
    const res = await fetch(p, { method: "POST", headers: { "Content-Type": "application/json", Authorization: "Bearer " + t, "x-requested-with": "XMLHttpRequest", Accept: "text/event-stream" }, body: JSON.stringify(b) });
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let reasoning = "", answer = "", sessionId = "", error = "";
    let buffer = "";
    const deadline = Date.now() + timeoutMs;
    while (Date.now() < deadline) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop();
      for (const line of lines) {
        if (!line.startsWith("data:")) continue;
        const payload = line.slice(5).trim();
        if (!payload || payload === "[DONE]") continue;
        try {
          const evt = JSON.parse(payload);
          if (evt.session_id) sessionId = evt.session_id;
          if (evt.type === "reasoning" || evt.reasoning) reasoning += evt.reasoning || evt.content || "";
          if (evt.type === "message" || evt.type === "answer" || evt.answer || evt.content) answer += evt.answer || evt.content || "";
          if (evt.type === "error") error = evt.message || evt.error || "stream_error";
        } catch {}
      }
    }
    return { answer, reasoning, sessionId, error, status: res.status };
  }, { t: token, p: path, b: body, timeoutMs });
}

// ---------- 业务函数 ----------
function parseList(res) {
  const d = res.json?.data;
  if (!d) return [];
  if (Array.isArray(d)) return d;
  return d.rows || d.list || [];
}

async function findSceneId(page, token, name) {
  const res = await apiGet(page, token, "/backend_api/lerwee/prompt-template/list?page=1&pageSize=200");
  const list = parseList(res);
  const match = list.find(s => (s.name || "").includes(name));
  if (!match) {
    console.log("可用场景:");
    for (const s of list) console.log("  -", s.id, s.name);
    throw new Error("未找到场景: " + name);
  }
  return match.id;
}

async function getTemplate(page, token, sceneId) {
  const res = await apiGet(page, token, "/backend_api/lerwee/prompt-template/view?id=" + sceneId);
  return res.json?.data?.content || res.json?.data?.text || res.json?.data?.prompt || "";
}

// ---------- 自动检查 ----------
function autoCheck(answer, reasoning) {
  const issues = [];
  if (!answer || answer.length < 50) issues.push("最终回答过短或为空");
  if (!answer.includes("处理结论")) issues.push("缺少处理结论");
  if (answer.includes("{#")) issues.push("最终回答有残留表达式");
  if (reasoning.includes("SQL不合法") || reasoning.includes("SQL 不合法")) issues.push("CoT 中有 SQL 不合法错误");
  if (reasoning.includes("表达式未解析")) issues.push("表达式未解析");
  if (answer.includes("\uff1f\uff1f") || answer.includes("???")) issues.push("有乱码问号");
  return issues;
}

// ---------- 主流程 ----------
async function main() {
  console.log("=== 乐维 CoT 纯接口测试器 ===");
  console.log("CDP:", cdpUrl);
  const { browser, page, baseUrl, token } = await connect();
  console.log("平台:", baseUrl, "| token:", token.slice(0, 12) + "...");

  if (listScenes) {
    const res = await apiGet(page, token, "/backend_api/lerwee/prompt-template/list?page=1&pageSize=200");
    const list = parseList(res);
    console.log("\n场景列表 (" + list.length + " 个):");
    for (const s of list) console.log("  " + s.id + "\t" + s.name);
    await browser.close();
    return;
  }

  if (!sceneName) {
    console.log("用法: node api-test.mjs --cdp <url> --scene <名称> [--objects <逗号>] [--multi] [--list-only] [--list-scenes]");
    await browser.close();
    return;
  }

  console.log("场景:", sceneName, "| 对象:", objectsArg || "(仅列表)");
  const sceneId = await findSceneId(page, token, sceneName);
  console.log("场景ID:", sceneId);

  const template = await getTemplate(page, token, sceneId);
  if (!template) throw new Error("场景模板为空");
  console.log("模板长度:", template.length);

  const sdRes = await apiPost(page, token, "/backend_api/lerwee/prompt-template/select-data", { text: template });
  const sd = sdRes.json?.data || {};
  const expressions = sd.selectExpressions || [];
  console.log("\n候选表达式:");
  for (const expr of expressions) {
    const rows = expr.data?.rows || expr.rows || expr.candidates || [];
    console.log("  ID:" + expr.id + " 类型:" + expr.alias + " 候选数:" + rows.length);
  }

  if (listOnly) {
    for (const expr of expressions) {
      const rows = expr.data?.rows || [];
      console.log("\n表达式 " + expr.id + " (" + expr.alias + ") 候选:");
      for (const row of rows) {
        console.log("  " + (row.hostname || row.name || "") + " | " + (row.ip || "") + " | " + (row.active_label || "") + " | " + (row.power_label || ""));
      }
    }
    await browser.close();
    return;
  }

  const objectNames = objectsArg.split(",").map(s => s.trim()).filter(Boolean);
  if (!objectNames.length) throw new Error("未指定测试对象，请用 --objects 传参");
  const selections = {};
  for (const expr of expressions) {
    const exprId = expr.id;
    const rows = expr.data?.rows || [];
    const matched = [];
    for (const row of rows) {
      const rowText = [row.hostname, row.ip, row.name, row.active_label].filter(Boolean).join(" ");
      if (objectNames.some(n => rowText.includes(n))) matched.push(row);
    }
    if (matched.length) selections[exprId] = isMulti ? matched : [matched[0]];
  }
  console.log("\n选中:", JSON.stringify(Object.fromEntries(Object.entries(selections).map(([k, v]) => [k, v.length + "个"]))));

  const buildRes = await apiPost(page, token, "/backend_api/lerwee/prompt-template/build", { text: template, selections });
  const builtPrompt = buildRes.json?.data?.output || buildRes.json?.data || "";
  console.log("build 输出长度:", builtPrompt.length);

  console.log("\n等待模型回答 (超时 " + timeoutSec + "s)...");
  const { answer, reasoning, sessionId, error } = await streamChat(page, token, "/backend_api/stream/lerwee/chat-stream", { message: builtPrompt, prompt_id: "", session_id: "", template_id: String(sceneId) }, timeoutSec * 1000);
  console.log("session:", sessionId, error ? "| 错误: " + error : "");

  const issues = autoCheck(answer, reasoning);
  console.log("\n=== 测试结果 ===");
  console.log("回答长度:", answer.length, "| CoT 长度:", reasoning.length);
  console.log("自动检查:", issues.length ? issues.length + " 个问题" : "通过");
  for (const i of issues) console.log("  [!] " + i);

  const ts = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
  const slug = sceneName.replace(/[\\/]/g, "_").slice(0, 30);
  const resultFile = outDir + "/api-test-" + slug + "-" + ts + ".json";
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(resultFile, JSON.stringify({ sceneName, sceneId, baseUrl, objects: objectNames, multi: isMulti, timestamp: ts, sessionId, error, answerLength: answer.length, reasoningLength: reasoning.length, issues, answer, reasoning }, null, 2), "utf8");
  console.log("\n结果已保存:", resultFile);
  console.log("\n=== 最终回答预览 ===");
  console.log(answer.slice(0, 500) + (answer.length > 500 ? "..." : ""));

  await browser.close();
}

main().catch(e => { console.error("FATAL:", e.message); process.exit(1); });
