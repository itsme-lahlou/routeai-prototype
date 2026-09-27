'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ArrowDownRight, ArrowRight, Check, MoveUpRight, RotateCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { models, routeRequest, type Model, type RouteResult } from './route-data';

const examples = [
  ['Debug code', 'Debug this Python function and explain why it fails.'],
  ['Analyze image', 'Analyze this image and describe the key objects and relationships.'],
  ['Summarize paper', 'Summarize a long research paper and extract its main findings.'],
  ['Translate document', 'Translate this document from English to Chinese.'],
  ['Research topic', 'Research the latest approaches to efficient AI inference.'],
];

function Brand() {
  return <a className="brand" href="#top" aria-label="RouteAI home"><span className="brand-mark"><i /><i /><i /></span><span>ROUTE<span className="rust">AI</span></span></a>;
}

function HeroDiagram() {
  return <div className="hero-diagram" aria-label="Technical diagram of a request being routed to a model">
    <div className="diagram-header"><span>ROUTING / LIVE PREVIEW</span><span><b className="status-dot" /> SYSTEM ONLINE</span></div>
    <div className="diagram-box"><small>00 / INPUT</small><strong>Incoming request</strong><span className="diagram-pulse" /></div>
    <div className="diagram-stem" />
    <div className="diagram-box analysis"><small>01 / ANALYSIS</small><strong>Task profiler</strong><span>Intent · capability · context</span></div>
    <div className="diagram-fork"><i /><i /><i /><i /><i /><i /></div>
    <div className="diagram-models">{['GLM', 'QWEN', 'DEEPSEEK', 'KIMI', 'GEMINI', 'GPT'].map((model) => <div className={model === 'DEEPSEEK' ? 'diagram-model chosen' : 'diagram-model'} key={model}><span>✳</span>{model}</div>)}</div>
    <div className="diagram-footer"><span>06 CANDIDATE MODELS</span><span className="rust">━ &nbsp; ROUTE SELECTED ↘</span></div>
  </div>;
}

const stages = ['ANALYZING REQUEST', 'DETECTING CAPABILITIES', 'BENCHMARKING MODELS', 'OPTIMIZING COST', 'ROUTE SELECTED'];
const flow = [
  ['USER REQUEST', 'A task enters through one consistent interface.'],
  ['TASK PROFILER', 'Intent, context, reasoning, and modalities are identified.'],
  ['MODEL EVALUATION', 'Eligible models are compared against task requirements.'],
  ['TRADE-OFF SCORING', 'Quality, latency, and cost targets are weighted.'],
  ['MODEL SELECTED', 'One recommended route is returned with an explanation.'],
];
const capabilities = [
  ['Task intelligence', 'Identifies coding, reasoning, vision, translation, research, and creative workloads.'],
  ['Context awareness', 'Estimates how much source material the task needs the model to hold at once.'],
  ['Capability matching', 'Considers only model profiles that support the required input and output.'],
  ['Dynamic routing', 'Scores each eligible route against quality, latency, and cost targets.'],
];
const supported = ['DEEPSEEK', 'GLM', 'QWEN', 'KIMI', 'GEMINI', 'GPT', 'MINIMAX', 'MISTRAL', 'LLAMA', 'CLAUDE'];
const domains = ['TEXT', 'VISION', 'REASONING', 'CODING', 'LONG CONTEXT', 'REAL-TIME', 'IMAGE GENERATION'];
const useCases = [
  ['01', 'AI coding assistants', 'Route complex debugging to reasoning models while sending simple completions to faster models.'],
  ['02', 'Research agents', 'Choose models dynamically based on context length and reasoning requirements.'],
  ['03', 'Multimodal applications', 'Route image, document, and text requests to compatible models automatically.'],
];

function SectionHeading({ number, label, title, description }: { number: string; label: string; title: string; description: string }) {
  return <div className="editorial-heading reveal"><span className="giant-number">{number}</span><div><span className="section-kicker">{label}</span><h2>{title}</h2><p>{description}</p></div></div>;
}

