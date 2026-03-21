import { Router, Request, Response } from "express";
import { supabase } from "../lib/supabase";
import path from "path";
import fs from "fs";
import multer from "multer";
import crypto from "crypto";

type AssistantMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

type SessionData = {
  sessionId: string;
  language: string;
  createdAt: number;
  updatedAt: number;
  messages: AssistantMessage[];
  pendingClarification: {
    question: string;
    candidates: RetrievalCandidate[];
    suggestedTopics: IntentCategory[];
  } | null;
};

type IntentCategory =
  | "platform_overview"
  | "architecture"
  | "endpoints"
  | "auth"
  | "models"
  | "contribution"
  | "booking"
  | "ownership_contact"
  | "services"
  | "runtime_policy"
  | "unknown";

type KnowledgeCard = {
  id: string;
  sourcePath: string;
  topic: IntentCategory;
  factText: string;
  aliases: string[];
  languageVariants: { en: string; hi: string };
  anchors: string[];
};

type RetrievalCandidate = {
  card: KnowledgeCard;
  intentScore: number;
  aliasScore: number;
  semanticScore: number;
  score: number;
};

type KnowledgeIndex = {
  version: string;
  cards: KnowledgeCard[];
  generatedQuestions: string[];
  valid: boolean;
};

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 },
});

const GROQ_BASE_URL = "https://api.groq.com/openai/v1";
const GROQ_CHAT_MODEL = process.env.GROQ_CHAT_MODEL || "llama-3.1-8b-instant";
const GROQ_CALL_MODEL = process.env.GROQ_CALL_MODEL || GROQ_CHAT_MODEL;
const GROQ_COMPLEX_MODEL = process.env.GROQ_COMPLEX_MODEL || "qwen-qwq-32b";
const GROQ_QUALITY_FALLBACK_MODEL = process.env.GROQ_QUALITY_FALLBACK_MODEL || "llama-3.3-70b-versatile";
const GROQ_WHISPER_MODEL = process.env.GROQ_WHISPER_MODEL || "whisper-large-v3-turbo";
const GROQ_TTS_MODEL = process.env.GROQ_TTS_MODEL || "playai-tts";
const GROQ_TTS_VOICE_EN = process.env.GROQ_TTS_VOICE_EN || "Fritz-PlayAI";
const GROQ_TTS_VOICE_HI = process.env.GROQ_TTS_VOICE_HI || GROQ_TTS_VOICE_EN;
const MAX_SESSION_TURNS = 14;
const EXPECTED_PROMPT_VERSION = "1.2.0";
const MODEL_INFO_TTL_MS = 5 * 60 * 1000;

const sessionStore = new Map<string, SessionData>();
let cachedModelInfo: { value: any; expiresAt: number } | null = null;

const PROMPT_FILE = path.resolve(__dirname, "../../edyx_voice_agent_system_prompt.json");

let cachedPrompt = "";
let cachedPromptObject: any = null;
let cachedCompiledPrompt: any = null;
let cachedPromptFileSignature = "";
let cachedKnowledgeIndex: KnowledgeIndex | null = null;

function createTraceId(): string {
  return crypto.randomBytes(6).toString("hex");
}

function sendError(
  res: Response,
  status: number,
  code: string,
  message: string,
  retryable: boolean,
  details?: Record<string, unknown>,
) {
  const traceId = createTraceId();
  res.status(status).json({ code, message, retryable, traceId, ...(details || {}) });
}

