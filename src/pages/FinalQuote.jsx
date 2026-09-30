import React, { useState, useEffect, useRef } from 'react';
import NavBtn from '../components/NavBtn';
import calculateFinalQuote from '../utils/functions';
import { sendQuote, clean, escName, artworkStatus } from '../utils/quoteDelivery';
import SHOP_CONFIG from '../config/shop';
import { PLACEMENT_LABELS } from './PlacementSelect';
import { TURNAROUND_LABELS } from './TurnaroundSelect';

const GARMENT_SIZES = ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL'];
const PHONE_HREF = `tel:${SHOP_CONFIG.shop_phone.replace(/[^0-9]/g, '')}`;

// Everything we cannot price online still sends. The customer sees why, Jake gets the
// whole job, and nobody ever sees a guessed or $0 figure.
const HAND_QUOTE = {
    SP_BY_REQUEST: {
        title: 'Screen print is priced by hand',
        body: 'Send the job below and Jake comes back with a real number. Most jobs here run DTF, so he will tell you straight if that prints it for less.',
    },
    DTF_OVER_MAX: {
        title: 'Over 500 pieces? Jake prices that personally',
        body: 'Big runs get a better number than any chart. Send the details below and he comes back with a real quote.',
    },
    GARMENT_NOT_PRICED: {
        title: 'We will price this garment by hand',
        body: 'Our live garment list did not load, so there is no current cost on this one. Send it below and Jake comes back with the number.',
    },
    PLACEMENT_MISSING: {
        title: 'We will price this one by hand',
        body: 'Send it below and Jake comes back with the number.',
    },
    NO_PRICE: {
        title: 'We will price this one by hand',
        body: 'Send it below and Jake comes back with the number.',
    },
    CALC_ERROR: {
        title: 'We could not price this online just now',
        body: 'Send it below anyway. Jake gets every detail and comes back with the number.',
    },
};

const money = (n) => `$${Number(n).toFixed(2)}`;

