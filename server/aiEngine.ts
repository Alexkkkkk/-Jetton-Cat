import { db } from "./db";
import { aiEvents } from "../shared/models/auth";
import { desc, sql } from "drizzle-orm";

export interface VitalSigns {
    apr: number;
    total_locked: number;
    last_update: number;
    synapse_depth: number;
    liquidity_ratio: number;
    health: number;
}

export interface NeuralProfile {
    history_hash: string;
    evolution_cycles: number;
    threat_level: number;
    policy_weight: number;
    last_tx_time: number;
    mutation_seed: number;
    memory_bank: number;
}

export type HealthStatus = "CRITICAL" | "WARNING" | "STABLE" | "OPTIMAL";

export interface AiAnalysis {
    status: HealthStatus;
    statusEmoji: string;
    score: number;
    summary: string;
    insights: string[];
    recommendations: string[];
    riskLevel: "HIGH" | "MEDIUM" | "LOW";
    predictedApr: number;
    trend: "RISING" | "STABLE" | "FALLING";
    autonomyIndex: number;
    timestamp: number;
}

function classifyHealth(health: number): { status: HealthStatus; emoji: string } {
    if (health >= 700) return { status: "OPTIMAL", emoji: "🟢" };
    if (health >= 400) return { status: "STABLE", emoji: "🟡" };
    if (health >= 100) return { status: "WARNING", emoji: "🟠" };
    return { status: "CRITICAL", emoji: "🔴" };
}

function classifyRisk(health: number, total_locked: number): "HIGH" | "MEDIUM" | "LOW" {
    if (health < 100 || total_locked < 5e9) return "HIGH";
    if (health < 400 || total_locked < 20e9) return "MEDIUM";
    return "LOW";
}

function calcTrend(apr: number, health: number, memory_bank: number): "RISING" | "STABLE" | "FALLING" {
    if (health > 700 && apr > 50) return "RISING";
    if (health < 200 || apr < 10) return "FALLING";
    return "STABLE";
}

function calcAutonomyIndex(cycles: number, policyWeight: number, threatLevel: number): number {
    const base = Math.min(100, cycles * 2);
    const policyBonus = Math.min(20, policyWeight / 50);
    const threatPenalty = threatLevel * 0.5;
    return Math.max(0, Math.min(100, Math.round(base + policyBonus - threatPenalty)));
}

function predictApr(current: number, health: number, trend: string): number {
    const delta = trend === "RISING" ? 5 : trend === "FALLING" ? -8 : 0;
    const healthBonus = health > 700 ? 3 : health < 200 ? -5 : 0;
    return Math.max(0, current + delta + healthBonus);
}