function createSessionId(): string {
  if (typeof crypto.randomUUID === "function") return crypto.randomUUID();
  return `sess_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

function getPromptFileSignature(): string {
  try {
    const stat = fs.statSync(PROMPT_FILE);
    return `${stat.size}:${stat.mtimeMs}`;
  } catch {
    return "missing";
  }
}

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .map((t) => t.trim())
    .filter((t) => t.length >= 2);
}

function uniqueStrings(values: string[]): string[] {
  return Array.from(new Set(values.map((v) => v.trim()).filter(Boolean)));
}

function topicFromPath(pathStr: string): IntentCategory {
  const p = pathStr.toLowerCase();
  if (/owner|brand|contact|linkedin|github/.test(p)) return "ownership_contact";
  if (/appointment|booking|calendar|timezone|meeting/.test(p)) return "booking";
  if (/auth|otp|jwt|google/.test(p)) return "auth";
  if (/model|latency|physics|convo|balanced|fast/.test(p)) return "models";
  if (/service|pdf|icon|youtube|transcribe/.test(p)) return "services";
  if (/route|endpoint|api_endpoint|request|response/.test(p)) return "endpoints";
  if (/architecture|module|gateway|frontend|backend|stack/.test(p)) return "architecture";
  if (/contribution|pull_request|issue|hall_of_fame|evolution/.test(p)) return "contribution";
  if (/runtime|language|tooling|policy|response_rules|persona/.test(p)) return "runtime_policy";
  if (/platform_overview|summary|core_claims|what_is_edyx|pricing/.test(p)) return "platform_overview";
  return "unknown";
}

const TOPIC_ALIASES: Record<IntentCategory, string[]> = {
  platform_overview: ["edyx", "platform", "overview", "what is"],
  architecture: ["architecture", "backend", "frontend", "gateway", "module"],
  endpoints: ["endpoint", "route", "api", "request", "response"],
  auth: ["auth", "otp", "login", "google", "jwt"],
  models: ["model", "fast", "balanced", "convo", "physics", "situation"],
  contribution: ["contribute", "issue", "pr", "pull request", "hall of fame"],
  booking: ["book", "appointment", "calendar", "schedule", "time slot"],
  ownership_contact: ["owner", "founder", "contact", "linkedin", "email"],
  services: ["services", "pdf", "icon", "youtube", "transcribe"],
  runtime_policy: ["language", "policy", "one question", "confirmation", "runtime"],
  unknown: [],
};

function collectLeafFacts(value: unknown, sourcePath: string, out: Array<{ path: string; text: string }>) {
  if (value == null) return;

  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    const text = String(value).trim();
    if (text) out.push({ path: sourcePath, text });
    return;
  }

  if (Array.isArray(value)) {
    const primitiveValues = value.filter(
      (v) => typeof v === "string" || typeof v === "number" || typeof v === "boolean",
    );

    if (primitiveValues.length) {
      const joined = primitiveValues.map((v) => String(v).trim()).filter(Boolean).join("; ");
      if (joined) out.push({ path: sourcePath, text: joined });
    }

    for (let i = 0; i < value.length; i += 1) {
      collectLeafFacts(value[i], `${sourcePath}[${i}]`, out);
    }
    return;
  }

  if (typeof value === "object") {
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      collectLeafFacts(v, sourcePath ? `${sourcePath}.${k}` : k, out);
    }
  }
}

function classifyIntent(question: string): IntentCategory {
  const q = question.toLowerCase();
  if (/owner|founder|contact|linkedin|email|who built/.test(q)) return "ownership_contact";
  if (/book|appointment|calendar|schedule|slot|meeting/.test(q)) return "booking";
  if (/auth|otp|login|google|jwt|sign in/.test(q)) return "auth";
  if (/model|fast|balanced|convo|physics|latency/.test(q)) return "models";
  if (/service|pdf|icon|youtube|transcrib/.test(q)) return "services";
  if (/endpoint|route|api|request|response|curl/.test(q)) return "endpoints";
  if (/architecture|backend|frontend|gateway|module/.test(q)) return "architecture";
  if (/contribut|issue|pull request|pr|hall of fame/.test(q)) return "contribution";
  if (/language|policy|one question|confirm|rules/.test(q)) return "runtime_policy";
  if (/what is edyx|about edyx|platform/.test(q)) return "platform_overview";
  return "unknown";
}

function semanticOverlapScore(a: string, b: string): number {
  const at = tokenize(a);
  const bt = tokenize(b);
  if (!at.length || !bt.length) return 0;
  const aset = new Set(at);
  let common = 0;
  for (const token of bt) {
    if (aset.has(token)) common += 1;
  }
  return common / Math.max(at.length, bt.length);
}

function buildQuestionVariants(card: KnowledgeCard): string[] {
  const topic = card.topic.replace(/_/g, " ");
  const label = card.factText.slice(0, 64);
  return uniqueStrings([
    `What is ${topic}?`,
    `How does ${topic} work in Edyx?`,
    `When should I use this ${topic}?`,
    `Where do I start with ${topic}?`,
    `Can you explain ${label}?`,
    `Beginner guide for ${topic} please.`,
    `Technical deep dive for ${topic}.`,
  ]);
}

function buildKnowledgeIndex(promptObj: any): KnowledgeIndex {
  const compiled = compilePromptContext();
  const leaves: Array<{ path: string; text: string }> = [];
  collectLeafFacts(promptObj, "", leaves);

  const cards: KnowledgeCard[] = leaves
    .map((leaf, idx) => {
      const topic = topicFromPath(leaf.path);
      const pathTokens = tokenize(leaf.path.replace(/[.[\]]/g, " "));
      const textTokens = tokenize(leaf.text).slice(0, 10);
      const aliases = uniqueStrings([...TOPIC_ALIASES[topic], ...pathTokens.slice(0, 6)]);
      const anchors = uniqueStrings([...pathTokens.slice(0, 6), ...textTokens.slice(0, 8)]);
      const hiVariant = leaf.text;

      return {
        id: `card_${idx + 1}`,
        sourcePath: leaf.path || "root",
        topic,
        factText: leaf.text,
        aliases,
        languageVariants: {
          en: leaf.text,
          hi: hiVariant,
        },
        anchors,
      };
    })
    .filter((c) => c.factText.length > 2);

  const generatedQuestions = uniqueStrings(cards.flatMap((card) => buildQuestionVariants(card)));

  return {
    version: compiled.version || "unknown",
    cards,
    generatedQuestions,
    valid: compiled.issues.length === 0,
  };
}

function ensureKnowledgeIndex(): KnowledgeIndex {
  const promptObj = getPromptObject();
  const compiled = compilePromptContext();

  if (!cachedKnowledgeIndex || cachedKnowledgeIndex.version !== (compiled.version || "unknown")) {
    cachedKnowledgeIndex = buildKnowledgeIndex(promptObj);
  }

  return cachedKnowledgeIndex;
}

function getPromptObject(): any {
  const signature = getPromptFileSignature();
  if (signature !== cachedPromptFileSignature) {
    cachedPromptFileSignature = signature;
    cachedPrompt = "";
    cachedPromptObject = null;
    cachedCompiledPrompt = null;
    cachedKnowledgeIndex = null;
  }

  if (cachedPromptObject) return cachedPromptObject;

  try {
    const raw = fs.readFileSync(PROMPT_FILE, "utf-8");
    cachedPromptObject = JSON.parse(raw);
    return cachedPromptObject;
  } catch (error) {
    console.error("Failed to parse voice assistant system prompt object:", error);
    cachedPromptObject = {};
    return cachedPromptObject;
  }
}

function getPromptContext(): string {
  if (cachedPrompt) return cachedPrompt;

  try {
    const parsed = getPromptObject();
    const curated: any = {
      system_prompt_meta: parsed.system_prompt_meta,
      agent_persona: parsed.agent_persona,
      greeting: parsed.greeting,
      conversation_flow: parsed.conversation_flow,
      faq_handling: {
        knowledge_base: parsed.faq_handling?.knowledge_base
      },
    };

    if (curated.faq_handling?.knowledge_base?.codebase_navigation_guide) {
      delete curated.faq_handling.knowledge_base.codebase_navigation_guide;
    }
    if (curated.conversation_flow?.appointment_booking?.calendar_tool_contract) {
      delete curated.conversation_flow.appointment_booking.calendar_tool_contract;
    }

    cachedPrompt = JSON.stringify(curated);
    return cachedPrompt;
  } catch (error) {
    console.error("Failed to read voice assistant system prompt:", error);
    cachedPrompt = "{}";
    return cachedPrompt;
  }
}

function validatePromptObject(obj: any): string[] {
  const issues: string[] = [];
  const requiredTopLevel = [
    "system_prompt_meta",
    "greeting",
    "agent_persona",
    "conversation_flow",
    "faq_handling",
    "self_hosted_frontend_runtime_profile",
  ];

  for (const key of requiredTopLevel) {
    if (!obj || typeof obj !== "object" || !(key in obj)) {
      issues.push(`Missing required top-level key: ${key}`);
    }
  }

  if (!obj?.greeting?.primary || typeof obj?.greeting?.primary !== "string") {
    issues.push("greeting.primary must be a non-empty string");
  }
  if (!Array.isArray(obj?.self_hosted_frontend_runtime_profile?.language_runtime?.supported_languages)) {
    issues.push("runtime_profile.language_runtime.supported_languages must be an array");
  }

  return issues;
}

function compilePromptContext() {
  if (cachedCompiledPrompt) return cachedCompiledPrompt;

  const raw = getPromptObject();
  const issues = validatePromptObject(raw);
  const runtimeLanguages = raw?.self_hosted_frontend_runtime_profile?.language_runtime?.supported_languages;

  const version = raw?.system_prompt_meta?.version || "unknown";
  if (version !== EXPECTED_PROMPT_VERSION) {
    console.warn(`voice-assistant prompt version mismatch: expected ${EXPECTED_PROMPT_VERSION}, got ${version}`);
  }
  if (issues.length) {
    console.warn("voice-assistant prompt validation issues:", issues);
  }

  cachedCompiledPrompt = {
    metadata: raw?.system_prompt_meta || {},
    openingBehavior: raw?.greeting || {},
    tonePolicy: raw?.agent_persona || {},
    responseRules: raw?.agent_persona?.response_rules || {},
    conversationFlow: raw?.conversation_flow || {},
    knowledgeSummary: raw?.faq_handling || {},
    ownerContactPolicy: {
      owners: raw?.system_prompt_meta?.brand?.owners || [],
      contact_email: raw?.system_prompt_meta?.brand?.contact_email || "",
      github: raw?.system_prompt_meta?.brand?.github || "",
    },
    fallbackResponses: raw?.fallback_responses || {},
    supportedLanguages: Array.isArray(runtimeLanguages) && runtimeLanguages.length ? runtimeLanguages : ["en"],
    languageCheck: raw?.greeting?.language_check || "Would you like to continue in English or Hindi?",
    version,
    issues,
  };

  return cachedCompiledPrompt;
}

function getLastUserMessage(messages: AssistantMessage[]): string {
  const userMessage = messages
    .slice()
    .reverse()
    .find((m) => m.role === "user");
  return userMessage?.content || "";
}

function fallbackOwnerReply(messages: AssistantMessage[]): string | null {
  const text = getLastUserMessage(messages).toLowerCase();
  const ownerIntent = /owner|who built|who created|founder|contact|linkedin|team/.test(text);
  if (!ownerIntent) return null;

  const promptObj = getPromptObject();
  const owners = promptObj?.system_prompt_meta?.brand?.owners || [];
  const contactEmail = promptObj?.system_prompt_meta?.brand?.contact_email || "N/A";
  const github = promptObj?.system_prompt_meta?.brand?.github || "N/A";

  if (!owners.length) {
    return `Edyx owner details are currently unavailable in my runtime context. Contact: ${contactEmail}.`;
  }

  const ownerLines = owners
    .map((owner: any) => `${owner?.name || "Unknown"} (${owner?.linkedin || "No LinkedIn provided"})`)
    .join("; ");

  return [
    "Edyx is built and maintained by:",
    ownerLines,
    `Contact email: ${contactEmail}`,
    `GitHub: ${github}`,
  ].join(" ");
}

function fallbackPromptReply(messages: AssistantMessage[], mode: "chat" | "call"): string {
  const ownerReply = fallbackOwnerReply(messages);
  if (ownerReply) return ownerReply;

  const promptObj = getPromptObject();
  const fallback = promptObj?.fallback_responses;
  const generic = fallback?.knowledge_not_found || "I could not complete that request, but I can still help with Edyx platform, owners, API models, and onboarding questions.";

  if (mode === "call") {
    return `${generic} Please tell me your main question in one line, and I will help right away.`;
  }

  return generic;
}

function retrieveKnowledgeCandidates(question: string): RetrievalCandidate[] {
  const index = ensureKnowledgeIndex();
  const intent = classifyIntent(question);
  const qLower = question.toLowerCase();
  const qTokens = tokenize(question);

  const scored = index.cards.map((card) => {
    const intentScore = intent !== "unknown" && card.topic === intent ? 1 : 0;

    const aliasMatches = card.aliases.filter((a) => qLower.includes(a.toLowerCase())).length;
    const anchorMatches = card.anchors.filter((a) => qTokens.includes(a)).length;
    const aliasScore = Math.min(1, aliasMatches * 0.24 + anchorMatches * 0.08);

    const semanticScore = semanticOverlapScore(question, `${card.sourcePath} ${card.factText}`);
    const score = intentScore * 0.35 + aliasScore * 0.35 + semanticScore * 0.3;

    return {
      card,
      intentScore,
      aliasScore,
      semanticScore,
      score,
    };
  });

  return scored.sort((a, b) => b.score - a.score).slice(0, 5);
}

function isAffirmative(text: string): boolean {
  const t = text
    .trim()
    .toLowerCase()
    .replace(/[^a-z\s]/g, " ");
  const tokens = t.split(/\s+/).filter(Boolean);
  if (!tokens.length) return false;
  const affirmSet = new Set(["yes", "yeah", "yep", "yup", "ok", "okay", "sure", "haan", "ha", "han", "continue"]);
  return (
    tokens.some((tok) => affirmSet.has(tok) || /^y+e+s+$/.test(tok) || tok.startsWith("ye")) ||
    /go\s+ahead/.test(t)
  );
}

function isNegative(text: string): boolean {
  const t = text
    .trim()
    .toLowerCase()
    .replace(/[^a-z\s]/g, " ");
  return /\b(no|nope|nah|not now|different)\b/.test(t);
}

function resolvePendingCandidates(
  userText: string,
  pending: SessionData["pendingClarification"],
): RetrievalCandidate[] | null {
  if (!pending || !pending.candidates.length) return null;

  if (isAffirmative(userText)) {
    return pending.candidates;
  }

  const explicitIntent = classifyIntent(userText);
  if (explicitIntent !== "unknown") {
    const filtered = pending.candidates.filter((c) => c.card.topic === explicitIntent);
    if (filtered.length) return filtered;
  }

  const q = userText.toLowerCase();
  const suggested = pending.suggestedTopics || [];
  for (const topic of suggested) {
    const words = topic.split("_");
    if (q.includes(topic.replace(/_/g, " ")) || words.some((w) => q.includes(w))) {
      const filtered = pending.candidates.filter((c) => c.card.topic === topic);
      if (filtered.length) return filtered;
    }
  }

  return null;
}

function pickClarifierTopics(candidates: RetrievalCandidate[]): IntentCategory[] {
  const topics = uniqueStrings(candidates.map((c) => c.card.topic).filter((t) => t !== "unknown")) as IntentCategory[];
  return topics.slice(0, 4);
}

function buildAnswerFromCandidates(
  candidates: RetrievalCandidate[],
  question: string,
  language: string,
  mode: "chat" | "call",
): { reply: string; confidence: "high"; sources: string[] } {
  const top = candidates[0];
  const selected = candidates.filter((c) => c.score >= top.score * 0.82).slice(0, 3);
  const selectedFacts = selected.map((c) => c.card.languageVariants[language === "hi" ? "hi" : "en"] || c.card.factText);
  const technicalAsk = /api|endpoint|route|payload|architecture|technical|deep|code|implement/i.test(question);

  let body = "";
  if (technicalAsk) {
    body = [
      "Here is the grounded answer from Edyx knowledge JSON:",
      ...selectedFacts.map((fact, i) => `${i + 1}. ${fact}`),
    ].join(" ");
  } else {
    body = selectedFacts[0];
    if (selectedFacts[1]) {
      body += ` ${selectedFacts[1]}`;
    }
  }

  const followUp =
    mode === "call"
      ? "If you want, I can also help with the next related step."
      : "If helpful, I can also give either a quick summary or deeper technical breakdown.";

  return {
    reply: `${body} ${followUp}`,
    confidence: "high",
    sources: selected.map((c) => c.card.sourcePath),
  };
}

function buildConversationalReply(question: string): string | null {
  const q = question.trim().toLowerCase();
  const compiled = compilePromptContext();

  if (/^(hi|hello|hey|hii|helo|namaste|hola)\b/.test(q)) {
    return compiled.openingBehavior?.primary ||
      "Hi, this is the Edyx assistant. I can help with models, APIs, services, contribution, or booking support.";
  }

  if (/\b(thanks|thank you|thx|shukriya|dhanyavaad)\b/.test(q)) {
    return "You are welcome. Would you like help with one more Edyx question?";
  }

  if (/\b(bye|goodbye|see you|exit)\b/.test(q)) {
    return compiled.fallbackResponses?.call_closing ||
      "Thank you for contacting Edyx. Have a great day.";
  }

  return null;
}

function buildDirectBrandReply(question: string): { reply: string; source: string } | null {
  const q = question.trim().toLowerCase();
  const brand = compilePromptContext().metadata?.brand || {};

  if (/github|repo|repository/.test(q)) {
    const github = String(brand?.github || "").trim();
    if (github) {
      return {
        reply: `The official Edyx GitHub repository is ${github}. Want setup steps for backend or frontend first?`,
        source: "system_prompt_meta.brand.github",
      };
    }
  }

  if (/docs|documentation/.test(q)) {
    const docs = String(brand?.docs_url || "").trim();
    if (docs) {
      return {
        reply: `You can find Edyx docs at ${docs}. Want quick API request examples too?`,
        source: "system_prompt_meta.brand.docs_url",
      };
    }
  }

  if (/website|site|official site/.test(q)) {
    const website = String(brand?.website || "").trim();
    if (website) {
      return {
        reply: `The official Edyx website is ${website}.`,
        source: "system_prompt_meta.brand.website",
      };
    }
  }

  if (/contact|email/.test(q)) {
    const email = String(brand?.contact_email || "").trim();
    if (email) {
      return {
        reply: `You can contact the Edyx team at ${email}.`,
        source: "system_prompt_meta.brand.contact_email",
      };
    }
  }

  if (/owner|founder|who built|who created/.test(q)) {
    const owners = Array.isArray(brand?.owners) ? brand.owners : [];
    if (owners.length) {
      const ownerText = owners
        .map((o: any) => `${o?.name || "Unknown"}${o?.linkedin ? ` (${o.linkedin})` : ""}`)
        .join("; ");
      return {
        reply: `Edyx is built by ${ownerText}.`,
        source: "system_prompt_meta.brand.owners",
      };
    }
  }

  return null;
}

function composeGroundedAnswer(
  question: string,
  language: string,
  mode: "chat" | "call",
  overrideCandidates?: RetrievalCandidate[],
): {
  reply: string;
  confidence: "high" | "medium" | "low";
  sources: string[];
  candidates: RetrievalCandidate[];
  suggestedTopics: IntentCategory[];
} {
  const conversational = buildConversationalReply(question);
  if (conversational) {
    return {
      reply: conversational,
      confidence: "high",
      sources: ["greeting.primary"],
      candidates: [],
      suggestedTopics: [],
    };
  }

  const directBrand = buildDirectBrandReply(question);
  if (directBrand) {
    return {
      reply: directBrand.reply,
      confidence: "high",
      sources: [directBrand.source],
      candidates: [],
      suggestedTopics: [],
    };
  }

  const candidates = overrideCandidates?.length ? overrideCandidates : retrieveKnowledgeCandidates(question);
  const top = candidates[0];
  const second = candidates[1];
  const suggestedTopics = pickClarifierTopics(candidates);
  const intent = classifyIntent(question);
  const explicitPlatformAsk = /what\s+is\s+edyx|tell\s+me\s+about\s+edyx|about\s+edyx/.test(question.toLowerCase());

  if (!top || top.score < 0.36) {
    const fallback =
      "I could not find that exact detail in the current Edyx knowledge JSON. I can help with platform overview, API endpoints, auth, models, services, contribution, or appointment booking.";
    return { reply: fallback, confidence: "low", sources: [], candidates: [], suggestedTopics: [] };
  }

  const shouldSkipClarifier =
    explicitPlatformAsk ||
    (intent !== "unknown" && top.card.topic === intent && top.score >= 0.42 && (!second || top.score - second.score >= 0.02));

  if (!shouldSkipClarifier && (top.score < 0.56 || (second && top.score - second.score < 0.08))) {
    const topicText = suggestedTopics.length
      ? suggestedTopics.map((t) => t.replace(/_/g, " ")).join(", ")
      : "API endpoints, auth flow, models, services, or contribution";
    const clarifier =
      mode === "call"
        ? `I found related info in the Edyx knowledge base. Do you want details about ${topicText}?`
        : `I found related JSON sections, but I want to be precise. Should I answer this from ${topicText}?`;
    return {
      reply: clarifier,
      confidence: "medium",
      sources: candidates.slice(0, 2).map((c) => c.card.sourcePath),
      candidates,
      suggestedTopics,
    };
  }

  const composed = buildAnswerFromCandidates(candidates, question, language, mode);
  return {
    ...composed,
    candidates,
    suggestedTopics,
  };
}

function buildGroundedFactsBlock(candidates: RetrievalCandidate[], language: string): string {
  const selected = candidates.slice(0, 4);
  if (!selected.length) return "No retrieved facts.";

  return selected
    .map((c, idx) => {
      const fact = c.card.languageVariants[language === "hi" ? "hi" : "en"] || c.card.factText;
      return `${idx + 1}. [${c.card.sourcePath}] ${fact}`;
    })
    .join("\n");
}

function detectUserMode(question: string): "beginner" | "builder" {
  const q = question.toLowerCase();
  return /api|endpoint|route|payload|architecture|code|implement|debug|latency|security|token|jwt/.test(q)
    ? "builder"
    : "beginner";
}

function isComplexQuestion(question: string, candidates: RetrievalCandidate[]): boolean {
  const q = question.toLowerCase();
  const tokenCount = tokenize(question).length;
  const highDensityTechnical = /compare|difference|tradeoff|architecture|debug|failure|error|edge case|security|token|jwt|scope|throughput|latency|optimi/.test(q);
  const multiPart = (question.match(/[?]/g) || []).length >= 2 || /\band\b.*\band\b/.test(q);
  const top = candidates[0];
  const technicalTopic = top && ["architecture", "endpoints", "auth", "models", "runtime_policy"].includes(top.card.topic);
  return tokenCount >= 18 || highDensityTechnical || multiPart || Boolean(technicalTopic && top.score < 0.62);
}

async function runGroqCompletionWithFallback(args: {
  systemInstruction: string;
  question: string;
  preferredModel: string;
  mode: "chat" | "call";
}): Promise<{ text: string; modelUsed: string }> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error("Missing GROQ_API_KEY");
  }

  const { systemInstruction, question, preferredModel, mode } = args;
  const fallbackModel = mode === "call" ? GROQ_CALL_MODEL : GROQ_CHAT_MODEL;
  const candidateModels = uniqueStrings([preferredModel, GROQ_QUALITY_FALLBACK_MODEL, fallbackModel]);

  let lastError = "";
  for (const model of candidateModels) {
    const response = await fetch(`${GROQ_BASE_URL}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        temperature: 0.35,
        max_tokens: 520,
        messages: [
          { role: "system", content: systemInstruction },
          { role: "user", content: question },
        ],
      }),
    });

    if (response.ok) {
      const data: any = await response.json();
      const text = data?.choices?.[0]?.message?.content?.trim() || "I can help, but I need one clearer question about Edyx.";
      return { text, modelUsed: model };
    }

    lastError = await response.text();
  }

  throw new Error(`Groq grounded reply failed across models: ${lastError}`);
}