function Metric({ label, value }: { label: string; value: number }) {
  return <div className="result-metric"><div className="metric-label"><span>{label}</span><strong>{value}<small> / 100</small></strong></div><Progress value={value} className="metric-progress" aria-label={label} /></div>;
}

function ResultDashboard({ result }: { result: RouteResult }) {
  const alternatives = models.filter((model) => model.id !== result.model.id).sort((a, b) => b.quality - a.quality).slice(0, 3);
  return <div className="result-dashboard" aria-live="polite">
    <div className="result-banner"><span><Check size={15} /> ROUTE SELECTED</span><span>SIMULATED ANALYSIS / COMPLETE</span></div>
    <div className="result-main">
      <div className="profile-panel"><span className="panel-kicker">TASK PROFILE / 01</span><h3>{result.task}</h3><div className="profile-facts"><div><span>VISION REQUIRED</span><strong>{result.vision}</strong></div><div><span>CONTEXT DEMAND</span><strong>{result.context}</strong></div><div><span>REASONING DEMAND</span><strong>{result.reasoning}</strong></div></div><div className="result-tags">{result.tags.map((tag) => <span key={tag}>{tag}</span>)}</div></div>
      <div className="selected-panel"><span className="panel-kicker">RECOMMENDED MODEL / 02</span><div className="selected-label"><span className="selected-symbol">✳</span><span>BEST MATCH</span></div><h3>{result.model.id}</h3><p>{result.reason}</p><div className="route-confidence"><span>ROUTING CONFIDENCE</span><strong>92%</strong></div></div>
    </div>
    <div className="result-scores"><div className="score-meters"><Metric label="QUALITY" value={result.model.quality} /><Metric label="SPEED" value={result.model.speed} /><Metric label="COST EFFICIENCY" value={result.model.efficiency} /></div><div className="result-operational"><div><span>EST. LATENCY</span><strong>{result.model.latency}</strong></div><div><span>EST. COST</span><strong>{result.model.cost}</strong></div></div></div>
    <div className="result-bottom"><div className="why-panel"><span className="panel-kicker">WHY THIS MODEL</span><p>{result.reason}</p></div><div className="alternatives-panel"><span className="panel-kicker">ALTERNATIVES</span>{alternatives.map((model) => <div className="alternative-row" key={model.id}><strong>{model.id}</strong><span>Q {model.quality}</span><span>S {model.speed}</span><span>{model.cost}</span></div>)}</div></div>
    <p className="prototype-note">Illustrative scores, latency, and cost for prototype demonstration. No real model calls are made.</p>
  </div>;
}

