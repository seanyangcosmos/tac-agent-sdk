import OpenAI from "openai"
import { tacAnalyze } from "./index"

export async function runTAC({
  provider,
  apiKey,
  input
}: {
  provider: "openai" | "claude" | "ollama" | "lmstudio"
  apiKey?: string
  input: string
}) {

  let llm

  if (provider === "openai") {
    const client = new OpenAI({ apiKey })

    llm = {
      async complete(prompt: string) {
        const r = await client.chat.completions.create({
          model: "gpt-4o",
          messages: [{ role: "user", content: prompt }],
          temperature: 0.1
        })

        return r.choices[0].message.content || "{}"
      }
    }
  }

  else if (provider === "ollama") {
    llm = {
      async complete(prompt: string) {

        const r = await fetch(
          "http://localhost:11434/api/generate",
          {
            method: "POST",
            body: JSON.stringify({
              model: "llama3",
              prompt
            })
          }
        )

        const json = await r.json()
        return json.response
      }
    }
  }

  else if (provider === "lmstudio") {

    llm = {
      async complete(prompt: string) {

        const r = await fetch(
          "http://localhost:1234/v1/chat/completions",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              model: "local-model",
              messages: [
                { role: "user", content: prompt }
              ]
            })
          }
        )

        const json = await r.json()
        return json.choices[0].message.content
      }
    }
  }

  else {
    throw new Error("Unsupported provider")
  }

  return tacAnalyze({
    llm,
    input
  })
}