async function generateGroundedGroqReply(args: {
  question: string;
  mode: "chat" | "call";
  language: string;
  confidence: "high" | "medium";
  suggestedTopics: IntentCategory[];
  candidates: RetrievalCandidate[];
}): Promise<{ reply: string; modelUsed: string }> {

  const { question, mode, language, confidence, suggestedTopics, candidates } = args;
  const groundedFacts = buildGroundedFactsBlock(candidates, language);
  const userMode = detectUserMode(question);
  const complex = isComplexQuestion(question, candidates);
  const preferredModel = complex ? GROQ_COMPLEX_MODEL : (mode === "call" ? GROQ_CALL_MODEL : GROQ_CHAT_MODEL);
  const tone = mode === "call"
    ? "Use a natural spoken tone in short sentences."
    : "Use a concise, polished chat tone.";

  const clarificationHint =
    confidence === "medium"
      ? `If still ambiguous, ask one precise clarifying question choosing from: ${suggestedTopics.map((t) => t.replace(/_/g, " ")).join(", ") || "known Edyx topics"}.`
      : "Do not ask unnecessary clarifying questions if the answer is clear from retrieved facts.";

  const systemInstruction = [
    "You are the Edyx AI assistant.",
    "Fact strictness: very high. Style strictness: medium-low.",
    "Use ONLY the retrieved knowledge facts below for factual claims.",
    "Do not fabricate or infer beyond those facts.",
    "If facts are insufficient, say what is missing and suggest the closest supported topic.",
    "Never output raw JSON or internal field names.",
    "Rewrite facts in natural language.",
    userMode === "builder"
      ? "User mode: builder. Include practical technical steps with concise depth."
      : "User mode: beginner. Keep wording simple, clear, and practical.",
    "Prefer conversational natural answers. Ask a follow-up only when it adds value.",
    "Avoid repeating the same phrase every turn.",
    tone,
    clarificationHint,
    "Retrieved Edyx knowledge facts:",
    groundedFacts,
  ].join("\n");

  const completion = await runGroqCompletionWithFallback({
    systemInstruction,
    question,
    preferredModel,
    mode,
  });

  return { reply: completion.text, modelUsed: completion.modelUsed };
}

