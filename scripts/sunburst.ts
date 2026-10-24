/**
 * Generate images with Sunburst (OpenAI gpt-image-2.5-sunburst) for Clearline's brand and site art.
 *
 *   bun scripts/sunburst.ts logo-horizon logo-spectrum ...
 *   bun scripts/sunburst.ts hero-texture --extra "a retake note"
 *
 * Each job's prompt is `scripts/sunburst/<name>.txt`, sent as written. Jobs with references go to
 * v1/images/edits conditioned on those files (repo paths); the rest go to v1/images/generations.
 * Takes land in `.sunburst/<name>-v<N>.png` (git-ignored); the ones we keep are copied into the repo
 * by hand. Every call appends one line (prompt file, model, size, usage, output hash, never the key)
 * to `docs/brand/sunburst-calls.jsonl`, which is the provenance log.
 *
 * Reads OPENAI_API_KEY from the environment and never prints it.
 */
import { createHash } from "node:crypto";
import { appendFileSync, existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { basename, join } from "node:path";

const MODEL = "gpt-image-2.5-sunburst";
const QUALITY = "medium";
const ROOT = process.cwd();
const PROMPTS = join(ROOT, "scripts", "sunburst");
const OUT = join(ROOT, ".sunburst");
const LOG = join(ROOT, "docs", "brand", "sunburst-calls.jsonl");
// USD per 1M tokens, from the gpt-image-2.5-sunburst model page (as used in LineCrush's turtle-town generator).
const PRICE = { textIn: 5, imageIn: 8, imageOut: 30 };

type Job = { size: string; refs?: string[] };

const JOBS: Record<string, Job> = {
  "logo-horizon": { size: "1024x1024" },
  "logo-spectrum": { size: "1024x1024" },
  "logo-lens": { size: "1024x1024" },
  "logo-c-line": { size: "1024x1024" },
  "logo-meniscus": { size: "1024x1024" },
  "logo-prism": { size: "1024x1024" },
  "logo-wordmark": { size: "1024x1024" },
  "logo-beacon": { size: "1024x1024" },
  "hero-meniscus": { size: "1536x1024" },
  "hero-spectrum": { size: "1536x1024" },
  "hero-glass": { size: "1536x1024" },
  "story-calm": { size: "1024x1536" },
  "story-spectrum": { size: "1024x1536" },
};

type Usage = {
  input_tokens_details?: { text_tokens?: number; image_tokens?: number };
  output_tokens?: number;
};

function cost(usage: Usage): number {
  const text = usage.input_tokens_details?.text_tokens ?? 0;
  const image = usage.input_tokens_details?.image_tokens ?? 0;
  const out = usage.output_tokens ?? 0;
  return Math.round(((text * PRICE.textIn + image * PRICE.imageIn + out * PRICE.imageOut) / 1e6) * 1e4) / 1e4;
}

function nextVersion(name: string): number {
  const taken = readdirSync(OUT)
    .map((file) => file.match(new RegExp(`^${name}-v(\\d+)\\.png$`))?.[1])
    .filter((v): v is string => v !== undefined)
    .map(Number);
  return taken.length ? Math.max(...taken) + 1 : 1;
}

async function run(key: string, name: string, extra: string): Promise<void> {
  const job = JOBS[name];
  let prompt = readFileSync(join(PROMPTS, `${name}.txt`), "utf8").trim();
  if (extra) prompt += `\n\n${extra}`;
  const refs = job.refs ?? [];
  const endpoint = refs.length ? "v1/images/edits" : "v1/images/generations";

  let body: BodyInit;
  const headers: Record<string, string> = { Authorization: `Bearer ${key}` };
  if (refs.length) {
    const form = new FormData();
    form.set("model", MODEL);
    form.set("prompt", prompt);
    form.set("size", job.size);
    form.set("quality", QUALITY);
    form.set("n", "1");
    for (const ref of refs) {
      form.append("image[]", new Blob([readFileSync(join(ROOT, ref))], { type: "image/png" }), basename(ref));
    }
    body = form;
  } else {
    headers["Content-Type"] = "application/json";
    body = JSON.stringify({ model: MODEL, prompt, size: job.size, quality: QUALITY, n: 1 });
  }

  const start = Date.now();
  let data: { data: { b64_json: string }[]; usage?: Usage } | undefined;
  for (let attempt = 0; attempt < 3; attempt++) {
    const res = await fetch(`https://api.openai.com/${endpoint}`, { method: "POST", headers, body });
    if (res.ok) {
      data = await res.json();
      break;
    }
    const detail = (await res.text()).slice(0, 400);
    if (res.status < 500 || attempt === 2) throw new Error(`${name}: HTTP ${res.status} ${detail}`);
    await new Promise((resolve) => setTimeout(resolve, 5000 * (attempt + 1)));
  }
  if (!data) throw new Error(`${name}: no response`);

  const png = Buffer.from(data.data[0].b64_json, "base64");
  const version = nextVersion(name);
  const out = join(OUT, `${name}-v${version}.png`);
  writeFileSync(out, png);
  const usage = data.usage ?? {};
  const record = {
    call: `${name}-v${version}`,
    at: new Date().toISOString(),
    seconds: Math.round((Date.now() - start) / 100) / 10,
    endpoint,
    model: MODEL,
    size: job.size,
    quality: QUALITY,
    promptFile: `scripts/sunburst/${name}.txt`,
    extraPrompt: extra,
    references: refs,
    usage,
    costUsd: cost(usage),
    outputSha256: createHash("sha256").update(png).digest("hex"),
  };
  appendFileSync(LOG, JSON.stringify(record) + "\n");
  console.log(`[done] ${basename(out)} $${record.costUsd}`);
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const extraAt = args.indexOf("--extra");
  const extra = extraAt >= 0 ? (args[extraAt + 1] ?? "") : "";
  const names = extraAt >= 0 ? args.slice(0, extraAt) : args;
  const unknown = names.filter((n) => !(n in JOBS));
  if (!names.length || unknown.length) {
    console.error(`usage: bun scripts/sunburst.ts <${Object.keys(JOBS).join("|")}>... [--extra "note"]`);
    process.exit(1);
  }
  const key = process.env.OPENAI_API_KEY?.trim();
  if (!key) throw new Error("OPENAI_API_KEY is not set");
  mkdirSync(OUT, { recursive: true });
  if (!existsSync(join(ROOT, "docs", "brand"))) mkdirSync(join(ROOT, "docs", "brand"), { recursive: true });
  const results = await Promise.allSettled(names.map((name) => run(key, name, extra)));
  for (const r of results) if (r.status === "rejected") console.error(String(r.reason));
}

await main();
