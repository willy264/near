import * as d3 from "d3";
import deployment from "../../../deployments/testnet.json";
import {
  runEvidenceSchema,
  type RunEvidence,
} from "../../shared/src/schemas.ts";
import { type Obligation } from "../../shared/src/model.ts";
import { planClearing } from "../../solver/src/index.ts";
import { liveSnapshot } from "./rpc.ts";
import "./style.css";
import { ROLES, FIRMS } from "../../sim/src/local.ts";
function roleLabel(account: string) {
  const m = /^(agent|firm)-(\d+)\./.exec(account);
  if (!m) return account.split(".")[0];
  const index = Number(m[2]) - 1;
  return (
    (m[1] === "firm" ? FIRMS[index] : ROLES[Math.floor(index / 2)]) ??
    account.split(".")[0]
  );
}
const app = document.querySelector<HTMLDivElement>("#app")!;
app.innerHTML = `<header><a class="wordmark" href="#">Untangle<span aria-hidden="true">↗</span></a><span class="badge">NEAR TESTNET · tUSD IS A TEST TOKEN</span><a href="https://github.com/willy264/near">Source ↗</a></header><main><section class="intro"><p class="eyebrow">A ledger for obligations that go both ways</p><h1>Clear the circle.<br><em>Pay what remains.</em></h1><p>Creditors issue. Debtors accept. Anyone can find a debt cycle; the contract verifies it and reduces every edge. Only the residue needs payment.</p><p class="small">Scripted, simulated agents and fictional firms. No LLM calls. No real money.</p></section><nav class="tabs" aria-label="Recorded scenario"><button data-scenario="agents" aria-pressed="true">Agents</button><button data-scenario="firms" aria-pressed="false">Small firms</button><button data-scenario="random" aria-pressed="false">Random control</button><button data-scenario="supply-chain" aria-pressed="false">Supply-chain control</button></nav><section class="workspace"><div class="graph-area"><div class="graph-heading"><h2 id="graph-title">Recorded obligations</h2><button id="live">Load live state ↗</button></div><p id="source" class="small" role="status">Loading saved evidence…</p><svg id="graph" viewBox="0 0 900 520" aria-labelledby="graph-title" role="img"></svg><p id="empty" hidden>No open obligations at this stage.</p><p class="small">Arrow: debtor → creditor · Thicker edge: more remaining · Focus or hover for details</p><label class="timeline" for="stage">Replay stage <strong id="stage-name">Trading</strong></label><input id="stage" type="range" min="0" max="2" value="0" step="1"><div class="stage-labels"><span>Trading</span><span>Clearing</span><span>Settlement</span></div><div id="tx-links" class="small"></div></div><aside><p class="eyebrow">tUSD · TEST TOKEN · NO VALUE</p><div id="numbers" aria-live="polite"></div><p id="payment-note" class="small"></p><button id="dry">Dry-run clearing on live state</button><p id="dry-result" class="small" role="status">Runs locally in this browser. No wallet and no transaction.</p></aside></section><section class="how"><h2>Four steps. One unchanged net position.</h2><ol><li><strong>Issue & accept</strong><p>Both sides acknowledge a debt. An operator sets each debtor’s cap.</p></li><li><strong>Find a cycle</strong><p>A scripted solver finds a closed chain of accepted obligations.</p></li><li><strong>Verify & clear</strong><p>The contract checks each edge and cancels a common amount. No tokens move.</p></li><li><strong>Pay the residue</strong><p>Debtors pay the remainder; creditors withdraw their credited test tokens.</p></li></ol><p>Agent keys can issue, accept, reject and cancel. They cannot attach deposits, transfer tokens, withdraw, or change debt caps.</p></section></main><footer><p>Prior art: <a href="https://cycles.money">Cycles</a>, Ledgerloops, and traditional clearing houses. Untangle does not claim to invent netting.</p><p>Public debts; operator-held upgrade keys; greedy solver; testnet only. Built for NEAR HACKATHON 2026.</p><a id="contract-link">View testnet contract ↗</a></footer>`;
const el = <T extends HTMLElement>(id: string) =>
  document.getElementById(id) as T;
const contractLink = el<HTMLAnchorElement>("contract-link");
contractLink.href = `https://testnet.nearblocks.io/address/${deployment.ledger}`;
const format = (n: string | number | bigint) => {
  const value = BigInt(n);
  return `${(value / 1_000_000n).toLocaleString()}${
    value % 1_000_000n
      ? "." +
        String(value % 1_000_000n)
          .padStart(6, "0")
          .replace(/0+$/, "")
      : ""
  }`;
};
let runs: Record<string, { file: string; run: RunEvidence }> = {},
  scenario = "agents";
