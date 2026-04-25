interface TacLLM {
    complete(prompt: string): Promise<string>;
}
type DecisionState = {
    intent: string;
    resources: string;
    risk_boundary: string;
    execution_horizon: string;
};
type ParsedLayers = Partial<DecisionState>;
type LayerValidation = {
    valid: boolean;
    reason: string;
};
type ValidationResult = {
    intent: LayerValidation;
    resources: LayerValidation;
    risk_boundary: LayerValidation;
    execution_horizon: LayerValidation;
};
type RepairTarget = {
    target_edge: string;
    verification_type: string;
    question_logic: string;
    suggested_question: string;
};
declare function tacAnalyze({ llm, input, decisionState, }: {
    llm: TacLLM;
    input: string;
    decisionState?: ParsedLayers;
}): Promise<{
    segments: any;
    decision_state: DecisionState;
    validation: ValidationResult;
    readiness_score: number;
    missing_layer: keyof DecisionState;
    missing_reason: string;
    next_question: string;
    status: string;
    recommendation?: undefined;
    topology?: undefined;
    summary?: undefined;
    alignment?: undefined;
    alignment_label?: undefined;
    tension?: undefined;
    tension_label?: undefined;
    convergence?: undefined;
    convergence_label?: undefined;
    structural_conflict?: undefined;
    conflict_type?: undefined;
    conflict_explanation?: undefined;
    repair_target?: undefined;
    repair_question?: undefined;
} | {
    segments: any;
    decision_state: DecisionState;
    validation: ValidationResult;
    readiness_score: number;
    missing_layer: null;
    next_question: string;
    recommendation: string;
    topology: string;
    summary: string;
    alignment: number;
    alignment_label: string;
    tension: number;
    tension_label: string;
    convergence: number;
    convergence_label: string;
    structural_conflict: boolean;
    conflict_type: string;
    conflict_explanation: string;
    repair_target: RepairTarget | null;
    repair_question: string;
    status: string;
    missing_reason?: undefined;
}>;

export { type TacLLM, tacAnalyze };
