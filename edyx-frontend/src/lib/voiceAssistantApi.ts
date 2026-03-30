export const BACKEND_URL =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV ? "http://localhost:3001" : "https://edyx-backend.onrender.com");

export type AssistantMessage = {
  role: "user" | "assistant";
  content: string;
};

export type LeadPayload = {
  name: string;
  email: string;
  phone: string;
  consent: boolean;
};

export type BootstrapResponse = {
  sessionId: string;
  model: string;
  greeting: string;
  languageCheck: string;
  supportedLanguages: string[];
};

export type RespondResponse = {
  reply: string;
  model: string;
  nextAction?: string;
};

export type ModelInfoResponse = {
  selectedModel: string;
  candidateModels: string[];
  cacheExpiry: string;
  source: string;
};

export type VoiceApiError = Error & {
  status?: number;
  code?: string;
  retryable?: boolean;
};

async function parseApiResponse(response: Response) {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(data?.message || data?.error || "Request failed") as VoiceApiError;
    error.status = response.status;
    error.code = data?.code;
    error.retryable = data?.retryable;
    throw error;
  }
  return data;
}

export async function bootstrapAssistant(signal?: AbortSignal): Promise<BootstrapResponse> {
  const response = await fetch(`${BACKEND_URL}/voice-assistant/bootstrap`, { signal });
  const data = (await parseApiResponse(response)) as Partial<BootstrapResponse>;

  if (!data?.sessionId || typeof data.sessionId !== "string") {
    const error = new Error("Assistant service is still waking up. Please retry in a moment.") as VoiceApiError;
    error.code = "BOOTSTRAP_INVALID_RESPONSE";
    error.retryable = true;
    throw error;
  }

  return data as BootstrapResponse;
}

export async function fetchModelInfo(): Promise<ModelInfoResponse> {
  const response = await fetch(`${BACKEND_URL}/voice-assistant/model-info`);
  return parseApiResponse(response);
}

export async function respondAssistant(
  payload: {
    sessionId: string;
    userText: string;
    language: string;
    mode?: "chat" | "call";
  },
  signal?: AbortSignal
): Promise<RespondResponse> {
  const response = await fetch(`${BACKEND_URL}/voice-assistant/respond`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    signal,
  });

  return parseApiResponse(response);
}

export async function resetAssistantSession(sessionId: string): Promise<{ ok: boolean }> {
  const response = await fetch(`${BACKEND_URL}/voice-assistant/reset`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sessionId }),
  });

  return parseApiResponse(response);
}

export async function submitVoiceLead(payload: LeadPayload) {
  const response = await fetch(`${BACKEND_URL}/voice-assistant/lead`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  return parseApiResponse(response);
}

export function submitVoiceLeadInBackground(payload: LeadPayload, onError?: (error: unknown) => void) {
  void submitVoiceLead(payload).catch((error) => {
    if (onError) {
      onError(error);
    }
  });
}

export async function sendAssistantChat(messages: AssistantMessage[]) {
  const response = await fetch(`${BACKEND_URL}/voice-assistant/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages }),
  });

  return parseApiResponse(response);
}

export async function sendAssistantCall(messages: AssistantMessage[]) {
  const response = await fetch(`${BACKEND_URL}/voice-assistant/call/respond`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages }),
  });

  return parseApiResponse(response);
}

export async function transcribeCallAudio(audioBlob: Blob, signal?: AbortSignal) {
  const formData = new FormData();
  formData.append("audio", audioBlob, "voice-input.webm");
  formData.append("mimeType", audioBlob.type || "audio/webm");
  formData.append("language", "en");

  const response = await fetch(`${BACKEND_URL}/voice-assistant/transcribe`, {
    method: "POST",
    body: formData,
    signal,
  });

  return parseApiResponse(response);
}

export async function fetchAssistantTtsAudio(
  payload: { text: string; language: string },
  signal?: AbortSignal
): Promise<Blob> {
  const response = await fetch(`${BACKEND_URL}/voice-assistant/tts`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    signal,
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data?.message || data?.error || "TTS request failed");
  }

  return response.blob();
}
