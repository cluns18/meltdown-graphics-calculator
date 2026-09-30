const P = require("./pricing.cjs");

// Returns a quote, or an explicit non-quotable result with an error code. It never
// guesses a number and never returns 0. See project_calc_lookup_bug_sweep: Brian wants
// an error code plus "reach out for a quote", never a fabricated or $0 price.
const money = (n) => Math.round(n * 100) / 100;

// What the picked blank adds over the basic tee inside Jake's ballparks. Only a live
// catalog pick carries a current S&S cost; without one the garment cannot be priced.
const garmentUpcharge = (input) => {
    const cost = Number(input.selectedGarmentCost);
    if (!(cost > 0)) return null;
    return Math.max(0, cost - P.BASIC_TEE_WHOLESALE) * P.GARMENT_MARKUP;
};

const turnaroundFor = (key) => P.TURNAROUND[key] || P.TURNAROUND.standard;

const buildDtfQuote = (input, qty) => {
    if (qty < P.DTF_MIN_QTY) return { quotable: false, errorCode: "INCOMPLETE" };
    if (qty > P.DTF_MAX_QTY) {
        return { quotable: false, errorCode: "DTF_OVER_MAX", maxQuantity: P.DTF_MAX_QTY };
    }

    const keys = [...new Set((input.selectedLocation || []).filter((k) => typeof k === "string"))];
    if (keys.length === 0) return { quotable: false, errorCode: "INCOMPLETE" };
    const unknown = keys.filter((k) => !P.DTF_PLACEMENTS[k]);
    if (unknown.length > 0) return { quotable: false, errorCode: "PLACEMENT_MISSING" };

    const upcharge = garmentUpcharge(input);
    if (upcharge === null) return { quotable: false, errorCode: "GARMENT_NOT_PRICED" };

    // The dearest placement carries Jake's base price, every other one adds $3.
    const placed = keys
        .map((k) => ({ key: k, label: P.DTF_PLACEMENTS[k].label, basicTee: P.DTF_PLACEMENTS[k].basicTee }))
        .sort((a, b) => b.basicTee - a.basicTee);
    const lines = placed.map((p, i) => ({
        key: p.key,
        label: p.label,
        primary: i === 0,
        perPiece: i === 0 ? p.basicTee : P.DTF_ADDITIONAL_PLACEMENT,
    }));
    if (lines.some((l) => typeof l.perPiece !== "number" || !(l.perPiece > 0))) {
        return { quotable: false, errorCode: "NO_PRICE" };
    }

    const basicTeePerPiece = lines.reduce((s, l) => s + l.perPiece, 0);
    const beforeRush = (basicTeePerPiece + upcharge) * qty;
    const turn = turnaroundFor(input.turnaround);
    const rushAmount = beforeRush * turn.surcharge;
    const totalQuote = money(beforeRush + rushAmount);
    if (!(totalQuote > 0)) return { quotable: false, errorCode: "CALC_ERROR" };

    return {
        quotable: true,
        service: "dtf",
        quantity: qty,
        lines,
        basicTeePerPiece: money(basicTeePerPiece),
        garmentUpcharge: money(upcharge),
        turnaround: turn.label,
        rushPercent: Math.round(turn.surcharge * 100),
        rushIsFloor: Boolean(turn.floor),
        rushAmount: money(rushAmount),
        totalQuote,
        pricePerItem: money(totalQuote / qty),
    };
};

const buildScreenPrintRequest = (input, qty) => {
    const keys = (input.selectedLocation || []).filter((k) => P.SP_PLACEMENTS[k]);
    if (keys.length === 0) return { quotable: false, errorCode: "INCOMPLETE" };
    const counts = input.locationColorCounts || {};
    const lines = keys.map((k) => ({
        key: k,
        label: P.SP_PLACEMENTS[k].label,
        colors: Math.max(1, parseInt(counts[k], 10) || 1),
    }));
    return {
        quotable: false,
        errorCode: "SP_BY_REQUEST",
        service: "screenPrinting",
        quantity: qty,
        lines,
        turnaround: turnaroundFor(input.turnaround).label,
    };
};

const buildQuote = (input) => {
    const { selectedProject, quantity } = input || {};
    const qty = parseInt(quantity, 10);
    if (!selectedProject) return { quotable: false, errorCode: "INCOMPLETE" };
    if (!Number.isFinite(qty) || qty < 1) return { quotable: false, errorCode: "INCOMPLETE" };
    if (selectedProject === "dtf") return buildDtfQuote(input, qty);
    if (selectedProject === "screenPrinting") return buildScreenPrintRequest(input, qty);
    return { quotable: false, errorCode: "INCOMPLETE" };
};

exports.handler = async (event) => {
    try {
        const result = buildQuote(JSON.parse(event.body || "{}"));
        return {
            statusCode: 200,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(result),
        };
    } catch (error) {
        console.error("Error in calculatePricing:", error);
        return { statusCode: 500, body: JSON.stringify({ quotable: false, errorCode: "CALC_ERROR" }) };
    }
};

exports.buildQuote = buildQuote;
