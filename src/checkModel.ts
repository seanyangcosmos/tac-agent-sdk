import type { TacAgentConfig } from "./config"
import { createLLM } from "./llm"

export type ModelCheckResult = {
  ok: boolean
  reason?: string
  suggestions?: string[]
}

/**
 * Runs a minimal inference call to verify the selected model works.
 * Does NOT fallback to other providers.
 */
export async function checkModel(
  config: TacAgentConfig
): Promise<ModelCheckResult> {
  try {
    const llm = createLLM(config)

    const raw = await llm.complete(
      'Return valid JSON only: {"ok": true}'
    )

    const cleaned = String(raw || "")
      .replace(/```json/gi, "")
      .replace(/```/g, "")
      .trim()

    const parsed = JSON.parse(cleaned)

    if (parsed?.ok === true) {
      return { ok: true }
    }

    return {
      ok: false,
      reason:
        "Model responded but did not return valid JSON in expected format.",
      suggestions: suggestionsFor(config),
    }
  } catch (err: any) {
    return {
      ok: false,
      reason: normalizeError(err),
      suggestions: suggestionsFor(config),
    }
  }
}

/**
 * Normalizes provider error messages into readable output.
 */
function normalizeError(err: any): string {
  if (!err) return "Unknown model error."

  const msg = String(err.message || err)

  if (msg.includes("401")) {
    return "Authentication failed. API key may be invalid."
  }

  if (msg.includes("403")) {
    return "Access denied. This API key may not have permission to use the selected model."
  }

  if (msg.includes("404")) {
    return "Model not found or not accessible to this account."
  }

  if (msg.includes("ECONNREFUSED")) {
    return "Connection refused. Local model server may not be running."
  }

  if (msg.includes("timeout")) {
    return "Connection timeout. Model endpoint may be unreachable."
  }

  return msg
}

/**
 * Provider-specific troubleshooting suggestions.
 * Never recommends switching providers.
 */
function suggestionsFor(config: TacAgentConfig): string[] {
  const base = [
    "Check that the API key or local endpoint is correct.",
    "Check that the selected model name exists in your provider environment.",
    "Test the same model using the provider's official console or CLI.",
    "Ensure network access to the model endpoint is available.",
  ]

  switch (config.provider) {
    case "openai":
      return [
        "Verify the OpenAI API key is active.",
        "Confirm the model name exactly matches OpenAI documentation.",
        "Example valid models include: gpt-4o, gpt-4.1-mini.",
        ...base,
      ]

    case "anthropic":
      return [
        "Verify Claude API access is enabled for this account.",
        "Check that this Anthropic account has inference permission.",
        "Confirm the selected Claude model exists in your Anthropic console.",
        ...base,
      ]

    case "ollama":
      return [
        "Ensure Ollama is running locally.",
        "Run: ollama list",
        "Verify the selected model exists locally.",
        ...base,
      ]

    case "lmstudio":
      return [
        "Ensure LM Studio local server is running.",
        "Enable OpenAI-compatible API mode in LM Studio.",
        "Default endpoint is usually http://localhost:1234/v1.",
        ...base,
      ]

    case "openai-compatible":
      return [
        "Verify the endpoint URL is correct.",
        "Confirm the model exists on that endpoint.",
        "Ensure the endpoint supports /v1/chat/completions.",
        ...base,
      ]

    default:
      return base
  }
}
