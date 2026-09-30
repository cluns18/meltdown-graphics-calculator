import React, { useEffect, useState } from 'react';
import NavBtn from '../components/NavBtn';

// The picked garment carries its own colorways whether it came from the live catalog
// (catalog.js mapRow) or the hand-built fallback modules.
function Swatch({ color, active, onClick }) {
    const [dead, setDead] = useState(false);
    const src = color.swatch || color.image;
    return (
        <button
            type='button'
            onClick={onClick}
            title={color.name}
            aria-label={color.name}
            aria-pressed={active}
            className={`swatch ${active ? 'is-active' : ''}`}
        >
            {/* A dead swatch image fills with its hex instead of leaving a hole. */}
            {src && !dead
                ? <img src={src} alt='' loading='lazy' style={color.hex ? { backgroundColor: color.hex } : undefined} onError={() => setDead(true)} />
                : <span className='swatch__hex' style={{ backgroundColor: color.hex || '#e2e7e6' }} />}
        </button>
    );
}

export default function ColorSelect({ onNext, onPrevious, pickedGarment, selectedColor, setSelectedColor }) {
    const colors = pickedGarment?.colors || [];

    useEffect(() => {
        if (!selectedColor && colors.length > 0) setSelectedColor(colors[0]);
    }, [selectedColor, colors, setSelectedColor]);

    if (!colors.length) {
        return (
            <>
                <div className='slide-header'>
                    <h1 className='slide-title'>Pick your color</h1>
                    <p className='slide-sub'>Go back and pick a garment first.</p>
                </div>
                <div className='slide-nav'>
                    <NavBtn onClick={onPrevious} direction='prev'>&larr; Prev</NavBtn>
                </div>
            </>
        );
    }

    const shown = selectedColor || colors[0];

    return (
        <>
            <div className='slide-header'>
                <h1 className='slide-title'>Pick your color</h1>
                <p className='slide-sub'>
                    {pickedGarment.label || pickedGarment.name} in <strong>{shown.name}</strong>. {colors.length} {colors.length === 1 ? 'color' : 'colors'} to choose from.
                </p>
            </div>
            <div className='slide-content'>
                <div className='color-preview'>
                    {shown.image
                        ? <img src={shown.image} alt={`${pickedGarment.label || pickedGarment.name} in ${shown.name}`} className='color-img' />
                        : <span className='color-hex' style={{ backgroundColor: shown.hex || '#e2e7e6' }} />}
                </div>
                <div className='swatch-grid'>
                    {colors.map((c) => (
                        <Swatch key={c.name} color={c} active={shown.name === c.name} onClick={() => setSelectedColor(c)} />
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
