function c(e){try{return JSON.parse(e)}catch{return null}}function u(e){return String(e||"").trim()}function g(e){let n=typeof e=="number"?e:Number(e);return Number.isNaN(n)?0:Math.max(0,Math.min(10,n))}function f(e){return e>=8?"Strong":e>=5?"Moderate":e>=3?"Limited":"Low"}function p(){return{intent:"",resources:"",risk_boundary:"",execution_horizon:""}}function b(e,n){return{intent:n.intent||e.intent,resources:n.resources||e.resources,risk_boundary:n.risk_boundary||e.risk_boundary,execution_horizon:n.execution_horizon||e.execution_horizon}}function S(e){let n=Object.values(e).filter(t=>t.valid).length;return Math.round(n/4*100)}function h(e,n){return!e.intent||!n.intent.valid?"intent":!e.resources||!n.resources.valid?"resources":!e.risk_boundary||!n.risk_boundary.valid?"risk_boundary":!e.execution_horizon||!n.execution_horizon.valid?"execution_horizon":null}function L(e){return e?{intent:"What decision are you actually trying to make?",resources:"What resources, budget, or constraints shape this decision?",risk_boundary:"What downside must this decision avoid?",execution_horizon:"What timing makes this decision meaningful?"}[e]:""}async function x(e,n){let t=`
Split the user's decision into TAC layers.

Return JSON:

{
"segments": string[],
"intent": string,
"resources": string,
"risk_boundary": string,
"execution_horizon": string
}

User input:
${e}
`,i=await n.complete(t),r=c(i);return r?{segments:r.segments||[],parsedLayers:{intent:u(r.intent),resources:u(r.resources),risk_boundary:u(r.risk_boundary),execution_horizon:u(r.execution_horizon)}}:{segments:[],parsedLayers:{}}}async function v(e,n){let t=`
Validate TAC structure.

Return JSON:

{
"intent":{"valid":boolean,"reason":string},
"resources":{"valid":boolean,"reason":string},
"risk_boundary":{"valid":boolean,"reason":string},
"execution_horizon":{"valid":boolean,"reason":string}
}

State:
${JSON.stringify(e)}
`,i=await n.complete(t),r=c(i);return r||{intent:{valid:!1,reason:"LLM returned non-JSON output"},resources:{valid:!1,reason:"LLM returned non-JSON output"},risk_boundary:{valid:!1,reason:"LLM returned non-JSON output"},execution_horizon:{valid:!1,reason:"LLM returned non-JSON output"}}}async function k(e,n){let t=`
Detect structural conflict in TAC decision.

Return JSON:

{
"has_conflict": boolean,
"conflict_type": string,
"explanation": string,
"repair_target": {
"target_edge": string,
"verification_type": string,
"question_logic": string,
"suggested_question": string
}
}

State:
${JSON.stringify(e)}
`,i=await n.complete(t);return c(i)}async function w(e,n,t){let i=`
Evaluate TAC decision.

Return JSON:

{
"alignment": number,
"tension": number,
"convergence": number,
"summary": string
}

State:
${JSON.stringify(e)}

Conflict:
${JSON.stringify(n)}
`,r=await t.complete(i),s=c(r);return{alignment:g(s.alignment),tension:g(s.tension),convergence:g(s.convergence),summary:u(s.summary)}}function N(e,n,t,i){return i&&n>=7?"Needs clarification":e>=8&&n<=4&&t>=8?"Proceed":e>=7&&n<=6&&t>=5?"Proceed with caution":e<=4?"Do not proceed":t<=4?"Wait":"Needs clarification"}function D(e,n,t,i){return i?"structural_tension":e>=8&&n<=4&&t>=8?"stable_alignment":e>=7&&n<=6&&t>=5?"actionable_with_risk":e<=4?"structural_misalignment":t<=4?"low_readiness":"uncertain_structure"}async function z({llm:e,input:n,decisionState:t={}}){let i={...p(),...t},r=await x(n,e),s=b(i,r.parsedLayers),l=await v(s,e),_=S(l),d=h(s,l);if(d)return{status:"needs_one_more_condition",missing_layer:d,next_question:L(d),readiness_score:_};let a=await k(s,e),o=await w(s,a,e),m=N(o.alignment,o.tension,o.convergence,a.has_conflict),y=D(o.alignment,o.tension,o.convergence,a.has_conflict);return{status:"decision_ready",segments:r.segments,decision_state:s,validation:l,readiness_score:_,structural_conflict:a.has_conflict,conflict_type:a.conflict_type,conflict_explanation:a.explanation,repair_target:a.repair_target||null,repair_question:a.repair_target?.suggested_question||"",alignment:o.alignment,alignment_label:f(o.alignment),tension:o.tension,tension_label:f(o.tension),convergence:o.convergence,convergence_label:f(o.convergence),recommendation:m,topology:y,summary:o.summary}}export{z as a};
