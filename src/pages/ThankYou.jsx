import React from 'react';
import SHOP_CONFIG from '../config/shop';

export default function ThankYou() {
    return (
        <>
            <div className='slide-header'>
                <h1 className='slide-title'>Got it. You're all set.</h1>
                <p className='slide-sub'>A copy of everything you sent is on its way to your inbox.</p>
            </div>
            <div className='slide-content'>
                <div className='contact-card'>
                    <p>Jake reads every request and gets back to you with a real number. Nothing prints until you approve the art.</p>
                    <p><strong>Working on a deadline?</strong></p>
                    <p>
                        Call or text <a href={`tel:${SHOP_CONFIG.shop_phone.replace(/[^0-9]/g, '')}`}>{SHOP_CONFIG.shop_phone}</a>
                        {' '}or email <a href={`mailto:${SHOP_CONFIG.shop_email}`}>{SHOP_CONFIG.shop_email}</a>.
                    </p>
                </div>
            </div>
        </>
    );
}