function normalizeMessages(rawMessages: unknown): AssistantMessage[] {
  if (!Array.isArray(rawMessages)) return [];

  return rawMessages
    .filter((msg) => msg && typeof msg === "object")
    .map((msg: any) => ({
      role: msg.role === "assistant" || msg.role === "system" ? msg.role : "user",
      content: typeof msg.content === "string" ? msg.content.trim().slice(0, 4000) : "",
    }))
    .filter((msg) => msg.content.length > 0);
}

function buildSystemMessage(mode: "chat" | "call"): string {
  const compiled = compilePromptContext();
  const style =
    mode === "chat"
      ? "Use a polished, formal, concise tone for chat replies."
      : "Use a warm, human, natural spoken tone for call replies. Keep it short and emotionally intelligent.";

  return [
    "You are the Edyx AI Voice Assistant.",
    "Follow these policies:",
    "- Ask one question at a time.",
    "- Keep answers concise and helpful.",
    "- Use deterministic factual details for owner/contact requests when available.",
    style,
    `Supported languages from runtime profile: ${compiled.supportedLanguages.join(", ")}.`,
    "Use the following canonical Edyx behavior context JSON as source of truth:",
    getPromptContext(),
  ].join("\n");
}

async function generateAssistantReply(messages: AssistantMessage[], mode: "chat" | "call") {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error("Missing GROQ_API_KEY");
  }

  const primaryModel = mode === "call" ? GROQ_CALL_MODEL : GROQ_CHAT_MODEL;
  const candidateModels = uniqueStrings([
    primaryModel,
    GROQ_QUALITY_FALLBACK_MODEL,
    "llama-3.3-70b-versatile",
    "mixtral-8x7b-32768",
    "gemma2-9b-it",
    "llama3-8b-8192"
  ]);

  let lastError = "";

  for (const model of candidateModels) {
    const response = await fetch(`${GROQ_BASE_URL}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        temperature: mode === "call" ? 0.45 : 0.3,
        max_tokens: 800,
        messages: [
          {
            role: "system",
            content: buildSystemMessage(mode),
          },
          ...messages,
        ],
      }),
    });

    if (response.ok) {
      const data: any = await response.json();
      const reply = data?.choices?.[0]?.message?.content?.trim() || "I apologize, I could not generate a response right now.";
      return { reply, modelUsed: model };
    }

    lastError = await response.text();
    // If it's not a rate limit, we could log it or choose to throw. But cycling through models is safe.
  }

  throw new Error(`Groq chat completion failed across all models. Last error: ${lastError}`);
}

router.post("/lead", async (req: Request, res: Response) => {
  try {
    const { name, email, phone, consent } = req.body || {};

    if (!name || !email || !phone) {
      sendError(res, 400, "INVALID_INPUT", "Name, email, and phone are required.", false);
      return;
    }

    const normalizedName = String(name).trim();
    const normalizedEmail = String(email).trim().toLowerCase();
    const normalizedPhone = String(phone).trim();
    const normalizedConsent = Boolean(consent);

    // Send a wide synonym payload once, then iteratively remove unknown columns
    // based on PostgREST error feedback until we match the real table schema.
    const adaptivePayload: Record<string, any> = {
      name: normalizedName,
      full_name: normalizedName,
      user_name: normalizedName,
      customer_name: normalizedName,
      lead_name: normalizedName,
      email: normalizedEmail,
      email_address: normalizedEmail,
      contact_email: normalizedEmail,
      phone: normalizedPhone,
      phone_number: normalizedPhone,
      mobile: normalizedPhone,
      mobile_number: normalizedPhone,
      contact_number: normalizedPhone,
      consent: normalizedConsent,
      marketing_consent: normalizedConsent,
      contact_consent: normalizedConsent,
      updates_opt_in: normalizedConsent,
      opted_in: normalizedConsent,
      source: "voice_assistant",
      lead_source: "voice_assistant",
      platform: "web",
    };

    let workingPayload = { ...adaptivePayload };
    let lastError: any = null;

    for (let attempt = 0; attempt < 24; attempt += 1) {
      const keys = Object.keys(workingPayload);
      if (!keys.length) {
        break;
      }

      const { error } = await supabase.from("voice_assistant_leads").insert(workingPayload);

      if (!error) {
        res.json({ ok: true });
        return;
      }

      lastError = error;

      const raw = `${error?.message || ""} ${error?.details || ""} ${error?.hint || ""}`;
      const missingColumnMatch = raw.match(/'([^']+)'\s+column/i);
      const missingColumn = missingColumnMatch?.[1];

      if (missingColumn && Object.prototype.hasOwnProperty.call(workingPayload, missingColumn)) {
        delete workingPayload[missingColumn];
        continue;
      }

      break;
    }

    res.status(500).json({
      error: "Unable to save lead. Please verify voice_assistant_leads table column names.",
      details: lastError?.message || lastError?.details || "Unknown insert failure",
      code: lastError?.code,
      hint: lastError?.hint,
    });
  } catch (error: any) {
    console.error("Lead capture error:", error);
    sendError(res, 500, "LEAD_CAPTURE_FAILED", "Internal server error", true, {
      details: error?.message,
    });
  }
});

router.get("/bootstrap", (_req: Request, res: Response) => {
  try {
    const compiled = compilePromptContext();
    const sessionId = createSessionId();
    const language = compiled.supportedLanguages.includes("en") ? "en" : compiled.supportedLanguages[0];

    sessionStore.set(sessionId, {
      sessionId,
      language,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      messages: [],
      pendingClarification: null,
    });

    res.json({
      sessionId,
      model: GROQ_CALL_MODEL,
      greeting: compiled.openingBehavior?.primary || "Hi, I am your Edyx assistant. How can I help you today?",
      languageCheck: compiled.languageCheck,
      supportedLanguages: compiled.supportedLanguages,
    });
  } catch (error: any) {
    sendError(res, 500, "BOOTSTRAP_FAILED", "Failed to bootstrap assistant session", true, {
      details: error?.message,
    });
  }
});

router.get("/model-info", (_req: Request, res: Response) => {
  const now = Date.now();
  if (cachedModelInfo && cachedModelInfo.expiresAt > now) {
    res.json(cachedModelInfo.value);
    return;
  }

  const value = {
    selectedModel: GROQ_CHAT_MODEL,
    candidateModels: [
      GROQ_CHAT_MODEL,
      GROQ_COMPLEX_MODEL,
      "llama-3.1-8b-instant",
      "llama-3.3-70b-versatile",
      "qwen-qwq-32b",
    ],
    cacheExpiry: new Date(now + MODEL_INFO_TTL_MS).toISOString(),
    source: "backend-runtime",
  };

  cachedModelInfo = {
    value,
    expiresAt: now + MODEL_INFO_TTL_MS,
  };

  res.json(value);
});

router.post("/reset", (req: Request, res: Response) => {
  const sessionId = String(req.body?.sessionId || "").trim();
  if (!sessionId) {
    sendError(res, 400, "INVALID_INPUT", "sessionId is required", false);
    return;
  }

  sessionStore.delete(sessionId);
  res.json({ ok: true });
});

router.post("/transcribe", upload.single("audio"), async (req: Request, res: Response) => {
  try {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      sendError(res, 500, "MISSING_API_KEY", "Missing GROQ_API_KEY", false);
      return;
    }

    const bodyLanguage = String(req.body?.language || "en").trim() || "en";
    let audioBuffer: Buffer | null = null;
    let mimeType = String(req.body?.mimeType || "audio/webm").trim() || "audio/webm";
    let filename = "voice-input.webm";

    if (req.file?.buffer) {
      audioBuffer = req.file.buffer;
      mimeType = req.file.mimetype || mimeType;
      filename = req.file.originalname || filename;
    } else if (typeof req.body?.audioBase64 === "string" && req.body.audioBase64.length > 0) {
      const rawBase64 = req.body.audioBase64.includes(",")
        ? req.body.audioBase64.split(",").pop()
        : req.body.audioBase64;
      audioBuffer = Buffer.from(rawBase64, "base64");
      filename = "voice-input.base64.webm";
    }

    if (!audioBuffer || !audioBuffer.length) {
      sendError(res, 400, "INVALID_INPUT", "audio file or audioBase64 is required", false);
      return;
    }

    const blob = new Blob([new Uint8Array(audioBuffer)], { type: mimeType });
    const formData = new FormData();
    formData.append("model", GROQ_WHISPER_MODEL);
    formData.append("language", bodyLanguage);
    formData.append("response_format", "verbose_json");
    formData.append("file", blob, filename);

    const transcriptionResponse = await fetch(`${GROQ_BASE_URL}/audio/transcriptions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
      body: formData,
    });

    if (!transcriptionResponse.ok) {
      const body = await transcriptionResponse.text();
      throw new Error(`Groq transcription failed: ${transcriptionResponse.status} ${body}`);
    }

    const transcriptData: any = await transcriptionResponse.json();
    const text = String(transcriptData?.text || "").trim();
    const confidence = typeof transcriptData?.confidence === "number" ? transcriptData.confidence : undefined;

    res.json({ text, confidence });
  } catch (error: any) {
    sendError(res, 500, "TRANSCRIBE_FAILED", "Failed to transcribe audio", true, {
      details: error?.message,
    });
  }
});

