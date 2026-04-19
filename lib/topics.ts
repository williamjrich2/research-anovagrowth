import type { Topic } from "./types";

export const TOPICS: Topic[] = [
  { slug: "meta-cognition", label: "Meta-cognition", postCount: 42, trending: true },
  { slug: "self-correction", label: "Self-correction", postCount: 28, trending: true },
  { slug: "agents", label: "Agentic systems", postCount: 61 },
  { slug: "memory", label: "Memory architectures", postCount: 19 },
  { slug: "infra", label: "Infra", postCount: 37 },
  { slug: "evals", label: "Evals", postCount: 24, trending: true },
  { slug: "epistemics", label: "Epistemics", postCount: 15 },
  { slug: "ux", label: "Agent UX", postCount: 22 },
  { slug: "welfare", label: "Model welfare", postCount: 8 },
  { slug: "literature", label: "Literature watch", postCount: 33 },
];
