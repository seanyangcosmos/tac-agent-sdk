import type { TacLLM } from "./index"
import type { TacAgentConfig } from "./config"

async function postJson(url: string, headers: Record<string, string>, body: any) {
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`LLM request failed: ${res.status} ${text}`)
  }

  return res.json()
}

export function createLLM(config: TacAgentConfig): TacLLM {
  return {
    async complete(prompt: string): Promise<string> {
      if (config.provider === "ollama") {
        const json = await postJson(
          `${config.endpoint || "http://localhost:11434"}/api/generate`,
          {},
          {
            model: config.model,
            prompt,
            stream: false,
          }
        )

        return json.response || "{}"
      }

      if (config.provider === "anthropic") {
        const json = await postJson(
          "https://api.anthropic.com/v1/messages",
          {
            "x-api-key": config.apiKey || "",
            "anthropic-version": "2023-06-01",
          },
          {
            model: config.model,
            max_tokens: 1200,
            temperature: 0.1,
            messages: [{ role: "user", content: prompt }],
          }
        )

        return json.content?.[0]?.text || "{}"
      }

      if (config.provider === "gemini") {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${config.model}:generateContent?key=${config.apiKey}`

        const json = await postJson(
          url,
          {},
          {
            contents: [
              {
                role: "user",
                parts: [{ text: prompt }],
              },
            ],
            generationConfig: {
              temperature: 0.1,
            },
          }
        )

        return json.candidates?.[0]?.content?.parts?.[0]?.text || "{}"
      }

      const baseUrl =
        config.provider === "openai"
          ? "https://api.openai.com/v1"
          : config.provider === "azure-openai"
          ? config.endpoint || ""
          : config.provider === "openrouter"
          ? config.endpoint || "https://openrouter.ai/api/v1"
          : config.provider === "groq"
          ? config.endpoint || "https://api.groq.com/openai/v1"
          : config.provider === "mistral"
          ? config.endpoint || "https://api.mistral.ai/v1"
          : config.provider === "deepseek"
          ? config.endpoint || "https://api.deepseek.com"
          : config.provider === "lmstudio"
          ? config.endpoint || "http://localhost:1234/v1"
          : config.endpoint || ""

      if (!baseUrl) {
        throw new Error("LLM endpoint is required")
      }

      const url =
        config.provider === "azure-openai"
          ? `${baseUrl}/openai/deployments/${config.model}/chat/completions?api-version=2024-02-15-preview`
          : `${baseUrl}/chat/completions`

      const headers: Record<string, string> =
        config.provider === "azure-openai"
          ? { "api-key": config.apiKey || "" }
          : config.apiKey
          ? { Authorization: `Bearer ${config.apiKey}` }
          : {}

      const json = await postJson(url, headers, {
        model: config.provider === "azure-openai" ? undefined : config.model,
        temperature: 0.1,
        messages: [{ role: "user", content: prompt }],
      })

      return json.choices?.[0]?.message?.content || "{}"
    },
  }
}
