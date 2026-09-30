import React from 'react';
import NavBtn from '../components/NavBtn';

// Keys match netlify/functions/pricing.cjs DTF_PLACEMENTS and SP_PLACEMENTS. No price
// on these cards; the quote step shows the one number that matters.
export const PLACEMENTS = [
    { key: 'full_front', label: 'Full front', detail: 'Across the chest.' },
    { key: 'full_back', label: 'Full back', detail: 'Across the back.' },
    { key: 'left_chest', label: 'Left chest', detail: 'A small logo over the heart.' },
    { key: 'sleeve', label: 'Sleeve', detail: 'Down or around one sleeve.' },
];
export const PLACEMENT_LABELS = Object.fromEntries(PLACEMENTS.map((p) => [p.key, p.label]));

export default function PlacementSelect({ onNext, onPrevious, selectedProject, selectedLocation, setSelectedLocation }) {
    const toggle = (key) => {
        setSelectedLocation(
            selectedLocation.includes(key)
                ? selectedLocation.filter((k) => k !== key)
                : [...selectedLocation, key]
        );
    };

    return (
        <>
            <div className='slide-header'>
                <h1 className='slide-title'>Where does the design go?</h1>
                <p className='slide-sub'>Pick every spot you want printed.</p>
            </div>
            <div className='slide-content'>
                <div className='option-grid'>
                    {PLACEMENTS.map((p) => {
                        const on = selectedLocation.includes(p.key);
                        return (
                            <button
                                type='button'
                                key={p.key}
                                className={`option-card ${on ? 'is-active' : ''}`}
                                aria-pressed={on}
                                onClick={() => toggle(p.key)}
                            >
                                <span className='option-card__label'>{p.label}</span>
                                <span className='option-card__detail'>{p.detail}</span>
                            </button>
                        );
                    })}
                </div>
                <p className='slide-note'>
                    {selectedProject === 'screenPrinting'
                        ? 'Next you tell us how many ink colors go in each spot.'
                        : 'Oversized print, or a spot not listed here? Pick the closest one and tell us in your artwork notes.'}
                </p>
            </div>
            <div className='slide-nav'>
                <NavBtn onClick={onPrevious} direction='prev'>&larr; Prev</NavBtn>
                <NavBtn onClick={onNext}>Next &rarr;</NavBtn>
            </div>
        </>
    );
}
