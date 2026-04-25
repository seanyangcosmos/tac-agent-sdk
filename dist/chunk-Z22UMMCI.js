import{a as u}from"./chunk-5E2BZ2EL.js";import c from"express";import A from"path";import j from"fs";import p from"fs";import M from"os";import h from"path";import C from"readline";var g=h.join(M.homedir(),".tac-agent"),l=h.join(g,"config.json");function n(e){let s=C.createInterface({input:process.stdin,output:process.stdout});return new Promise(t=>{s.question(e,r=>{s.close(),t(r.trim())})})}function y(){return p.existsSync(l)}function f(){if(!p.existsSync(l))throw new Error("TAC Agent config not found. Run tac-agent setup.");return JSON.parse(p.readFileSync(l,"utf8"))}function x(e){p.mkdirSync(g,{recursive:!0}),p.writeFileSync(l,JSON.stringify(e,null,2))}async function v(){console.log(`
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
`);let e=await n("Select provider number: "),t={1:"openai",2:"anthropic",3:"gemini",4:"azure-openai",5:"openrouter",6:"groq",7:"mistral",8:"deepseek",9:"ollama",10:"lmstudio",11:"custom"}[e];if(!t)throw new Error("Invalid provider selection");let r="",i="",o="";t==="openai"&&(r=await n("Enter OpenAI API key: "),o=await n("Model [gpt-4o]: ")||"gpt-4o"),t==="anthropic"&&(r=await n("Enter Anthropic API key: "),o=await n("Model [claude-3-5-sonnet-latest]: ")||"claude-3-5-sonnet-latest"),t==="gemini"&&(r=await n("Enter Gemini API key: "),o=await n("Model [gemini-1.5-pro]: ")||"gemini-1.5-pro"),t==="azure-openai"&&(r=await n("Enter Azure OpenAI API key: "),i=await n("Enter Azure endpoint: "),o=await n("Enter Azure deployment name: ")),t==="openrouter"&&(r=await n("Enter OpenRouter API key: "),o=await n("Model [openai/gpt-4o]: ")||"openai/gpt-4o",i="https://openrouter.ai/api/v1"),t==="groq"&&(r=await n("Enter Groq API key: "),o=await n("Model [llama-3.1-70b-versatile]: ")||"llama-3.1-70b-versatile",i="https://api.groq.com/openai/v1"),t==="mistral"&&(r=await n("Enter Mistral API key: "),o=await n("Model [mistral-large-latest]: ")||"mistral-large-latest",i="https://api.mistral.ai/v1"),t==="deepseek"&&(r=await n("Enter DeepSeek API key: "),o=await n("Model [deepseek-chat]: ")||"deepseek-chat",i="https://api.deepseek.com"),t==="ollama"&&(i=await n("Ollama endpoint [http://localhost:11434]: ")||"http://localhost:11434",o=await n("Model [llama3]: ")||"llama3"),t==="lmstudio"&&(i=await n("LM Studio endpoint [http://localhost:1234/v1]: ")||"http://localhost:1234/v1",o=await n("Model [local-model]: ")||"local-model"),t==="custom"&&(i=await n("Enter OpenAI-compatible endpoint: "),r=await n("Enter API key if required, otherwise leave blank: "),o=await n("Enter model name: ")),x({provider:t,apiKey:r||void 0,endpoint:i||void 0,model:o}),console.log(`
TAC Agent LLM configuration saved locally:

${l}

Provider: ${t}
Model: ${o}
`)}async function d(e,s,t){let r=await fetch(e,{method:"POST",headers:{"Content-Type":"application/json",...s},body:JSON.stringify(t)});if(!r.ok){let i=await r.text();throw new Error(`LLM request failed: ${r.status} ${i}`)}return r.json()}function w(e){return{async complete(s){if(e.provider==="ollama")return(await d(`${e.endpoint||"http://localhost:11434"}/api/generate`,{},{model:e.model,prompt:s,stream:!1})).response||"{}";if(e.provider==="anthropic")return(await d("https://api.anthropic.com/v1/messages",{"x-api-key":e.apiKey||"","anthropic-version":"2023-06-01"},{model:e.model,max_tokens:1200,temperature:.1,messages:[{role:"user",content:s}]})).content?.[0]?.text||"{}";if(e.provider==="gemini"){let a=`https://generativelanguage.googleapis.com/v1beta/models/${e.model}:generateContent?key=${e.apiKey}`;return(await d(a,{},{contents:[{role:"user",parts:[{text:s}]}],generationConfig:{temperature:.1}})).candidates?.[0]?.content?.parts?.[0]?.text||"{}"}let t=e.provider==="openai"?"https://api.openai.com/v1":e.provider==="azure-openai"?e.endpoint||"":e.provider==="openrouter"?e.endpoint||"https://openrouter.ai/api/v1":e.provider==="groq"?e.endpoint||"https://api.groq.com/openai/v1":e.provider==="mistral"?e.endpoint||"https://api.mistral.ai/v1":e.provider==="deepseek"?e.endpoint||"https://api.deepseek.com":e.provider==="lmstudio"?e.endpoint||"http://localhost:1234/v1":e.endpoint||"";if(!t)throw new Error("LLM endpoint is required");let r=e.provider==="azure-openai"?`${t}/openai/deployments/${e.model}/chat/completions?api-version=2024-02-15-preview`:`${t}/chat/completions`,i=e.provider==="azure-openai"?{"api-key":e.apiKey||""}:e.apiKey?{Authorization:`Bearer ${e.apiKey}`}:{};return(await d(r,i,{model:e.provider==="azure-openai"?void 0:e.model,temperature:.1,messages:[{role:"user",content:s}]})).choices?.[0]?.message?.content||"{}"}}}var L=4318;async function G(){y()||(console.log(`
No local LLM config found.
`),await v());let e=f(),s=w(e),t=c();t.use(c.json());let r=A.join(process.cwd(),"public");t.get("/health",(i,o)=>{o.json({ok:!0,provider:e.provider,model:e.model})}),t.get("/",(i,o)=>{o.redirect("/chat")}),t.get("/chat",(i,o)=>{let a=A.join(r,"chat.html");if(!j.existsSync(a))return o.status(500).send("chat.html not found");o.sendFile(a)}),t.post("/analyze",async(i,o)=>{try{let a=String(i.body?.input||"").trim(),m=i.body?.decision_state||{};if(!a)return o.status(400).json({error:"Missing input"});let k=await u({llm:s,input:a,decisionState:m});return o.json(k)}catch(a){return console.error("Analyze error:",a?.message||a),o.status(500).json({error:"Analysis failed",detail:a?.message||String(a)})}}),t.use(c.static(r)),t.listen(L,()=>{console.log(`
TAC Agent local runtime started

Open:
http://localhost:${L}/chat
`)})}export{G as a};
