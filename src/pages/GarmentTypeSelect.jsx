import React, { useEffect } from 'react';
import NavBtn from '../components/NavBtn';
import tshirtImage from '/assets/tshirtspgarment.png';
import longSleeveImage from '/assets/longsleevespgarment.png';
import sweatshirtImage from '/assets/hoodiespgarment.png';
import poloImage from '/assets/polospgarment.png';

// The ids match catalog.js TYPE_MAP. No hats: Meltdown outsources embroidery.
export const GARMENT_TYPES = [
    { id: 'tshirt', name: 'T-Shirt', image: tshirtImage },
    { id: 'longsleeve', name: 'Long Sleeve', image: longSleeveImage },
    { id: 'sweatshirt', name: 'Sweatshirt', image: sweatshirtImage },
    { id: 'polo', name: 'Polo', image: poloImage },
];

export default function GarmentTypeSelect({ selectedProject, garmentType, setGarmentType, onNext, onPrevious }) {
    useEffect(() => {
        if (!garmentType) setGarmentType(GARMENT_TYPES[0]);
    }, [garmentType, setGarmentType]);

    const shown = garmentType || GARMENT_TYPES[0];

    return (
        <>
            <div className='slide-header'>
                <h1 className='slide-title'>What are we printing on?</h1>
                <p className='slide-sub'>
                    {selectedProject === 'screenPrinting'
                        ? 'Pick the garment type. You choose the exact style next.'
                        : 'Pick the garment type. You choose the exact style next, from three we recommend or the whole catalog.'}
                </p>
            </div>
            <div className='slide-content'>
                <div className='garment-layout'>
                    <div className='garment-preview'>
                        <img src={shown.image} alt={shown.name} className='garment-img' />
                    </div>
                    <div className='garment-buttons'>
                        {GARMENT_TYPES.map((t) => (
                            <button
                                type='button'
                                key={t.id}
                                className={`choice-btn ${garmentType?.id === t.id ? 'is-active' : ''}`}
                                aria-pressed={garmentType?.id === t.id}
                                onClick={() => setGarmentType(t)}
                            >
                                {t.name}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
            <div className='slide-nav'>
                <NavBtn onClick={onPrevious} direction='prev'>&larr; Prev</NavBtn>
                <NavBtn onClick={onNext}>Next &rarr;</NavBtn>
            </div>
        </>
    );
}
