export async function parseApiResponse<T>(
  res: Response
): Promise<{ ok: true; data: T } | { ok: false; error: string }> {
  const contentType = res.headers.get("content-type") ?? ""

  if (contentType.includes("application/json")) {
    const data = (await res.json()) as T & { error?: string }
    if (!res.ok) {
      return {
        ok: false,
        error: data.error ?? `Request failed (${res.status})`,
      }
    }
    return { ok: true, data }
  }

  if (!res.ok) {
    if (res.status === 401) {
      return { ok: false, error: "Your session expired. Sign in again." }
    }
    return { ok: false, error: `Request failed (${res.status}). Try again.` }
  }

  return { ok: false, error: "Unexpected server response." }
}
