type ApiPayload = {
  ok?: boolean
  message?: string
}

const statusMessage = (response: Response, fallback: string) =>
  `${fallback} (${response.status} ${response.statusText || "response"})`

export async function readJsonSafely<T>(response: Response): Promise<T | null> {
  const text = await response.text()
  if (!text.trim()) return null

  try {
    return JSON.parse(text) as T
  } catch {
    return null
  }
}

export async function readApiResponse<T extends ApiPayload>(
  response: Response,
  fallbackMessage: string,
  emptyPayload?: T,
): Promise<T> {
  const payload = await readJsonSafely<T>(response)

  if (!payload) {
    if (response.ok && emptyPayload) return emptyPayload
    throw new Error(
      response.ok
        ? "The server returned an empty response. Please try again."
        : statusMessage(response, fallbackMessage),
    )
  }

  if (!response.ok || payload.ok === false) {
    throw new Error(payload.message || statusMessage(response, fallbackMessage))
  }

  return payload
}
