import{a as u}from"./chunk-5E2BZ2EL.js";import c from"express";import A from"path";import L from"fs";import p from"fs";import x from"os";import h from"path";import C from"readline";var g=h.join(x.homedir(),".tac-agent"),l=h.join(g,"config.json");function o(e){let a=C.createInterface({input:process.stdin,output:process.stdout});return new Promise(t=>{a.question(e,n=>{a.close(),t(n.trim())})})}function y(){return p.existsSync(l)}function f(){if(!p.existsSync(l))throw new Error("TAC Agent config not found. Run tac-agent setup.");return JSON.parse(p.readFileSync(l,"utf8"))}function j(e){p.mkdirSync(g,{recursive:!0}),p.writeFileSync(l,JSON.stringify(e,null,2))}async function v(){console.log(`
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
`);let e=await o("Select provider number: "),t={1:"openai",2:"anthropic",3:"gemini",4:"azure-openai",5:"openrouter",6:"groq",7:"mistral",8:"deepseek",9:"ollama",10:"lmstudio",11:"custom"}[e];if(!t)throw new Error("Invalid provider selection");let n="",i="",r="";t==="openai"&&(n=await o("Enter OpenAI API key: "),r=await o("Model [gpt-4o]: ")||"gpt-4o"),t==="anthropic"&&(n=await o("Enter Anthropic API key: "),r=await o("Model [claude-3-5-sonnet-latest]: ")||"claude-3-5-sonnet-latest"),t==="gemini"&&(n=await o("Enter Gemini API key: "),r=await o("Model [gemini-1.5-pro]: ")||"gemini-1.5-pro"),t==="azure-openai"&&(n=await o("Enter Azure OpenAI API key: "),i=await o("Enter Azure endpoint: "),r=await o("Enter Azure deployment name: ")),t==="openrouter"&&(n=await o("Enter OpenRouter API key: "),r=await o("Model [openai/gpt-4o]: ")||"openai/gpt-4o",i="https://openrouter.ai/api/v1"),t==="groq"&&(n=await o("Enter Groq API key: "),r=await o("Model [llama-3.1-70b-versatile]: ")||"llama-3.1-70b-versatile",i="https://api.groq.com/openai/v1"),t==="mistral"&&(n=await o("Enter Mistral API key: "),r=await o("Model [mistral-large-latest]: ")||"mistral-large-latest",i="https://api.mistral.ai/v1"),t==="deepseek"&&(n=await o("Enter DeepSeek API key: "),r=await o("Model [deepseek-chat]: ")||"deepseek-chat",i="https://api.deepseek.com"),t==="ollama"&&(i=await o("Ollama endpoint [http://localhost:11434]: ")||"http://localhost:11434",r=await o("Model [llama3]: ")||"llama3"),t==="lmstudio"&&(i=await o("LM Studio endpoint [http://localhost:1234/v1]: ")||"http://localhost:1234/v1",r=await o("Model [local-model]: ")||"local-model"),t==="custom"&&(i=await o("Enter OpenAI-compatible endpoint: "),n=await o("Enter API key if required, otherwise leave blank: "),r=await o("Enter model name: ")),j({provider:t,apiKey:n||void 0,endpoint:i||void 0,model:r}),console.log(`
TAC Agent LLM configuration saved locally:

${l}

Provider: ${t}
Model: ${r}
`)}async function d(e,a,t){let n=await fetch(e,{method:"POST",headers:{"Content-Type":"application/json",...a},body:JSON.stringify(t)});if(!n.ok){let i=await n.text();throw new Error(`LLM request failed: ${n.status} ${i}`)}return n.json()}function w(e){return{async complete(a){if(e.provider==="ollama")return(await d(`${e.endpoint||"http://localhost:11434"}/api/generate`,{},{model:e.model,prompt:a,stream:!1})).response||"{}";if(e.provider==="anthropic")return(await d("https://api.anthropic.com/v1/messages",{"x-api-key":e.apiKey||"","anthropic-version":"2023-06-01"},{model:e.model,max_tokens:1200,temperature:.1,messages:[{role:"user",content:a}]})).content?.[0]?.text||"{}";if(e.provider==="gemini"){let s=`https://generativelanguage.googleapis.com/v1beta/models/${e.model}:generateContent?key=${e.apiKey}`;return(await d(s,{},{contents:[{role:"user",parts:[{text:a}]}],generationConfig:{temperature:.1}})).candidates?.[0]?.content?.parts?.[0]?.text||"{}"}let t=e.provider==="openai"?"https://api.openai.com/v1":e.provider==="azure-openai"?e.endpoint||"":e.provider==="openrouter"?e.endpoint||"https://openrouter.ai/api/v1":e.provider==="groq"?e.endpoint||"https://api.groq.com/openai/v1":e.provider==="mistral"?e.endpoint||"https://api.mistral.ai/v1":e.provider==="deepseek"?e.endpoint||"https://api.deepseek.com":e.provider==="lmstudio"?e.endpoint||"http://localhost:1234/v1":e.endpoint||"";if(!t)throw new Error("LLM endpoint is required");let n=e.provider==="azure-openai"?`${t}/openai/deployments/${e.model}/chat/completions?api-version=2024-02-15-preview`:`${t}/chat/completions`,i=e.provider==="azure-openai"?{"api-key":e.apiKey||""}:e.apiKey?{Authorization:`Bearer ${e.apiKey}`}:{};return(await d(n,i,{model:e.provider==="azure-openai"?void 0:e.model,temperature:.1,messages:[{role:"user",content:a}]})).choices?.[0]?.message?.content||"{}"}}}var k=4318;async function G(){y()||(console.log(`
No local LLM config found.
`),await v());let e=f(),a=w(e),t=c();t.use(c.json());let n=A.join(process.cwd(),"public");L.existsSync(n)&&t.use(c.static(n)),t.get("/health",(i,r)=>{r.json({status:"ok",provider:e.provider,model:e.model})}),t.get("/chat",(i,r)=>{let s=A.join(n,"chat.html");if(!L.existsSync(s))return r.status(500).send("chat.html not found");r.sendFile(s)}),t.post("/analyze",async(i,r)=>{try{let{input:s,decision_state:m}=i.body||{};if(!s)return r.status(400).json({error:"Missing input"});let M=await u({llm:a,input:s,decisionState:m||{}});r.json(M)}catch(s){console.error("Analyze error:",s.message),r.status(500).json({error:"Analysis failed"})}}),t.listen(k,()=>{console.log(`
TAC Agent local runtime started

Open:
http://localhost:${k}/chat
`)})}export{G as a};
