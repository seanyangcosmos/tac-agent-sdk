import express from "express"
import path from "path"
import fs from "fs"
import { tacAnalyze } from "./index"
import { loadConfig, configExists, setupConfig } from "./config"
import { createLLM } from "./llm"

const PORT = 4318

export async function startServer() {
  if (!configExists()) {
    console.log("\nNo local LLM config found.\n")
    await setupConfig()
  }

  const config = loadConfig()
  const llm = createLLM(config)

  const app = express()
  app.use(express.json())

  const publicPath = path.join(process.cwd(), "public")

  app.get("/health", (_, res) => {
    res.json({
      ok: true,
      provider: config.provider,
      model: config.model,
    })
  })

  app.get("/", (_, res) => {
    res.redirect("/chat")
  })

  app.get("/chat", (_, res) => {
    const chatFile = path.join(publicPath, "chat.html")

    if (!fs.existsSync(chatFile)) {
      return res.status(500).send("chat.html not found")
    }

    res.sendFile(chatFile)
  })

  app.post("/analyze", async (req, res) => {
    try {
      const input = String(req.body?.input || "").trim()
      const decisionState = req.body?.decision_state || {}

      if (!input) {
        return res.status(400).json({
          error: "Missing input",
        })
      }

      const result = await tacAnalyze({
        llm,
        input,
        decisionState,
      })

      return res.json(result)
    } catch (err: any) {
      console.error("Analyze error:", err?.message || err)

      return res.status(500).json({
        error: "Analysis failed",
        detail: err?.message || String(err),
      })
    }
  })

  app.use(express.static(publicPath))

  app.listen(PORT, () => {
    console.log(`
TAC Agent local runtime started

Open:
http://localhost:${PORT}/chat
`)
  })
}
