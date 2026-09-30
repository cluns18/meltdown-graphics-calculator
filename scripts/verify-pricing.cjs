// node scripts/verify-pricing.cjs
// Asserts the calculator reproduces Jake's own published ballparks on a basic tee and
// never returns a $0 or guessed price. Exit code 1 on any failure.
const { buildQuote } = require("../netlify/functions/calculatePricing.cjs");

const TEE = 2.45; // Gildan 5000 wholesale, the basic tee
let fails = 0;
const check = (name, got, want) => {
    const ok = got === want;
    if (!ok) fails++;
    console.log(`${ok ? "PASS" : "FAIL"}  ${name}  got=${JSON.stringify(got)} want=${JSON.stringify(want)}`);
};
const dtf = (locs, qty, cost = TEE, turnaround = "standard") =>
    buildQuote({ selectedProject: "dtf", quantity: qty, selectedLocation: locs, selectedGarmentCost: cost, turnaround });

// Jake's published ballparks, all on a basic tee.
check("left chest = $10", dtf(["left_chest"], 24).pricePerItem, 10);
check("full front = $12", dtf(["full_front"], 24).pricePerItem, 12);
check("front + sleeve = $15", dtf(["full_front", "sleeve"], 24).pricePerItem, 15);
check("front + back = $15", dtf(["full_front", "full_back"], 24).pricePerItem, 15);
check("order of picks does not matter", dtf(["sleeve", "full_front"], 24).pricePerItem, 15);
check("left chest + back = $15", dtf(["left_chest", "full_back"], 24).pricePerItem, 15);
check("24 full fronts total", dtf(["full_front"], 24).totalQuote, 288);
check("qty 1 still quotes (no minimum)", dtf(["full_front"], 1).totalQuote, 12);

// Blanks: wholesale difference x2 over the basic tee.
check("Gildan 18500 hoodie full front", dtf(["full_front"], 10, 10.09).pricePerItem, 27.28);
check("Comfort Colors 1717 full front", dtf(["full_front"], 10, 6.68).pricePerItem, 20.46);
check("cheaper blank never discounts", dtf(["full_front"], 10, 1.5).pricePerItem, 12);

// Rush ladder.
check("3-5 day rush +15%", dtf(["full_front"], 10, TEE, "rush_3_5").totalQuote, 138);
check("1-2 day rush +30%", dtf(["full_front"], 10, TEE, "rush_1_2").totalQuote, 156);
check("same day +50%", dtf(["full_front"], 10, TEE, "same_day").totalQuote, 180);
check("same day flagged as a minimum", dtf(["full_front"], 10, TEE, "same_day").rushIsFloor, true);
check("unknown turnaround falls to standard", dtf(["full_front"], 10, TEE, "bogus").totalQuote, 120);

// Never $0, never guessed.
check("no garment cost -> not quotable", dtf(["full_front"], 10, 0).quotable, false);
check("no garment cost -> GARMENT_NOT_PRICED", dtf(["full_front"], 10, 0).errorCode, "GARMENT_NOT_PRICED");
check("no placements -> INCOMPLETE", dtf([], 10).errorCode, "INCOMPLETE");
check("unknown placement -> PLACEMENT_MISSING", dtf(["pocket"], 10).errorCode, "PLACEMENT_MISSING");
check("501 pieces -> DTF_OVER_MAX", dtf(["full_front"], 501).errorCode, "DTF_OVER_MAX");
check("500 pieces still quotes", dtf(["full_front"], 500).quotable, true);
check("qty 0 -> INCOMPLETE", dtf(["full_front"], 0).errorCode, "INCOMPLETE");
check("duplicate placement counted once", dtf(["full_front", "full_front"], 10).pricePerItem, 12);

// Screen print is by request only.
const sp = buildQuote({ selectedProject: "screenPrinting", quantity: 144, selectedLocation: ["full_front"], locationColorCounts: { full_front: 2 }, selectedGarmentCost: TEE });
check("screen print never quotable", sp.quotable, false);
check("screen print -> SP_BY_REQUEST", sp.errorCode, "SP_BY_REQUEST");
check("screen print carries no price", sp.totalQuote, undefined);
check("screen print keeps colors for Jake", sp.lines[0].colors, 2);
check("embroidery is not a path", buildQuote({ selectedProject: "embroidery", quantity: 10, selectedLocation: ["left_chest"] }).quotable, false);

console.log(fails ? `\n${fails} FAILED` : "\nALL PASS");
process.exit(fails ? 1 : 0);
