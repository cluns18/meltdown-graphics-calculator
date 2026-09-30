import React from 'react';
import NavBtn from '../components/NavBtn';

// Jake's own rush ladder, from the quote page on meltdowngraphics.com. Keys match
// netlify/functions/pricing.cjs TURNAROUND.
export const TURNAROUND_OPTIONS = [
    { key: 'standard', label: '7 to 10 business days', detail: 'Standard. No rush charge.' },
    { key: 'rush_3_5', label: '3 to 5 business days', detail: 'Rush, adds 15% to the order.' },
    { key: 'rush_1_2', label: '1 to 2 business days', detail: 'Rush, adds 30% to the order.' },
    { key: 'same_day', label: 'Same day', detail: 'Adds 50% or more. We confirm it can be done before anything prints.' },
];
export const TURNAROUND_LABELS = Object.fromEntries(TURNAROUND_OPTIONS.map((o) => [o.key, o.label]));

export default function TurnaroundSelect({ onNext, onPrevious, turnaround, setTurnaround }) {
    return (
        <>
            <div className='slide-header'>
                <h1 className='slide-title'>When do you need it?</h1>
                <p className='slide-sub'>Days are counted from art approval and payment.</p>
            </div>
            <div className='slide-content'>
                <div className='option-list'>
                    {TURNAROUND_OPTIONS.map((o) => (
                        <button
                            type='button'
                            key={o.key}
                            className={`option-card ${turnaround === o.key ? 'is-active' : ''}`}
                            aria-pressed={turnaround === o.key}
                            onClick={() => setTurnaround(o.key)}
                        >
                            <span className='option-card__label'>{o.label}</span>
                            <span className='option-card__detail'>{o.detail}</span>
                        </button>
                    ))}
                </div>
            </div>
            <div className='slide-nav'>
                <NavBtn onClick={onPrevious} direction='prev'>&larr; Prev</NavBtn>
                <NavBtn onClick={onNext}>Next &rarr;</NavBtn>
            </div>
        </>
    );
}