export default function Home() {
  const [prompt, setPrompt] = useState('');
  const [stage, setStage] = useState(-1);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<RouteResult | null>(null);
  const [flowStep, setFlowStep] = useState(1);
  const [sortBy, setSortBy] = useState<'quality' | 'speed' | 'cost'>('quality');
  const [inspected, setInspected] = useState<Model>(models[0]);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const runId = useRef(0);

  const runRouter = useCallback((raw: string) => {
    const task = raw.trim();
    if (!task) return Promise.reject(new Error('Enter a request before running the router.'));
    if (timer.current) clearInterval(timer.current);
    const currentRun = ++runId.current;
    setPrompt(task);
    setResult(null);
    setRunning(true);
    setStage(0);
    let currentStage = 0;
    return new Promise<RouteResult>((resolve) => {
      timer.current = setInterval(() => {
        if (currentRun !== runId.current) return;
        currentStage += 1;
        setStage(currentStage);
        if (currentStage === stages.length - 1) {
          if (timer.current) clearInterval(timer.current);
          const next = routeRequest(task);
          setResult(next);
          setInspected(next.model);
          setRunning(false);
          resolve(next);
        }
      }, 390);
    });
  }, []);

  useEffect(() => {
    const nodes = document.querySelectorAll('.reveal');
    const observer = new IntersectionObserver((entries) => entries.forEach((entry) => {
      if (entry.isIntersecting) { entry.target.classList.add('in-view'); observer.unobserve(entry.target); }
    }), { threshold: 0.13 });
    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    type ToolContext = { registerTool: (tool: Record<string, unknown>, options?: { signal?: AbortSignal }) => void | Promise<void> };
    const context = (document as Document & { modelContext?: ToolContext }).modelContext;
    if (!context?.registerTool) return;
    const lifecycle = new AbortController();
    try {
      void Promise.resolve(context.registerTool({
        name: 'route_task',
        title: 'Route an AI task',
        description: 'Analyze a task in the RouteAI prototype and show a simulated model recommendation.',
        inputSchema: { type: 'object', properties: { task: { type: 'string', minLength: 1 } }, required: ['task'], additionalProperties: false },
        annotations: { readOnlyHint: false, untrustedContentHint: true },
        execute: async (input: unknown) => {
          if (!input || typeof input !== 'object' || !('task' in input) || typeof input.task !== 'string' || !input.task.trim()) throw new Error('A nonempty task is required.');
          const route = await runRouter(input.task);
          return { task: route.task, recommendedModel: route.model.id, reason: route.reason };
        },
      }, { signal: lifecycle.signal })).catch(() => {});
    } catch { /* Browser has no supported WebMCP context. */ }
    return () => lifecycle.abort();
  }, [runRouter]);

  const sortedModels = useMemo(() => [...models].sort((a, b) => sortBy === 'cost' ? Number(a.cost.slice(1)) - Number(b.cost.slice(1)) : b[sortBy] - a[sortBy]), [sortBy]);
  return <main id="top">
    <header className="site-header shell"><Brand /><nav aria-label="Primary navigation"><a href="#product">Product</a><a href="#routing">Routing</a><a href="#models">Models</a><a href="#performance">Performance</a></nav><a className="header-cta" href="#router">Launch router <MoveUpRight size={15} /></a></header>
    <section className="hero shell" id="product"><div className="hero-copy"><div className="eyebrow"><i /> INTELLIGENT MODEL ROUTING <span>/ 001</span></div><h1>One task.<br /><em>The right model.</em></h1><p>RouteAI analyzes every request and selects the model that delivers the best balance of quality, speed, and cost.</p><div className="hero-actions"><a className="button-dark" href="#router">TRY THE ROUTER <ArrowRight size={16} /></a><a className="button-text" href="#routing">HOW IT WORKS ↘</a></div><div className="hero-foot"><span>BUILT FOR DECISIONS THAT MATTER</span><span>SCROLL TO EXPLORE ↓</span></div></div><HeroDiagram /></section>
    <section className="router-section" id="router"><div className="shell"><div className="section-intro"><span className="section-kicker">PRODUCT EXPERIENCE / 00</span><div><h2>Route any task<span className="rust">.</span></h2><p>Write a request, or start with an example. See how RouteAI turns task requirements into a model decision.</p></div></div><div className="router-workspace"><div className="workspace-head"><span><b className="status-dot" /> ROUTER CONSOLE</span><span>PROTOTYPE / V 0.1</span></div><label htmlFor="task-prompt" className="input-label">YOUR REQUEST <span>01 / 02</span></label><Textarea id="task-prompt" className="task-input" value={prompt} onChange={(event) => setPrompt(event.target.value)} placeholder="Describe what you want AI to do…" /><div className="example-row"><span>TRY AN EXAMPLE</span>{examples.map(([label, value]) => <Button key={label} variant="outline" className="example-chip" onClick={() => { setPrompt(value); setResult(null); setStage(-1); }}>{label}</Button>)}</div><div className="workspace-bottom"><span>NO API KEY REQUIRED · SIMULATED ROUTING</span><Button className="button-rust" disabled={running || !prompt.trim()} onClick={() => { void runRouter(prompt); }}>{running ? 'ROUTING…' : 'RUN ROUTER'} <ArrowRight size={16} /></Button></div></div>
      {running && <div className="analysis-progress" aria-live="polite"><div className="analysis-progress-top"><span>ROUTING REQUEST</span><strong>{String(Math.min(stage + 1, 5)).padStart(2, '0')} / 05</strong></div><div className="stage-list">{stages.map((item, index) => <div className={index < stage ? 'stage done' : index === stage ? 'stage active' : 'stage'} key={item}><span>{String(index + 1).padStart(2, '0')}</span><strong>{item}</strong><span>{index < stage ? '✓' : index === stage ? '●' : '—'}</span></div>)}</div></div>}
      {result && <ResultDashboard result={result} />}
    </div></section>
    <section className="editorial-section shell" id="workflows"><SectionHeading number="01" label="INTELLIGENCE / 01" title="Built for AI workflows" description="RouteAI evaluates the full requirements of every request before selecting a model." /><div className="capability-grid">{capabilities.map(([title, body], index) => <article className="capability reveal" key={title}><span className="capability-index">0{index + 1} / CAPABILITY</span><div className="capability-symbol">{['◎','⌘','⟡','↗'][index]}</div><h3>{title}</h3><p>{body}</p></article>)}</div></section>
    <section className="flow-section" id="routing"><div className="shell"><SectionHeading number="02" label="DECISION LAYER / 02" title="Routing decisions you can understand." description="Every recommendation follows a clear sequence from request analysis to a scored route." /><div className="flow-board reveal"><div className="flow-board-top"><span>ROUTING ARCHITECTURE</span><span>CLICK A STAGE TO EXPLORE <ArrowDownRight size={14} /></span></div><div className="flow-steps">{flow.map(([title], index) => <button className={flowStep === index ? 'flow-step active' : 'flow-step'} onClick={() => setFlowStep(index)} key={title}><span>0{index + 1}</span><strong>{title}</strong><ArrowRight size={15} /></button>)}</div><div className="flow-detail"><span>0{flowStep + 1} / 05</span><strong>{flow[flowStep][0]}</strong><p>{flow[flowStep][1]}</p></div></div></div></section>
    <section className="performance-section shell" id="performance"><SectionHeading number="03" label="EFFICIENCY / 03" title="Faster. Cheaper. Smarter." description="One routing layer helps teams tune each request around the trade-offs that matter most." /><div className="performance-grid reveal">{[['34%', 'lower average inference cost'], ['2.4×', 'faster model selection'], ['92%', 'routing confidence'], ['18+', 'supported model profiles']].map(([value, label], index) => <div className="performance-item" key={label}><span className="performance-index">0{index + 1} / METRIC</span><strong>{value}</strong><p>{label}</p></div>)}</div><p className="micro-note">Prototype benchmark data for demonstration. Figures are illustrative, not measured benchmarks.</p></section>
    <section className="comparison-section" id="models"><div className="shell"><div className="comparison-heading reveal"><div><span className="section-kicker">MODEL INDEX / COMPARISON</span><h2>See the trade-offs<span className="rust">.</span></h2></div><p>Model choice is a trade-off. Compare the profiles RouteAI evaluates before it selects a route.</p></div><div className="table-wrap reveal"><div className="table-top"><span>SUPPORTED PROFILES / 06</span><span>SIMULATED PROTOTYPE METRICS</span></div><Table className="model-table"><TableHeader><TableRow><TableHead>MODEL</TableHead><TableHead>BEST FOR</TableHead><TableHead><button onClick={() => setSortBy('quality')}>QUALITY {sortBy === 'quality' ? '↓' : ''}</button></TableHead><TableHead><button onClick={() => setSortBy('speed')}>SPEED {sortBy === 'speed' ? '↓' : ''}</button></TableHead><TableHead><button onClick={() => setSortBy('cost')}>COST {sortBy === 'cost' ? '↑' : ''}</button></TableHead><TableHead>CONTEXT</TableHead><TableHead>MULTIMODAL</TableHead></TableRow></TableHeader><TableBody>{sortedModels.map((model) => <TableRow key={model.id}><TableCell><span className="table-model-symbol">✳</span><strong>{model.id}</strong></TableCell><TableCell>{model.bestFor}</TableCell><TableCell className="table-score">{model.quality}</TableCell><TableCell className="table-score">{model.speed}</TableCell><TableCell>{model.costLevel}</TableCell><TableCell>{model.context}</TableCell><TableCell>{model.multimodal ? 'Yes' : 'No'}</TableCell></TableRow>)}</TableBody></Table></div><p className="micro-note">All quality, speed, cost, and capability values shown here are fictional demonstration data.</p></div></section>
    <section className="support-section shell"><SectionHeading number="04" label="MODEL ECOSYSTEM / 04" title="Day-0 model support" description="New models can be added to the routing layer without redesigning the workflow." /><div className="support-body reveal"><div className="support-label">MODEL PROFILES / 10</div><div className="support-grid">{supported.map((name, index) => <div className="support-badge" key={name}><span className="badge-symbol">{['✳','◩','⬡','◐','◇','◎','≋','✦','△','◈'][index]}</span><strong>{name}</strong></div>)}</div><div className="support-label capability-label">CAPABILITY SURFACE / 07</div><div className="domain-list">{domains.map((domain) => <span key={domain}><i />{domain}</span>)}</div></div></section>
    <section className="live-section"><div className="shell"><div className="live-heading reveal"><div><span className="section-kicker">ROUTING IN MOTION / LIVE VIEW</span><h2>Watch a request<br />route in real time<span className="rust">.</span></h2></div><p>The selected path responds to the task. Inspect any candidate profile to compare its simulated score.</p></div><div className="live-board reveal"><div className="live-source"><span>INCOMING REQUEST</span><strong>{result?.task ?? 'Coding + reasoning'}</strong><small>REQUEST / 001</small></div><div className="live-lines"><span /><span /><span /></div><div className="live-nodes">{models.slice(0, 5).map((model) => <button className={inspected.id === model.id ? 'live-node active' : 'live-node'} onClick={() => setInspected(model)} key={model.id}><span>✳</span><strong>{model.short}</strong><small>Q {model.quality} / S {model.speed}</small></button>)}</div><div className="live-route"><span>INSPECTED PROFILE</span><strong>{inspected.id}</strong><div><span>QUALITY <b>{(inspected.quality / 100).toFixed(2)}</b></span><span>LATENCY <b>{(inspected.speed / 100).toFixed(2)}</b></span><span>COST <b>{(inspected.efficiency / 100).toFixed(2)}</b></span></div><Button variant="outline" onClick={() => { void runRouter(prompt || examples[0][1]); }} disabled={running}>REPLAY ROUTE <RotateCw size={13} /></Button></div></div></div></section>
    <section className="uses-section shell"><div className="uses-heading reveal"><span className="section-kicker">APPLICATIONS / USE CASES</span><h2>One routing layer.<br /><span className="rust">Many workflows.</span></h2></div><div className="use-list">{useCases.map(([number, title, body]) => <article className="use-row reveal" key={title}><span>{number}</span><h3>{title}</h3><p>{body}</p><ArrowDownRight size={20} /></article>)}</div></section>
    <section className="cta-section"><div className="shell cta-inner"><span className="section-kicker">START ROUTING / ROUTEAI</span><p>Stop choosing models manually.</p><h2>One interface.<br />Every model.<br /><em>The right route.</em></h2><a href="#router" className="cta-button">TRY ROUTEAI <ArrowRight size={18} /></a><span className="cta-note">PROTOTYPE — AI + INNOVATION DESIGN</span></div></section>
    <footer className="site-footer"><div className="shell footer-main"><div><Brand /><p>Intelligent multi-model routing.</p></div><nav aria-label="Footer navigation"><a href="#product">Product</a><a href="#models">Models</a><a href="#routing">Routing</a><a href="#performance">Performance</a><a href="#router">Try the router</a></nav></div><div className="shell footer-bottom"><span>© 2026 ROUTEAI CONCEPT</span><span>CONCEPT PROTOTYPE FOR ACADEMIC DEMONSTRATION</span><a href="#top">BACK TO TOP ↑</a></div></footer>
  </main>;
}
