import React, { useEffect } from 'react';
import NavBtn from '../components/NavBtn';
import { PLACEMENT_LABELS } from './PlacementSelect';

// Screen print only. Nothing here prices anything; Jake uses the counts to quote
// the run by hand.
const MAX_COLORS = 12;

export default function ColorCount({ onNext, onPrevious, selectedLocations, colorCounts, setColorCounts }) {
    useEffect(() => {
        const missing = selectedLocations.filter((k) => !colorCounts[k]);
        if (missing.length) {
            setColorCounts({ ...colorCounts, ...Object.fromEntries(missing.map((k) => [k, 1])) });
        }
    }, [selectedLocations, colorCounts, setColorCounts]);

    const set = (key, value) => {
        const n = Math.min(Math.max(parseInt(value, 10) || 1, 1), MAX_COLORS);
        setColorCounts({ ...colorCounts, [key]: n });
    };

    return (
        <>
            <div className='slide-header'>
                <h1 className='slide-title'>How many ink colors?</h1>
                <p className='slide-sub'>Every color is its own screen, so this is what shapes a screen print price.</p>
            </div>
            <div className='slide-content'>
                {selectedLocations.map((key) => (
                    <div key={key}>
                        <label className='slide-label' htmlFor={`colors-${key}`}>{PLACEMENT_LABELS[key] || key}</label>
                        <div className='range-row'>
                            <input
                                id={`colors-${key}`}
                                type='range'
                                min='1'
                                max={MAX_COLORS}
                                value={colorCounts[key] || 1}
                                onChange={(e) => set(key, e.target.value)}
                            />
                            <span className='range-value'>
                                {colorCounts[key] || 1} {(colorCounts[key] || 1) === 1 ? 'color' : 'colors'}
                            </span>
                        </div>
                    </div>
                ))}
                <p className='slide-note'>Not sure? Give it your best guess. Jake checks the art before he quotes.</p>
            </div>
            <div className='slide-nav'>
                <NavBtn onClick={onPrevious} direction='prev'>&larr; Prev</NavBtn>
                <NavBtn onClick={onNext}>Next &rarr;</NavBtn>
            </div>
        </>
    );
}