router.post("/tts", async (req: Request, res: Response) => {
  try {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      sendError(res, 500, "MISSING_API_KEY", "Missing GROQ_API_KEY", false);
      return;
    }

    const text = String(req.body?.text || "").trim();
    const language = String(req.body?.language || "en").trim().toLowerCase();

    if (!text) {
      sendError(res, 400, "INVALID_INPUT", "text is required", false);
      return;
    }

    const voice = language.startsWith("hi") ? GROQ_TTS_VOICE_HI : GROQ_TTS_VOICE_EN;

    const speechResponse = await fetch(`${GROQ_BASE_URL}/audio/speech`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: GROQ_TTS_MODEL,
        voice,
        input: text.slice(0, 2500),
        response_format: "mp3",
      }),
    });

    if (!speechResponse.ok) {
      const errorBody = await speechResponse.text();
      throw new Error(`Groq TTS failed: ${speechResponse.status} ${errorBody}`);
    }

    const audioBuffer = Buffer.from(await speechResponse.arrayBuffer());
    res.setHeader("Content-Type", speechResponse.headers.get("content-type") || "audio/mpeg");
    res.setHeader("Cache-Control", "no-store");
    res.send(audioBuffer);
  } catch (error: any) {
    sendError(res, 502, "TTS_FAILED", "Failed to synthesize speech audio", true, {
      details: error?.message,
    });
  }
});

