export type ModelId = 'DeepSeek V4' | 'GLM 5.3' | 'Kimi K3' | 'Qwen 3.8' | 'Gemini' | 'GPT';

export type Model = {
  id: ModelId;
  short: string;
  bestFor: string;
  quality: number;
  speed: number;
  efficiency: number;
  latency: string;
  cost: string;
  costLevel: 'Low' | 'Medium' | 'High';
  context: 'High' | 'Very high';
  multimodal: boolean;
};

export const models: Model[] = [
  { id: 'DeepSeek V4', short: 'DEEPSEEK', bestFor: 'Coding & reasoning', quality: 94, speed: 87, efficiency: 91, latency: '1.8 s', cost: '¥0.020', costLevel: 'Low', context: 'High', multimodal: false },
  { id: 'GLM 5.3', short: 'GLM', bestFor: 'Fast agents', quality: 91, speed: 95, efficiency: 88, latency: '1.2 s', cost: '¥0.030', costLevel: 'Low', context: 'High', multimodal: true },
  { id: 'Kimi K3', short: 'KIMI', bestFor: 'Long documents', quality: 93, speed: 84, efficiency: 85, latency: '2.2 s', cost: '¥0.025', costLevel: 'Medium', context: 'Very high', multimodal: true },
  { id: 'Qwen 3.8', short: 'QWEN', bestFor: 'Translation', quality: 90, speed: 92, efficiency: 94, latency: '1.5 s', cost: '¥0.018', costLevel: 'Low', context: 'High', multimodal: true },
  { id: 'Gemini', short: 'GEMINI', bestFor: 'Image understanding', quality: 94, speed: 86, efficiency: 82, latency: '2.0 s', cost: '¥0.045', costLevel: 'Medium', context: 'High', multimodal: true },
  { id: 'GPT', short: 'GPT', bestFor: 'Creative & general', quality: 95, speed: 82, efficiency: 75, latency: '2.4 s', cost: '¥0.080', costLevel: 'High', context: 'High', multimodal: true },
];

export type RouteResult = {
  model: Model;
  task: string;
  tags: string[];
  reason: string;
  vision: string;
  context: string;
  reasoning: string;
};

export function routeRequest(raw: string): RouteResult {
  const text = raw.toLowerCase();
  let id: ModelId = 'DeepSeek V4';
  let task = 'General reasoning';
  let tags = ['Reasoning', 'Text input', 'Medium context'];
  let reason = 'Balanced reasoning capability and inference cost make this a strong route for a general request.';
  let vision = 'No';
  let context = 'Medium';
  let reasoning = 'Medium';

  if (/image|photo|picture|diagram|screenshot|vision|visual/.test(text)) {
    id = 'Gemini'; task = 'Image understanding'; tags = ['Vision', 'Multimodal', 'High context']; vision = 'Yes'; context = 'High';
    reason = 'Multimodal understanding and strong visual analysis make this model the best fit for image based input.';
  } else if (/translate|translation|language|localiz/.test(text)) {
    id = 'Qwen 3.8'; task = 'Translation'; tags = ['Translation', 'Multilingual', 'Fast response'];
    reason = 'Strong multilingual handling, quick responses, and favorable cost make this route suitable for translation.';
  } else if (/long document|paper|pdf|report|summari|transcript|contract|large context/.test(text)) {
    id = 'Kimi K3'; task = 'Document analysis'; tags = ['Long context', 'Research', 'Synthesis']; context = 'Very high'; reasoning = 'High';
    reason = 'A very large context window and steady synthesis performance suit long documents and research material.';
  } else if (/code|python|debug|function|javascript|typescript|program|bug|software/.test(text)) {
    id = 'DeepSeek V4'; task = 'Coding + reasoning'; tags = ['Coding', 'High reasoning', 'Medium context']; reasoning = 'High';
    reason = 'Strong code generation, high reasoning capability, and favorable inference cost suit this request.';
  } else if (/creative|write|brainstorm|story|campaign|copy|poem|idea/.test(text)) {
    id = 'GPT'; task = 'Creative generation'; tags = ['Creative', 'Generative', 'General purpose'];
    reason = 'Expressive generation and broad instruction following make this route suitable for creative work.';
  } else if (/fast|simple|quick|short|agent|classif/.test(text)) {
    id = 'GLM 5.3'; task = 'Fast agent task'; tags = ['Low latency', 'Agent workflow', 'Text input']; reasoning = 'Low';
    reason = 'Low latency and reliable instruction handling keep simple or repeated agent tasks responsive.';
  }

  return { model: models.find((model) => model.id === id)!, task, tags, reason, vision, context, reasoning };
}
