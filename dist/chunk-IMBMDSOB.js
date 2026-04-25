import{a as h}from"./chunk-5E2BZ2EL.js";import g from"express";import C from"path";import S from"fs";import p from"fs";import E from"os";import v from"path";import I from"readline";async function d(e,o,t){let i=await fetch(e,{method:"POST",headers:{"Content-Type":"application/json",...o},body:JSON.stringify(t)});if(!i.ok){let a=await i.text();throw new Error(`LLM request failed: ${i.status} ${a}`)}return i.json()}function u(e){return{async complete(o){if(e.provider==="ollama")return(await d(`${e.endpoint||"http://localhost:11434"}/api/generate`,{},{model:e.model,prompt:o,stream:!1})).response||"{}";if(e.provider==="anthropic")return(await d("https://api.anthropic.com/v1/messages",{"x-api-key":e.apiKey||"","anthropic-version":"2023-06-01"},{model:e.model,max_tokens:1200,temperature:.1,messages:[{role:"user",content:o}]})).content?.[0]?.text||"{}";if(e.provider==="gemini"){let s=`https://generativelanguage.googleapis.com/v1beta/models/${e.model}:generateContent?key=${e.apiKey}`;return(await d(s,{},{contents:[{role:"user",parts:[{text:o}]}],generationConfig:{temperature:.1}})).candidates?.[0]?.content?.parts?.[0]?.text||"{}"}let t=e.provider==="openai"?"https://api.openai.com/v1":e.provider==="azure-openai"?e.endpoint||"":e.provider==="openrouter"?e.endpoint||"https://openrouter.ai/api/v1":e.provider==="groq"?e.endpoint||"https://api.groq.com/openai/v1":e.provider==="mistral"?e.endpoint||"https://api.mistral.ai/v1":e.provider==="deepseek"?e.endpoint||"https://api.deepseek.com":e.provider==="lmstudio"?e.endpoint||"http://localhost:1234/v1":e.endpoint||"";if(!t)throw new Error("LLM endpoint is required");let i=e.provider==="azure-openai"?`${t}/openai/deployments/${e.model}/chat/completions?api-version=2024-02-15-preview`:`${t}/chat/completions`,a=e.provider==="azure-openai"?{"api-key":e.apiKey||""}:e.apiKey?{Authorization:`Bearer ${e.apiKey}`}:{};return(await d(i,a,{model:e.provider==="azure-openai"?void 0:e.model,temperature:.1,messages:[{role:"user",content:o}]})).choices?.[0]?.message?.content||"{}"}}}async function y(e){try{let t=await u(e).complete('Return valid JSON only: {"ok": true}'),i=String(t||"").replace(/```json/gi,"").replace(/```/g,"").trim();return JSON.parse(i)?.ok===!0?{ok:!0}:{ok:!1,reason:"Model responded but did not return valid JSON in expected format.",suggestions:f(e)}}catch(o){return{ok:!1,reason:x(o),suggestions:f(e)}}}function x(e){if(!e)return"Unknown model error.";let o=String(e.message||e);return o.includes("401")?"Authentication failed. API key may be invalid.":o.includes("403")?"Access denied. This API key may not have permission to use the selected model.":o.includes("404")?"Model not found or not accessible to this account.":o.includes("ECONNREFUSED")?"Connection refused. Local model server may not be running.":o.includes("timeout")?"Connection timeout. Model endpoint may be unreachable.":o}function f(e){let o=["Check that the API key or local endpoint is correct.","Check that the selected model name exists in your provider environment.","Test the same model using the provider's official console or CLI.","Ensure network access to the model endpoint is available."];switch(e.provider){case"openai":return["Verify the OpenAI API key is active.","Confirm the model name exactly matches OpenAI documentation.","Example valid models include: gpt-4o, gpt-4.1-mini.",...o];case"anthropic":return["Verify Claude API access is enabled for this account.","Check that this Anthropic account has inference permission.","Confirm the selected Claude model exists in your Anthropic console.",...o];case"ollama":return["Ensure Ollama is running locally.","Run: ollama list","Verify the selected model exists locally.",...o];case"lmstudio":return["Ensure LM Studio local server is running.","Enable OpenAI-compatible API mode in LM Studio.","Default endpoint is usually http://localhost:1234/v1.",...o];case"openai-compatible":return["Verify the endpoint URL is correct.","Confirm the model exists on that endpoint.","Ensure the endpoint supports /v1/chat/completions.",...o];default:return o}}var A=v.join(E.homedir(),".tac-agent"),c=v.join(A,"config.json");function r(e){let o=I.createInterface({input:process.stdin,output:process.stdout});return new Promise(t=>{o.question(e,i=>{o.close(),t(i.trim())})})}function w(){return p.existsSync(c)}function k(){if(!p.existsSync(c))throw new Error("TAC Agent config not found. Run tac-agent setup.");return JSON.parse(p.readFileSync(c,"utf8"))}function P(e){p.mkdirSync(A,{recursive:!0}),p.writeFileSync(c,JSON.stringify(e,null,2))}async function M(){console.log(`
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
`);let e=await r("Select provider number: "),t={1:"openai",2:"anthropic",3:"gemini",4:"azure-openai",5:"openrouter",6:"groq",7:"mistral",8:"deepseek",9:"ollama",10:"lmstudio",11:"custom"}[e];if(!t)throw new Error("Invalid provider selection");let i="",a="",n="";t==="openai"&&(i=await r("Enter OpenAI API key: "),n=await r("Model [gpt-4o]: ")||"gpt-4o"),t==="anthropic"&&(i=await r("Enter Anthropic API key: "),n=await r("Model [claude-3-5-sonnet-latest]: ")||"claude-3-5-sonnet-latest"),t==="gemini"&&(i=await r("Enter Gemini API key: "),n=await r("Model [gemini-1.5-pro]: ")||"gemini-1.5-pro"),t==="azure-openai"&&(i=await r("Enter Azure OpenAI API key: "),a=await r("Enter Azure endpoint: "),n=await r("Enter Azure deployment name: ")),t==="openrouter"&&(i=await r("Enter OpenRouter API key: "),n=await r("Model [openai/gpt-4o]: ")||"openai/gpt-4o",a="https://openrouter.ai/api/v1"),t==="groq"&&(i=await r("Enter Groq API key: "),n=await r("Model [llama-3.1-70b-versatile]: ")||"llama-3.1-70b-versatile",a="https://api.groq.com/openai/v1"),t==="mistral"&&(i=await r("Enter Mistral API key: "),n=await r("Model [mistral-large-latest]: ")||"mistral-large-latest",a="https://api.mistral.ai/v1"),t==="deepseek"&&(i=await r("Enter DeepSeek API key: "),n=await r("Model [deepseek-chat]: ")||"deepseek-chat",a="https://api.deepseek.com"),t==="ollama"&&(a=await r("Ollama endpoint [http://localhost:11434]: ")||"http://localhost:11434",n=await r("Model [llama3]: ")||"llama3"),t==="lmstudio"&&(a=await r("LM Studio endpoint [http://localhost:1234/v1]: ")||"http://localhost:1234/v1",n=await r("Model [local-model]: ")||"local-model"),t==="custom"&&(a=await r("Enter OpenAI-compatible endpoint: "),i=await r("Enter API key if required, otherwise leave blank: "),n=await r("Enter model name: "));let s={provider:t,apiKey:i||void 0,endpoint:a||void 0,model:n};console.log(`
Testing selected model access...
`);let l=await y(s);if(!l.ok){if(console.log(`Model test failed.
`),l.reason&&(console.log("Reason:"),console.log(l.reason),console.log("")),l.suggestions?.length){console.log("Suggestions:");for(let m of l.suggestions)console.log(`- ${m}`);console.log("")}throw new Error("LLM setup failed. Please run tac-agent again and choose a working model.")}P(s),console.log(`
  TAC Agent configuration saved:

  Provider: ${s.provider}
  Model: ${s.model}

  Model test passed.
  `),console.log(`
TAC Agent LLM configuration saved locally:

${c}

Provider: ${t}
Model: ${n}
`)}var L=4318;async function U(){w()||(console.log(`
No local LLM config found.
`),await M());let e=k(),o=u(e),t=g();t.use(g.json());let i=C.join(process.cwd(),"public");t.get("/health",(a,n)=>{n.json({ok:!0,provider:e.provider,model:e.model})}),t.get("/",(a,n)=>{n.redirect("/chat")}),t.get("/chat",(a,n)=>{let s=C.join(i,"chat.html");if(!S.existsSync(s))return n.status(500).send("chat.html not found");n.sendFile(s)}),t.post("/analyze",async(a,n)=>{try{let s=String(a.body?.input||"").trim(),l=a.body?.decision_state||{};if(!s)return n.status(400).json({error:"Missing input"});let m=await h({llm:o,input:s,decisionState:l});return n.json(m)}catch(s){return console.error("Analyze error:",s?.message||s),n.status(500).json({error:"Analysis failed",detail:s?.message||String(s)})}}),t.use(g.static(i)),t.listen(L,()=>{console.log(`
TAC Agent local runtime started

Open:
http://localhost:${L}/chat
`)})}export{U as a};