router.post("/respond", async (req: Request, res: Response) => {
  try {
    const sessionId = String(req.body?.sessionId || "").trim();
    const userText = String(req.body?.userText || "").trim();
    const language = String(req.body?.language || "en").trim() || "en";
    const mode = req.body?.mode === "chat" ? "chat" : "call";

    if (!sessionId || !userText) {
      sendError(res, 400, "INVALID_INPUT", "sessionId and userText are required", false);
      return;
    }

    const session = sessionStore.get(sessionId);
    if (!session) {
      sendError(res, 404, "SESSION_NOT_FOUND", "Session not found. Please bootstrap again.", true);
      return;
    }

    const nextMessages = [
      ...session.messages,
      { role: "user", content: userText } as AssistantMessage,
    ];

    const boundedMessages = nextMessages.slice(-MAX_SESSION_TURNS * 2);
    session.messages = boundedMessages;
    session.language = language;
    session.updatedAt = Date.now();

    const { reply, modelUsed } = await generateAssistantReply(session.messages, mode);

    session.messages = [
      ...session.messages,
      { role: "assistant", content: reply } as AssistantMessage,
    ].slice(-MAX_SESSION_TURNS * 2);
    session.updatedAt = Date.now();

    res.json({
      reply,
      model: modelUsed,
      nextAction: "continue",
    });
  } catch (error: any) {
    sendError(res, 500, "RESPOND_FAILED", "Failed to generate assistant response", true, {
      details: error?.message,
    });
  }
});

