// Meltdown Graphics pricing.
//
// THERE IS NO CLIENT MATRIX. Jake has never sent one (the Pricing Matrix Reference
// Pack was never sent to him either). Every number below is either one Jake publishes
// himself, quoted with its source, or a named constant listed in ASSUMPTIONS at the
// bottom of this file for him to confirm. Do not add a number that is neither.
//
// SOURCE 1: meltdowngraphics.com/pages/request-a-quote, scraped 2026-09-30, section
// "Approximate Custom Shirt Pricing", "ballpark starting prices", verbatim:
//   Left chest print on a basic tee:            starting around $10 each
//   Youth front print on a basic tee:           starting around $12 each
//   Standard full front print on a basic tee:   starting around $12 each
//   Front print + sleeve print on a basic tee:  starting around $15 each
//   Front print + back print on a basic tee:    starting around $15 each
// and "Premium shirts, hoodies, long sleeves, performance wear, oversized prints, rush
// orders, and extra print locations will raise the final cost."
// "ON A BASIC TEE" means these figures INCLUDE the blank. They are all-in prices.
//
// SOURCE 2: same page, "Rush Orders": "Standard turnaround on the quote sheet is 7-10
// business days, with rush pricing added for faster jobs: 3-5 business days +15%, 1-2
// business days +30%, and same day +50% minimum." The FAQ repeats 7 to 10 business days
// "following final artwork approval and payment".
//
// SOURCE 3: directtofilm.shop/pages/pricing (gang sheets, 22.6in wide, per sheet):
// 24in $19.99, 60in $49.99, 84in $69.99, 120in $89.99, 180in $109.99, 240in $129.99.
// Gang sheets are bought by the sheet through the Gang Sheet Builder product on the
// store, so the calculator links there instead of re-pricing them. Listed here only so
// the source is on file next to the apparel numbers.
//
// SCREEN PRINTING: Jake publishes no screen print numbers at all, and has not run a
// screen in over a year. The site sells it as "large spot-color runs, set up by
// request". So the calculator collects the job and he prices it by hand. It never
// shows a screen print figure.

// ---------------------------------------------------------------------------
// DTF apparel, all-in per piece on a basic tee (SOURCE 1).
// ---------------------------------------------------------------------------
const DTF_PLACEMENTS = {
    full_front: { label: 'Full front', basicTee: 12 },  // "Standard full front ... $12"
    full_back:  { label: 'Full back',  basicTee: 12 },  // ASSUMPTION A2: a back alone prices like a front
    left_chest: { label: 'Left chest', basicTee: 10 },  // "Left chest ... $10"
    sleeve:     { label: 'Sleeve',     basicTee: 10 },  // ASSUMPTION A3: a sleeve alone prices like a left chest
};

// Each placement after the first. Jake's front + sleeve and front + back are both $15,
// which is his $12 full front plus $3. ASSUMPTION A1: every extra placement adds that
// same $3, whatever its size.
const DTF_ADDITIONAL_PLACEMENT = 3;

// The blank inside Jake's ballparks. A "basic tee" is read as Gildan 5000, the most
// stocked tee at S&S. Its S&S wholesale base_cost in the calculator_catalog view on
// 2026-09-30 was $2.45. ASSUMPTION A4.
const BASIC_TEE_SLUG = 'gildan-5000';
const BASIC_TEE_WHOLESALE = 2.45;

// Any other blank adds its wholesale cost OVER the basic tee, marked up the same way
// Print Master marks up blanks (wholesale x2). ASSUMPTION A5: Jake has not stated a
// markup. A blank cheaper than the basic tee never takes money off his starting price.
const GARMENT_MARKUP = 2;

// No minimum. "No Minimums" is on his homepage, his DTF page and his t-shirt page.
const DTF_MIN_QTY = 1;
// Past this the ballparks are not a fair price ("For larger orders ... your final
// per-shirt price may come in lower"), so the calculator hands it to Jake. ASSUMPTION A6.
const DTF_MAX_QTY = 500;

// ---------------------------------------------------------------------------
// Turnaround (SOURCE 2). Applied to the whole order.
// ---------------------------------------------------------------------------
const TURNAROUND = {
    standard: { label: 'Standard, 7 to 10 business days', surcharge: 0 },
    rush_3_5: { label: 'Rush, 3 to 5 business days',       surcharge: 0.15 },
    rush_1_2: { label: 'Rush, 1 to 2 business days',       surcharge: 0.30 },
    same_day: { label: 'Same day',                          surcharge: 0.50, floor: true }, // "+50% minimum"
};

// ---------------------------------------------------------------------------
// Screen printing: by request, never priced online.
// ---------------------------------------------------------------------------
const SCREEN_PRINT_PRICED_ONLINE = false;
const SP_PLACEMENTS = {
    full_front: { label: 'Full front' },
    full_back:  { label: 'Full back' },
    left_chest: { label: 'Left chest' },
    sleeve:     { label: 'Sleeve' },
};

// Everything Jake needs to confirm, in one place. The build report copies this list.
const ASSUMPTIONS = [
    'A1: every placement after the first adds $3 per piece (from front+sleeve $15 and front+back $15 against a $12 full front)',
    'A2: a full back on its own prices like a full front, $12 on a basic tee',
    'A3: a sleeve on its own prices like a left chest, $10 on a basic tee',
    'A4: the "basic tee" in the ballparks is a Gildan 5000 at $2.45 S&S wholesale',
    'A5: any other blank adds (its S&S wholesale minus $2.45) x 2 per piece',
    'A6: the ballparks hold flat from 1 to 500 pieces, no volume breaks, no small-order charge; 501+ goes to Jake',
    'A7: rush percentages apply to the whole order total; same day is quoted at +50% and flagged as a minimum',
    'A8: screen printing is never priced online; the calculator collects the job and Jake quotes it',
];

module.exports = {
    DTF_PLACEMENTS,
    DTF_ADDITIONAL_PLACEMENT,
    BASIC_TEE_SLUG,
    BASIC_TEE_WHOLESALE,
    GARMENT_MARKUP,
    DTF_MIN_QTY,
    DTF_MAX_QTY,
    TURNAROUND,
    SCREEN_PRINT_PRICED_ONLINE,
    SP_PLACEMENTS,
    ASSUMPTIONS,
};