let simulation: d3.Simulation<d3.SimulationNodeDatum, undefined> | undefined;
function draw(edges: Obligation[]) {
  simulation?.stop();
  const svg = d3.select("#graph");
  const width = Math.max(280, document.getElementById("graph")!.clientWidth);
  const height = width < 600 ? 420 : 520;
  svg.attr("viewBox", `0 0 ${width} ${height}`);
  svg.selectAll("*").remove();
  el("empty").hidden = edges.length !== 0;
  svg
    .append("defs")
    .append("marker")
    .attr("id", "arrow")
    .attr("viewBox", "0 -5 10 10")
    .attr("refX", 23)
    .attr("refY", 0)
    .attr("markerWidth", 5)
    .attr("markerHeight", 5)
    .attr("orient", "auto")
    .append("path")
    .attr("d", "M0,-5L10,0L0,5")
    .attr("fill", "currentColor");
  const names = [
    ...new Set(edges.flatMap((o) => [o.debtor, o.creditor])),
  ].sort();
  type Node = d3.SimulationNodeDatum & { id: string };
  type Link = d3.SimulationLinkDatum<Node> & { o: Obligation };
  const nodes: Node[] = names.map((id, i) => ({
    id,
    x: width / 2 + width * 0.3 * Math.cos((2 * Math.PI * i) / names.length),
    y: height / 2 + height * 0.3 * Math.sin((2 * Math.PI * i) / names.length),
    ...(width < 600
      ? {
          fx: 50 + ((i % 3) * (width - 100)) / 2,
          fy: 45 + Math.floor(i / 3) * 95,
        }
      : {}),
  }));
  const links: Link[] = edges.map((o) => ({
    source: o.debtor,
    target: o.creditor,
    o,
  }));
  const max = edges.reduce((n, o) => (o.remaining > n ? o.remaining : n), 1n);
  const paths = svg
    .append("g")
    .attr("class", "edges")
    .selectAll("path")
    .data(links)
    .join("path")
    .attr("marker-end", "url(#arrow)")
    .attr("tabindex", 0)
    .attr("role", "img")
    .attr(
      "aria-label",
      (d) =>
        `${d.o.debtor} owes ${d.o.creditor}: ${format(d.o.remaining)} test tUSD`,
    )
    .attr(
      "stroke-width",
      (d) => 1 + Number((d.o.remaining * 400n) / max) / 100,
    );
  paths
    .append("title")
    .text(
      (d) =>
        `Obligation ${d.o.id}: ${d.o.debtor} → ${d.o.creditor}\n${format(d.o.remaining)} tUSD (test token)\n${d.o.memo}`,
    );
  const groups = svg.append("g").selectAll("g").data(nodes).join("g");
  groups
    .attr("tabindex", 0)
    .attr("role", "img")
    .attr("aria-label", (d) => `${d.id}: ${roleLabel(d.id)}`)
    .append("title")
    .text((d) => `${d.id}: ${roleLabel(d.id)}`);
  groups.append("circle").attr("r", 17);
  groups
    .append("text")
    .attr("y", 35)
    .attr("text-anchor", "middle")
    .style("font-size", width < 600 ? "10px" : "12px")
    .text((d) => roleLabel(d.id));
  const force = d3
    .forceSimulation(nodes)
    .force(
      "link",
      d3
        .forceLink<Node, Link>(links)
        .id((d) => d.id)
        .distance(width < 600 ? 100 : 150)
        .strength(0.12),
    )
    .force("charge", d3.forceManyBody().strength(width < 600 ? -180 : -450))
    .force("center", d3.forceCenter(width / 2, height / 2))
    .force("collision", d3.forceCollide(width < 600 ? 32 : 40));
  const tick = () => {
    nodes.forEach((n) => {
      n.x = Math.max(35, Math.min(width - 35, n.x!));
      n.y = Math.max(40, Math.min(height - 55, n.y!));
    });
    groups.attr("transform", (d) => `translate(${d.x},${d.y})`);
    paths.attr("d", (d) => {
      const a = d.source as Node,
        b = d.target as Node;
      const dx = b.x! - a.x!,
        dy = b.y! - a.y!,
        r = Math.hypot(dx, dy) * 1.5;
      return `M${a.x},${a.y}A${r},${r} 0 0,1 ${b.x},${b.y}`;
    });
  };
  force.on("tick", tick);
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
    force.stop();
    force.tick(150);
    tick();
  }
  simulation = force as unknown as typeof simulation;
}
function numbers(stats: Record<string, string | number>, run?: RunEvidence) {
  const grid = el("numbers");
  grid.replaceChildren();
  for (const [label, key] of [
    ["Accepted", "accepted_total"],
    ["Cleared without transfers", "cleared_total"],
    ["Settled by payment", "settled_total"],
    ["Outstanding", "outstanding_total"],
  ]) {
    const row = document.createElement("div");
    row.className = "metric";
    const title = document.createElement("span"),
      value = document.createElement("strong");
    title.textContent = label;
    value.textContent = format(stats[key]);
    row.append(title, value);
    if (key === "cleared_total") {
      const ratio = document.createElement("small");
      ratio.textContent = `${Number(stats.cleared_ratio_bps) / 100}% of accepted`;
      row.append(ratio);
    }
    grid.append(row);
  }
  el("payment-note").textContent = run
    ? `${run.payments} debtor payments for ${run.acceptedCount} accepted obligations, plus ${run.withdrawals} creditor withdrawals. Counts describe the full recorded run.`
    : "Live lifetime totals include test benchmarks. They are not the selected simulation’s results.";
}
function recorded() {
  const item = runs[scenario];
  if (!item) {
    el("source").textContent = "No saved evidence for this scenario yet.";
    draw([]);
    return;
  }
  const index = Number(el<HTMLInputElement>("stage").value),
    stage = item.run.stages[index];
  el("source").textContent =
    `Recorded ${item.run.parameters.mode} simulation · seed ${item.run.parameters.seed} · ${item.run.parameters.rounds} rounds · ${item.file}`;
  el("graph-title").textContent =
    scenario === "firms"
      ? "Fictional firms — recorded obligations"
      : "Recorded obligations";
  el("stage-name").textContent = stage.name;
  el<HTMLInputElement>("stage").disabled = false;
  draw(
    stage.fixture.obligations.map((o) => ({
      ...o,
      amount: BigInt(o.amount),
      remaining: BigInt(o.remaining),
      storage_fee: BigInt(o.storage_fee),
    })),
  );
  numbers(stage.fixture.stats, item.run);
  const links = el("tx-links");
  links.replaceChildren();
  for (const tx of item.run.transactions
    .filter((t) =>
      index === 1
        ? t.method === "submit_clearing"
        : index === 2
          ? ["ft_transfer_call", "withdraw"].includes(t.method)
          : ["issue_many", "accept_many"].includes(t.method),
    )
    .slice(-8)) {
    const a = document.createElement("a");
    a.href = `https://testnet.nearblocks.io/txns/${tx.hash}`;
    a.textContent = `${tx.method} ↗ `;
    links.append(a);
  }
  if (!item.run.transactions.length)
    links.textContent = "Local simulation: no on-chain transaction links.";
}
document
  .querySelectorAll<HTMLButtonElement>("[data-scenario]")
  .forEach((button) =>
    button.addEventListener("click", () => {
      scenario = button.dataset.scenario!;
      document
        .querySelectorAll("[data-scenario]")
        .forEach((b) => b.setAttribute("aria-pressed", String(b === button)));
      recorded();
    }),
  );