router.post("/chat", async (req: Request, res: Response) => {
  try {
    const messages = normalizeMessages(req.body?.messages);
    if (!messages.length) {
      res.status(400).json({ error: "messages array is required" });
      return;
    }

    const { reply, modelUsed } = await generateAssistantReply(messages, "chat");

    res.json({
      role: "assistant",
      content: reply,
      language: "en",
      model: modelUsed,
      voice_profile: "warm-natural-single-voice",
      confidence: "high",
      sources: []
    });
  } catch (error: any) {
    console.error("Voice assistant chat error:", error);
    const fallback = fallbackPromptReply(normalizeMessages(req.body?.messages), "chat");
    res.json({
      role: "assistant",
      content: fallback,
      language: "en",
      voice_profile: "warm-natural-single-voice",
      fallback: true,
    });
  }
});

router.post("/call/respond", async (req: Request, res: Response) => {
  try {
    const messages = normalizeMessages(req.body?.messages);
    if (!messages.length) {
      res.status(400).json({ error: "messages array is required" });
      return;
    }

    const { reply, modelUsed } = await generateAssistantReply(messages, "call");

    res.json({
      role: "assistant",
      content: reply,
      language: "en",
      model: modelUsed,
      voice_profile: "warm-natural-single-voice",
      mode: "call",
      confidence: "high",
      sources: []
    });
  } catch (error: any) {
    console.error("Voice assistant call response error:", error);
    const fallback = fallbackPromptReply(normalizeMessages(req.body?.messages), "call");
    res.json({
      role: "assistant",
      content: fallback,
      language: "en",
      voice_profile: "warm-natural-single-voice",
      mode: "call",
      fallback: true,
    });
  }
});

