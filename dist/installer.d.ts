declare function runTAC({ provider, apiKey, input }: {
    provider: "openai" | "claude" | "ollama" | "lmstudio";
    apiKey?: string;
    input: string;
}): Promise<{
    segments: any;
    decision_state: {
        intent: string;
        resources: string;
        risk_boundary: string;
        execution_horizon: string;
    };
    validation: {
        intent: {
            valid: boolean;
            reason: string;
        };
        resources: {
            valid: boolean;
            reason: string;
        };
        risk_boundary: {
            valid: boolean;
            reason: string;
        };
        execution_horizon: {
            valid: boolean;
            reason: string;
        };
    };
    readiness_score: number;
    missing_layer: keyof {
        intent: string;
        resources: string;
        risk_boundary: string;
        execution_horizon: string;
    };
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
    decision_state: {
        intent: string;
        resources: string;
        risk_boundary: string;
        execution_horizon: string;
    };
    validation: {
        intent: {
            valid: boolean;
            reason: string;
        };
        resources: {
            valid: boolean;
            reason: string;
        };
        risk_boundary: {
            valid: boolean;
            reason: string;
        };
        execution_horizon: {
            valid: boolean;
            reason: string;
        };
    };
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
    repair_target: {
        target_edge: string;
        verification_type: string;
        question_logic: string;
        suggested_question: string;
    } | null;
    repair_question: string;
    status: string;
    missing_reason?: undefined;
}>;

export { runTAC };