el("stage").addEventListener("input", recorded);
el("live").addEventListener("click", async () => {
  el("source").textContent = "Loading finalized testnet state…";
  try {
    const snapshot = await liveSnapshot();

    el("source").textContent =
      `LIVE testnet · finalized block ${snapshot.block}`;
    el("graph-title").textContent = "Live open obligations";
    el<HTMLInputElement>("stage").disabled = true;
    el("tx-links").textContent =
      "Live graph is a contract snapshot; replay uses the saved evidence.";
    draw(snapshot.edges);
    numbers(snapshot.stats);
  } catch {
    recorded();
    el("source").textContent =
      "RPC unavailable — showing clearly labeled recorded simulation data.";
  }
});
el("dry").addEventListener("click", async () => {
  const button = el<HTMLButtonElement>("dry");
  button.disabled = true;
  el("dry-result").textContent = "Fetching live state for dry-run…";
  try {
    const snapshot = await liveSnapshot(),
      batches = planClearing(snapshot.edges, deployment.token, snapshot.config);
    const reduced = batches
      .flatMap((b) => b.cycles)
      .reduce((n, c) => n + c.amount * BigInt(c.ids.length), 0n);
    el("dry-result").textContent =
      `DRY-RUN ONLY: ${format(reduced)} tUSD could clear in ${batches.flatMap((b) => b.cycles).length} cycles. No transaction sent.`;
  } catch {
    el("dry-result").textContent =
      "Live RPC unavailable. Dry-run was not performed; no transaction sent.";
  } finally {
    button.disabled = false;
  }
});
try {
  const response = await fetch(`${import.meta.env.BASE_URL}evidence/latest.json`);
  if (!response.ok) throw Error("Evidence unavailable");
  const data = await response.json();
  for (const [name, item] of Object.entries(data.runs) as [
    string,
    { file: string; run: unknown },
  ][])
    runs[name] = { file: item.file, run: runEvidenceSchema.parse(item.run) };
  recorded();
} catch {
  el("source").textContent =
    "Saved evidence could not be loaded. Try loading live state.";
}
