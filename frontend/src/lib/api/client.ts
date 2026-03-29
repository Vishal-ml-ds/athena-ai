/**
 * API client for ATHENA backend.
 * Handles auth headers, error wrapping, and response parsing.
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  error: { code: string; message: string } | null;
}

class ApiError extends Error {
  code: string;
  statusCode: number;

  constructor(message: string, code: string, statusCode: number) {
    super(message);
    this.code = code;
    this.statusCode = statusCode;
  }
}

async function getAuthToken(): Promise<string | null> {
  // Import dynamically to avoid SSR issues
  const { createClient } = await import("@/lib/supabase/client");
  const supabase = createClient();
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token ?? null;
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = await getAuthToken();

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    const errorMessage = body?.error?.message || `Request failed: ${response.status}`;
    const errorCode = body?.error?.code || "UNKNOWN_ERROR";
    throw new ApiError(errorMessage, errorCode, response.status);
  }

  const body: ApiResponse<T> = await response.json();

  if (!body.success) {
    throw new ApiError(
      body.error?.message || "Request failed",
      body.error?.code || "UNKNOWN_ERROR",
      response.status
    );
  }

  return body.data as T;
}

export const api = {
  get: <T>(endpoint: string) => request<T>(endpoint),

  post: <T>(endpoint: string, data?: unknown) =>
    request<T>(endpoint, {
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    }),

  patch: <T>(endpoint: string, data: unknown) =>
    request<T>(endpoint, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  delete: <T>(endpoint: string) =>
    request<T>(endpoint, { method: "DELETE" }),
};

/**
 * Send a message and consume the SSE stream.
 * Yields parsed event objects as they arrive.
 */
export async function* streamMessage(
  conversationId: string,
  content: string
): AsyncGenerator<Record<string, unknown>> {
  const token = await getAuthToken();

  const response = await fetch(
    `${API_BASE}/api/v1/conversations/${conversationId}/messages`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ content }),
    }
  );

  if (!response.ok || !response.body) {
    throw new ApiError("Failed to send message", "STREAM_ERROR", response.status);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() || "";

    for (const line of lines) {
      if (line.startsWith("data: ")) {
        try {
          const event = JSON.parse(line.slice(6));
          yield event;
        } catch {
          // Skip malformed events
        }
      }
    }
  }
}

export { ApiError };
