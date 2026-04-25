function c(e){return String(e||"").trim()}function g(e){let n=typeof e=="number"?e:Number(e);return Number.isNaN(n)?0:Math.max(0,Math.min(10,n))}function d(e){return e>=8?"Strong":e>=5?"Moderate":e>=3?"Limited":"Low"}function y(){return{intent:"",resources:"",risk_boundary:"",execution_horizon:""}}function p(e,n){return{intent:n.intent||e.intent,resources:n.resources||e.resources,risk_boundary:n.risk_boundary||e.risk_boundary,execution_horizon:n.execution_horizon||e.execution_horizon}}function b(e){let n=Object.values(e).filter(t=>t.valid).length;return Math.round(n/4*100)}function S(e,n){return!e.intent||!n.intent.valid?"intent":!e.resources||!n.resources.valid?"resources":!e.risk_boundary||!n.risk_boundary.valid?"risk_boundary":!e.execution_horizon||!n.execution_horizon.valid?"execution_horizon":null}function h(e){return e?{intent:"What decision are you actually trying to make?",resources:"What resources, budget, or constraints shape this decision?",risk_boundary:"What downside must this decision avoid?",execution_horizon:"What timing makes this decision meaningful?"}[e]:""}async function L(e,n){let t=`
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
`,i=await n.complete(t),o=JSON.parse(i);return{segments:o.segments||[],parsedLayers:{intent:c(o.intent),resources:c(o.resources),risk_boundary:c(o.risk_boundary),execution_horizon:c(o.execution_horizon)}}}async function x(e,n){let t=`
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
`,i=await n.complete(t);return JSON.parse(i)}async function k(e,n){let t=`
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
`,i=await n.complete(t);return JSON.parse(i)}async function v(e,n,t){let i=`
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
`,o=await t.complete(i),s=JSON.parse(o);return{alignment:g(s.alignment),tension:g(s.tension),convergence:g(s.convergence),summary:c(s.summary)}}function w(e,n,t,i){return i&&n>=7?"Needs clarification":e>=8&&n<=4&&t>=8?"Proceed":e>=7&&n<=6&&t>=5?"Proceed with caution":e<=4?"Do not proceed":t<=4?"Wait":"Needs clarification"}function N(e,n,t,i){return i?"structural_tension":e>=8&&n<=4&&t>=8?"stable_alignment":e>=7&&n<=6&&t>=5?"actionable_with_risk":e<=4?"structural_misalignment":t<=4?"low_readiness":"uncertain_structure"}async function D({llm:e,input:n,decisionState:t={}}){let i={...y(),...t},o=await L(n,e),s=p(i,o.parsedLayers),u=await x(s,e),_=b(u),l=S(s,u);if(l)return{status:"needs_one_more_condition",missing_layer:l,next_question:h(l),readiness_score:_};let a=await k(s,e),r=await v(s,a,e),f=w(r.alignment,r.tension,r.convergence,a.has_conflict),m=N(r.alignment,r.tension,r.convergence,a.has_conflict);return{status:"decision_ready",segments:o.segments,decision_state:s,validation:u,readiness_score:_,structural_conflict:a.has_conflict,conflict_type:a.conflict_type,conflict_explanation:a.explanation,repair_target:a.repair_target||null,repair_question:a.repair_target?.suggested_question||"",alignment:r.alignment,alignment_label:d(r.alignment),tension:r.tension,tension_label:d(r.tension),convergence:r.convergence,convergence_label:d(r.convergence),recommendation:f,topology:m,summary:r.summary}}export{D as a};
