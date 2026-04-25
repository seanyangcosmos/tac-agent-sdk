function r(e){return String(e||"").trim()}function g(e){try{let t=String(e||"").replace(/```json/gi,"").replace(/```/g,"").trim();return JSON.parse(t)}catch{return null}}function v(){return{intent:"",resources:"",risk_boundary:"",execution_horizon:""}}function x(e,t){return{intent:t.intent?.trim()||e.intent,resources:t.resources?.trim()||e.resources,risk_boundary:t.risk_boundary?.trim()||e.risk_boundary,execution_horizon:t.execution_horizon?.trim()||e.execution_horizon}}function S(e){return{intent:{valid:!!e?.intent?.valid,reason:r(e?.intent?.reason)},resources:{valid:!!e?.resources?.valid,reason:r(e?.resources?.reason)},risk_boundary:{valid:!!e?.risk_boundary?.valid,reason:r(e?.risk_boundary?.reason)},execution_horizon:{valid:!!e?.execution_horizon?.valid,reason:r(e?.execution_horizon?.reason)}}}function L(e){return{intent:{valid:!1,reason:e},resources:{valid:!1,reason:e},risk_boundary:{valid:!1,reason:e},execution_horizon:{valid:!1,reason:e}}}function k(e){let t=[e.intent.valid,e.resources.valid,e.risk_boundary.valid,e.execution_horizon.valid].filter(Boolean).length;return Math.round(t/4*100)}function w(e,t){return!e.intent.trim()||!t.intent.valid?"intent":!e.resources.trim()||!t.resources.valid?"resources":!e.risk_boundary.trim()||!t.risk_boundary.valid?"risk_boundary":!e.execution_horizon.trim()||!t.execution_horizon.valid?"execution_horizon":null}function T(e){return e?{intent:"What decision are you actually trying to make?",resources:"What resources, budget, capacity, or practical limits shape this decision?",risk_boundary:"What downside, conflict, or unacceptable impact must this decision avoid?",execution_horizon:"What timing, deadline, or execution window makes this decision meaningful?"}[e]:""}function D(e,t,i){return e?t[e].trim()?i[e].reason||"This TAC layer is present but not yet valid.":"This TAC layer is still missing.":""}function m(e){let t=typeof e=="number"?e:Number(e);return Number.isNaN(t)?0:Math.max(0,Math.min(10,t))}function f(e){return e>=8?"Strong":e>=5?"Moderate":e>=3?"Limited":"Low"}async function R(e,t){let i=`
You are a TAC decision-structure inference engine.

Your job is to:
1. split the user's input into meaningful decision segments
2. map those segments into TAC layers

TAC layers:
- intent = the actual decision being made
- resources = usable resources, budget, time, constraints, practical limits
- risk_boundary = acceptable downside, conflict boundary, tradeoff limit, what must not be harmed
- execution_horizon = timing, deadline, duration, execution window

Return valid JSON only in this exact format:

{
  "segments": string[],
  "intent": string,
  "resources": string,
  "risk_boundary": string,
  "execution_horizon": string
}

Rules:
- Keep original meaning faithful
- Do not invent missing content
- If a layer is missing, return ""
- One input may contain multiple segments
- Segments should be concise and meaningful
- No markdown
- No explanation outside JSON

User input:
${e}
`.trim(),o=await t.complete(i),n=g(o);return n?{segments:Array.isArray(n.segments)?n.segments.map(a=>String(a).trim()).filter(Boolean):[],parsedLayers:{intent:r(n.intent),resources:r(n.resources),risk_boundary:r(n.risk_boundary),execution_horizon:r(n.execution_horizon)}}:{segments:[],parsedLayers:{}}}async function z(e,t){let i=`
You are validating whether each layer in a TAC decision structure is semantically valid.

TAC layers:
1. intent = the actual decision being made
2. resources = usable resources, constraints, or practical conditions that shape the decision
3. risk_boundary = acceptable downside, conflict boundary, tradeoff limit, or what must not be harmed
4. execution_horizon = meaningful timing, duration, or execution window for action

Return valid JSON only in this exact format:

{
  "intent": {
    "valid": boolean,
    "reason": string
  },
  "resources": {
    "valid": boolean,
    "reason": string
  },
  "risk_boundary": {
    "valid": boolean,
    "reason": string
  },
  "execution_horizon": {
    "valid": boolean,
    "reason": string
  }
}

Rules:
- Judge semantic role, not just whether text exists.
- A layer may be present but invalid.
- Placeholder text, meaningless strings, random numbers, unrelated content, or vague filler should be invalid.
- Do not invent information.
- Keep reasons short and concrete.
- Return JSON only.

Decision state:
${JSON.stringify(e,null,2)}
`.trim(),o=await t.complete(i),n=g(o);return n?S(n):L("LLM returned non-JSON output")}async function N(e,t){let i=`
You are a TAC structural conflict detector and repair-target generator.

Your job:
1. detect whether the TAC structure contains a meaningful conflict
2. identify the most important conflict edge
3. generate the best clarification target to reduce tension or improve convergence

TAC layers:
- intent
- resources
- risk_boundary
- execution_horizon

Return valid JSON only in this exact format:

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

Rules:
- If no conflict exists, return has_conflict=false and repair_target=null
- Do not ask generic follow-up questions
- The suggested question must specifically verify the most important unresolved conflict edge
- Prefer questions that reduce structural tension or improve execution convergence
- Return JSON only

Decision state:
${JSON.stringify(e,null,2)}
`.trim(),o=await t.complete(i),n=g(o);return n?{has_conflict:!!n.has_conflict,conflict_type:r(n.conflict_type),explanation:r(n.explanation),repair_target:n.repair_target?{target_edge:r(n.repair_target.target_edge),verification_type:r(n.repair_target.verification_type),question_logic:r(n.repair_target.question_logic),suggested_question:r(n.repair_target.suggested_question)}:null}:{has_conflict:!1,conflict_type:"",explanation:"LLM returned non-JSON output",repair_target:null}}async function q(e,t,i){let o=`
You are a TAC evaluator.

Evaluate this decision across three axes:

- alignment: does the decision fit the user's actual goal and situation?
- tension: how much conflict, fragility, tradeoff, or structural risk exists?
- convergence: how ready is this decision for action now?

Return valid JSON only in this exact format:

{
  "alignment": number,
  "tension": number,
  "convergence": number,
  "summary": string
}

Rules:
- Scores must be 0 to 10
- If structural conflict exists, tension should reflect that
- summary must be concise and decision-focused
- Return JSON only

Decision state:
${JSON.stringify(e,null,2)}

Structural conflict check:
${JSON.stringify(t,null,2)}
`.trim(),n=await i.complete(o),a=g(n);return a?{alignment:m(a.alignment),tension:m(a.tension),convergence:m(a.convergence),summary:r(a.summary)}:{alignment:0,tension:0,convergence:0,summary:"LLM returned non-JSON output"}}function O(e,t,i,o){return o.has_conflict&&t>=7?"Needs clarification":e>=8&&t<=4&&i>=8?"Proceed":e>=7&&t<=6&&i>=5?"Proceed with caution":e<=4?"Do not proceed":i<=4?"Wait":"Needs clarification"}function J(e,t,i,o){return o.has_conflict?"structural_tension":e>=8&&t<=4&&i>=8?"stable_alignment":e>=7&&t<=6&&i>=5?"actionable_with_risk":e<=4?"structural_misalignment":i<=4?"low_readiness":"uncertain_structure"}async function C({llm:e,input:t,decisionState:i={}}){let o=r(t);if(!o)throw new Error("input required");if(!e||typeof e.complete!="function")throw new Error("llm.complete(prompt) is required");let n={...v(),...i},a=await R(o,e),u=x(n,a.parsedLayers),l=await z(u,e),y=k(l),d=w(u,l),_=T(d),p=D(d,u,l);if(d)return{segments:a.segments,decision_state:u,validation:l,readiness_score:y,missing_layer:d,missing_reason:p,next_question:_,status:"needs_one_more_condition"};let c=await N(u,e),s=await q(u,c,e),h=O(s.alignment,s.tension,s.convergence,c),b=J(s.alignment,s.tension,s.convergence,c);return{segments:a.segments,decision_state:u,validation:l,readiness_score:y,missing_layer:null,next_question:"",recommendation:h,topology:b,summary:s.summary,alignment:s.alignment,alignment_label:f(s.alignment),tension:s.tension,tension_label:f(s.tension),convergence:s.convergence,convergence_label:f(s.convergence),structural_conflict:c.has_conflict,conflict_type:c.conflict_type,conflict_explanation:c.explanation,repair_target:c.repair_target??null,repair_question:c.repair_target?.suggested_question??"",status:"decision_ready"}}export{C as a};