export function analyzeContract(
    vitals: VitalSigns,
    neural: NeuralProfile,
    isFrozen: boolean
): AiAnalysis {
    const { status, emoji } = classifyHealth(vitals.health);
    const riskLevel = classifyRisk(vitals.health, vitals.total_locked);
    const trend = calcTrend(vitals.apr, vitals.health, neural.memory_bank);
    const autonomyIndex = calcAutonomyIndex(
        neural.evolution_cycles,
        neural.policy_weight,
        neural.threat_level
    );
    const predictedApr = predictApr(vitals.apr, vitals.health, trend);
    const lockedTon = (vitals.total_locked / 1e9).toFixed(2);
    const secsSinceUpdate = Math.floor(Date.now() / 1000) - vitals.last_update;
    const minutesSinceUpdate = Math.floor(secsSinceUpdate / 60);

    const insights: string[] = [];
    const recommendations: string[] = [];

    if (isFrozen) {
        insights.push("⚠️ Contract is in Hibernation Mode — staking halted");
        recommendations.push("Send NeuralCommand with freeze=OFF to resume operations");
    }

    if (vitals.health === 0 && vitals.total_locked === 0) {
        insights.push("🆕 Contract is freshly deployed — awaiting first stake");
        recommendations.push("Stake at least 0.5 TON to activate the AI neural engine");
        return {
            status: "STABLE", statusEmoji: "🆕",
            score: 0, summary: "Contract initialized — neural engine dormant, awaiting activation.",
            insights, recommendations,
            riskLevel: "LOW", predictedApr: vitals.apr, trend: "STABLE",
            autonomyIndex: 0, timestamp: Date.now()
        };
    }

    if (vitals.health >= 700) {
        insights.push(`✅ Neural health is OPTIMAL at ${vitals.health}/1000`);
        insights.push(`📈 APR running at ${vitals.apr}% — above average performance`);
    } else if (vitals.health >= 400) {
        insights.push(`🟡 Neural health STABLE at ${vitals.health}/1000`);
    } else if (vitals.health >= 100) {
        insights.push(`🟠 Neural health WARNING at ${vitals.health}/1000 — monitor closely`);
        recommendations.push("Consider reducing market entropy to stabilize the organism");
    } else {
        insights.push(`🔴 Neural health CRITICAL at ${vitals.health}/1000 — emergency protocols active`);
        recommendations.push("URGENT: Send emergency freeze command immediately");
        recommendations.push("Add liquidity stake to restore reserve fund");
    }

    if (vitals.total_locked < 5e9) {
        insights.push(`⚠️ Reserve fund critically low: ${lockedTon} TON (< 5 TON threshold)`);
        recommendations.push("Increase stake to build reserve — minimum 5 TON recommended");
    } else if (vitals.total_locked < 20e9) {
        insights.push(`💎 Reserve fund: ${lockedTon} TON — building momentum`);
    } else {
        insights.push(`💎 Reserve fund healthy: ${lockedTon} TON — organism well-funded`);
    }

    if (neural.evolution_cycles > 0) {
        insights.push(`🧬 ${neural.evolution_cycles} evolution cycles completed — organism maturity growing`);
    }

    if (neural.threat_level > 50) {
        insights.push(`⚡ Elevated threat level: ${neural.threat_level}/100 — market entropy high`);
        recommendations.push("Send NeuralCommand with negative entropy adjustment to reduce market stress");
    } else if (neural.threat_level > 20) {
        insights.push(`📊 Moderate threat level: ${neural.threat_level}/100`);
    } else {
        insights.push(`🛡️ Threat level nominal: ${neural.threat_level}/100`);
    }

    if (neural.policy_weight < 50) {
        recommendations.push("Send CognitiveFeedback with positive strategy_shift to boost policy weight");
    } else if (neural.policy_weight > 800) {
        insights.push(`🧠 Policy weight at ${neural.policy_weight} — high intelligence factor`);
    }

    if (minutesSinceUpdate > 60) {
        insights.push(`⏱️ Last update was ${minutesSinceUpdate} minutes ago — organism may need stimulation`);
        if (minutesSinceUpdate > 1440) {
            recommendations.push("Contract has not evolved in 24h — send a NeuralCommand to prevent auto-freeze");
        }
    }

    if (trend === "RISING") {
        insights.push(`📈 APR trending UP — predicted next cycle: ${predictedApr}%`);
    } else if (trend === "FALLING") {
        insights.push(`📉 APR trending DOWN — predicted next cycle: ${predictedApr}%`);
        recommendations.push("Adjust ai_bias via NeuralCommand to stabilize APR");
    }

    const summaryMap: Record<HealthStatus, string> = {
        OPTIMAL: `Neural organism operating at peak efficiency. Health ${vitals.health}, APR ${vitals.apr}%, ${lockedTon} TON locked.`,
        STABLE: `System stable and evolving. Health ${vitals.health}, APR ${vitals.apr}%, ${lockedTon} TON in reserve.`,
        WARNING: `Organism under stress. Health declining to ${vitals.health}. Intervention recommended.`,
        CRITICAL: `EMERGENCY STATE. Health at ${vitals.health}. Immediate action required to prevent system collapse.`,
    };

    return {
        status,
        statusEmoji: emoji,
        score: vitals.health,
        summary: summaryMap[status],
        insights,
        recommendations,
        riskLevel,
        predictedApr,
        trend,
        autonomyIndex,
        timestamp: Date.now(),
    };
}

export async function logAiEvent(
    eventType: string,
    description: string,
    data: Record<string, any> = {}
): Promise<void> {
    try {
        await db.insert(aiEvents).values({
            eventType,
            description,
            data: JSON.stringify(data),
        });
    } catch (e) {
        console.error("[AI-ENGINE] Failed to log event:", e);
    }
}

export async function getRecentAiEvents(limit = 20) {
    try {
        return await db
            .select()
            .from(aiEvents)
            .orderBy(desc(aiEvents.createdAt))
            .limit(limit);
    } catch (e) {
        return [];
    }
}

export function formatTelegramAnalysis(analysis: AiAnalysis): string {
    const lines = [
        `${analysis.statusEmoji} *AI Analysis Report*`,
        ``,
        `*Status:* ${analysis.status}`,
        `*Risk:* ${analysis.riskLevel}`,
        `*Health Score:* ${analysis.score}/1000`,
        `*Trend:* ${analysis.trend}`,
        `*Autonomy Index:* ${analysis.autonomyIndex}%`,
        `*Predicted APR:* ~${analysis.predictedApr}%`,
        ``,
        `*Summary:*`,
        analysis.summary,
        ``,
        `*Key Insights:*`,
        ...analysis.insights.map(i => `• ${i}`),
    ];

    if (analysis.recommendations.length > 0) {
        lines.push(``, `*Recommendations:*`);
        analysis.recommendations.forEach(r => lines.push(`• ${r}`));
    }

    return lines.join("\n");
}
