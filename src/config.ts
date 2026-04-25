import fs from "fs"
import os from "os"
import path from "path"
import readline from "readline"
import { checkModel } from "./checkModel"

export type LLMProvider =
  | "openai"
  | "anthropic"
  | "gemini"
  | "azure-openai"
  | "openrouter"
  | "groq"
  | "mistral"
  | "deepseek"
  | "ollama"
  | "lmstudio"
  | "custom"

export type TacAgentConfig = {
  provider: LLMProvider
  apiKey?: string
  endpoint?: string
  model: string
}

const CONFIG_DIR = path.join(os.homedir(), ".tac-agent")
const CONFIG_PATH = path.join(CONFIG_DIR, "config.json")

function ask(question: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  })

  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close()
      resolve(answer.trim())
    })
  })
}

export function configExists() {
  return fs.existsSync(CONFIG_PATH)
}

export function loadConfig(): TacAgentConfig {
  if (!fs.existsSync(CONFIG_PATH)) {
    throw new Error("TAC Agent config not found. Run tac-agent setup.")
  }

  return JSON.parse(fs.readFileSync(CONFIG_PATH, "utf8"))
}

export function saveConfig(config: TacAgentConfig) {
  fs.mkdirSync(CONFIG_DIR, { recursive: true })
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2))
}

export async function setupConfig() {
  console.log(`
TAC Agent Local LLM Setup

Choose your LLM provider:

1) OpenAI
2) Anthropic / Claude
3) Google Gemini
4) Azure OpenAI
5) OpenRouter
6) Groq
7) Mistral
8) DeepSeek
9) Ollama
10) LM Studio
11) Custom OpenAI-compatible endpoint
`)

  const choice = await ask("Select provider number: ")

  const map: Record<string, LLMProvider> = {
    "1": "openai",
    "2": "anthropic",
    "3": "gemini",
    "4": "azure-openai",
    "5": "openrouter",
    "6": "groq",
    "7": "mistral",
    "8": "deepseek",
    "9": "ollama",
    "10": "lmstudio",
    "11": "custom",
  }

  const provider = map[choice]

  if (!provider) {
    throw new Error("Invalid provider selection")
  }

  let apiKey = ""
  let endpoint = ""
  let model = ""

  if (provider === "openai") {
    apiKey = await ask("Enter OpenAI API key: ")
    model = (await ask("Model [gpt-4o]: ")) || "gpt-4o"
  }

  if (provider === "anthropic") {
    apiKey = await ask("Enter Anthropic API key: ")
    model = (await ask("Model [claude-3-5-sonnet-latest]: ")) || "claude-3-5-sonnet-latest"
  }

  if (provider === "gemini") {
    apiKey = await ask("Enter Gemini API key: ")
    model = (await ask("Model [gemini-1.5-pro]: ")) || "gemini-1.5-pro"
  }

  if (provider === "azure-openai") {
    apiKey = await ask("Enter Azure OpenAI API key: ")
    endpoint = await ask("Enter Azure endpoint: ")
    model = await ask("Enter Azure deployment name: ")
  }

  if (provider === "openrouter") {
    apiKey = await ask("Enter OpenRouter API key: ")
    model = (await ask("Model [openai/gpt-4o]: ")) || "openai/gpt-4o"
    endpoint = "https://openrouter.ai/api/v1"
  }

  if (provider === "groq") {
    apiKey = await ask("Enter Groq API key: ")
    model = (await ask("Model [llama-3.1-70b-versatile]: ")) || "llama-3.1-70b-versatile"
    endpoint = "https://api.groq.com/openai/v1"
  }

  if (provider === "mistral") {
    apiKey = await ask("Enter Mistral API key: ")
    model = (await ask("Model [mistral-large-latest]: ")) || "mistral-large-latest"
    endpoint = "https://api.mistral.ai/v1"
  }

  if (provider === "deepseek") {
    apiKey = await ask("Enter DeepSeek API key: ")
    model = (await ask("Model [deepseek-chat]: ")) || "deepseek-chat"
    endpoint = "https://api.deepseek.com"
  }

  if (provider === "ollama") {
    endpoint = (await ask("Ollama endpoint [http://localhost:11434]: ")) || "http://localhost:11434"
    model = (await ask("Model [llama3]: ")) || "llama3"
  }

  if (provider === "lmstudio") {
    endpoint = (await ask("LM Studio endpoint [http://localhost:1234/v1]: ")) || "http://localhost:1234/v1"
    model = (await ask("Model [local-model]: ")) || "local-model"
  }

  if (provider === "custom") {
    endpoint = await ask("Enter OpenAI-compatible endpoint: ")
    apiKey = await ask("Enter API key if required, otherwise leave blank: ")
    model = await ask("Enter model name: ")
  }

  const config: TacAgentConfig = {
    provider,
    apiKey: apiKey || undefined,
    endpoint: endpoint || undefined,
    model,
  }

  console.log("\nTesting selected model access...\n")

  const result = await checkModel(config)

  if (!result.ok) {
    console.log("Model test failed.\n")

    if (result.reason) {
      console.log("Reason:")
      console.log(result.reason)
      console.log("")
    }

    if (result.suggestions?.length) {
      console.log("Suggestions:")
      for (const item of result.suggestions) {
        console.log(`- ${item}`)
      }
      console.log("")
    }

    throw new Error(
      "LLM setup failed. Please run tac-agent again and choose a working model."
    )
  }

  saveConfig(config)

  console.log(`
  TAC Agent configuration saved:

  Provider: ${config.provider}
  Model: ${config.model}

  Model test passed.
  `)
  console.log(`
TAC Agent LLM configuration saved locally:

${CONFIG_PATH}

Provider: ${provider}
Model: ${model}
`)
}