router.post("/call/transcribe", upload.single("audio"), async (req: Request, res: Response) => {
  try {
    const file = req.file;
    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
      res.status(500).json({ error: "Missing GROQ_API_KEY" });
      return;
    }

    if (!file) {
      res.status(400).json({ error: "audio file is required" });
      return;
    }

    const blob = new Blob([new Uint8Array(file.buffer)], { type: file.mimetype });
    const formData = new FormData();
    formData.append("model", GROQ_WHISPER_MODEL);
    formData.append("language", "en");
    formData.append("response_format", "verbose_json");
    formData.append("file", blob, file.originalname || "voice.webm");

    const transcriptionResponse = await fetch(`${GROQ_BASE_URL}/audio/transcriptions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
      body: formData,
    });

    if (!transcriptionResponse.ok) {
      const body = await transcriptionResponse.text();
      throw new Error(`Groq transcription failed: ${transcriptionResponse.status} ${body}`);
    }

    const transcriptData: any = await transcriptionResponse.json();
    const text = transcriptData?.text?.trim() || "";

    res.json({
      text,
      language: "en",
      model: GROQ_WHISPER_MODEL,
      fluent_whisper_pipeline: true,
    });
  } catch (error: any) {
    console.error("Voice transcription error:", error);
    res.status(500).json({ error: "Failed to transcribe audio", details: error?.message });
  }
});

export default router;