export default function FinalQuote({
    onNext, onPrevious, selectedProject, garmentType, pickedGarment, selectedColor,
    selectedArtwork, artworkFile, artworkDescription, selectedLocation,
    locationColorCounts, turnaround,
}) {
    const isSP = selectedProject === 'screenPrinting';
    const garmentLabel = pickedGarment?.label || pickedGarment?.name || garmentType?.name || '';
    const colorName = selectedColor?.name || '';
    const placementText = (selectedLocation || [])
        .map((k) => {
            const label = PLACEMENT_LABELS[k] || k;
            if (!isSP) return label;
            const n = locationColorCounts?.[k] || 1;
            return `${label} (${n} ${n === 1 ? 'color' : 'colors'})`;
        })
        .join(', ');
    const turnaroundLabel = TURNAROUND_LABELS[turnaround] || TURNAROUND_LABELS.standard;

    // Raw strings per size, so a customer can clear a field and retype without it
    // snapping back to 0. Parsed for the count, normalized on blur.
    const [sizeRaw, setSizeRaw] = useState(Object.fromEntries(GARMENT_SIZES.map((s) => [s, ''])));
    const sizeCounts = Object.fromEntries(GARMENT_SIZES.map((s) => [s, Math.max(0, parseInt(sizeRaw[s], 10) || 0)]));
    const quantity = Object.values(sizeCounts).reduce((a, b) => a + b, 0);

    const [quote, setQuote] = useState(null);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({ name: '', company: '', email: '', phone: '' });
    const [pricingRevealed, setPricingRevealed] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState('');

    // Debounced price fetch. A request counter drops any answer that arrives after a
    // newer one, so a fast typist never sees the price for a quantity they left behind.
    const reqId = useRef(0);
    useEffect(() => {
        if (quantity < 1) { setQuote(null); setLoading(false); return undefined; }
        setLoading(true);
        const id = ++reqId.current;
        const t = setTimeout(async () => {
            const result = await calculateFinalQuote(quantity, {
                selectedProject, selectedLocation, locationColorCounts, turnaround, pickedGarment,
            });
            if (id === reqId.current) { setQuote(result); setLoading(false); }
        }, 250);
        return () => clearTimeout(t);
    }, [quantity, selectedProject, selectedLocation, locationColorCounts, turnaround, pickedGarment]);

    const quotable = Boolean(quote?.quotable) && !loading;
    const handQuote = quote && !quote.quotable && quote.errorCode !== 'INCOMPLETE' ? (HAND_QUOTE[quote.errorCode] || HAND_QUOTE.CALC_ERROR) : null;

    const setSize = (size, value) => setSizeRaw((prev) => ({ ...prev, [size]: value.replace(/[^0-9]/g, '').slice(0, 4) }));
    const bump = (size, delta) => setSizeRaw((prev) => ({ ...prev, [size]: String(Math.max(0, (parseInt(prev[size], 10) || 0) + delta)) }));
    const normalize = (size) => setSizeRaw((prev) => ({ ...prev, [size]: prev[size] === '' ? '' : String(parseInt(prev[size], 10) || 0) }));

    const errors = {};
    if (!formData.name.trim()) errors.name = 'Add your name';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) errors.email = 'Add a valid email';
    if (formData.phone.replace(/[^0-9]/g, '').length < 10) errors.phone = 'Add a phone number';
    const formValid = Object.keys(errors).length === 0;
    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async () => {
        if (!formValid || quantity < 1 || isSubmitting) return;
        setIsSubmitting(true);
        setSubmitError('');

        const sizeBreakdownString = GARMENT_SIZES
            .filter((s) => sizeCounts[s] > 0)
            .map((s) => `${s} × ${sizeCounts[s]}`)
            .join('&nbsp;&nbsp;·&nbsp;&nbsp;');

        // ink_details shows in the CUSTOMER's email too, so it carries nothing about
        // blank cost. The pricing trail for Jake rides in special_inks, which only the
        // shop's lead email renders (templates/quote-client.html, "Special Inks" row).
        const inkDetails = isSP
            ? `Screen print by request | ${placementText} | ${turnaroundLabel}`
            : `DTF, full color | ${turnaroundLabel}`;
        const shopDetail = quotable
            ? [
                `Priced from Jake's published ballparks on a basic tee: ${quote.lines.map((l) => l.primary ? `${l.label} ${money(l.perPiece)}` : `${l.label} +${money(l.perPiece)}`).join(' + ')} = ${money(quote.basicTeePerPiece)}/pc`,
                quote.garmentUpcharge > 0
                    ? `Blank over Gildan 5000: +${money(quote.garmentUpcharge)}/pc (S&S wholesale difference x2)`
                    : 'Blank priced as a basic tee',
                quote.rushPercent > 0
                    ? `Rush +${quote.rushPercent}%${quote.rushIsFloor ? ' (same day, a MINIMUM, confirm the date)' : ''} = ${money(quote.rushAmount)}`
                    : 'Standard turnaround, no rush',
              ].join(' | ')
            : `NOT PRICED ONLINE (${quote?.errorCode || 'INCOMPLETE'}). Quote this by hand.`;

        const artworkUploaded = selectedArtwork && !selectedArtwork.startsWith('pending:');
        const pendingFilename = selectedArtwork && selectedArtwork.startsWith('pending:')
            ? selectedArtwork.slice('pending:'.length)
            : null;

        const payload = {
            shop_id: SHOP_CONFIG.shop_id,
            customer: {
                name: escName(clean(formData.name, 120)),
                email: clean(formData.email, 200),
                company: clean(formData.company, 200) || 'N/A',
                phone: clean(formData.phone, 40),
            },
            quote: {
                project: isSP ? 'Screen Printing (by request)' : 'DTF Printing',
                garment_name: garmentLabel,
                color: colorName,
                locations: placementText || 'None',
                ink_details: inkDetails,
                special_inks: shopDetail,
                size_breakdown: sizeBreakdownString || 'N/A',
                quantity,
                price_per_item: quotable ? quote.pricePerItem.toFixed(2) : 'TBD',
                total_price: quotable ? quote.totalQuote.toFixed(2) : 'TBD',
                artwork_status: artworkStatus({ artworkUrl: artworkUploaded ? selectedArtwork : null, pendingFilename }),
                artwork_description: clean(artworkDescription, 4000) || 'No description provided',
            },
        };

        try {
            // Attaches the artwork when there is both a file and a confirmed upload, and
            // falls back to the link-only payload rather than losing the quote.
            await sendQuote(payload, { file: artworkFile, artworkUrl: artworkUploaded ? selectedArtwork : null });
            const done = {
                quotable,
                totalQuote: quotable ? quote.totalQuote.toFixed(2) : '',
                pricePerItem: quotable ? quote.pricePerItem.toFixed(2) : '',
                quantity,
                project: isSP ? 'screen_print' : 'dtf',
            };
            window.parent.postMessage({ event: 'calculator_submission', ...done }, '*');
            window.parent.postMessage({ event: 'obgform_submission', type: 'obgform_submission', ...done }, '*');
            onNext();
        } catch (error) {
            console.error('Quote submission failed:', error);
            setSubmitError(`That did not go through. Try once more, or call ${SHOP_CONFIG.shop_phone} and we will take it over the phone.`);
        }
        setIsSubmitting(false);
    };

    const pillPrice = quantity < 1
        ? 'Add sizes to see your price'
        : loading ? 'Pricing...'
        : quotable ? `${money(quote.pricePerItem)} each`
        : 'Priced by hand';

    return (
        <>
            <div className='slide-header'>
                <h1 className='slide-title'>{isSP ? 'Send us the run' : 'Your price'}</h1>
                <p className='slide-sub'>
                    {garmentLabel}{colorName ? ` in ${colorName}` : ''}{placementText ? `. ${placementText}.` : ''} {turnaroundLabel}.
                </p>
            </div>
            <div className='slide-content'>
                <div className='quote-summary'>
                    <div className='counter-pill' aria-live='polite'>
                        <span>{quantity} {quantity === 1 ? 'piece' : 'pieces'}</span>
                        <span className='counter-pill__sep' aria-hidden='true'></span>
                        <span>{pillPrice}</span>
                    </div>
                </div>

                {handQuote && quantity > 0 && (
                    <div className='notice'>
                        <p><strong>{handQuote.title}</strong></p>
                        <p>{handQuote.body} Or call <a href={PHONE_HREF}>{SHOP_CONFIG.shop_phone}</a>.</p>
                    </div>
                )}

                {!pricingRevealed && (
                    <div>
                        <span className='slide-label'>How many of each size?</span>
                        <div className='size-grid'>
                            {GARMENT_SIZES.map((size) => (
                                <div key={size} className={`size-cell ${sizeCounts[size] > 0 ? 'is-active' : ''}`}>
                                    <div className='size-label'>{size}</div>
                                    <div className='size-ctl'>
                                        <input
                                            className='size-input'
                                            type='text'
                                            inputMode='numeric'
                                            pattern='[0-9]*'
                                            placeholder='0'
                                            aria-label={`${size} quantity`}
                                            value={sizeRaw[size]}
                                            onChange={(e) => setSize(size, e.target.value)}
                                            onBlur={() => normalize(size)}
                                        />
                                        <button type='button' className='size-btn' aria-label={`One less ${size}`} onClick={() => bump(size, -1)}>-</button>
                                        <button type='button' className='size-btn size-btn--plus' aria-label={`One more ${size}`} onClick={() => bump(size, 1)}>+</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                        {!isSP && <p className='slide-note slide-note--center'>No minimum. Order one shirt or five hundred.</p>}
                    </div>
                )}

                {/* Priced online: the per-piece shows above, the full breakdown after contact info. */}
                {quotable && !pricingRevealed && (
                    <div className='light-card'>
                        <h2 className='light-card__title'>See the full breakdown</h2>
                        <p className='light-card__text'>Drop your info to see the total, size by size, and we'll send you a copy.</p>
                        <ContactFields formData={formData} onChange={handleChange} errors={errors} />
                        <div className='actions'>
                            <NavBtn direction='next' disabled={!formValid} onClick={() => { if (formValid) setPricingRevealed(true); }}>
                                Show my total
                            </NavBtn>
                        </div>
                    </div>
                )}

                {quotable && pricingRevealed && (
                    <div className='light-card' style={{ animation: 'fadeIn 0.4s ease' }}>
                        <div className='price-stats'>
                            <div className='price-stat'>
                                <div className='price-stat__label'>Each</div>
                                <div className='price-stat__value'>{money(quote.pricePerItem)}</div>
                            </div>
                            <div className='price-stat'>
                                <div className='price-stat__label'>Total</div>
                                <div className='price-stat__value price-stat__value--gold'>{money(quote.totalQuote)}</div>
                            </div>
                            <div className='price-stat'>
                                <div className='price-stat__label'>Pieces</div>
                                <div className='price-stat__value'>{quantity}</div>
                            </div>
                        </div>

                        <table className='breakdown-table'>
                            <thead>
                                <tr>
                                    <th scope='col'>Size</th>
                                    <th scope='col' className='ctr'>Qty</th>
                                    <th scope='col' className='num'>Subtotal</th>
                                </tr>
                            </thead>
                            <tbody>
                                {GARMENT_SIZES.filter((s) => sizeCounts[s] > 0).map((size) => (
                                    <tr key={size}>
                                        <td>{size}</td>
                                        <td className='ctr'>
                                            <div className='qty-ctl'>
                                                <button type='button' className='qty-btn' aria-label={`One less ${size}`} onClick={() => bump(size, -1)}>-</button>
                                                <span>{sizeCounts[size]}</span>
                                                <button type='button' className='qty-btn qty-btn--plus' aria-label={`One more ${size}`} onClick={() => bump(size, 1)}>+</button>
                                            </div>
                                        </td>
                                        <td className='num'>{money(sizeCounts[size] * quote.pricePerItem)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        <p className='fine-print'>
                            {quote.rushPercent > 0 && (
                                <><strong>Includes the {quote.rushPercent}% rush{quote.rushIsFloor ? ', and same day starts there' : ''}.</strong>{' '}</>
                            )}
                            Built from our published starting prices. Jake confirms the final number once he sees your art, and nothing prints until you approve a proof. Ships anywhere, local handoff by arrangement.
                        </p>

                        {submitError && <div className='notice'><p>{submitError}</p></div>}
                        <div className='actions'>
                            <NavBtn direction='next' onClick={handleSubmit} disabled={!formValid || isSubmitting || quantity < 1}>
                                {isSubmitting ? 'Sending...' : 'Send me this quote'}
                            </NavBtn>
                        </div>
                    </div>
                )}

                {/* Priced by hand: one step, contact info and send. */}
                {handQuote && quantity > 0 && (
                    <div className='light-card'>
                        <h2 className='light-card__title'>Send it to Jake</h2>
                        <p className='light-card__text'>He reads every one and comes back with a real number.</p>
                        <ContactFields formData={formData} onChange={handleChange} errors={errors} />
                        {submitError && <div className='notice'><p>{submitError}</p></div>}
                        <div className='actions'>
                            <NavBtn direction='next' onClick={handleSubmit} disabled={!formValid || isSubmitting}>
                                {isSubmitting ? 'Sending...' : 'Send my request'}
                            </NavBtn>
                        </div>
                    </div>
                )}
            </div>
            <div className='slide-nav'>
                <NavBtn onClick={() => (pricingRevealed ? setPricingRevealed(false) : onPrevious())} direction='prev'>&larr; Prev</NavBtn>
            </div>
        </>
    );
}

function ContactFields({ formData, onChange, errors }) {
    const [touched, setTouched] = useState({});
    const touch = (e) => setTouched({ ...touched, [e.target.name]: true });
    const err = (k) => (touched[k] && errors[k] ? <span className='field-error'>{errors[k]}</span> : null);
    return (
        <div className='form-grid'>
            <div>
                <input className='field' type='text' name='name' autoComplete='name' placeholder='Your name *' aria-label='Your name' value={formData.name} onChange={onChange} onBlur={touch} />
                {err('name')}
            </div>
            <div>
                <input className='field' type='text' name='company' autoComplete='organization' placeholder='Company or team (optional)' aria-label='Company or team' value={formData.company} onChange={onChange} />
            </div>
            <div>
                <input className='field' type='email' name='email' autoComplete='email' placeholder='Email *' aria-label='Email' value={formData.email} onChange={onChange} onBlur={touch} />
                {err('email')}
            </div>
            <div>
                <input className='field' type='tel' name='phone' autoComplete='tel' placeholder='Phone *' aria-label='Phone' value={formData.phone} onChange={onChange} onBlur={touch} />
                {err('phone')}
            </div>
        </div>
    );
}
