import React from 'react';
import NavBtn from '../components/NavBtn';
import SHOP_CONFIG from '../config/shop';

// Where the gang sheet builder lives. Embedded on the store, that is the store's own
// product page (the referrer's origin). Standalone, it is directtofilm.shop, which
// runs the same builder today.
const gangSheetHref = () => {
    try {
        if (window.parent !== window && document.referrer) {
            return new URL(SHOP_CONFIG.gang_sheet_url, new URL(document.referrer).origin).href;
        }
    } catch { /* fall through */ }
    return 'https://directtofilm.shop/products/dtf-gang-sheet-builder';
};

const IntroSlide = ({ selectedProject, setSelectedProject, onNext }) => {
    const pick = (p) => setSelectedProject(p);
    return (
        <>
            <div className='slide-header'>
                <h1 className='slide-title'>What are we making?</h1>
                <p className='slide-sub'>
                    A few quick steps and you'll see a price. Most jobs here run DTF, full color with no minimum.
                </p>
            </div>
            <div className='slide-content'>
                <div className='option-list'>
                    <button
                        type='button'
                        className={`option-card option-card--lead ${selectedProject === 'dtf' ? 'is-active' : ''}`}
                        aria-pressed={selectedProject === 'dtf'}
                        onClick={() => pick('dtf')}
                    >
                        <span className='option-card__label'>Custom apparel, printed DTF</span>
                        <span className='option-card__detail'>Tees, long sleeves, sweatshirts and polos. Full color, any quantity, priced right here.</span>
                    </button>
                    <button
                        type='button'
                        className={`option-card ${selectedProject === 'screenPrinting' ? 'is-active' : ''}`}
                        aria-pressed={selectedProject === 'screenPrinting'}
                        onClick={() => pick('screenPrinting')}
                    >
                        <span className='option-card__label'>Screen printing, by request</span>
                        <span className='option-card__detail'>Large spot-color runs. Tell us the job and Jake prices it by hand.</span>
                    </button>
                    <a className='option-card option-card--link' href={gangSheetHref()} target='_top'>
                        <span className='option-card__label'>Just the transfers &rarr;</span>
                        <span className='option-card__detail'>Pressing your own? Build a DTF gang sheet, priced by the sheet.</span>
                    </a>
                </div>
            </div>
            <div className='slide-nav nav-end'>
                <NavBtn onClick={onNext}>Next &rarr;</NavBtn>
            </div>
        </>
    );
};

export default IntroSlide;
