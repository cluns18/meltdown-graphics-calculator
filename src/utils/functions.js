// Calls the Meltdown pricing function. Returns the whole result so the caller can
// handle quotable:false (screen print by request, over 500 pieces, a garment with no
// live cost) instead of rendering a fabricated or $0 price.
const calculateFinalQuote = async (quantity, {
    selectedProject,
    selectedLocation,
    locationColorCounts,
    turnaround,
    pickedGarment,
}) => {
    if (!quantity) return { quotable: false, errorCode: 'INCOMPLETE' };

    // Live S&S wholesale cost of the picked blank. Only catalog rows carry a current
    // cost; the hand-built fallback list is March 2025 data, so a fallback pick is
    // quoted by hand instead of on a stale blank price. The cost is folded into the
    // per-piece price on the server and never shown on its own.
    const selectedGarmentCost = pickedGarment?.fromCatalog && pickedGarment.cost > 0 ? pickedGarment.cost : 0;
    const body = {
        selectedProject,
        quantity,
        selectedLocation,
        locationColorCounts: locationColorCounts || {},
        turnaround,
        selectedGarmentCost,
    };

    try {
        const response = await fetch('/.netlify/functions/calculatePricing', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });
        if (!response.ok) return { quotable: false, errorCode: 'CALC_ERROR' };
        return await response.json();
    } catch {
        return { quotable: false, errorCode: 'CALC_ERROR' };
    }
};

export default calculateFinalQuote;
