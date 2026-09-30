// Why you would pick one garment over another. Three options per type, each with
// a reason taken from the mill's own spec sheet (weight, blend, yarn, fit) rather
// than sales copy, because a buyer comparing two shirts wants a difference they
// can act on. Same notes as the Olive Branch Apparel Design Studio
// (src/lib/garment-notes.ts there) and the Missouri calculator, so every path
// recommends the same three blanks.

// JAKE'S OWN PICKS, good / better / best. He has not sent any, so this is empty and
// the OBG defaults in RECOMMENDED stand. Drop his slugs in per type when he does; a
// slug that is not in calculator_catalog (SanMar-only styles, see
// reference_sanmar_not_in_ss_catalog) is padded with the most popular style of the type.
export const MELTDOWN_PICKS = {};

export const RECOMMENDED = {
    tshirt: ['gildan-5000', 'bella-canvas-3001', 'comfort-colors-1717'],
    longsleeve: ['gildan-5400', 'bella-canvas-3501', 'comfort-colors-6014'],
    hoodie: ['independent-trading-co-ss4500', 'gildan-18500', 'independent-trading-co-ind4000'],
    // "Sweatshirt" covers hoodies and crews: two hoodies and the classic crew.
    sweatshirt: ['independent-trading-co-ss4500', 'gildan-18500', 'gildan-18000'],
    crewneck: ['gildan-18000', 'bella-canvas-3945', 'comfort-colors-1566'],
    polo: ['harriton-m265', 'core365-88181', 'devon-jones-dg20'],
};

/** The three slugs to show for a catalog type, Jake's list first when he has sent one. */
export function picksFor(key) {
    if (MELTDOWN_PICKS && Array.isArray(MELTDOWN_PICKS[key]) && MELTDOWN_PICKS[key].length) {
        return MELTDOWN_PICKS[key];
    }
    return RECOMMENDED[key] || [];
}
export const GARMENT_NOTES = {
    'gildan-5000': { badge: 'Most affordable', headline: 'The budget workhorse', bullets: ['5.3 oz of 100% US cotton, the weight most people picture when they say t-shirt', '20 singles yarn gives it a sturdy hand rather than a soft one', 'Lowest cost per shirt we stock, so the money goes into the print'] },
    'bella-canvas-3001': { badge: 'Softest', headline: 'The one that feels like retail', bullets: ['Airlume combed and ring-spun cotton at 32 singles, the softest hand on this page', 'Retail fit with side seams, so it follows the body instead of hanging square', 'Pre-shrunk, which means the size someone orders is the size they keep'] },
    'comfort-colors-1717': { badge: 'Heaviest', headline: 'Heavy, soft, already broken in', bullets: ['6.1 oz ring-spun cotton, the heaviest tee here and it hangs like it', 'Garment dyed for a lived-in feel straight out of the bag, with minimal shrinkage', 'Relaxed fit, the cut people keep wearing after the event is over'] },
    'gildan-5400': { badge: 'Most affordable', headline: 'The long sleeve workhorse', bullets: ['5.3 oz of 100% US cotton, the same fabric as the 5000 with sleeves', 'Rib cuffs hold their shape wash after wash', 'Lowest cost long sleeve we stock'] },
    'bella-canvas-3501': { badge: 'Softest', headline: 'Retail feel with sleeves', bullets: ['4.2 oz Airlume combed and ring-spun cotton, light and soft', 'Retail fit with side seams and ribbed cuffs', 'Pre-shrunk, so the size someone orders is the size they keep'] },
    'comfort-colors-6014': { badge: 'Heaviest', headline: 'Heavy, garment dyed, broken in', bullets: ['6.1 oz ring-spun cotton, the heaviest long sleeve here', 'Garment dyed for a lived-in color straight out of the bag', 'Relaxed fit with ribbed cuffs'] },
    'gildan-18500': { badge: 'Most affordable', headline: 'The classic hoodie, priced to order in bulk', bullets: ['8 oz 50/50 cotton and polyester Heavy Blend fleece', 'Pill-resistant air-jet yarn keeps the face smooth, so a transfer sits flat', 'Lowest cost hoodie we stock, so the money goes into the print'] },
    'independent-trading-co-ind4000': { badge: 'Heaviest', headline: 'The heavyweight people keep', bullets: ['10 oz 80/20 cotton and polyester fleece, noticeably thicker in the hand', 'Standard fit with a three-panel hood and split-stitch double-needle sewing', 'The hoodie people pay retail for, at a bulk price'] },
    'independent-trading-co-ss4500': { badge: 'Softest', headline: 'Retail feel for about the same money', bullets: ['8.5 oz of 80/20 ring-spun fleece with a full cotton face', 'Jersey-lined hood and split-stitched seams, built the way retail builds them', 'Heavier and softer than a standard 50/50 at a near-identical price'] },
    'gildan-18600': { badge: 'Full zip', headline: 'The 18500 with a zipper', bullets: ['Same 8 oz 50/50 Heavy Blend fleece as the pullover', 'Full-length zipper with a matching metal pull', 'Unlined hood and a clean left chest for a small print'] },
    'gildan-18000': { badge: 'Classic crew', headline: 'The classic crew, priced to order in bulk', bullets: ['8 oz 50/50 cotton and polyester Heavy Blend fleece', 'Pill-resistant air-jet yarn keeps the face smooth', 'Lowest cost crew we stock'] },
    'bella-canvas-3945': { badge: 'Softest', headline: 'The one that feels like a favorite', bullets: ['7 oz 52/48 Airlume cotton and polyester sponge fleece', 'Drop shoulder, relaxed retail cut with side seams', 'Softest hand of the three, brushed inside and out'] },
    'comfort-colors-1566': { badge: 'Heaviest', headline: 'Heavy, garment dyed, already broken in', bullets: ['9.5 oz 80/20 ring-spun cotton and polyester, the heaviest crew here', 'Garment dyed for a lived-in color straight out of the bag', 'Relaxed fit with a ribbed collar, cuffs and waistband'] },
    'harriton-m265': { badge: 'Most affordable', headline: 'The uniform polo', bullets: ['5.6 oz 60/40 cotton and polyester pique that holds up to a work week', 'Three-button placket, rib collar and cuffs, the classic shape', 'Lowest cost polo we stock, so a whole staff fits the budget'] },
    'core365-88181': { badge: 'Performance', headline: 'The one that stays dry', bullets: ['4.1 oz 100% polyester with moisture wicking and UV protection', 'Snag resistant, so it survives the truck seat and the job site', 'Easy care, out of the dryer and onto the rack'] },
    'devon-jones-dg20': { badge: 'Pima cotton', headline: 'The front-desk polo', bullets: ['6.3 oz 100% pima cotton with a soft, refined hand', 'Tone-on-tone buttons and a tailored fit that reads as management', 'The polo for the people customers meet first'] },
};
