// @/services/achievement.ts
import type {
  ApiError,
  ApiSuccess,
  Achievement,
  AchievementListItem,
  AchievementStats,
  CreateAchievementBody,
  UpdateAchievementBody,
  Attachment,
} from "@/types/achievement";

type ApiOptions = {
  token?: string; // kalau backend pakai Authorization: Bearer <token>
  credentials?: RequestCredentials; // kalau backend pakai cookie session
  signal?: AbortSignal;
};

const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  ""
).replace(/\/$/, "");

function requireBaseUrl() {
  if (!API_BASE_URL) {
    throw new Error("NEXT_PUBLIC_API_BASE_URL belum diset");
  }
  return API_BASE_URL;
}

function buildUrl(path: string) {
  const base = requireBaseUrl();
  return `${base}${path.startsWith("/") ? "" : "/"}${path}`;
}

function getTokenFromStorage(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem('auth-token');
  } catch {
    return null;
  }
}

function withAuthHeaders(
  headers: HeadersInit | undefined,
  token?: string
): HeadersInit {
  const authToken = token || getTokenFromStorage();
  if (!authToken) return headers ?? {};
  return {
    ...(headers ?? {}),
    Authorization: `Bearer ${authToken}`,
  };
}

async function readJsonSafe(res: Response): Promise<unknown> {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return { status: "error", data: { message: text } };
  }
}

function pickDefined<T extends Record<string, unknown>>(obj: T): Partial<T> {
  const out: Partial<T> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v !== undefined) {
      (out as Record<string, unknown>)[k] = v;
    }
  }
  return out;
}

async function apiFetch<T>(
  path: string,
  init: RequestInit = {},
  opts: ApiOptions = {}
): Promise<T> {
  const url = buildUrl(path);

  const headers = withAuthHeaders(init.headers, opts.token);

  const res = await fetch(url, {
    ...init,
    headers,
    credentials: opts.credentials || 'include',
    signal: opts.signal,
  });

  const payload = (await readJsonSafe(res)) as
    | ApiSuccess<T>
    | ApiError
    | unknown;

  if (!res.ok) {
    const errorPayload = payload as ApiError | unknown;
    const message =
      typeof errorPayload === "object" &&
      errorPayload !== null &&
      "status" in errorPayload &&
      errorPayload.status === "error" &&
      "data" in errorPayload &&
      typeof errorPayload.data === "object" &&
      errorPayload.data !== null &&
      "message" in errorPayload.data &&
      typeof errorPayload.data.message === "string"
        ? errorPayload.data.message
        : `Request gagal (${res.status})`;

    throw new Error(message);
  }

  const successPayload = payload as ApiSuccess<T> | unknown;
  if (
    typeof successPayload === "object" &&
    successPayload !== null &&
    "status" in successPayload &&
    successPayload.status === "success" &&
    "data" in successPayload
  ) {
    return (successPayload as ApiSuccess<T>).data;
  }

  // fallback kalau backend suatu saat balikin raw data
  return payload as T;
}

/** =========================
 *  ACHIEVEMENTS
 *  ========================= */

const ACHIEVEMENTS_BASE = "/api/v1/achievements";

export async function getAchievements(
  opts: ApiOptions = {}
): Promise<AchievementListItem[]> {
  return apiFetch<AchievementListItem[]>(
    `${ACHIEVEMENTS_BASE}`,
    { method: "GET" },
    opts
  );
}

export async function getAchievementById(
  id: string,
  opts: ApiOptions = {}
): Promise<Achievement> {
  return apiFetch<Achievement>(
    `${ACHIEVEMENTS_BASE}/${id}`,
    { method: "GET" },
    opts
  );
}

export async function createAchievement(
  body: CreateAchievementBody,
  opts: ApiOptions = {}
): Promise<Achievement> {
  return apiFetch<Achievement>(
    `${ACHIEVEMENTS_BASE}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    },
    opts
  );
}

export async function updateAchievement(
  id: string,
  body: UpdateAchievementBody,
  opts: ApiOptions = {}
): Promise<Achievement> {
  const attachments = Array.isArray(body.attachments)
      ? body.attachments
      : undefined;

  const payload = pickDefined({
    achievementType: body.achievementType,
    title: body.title,
    description: body.description,
    details: body.details,
    attachments,
    tags: body.tags,
    points: body.points,
  });

  return apiFetch<Achievement>(
    `${ACHIEVEMENTS_BASE}/${id}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    },
    opts
  );
}

export async function deleteAchievement(
  id: string,
  opts: ApiOptions = {}
): Promise<void> {
  await apiFetch<unknown>(
    `${ACHIEVEMENTS_BASE}/${id}`,
    { method: "DELETE" },
    opts
  );
}

export async function submitAchievement(
  id: string,
  opts: ApiOptions = {}
): Promise<unknown> {
  // backend balikin UpdateAchievementReferenceResponse (status + data reference)
  return apiFetch<unknown>(
    `${ACHIEVEMENTS_BASE}/${id}/submit`,
    { method: "POST" },
    opts
  );
}

/**
 * Upload attachment
 * Endpoint: POST /api/v1/achievements/:id/attachments
 * Field name harus "file"
 * Jangan set Content-Type manual kalau pakai FormData, browser yang set boundary-nya. :contentReference[oaicite:2]{index=2}
 */
export async function uploadAchievementAttachment(
  id: string,
  file: File,
  opts: ApiOptions = {}
): Promise<Attachment> {
  const form = new FormData();
  form.append("file", file);

  return apiFetch<Attachment>(
    `${ACHIEVEMENTS_BASE}/${id}/attachments`,
    {
      method: "POST",
      body: form,
      // headers jangan di-set Content-Type
    },
    opts
  );
}

/** =========================
 *  STATS
 *  ========================= */

export async function getAchievementStats(
  opts: ApiOptions = {}
): Promise<AchievementStats> {
  return apiFetch<AchievementStats>(
    `${ACHIEVEMENTS_BASE}/stats`,
    { method: "GET" },
    opts
  );
}
