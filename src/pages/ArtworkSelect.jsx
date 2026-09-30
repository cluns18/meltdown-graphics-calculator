import React, { useState } from 'react';
import NavBtn from '../components/NavBtn';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../../firebaseConfig';

const MAX_BYTES = 20 * 1024 * 1024;

// A stalled upload must never strand the customer on this step with no way to tell
// whether anything happened.
const UPLOAD_TIMEOUT_MS = 60000;

const withTimeout = (promise, ms) =>
    Promise.race([
        promise,
        new Promise((_, reject) => setTimeout(() => reject(new Error('Upload timed out')), ms)),
    ]);

export default function ArtworkSelect({ onNext, onPrevious, setUploadedImage, setArtworkFile, artworkDescription, setArtworkDescription }) {
    const [imageFile, setImageFile] = useState(null);
    const [status, setStatus] = useState('idle'); // idle | uploading | success | error
    const [error, setError] = useState('');

    const handleFileUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        if (file.size > MAX_BYTES) {
            setError('That file is over 20MB. Send a smaller version, or describe the design below and we will email you for it.');
            setImageFile(null);
            setStatus('idle');
            setUploadedImage(null);
            setArtworkFile?.(null);
            return;
        }

        setImageFile(file);
        setError('');
        setStatus('uploading');
        setUploadedImage(`pending:${file.name}`);
        // The raw File rides along as a real email attachment. The Firebase URL alone
        // means the shop clicks out to a link that may not outlive the job.
        setArtworkFile?.(file);

        // Flat, unique key under uploads/. The storage rule is match /uploads/{fileName},
        // so a nested folder would 403 (reference_firebase_calc_config).
        const safeName = file.name.replace(/[^A-Za-z0-9._-]/g, '_');
        const uniquePath = `uploads/meltdown-${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${safeName}`;
        const storageRef = ref(storage, uniquePath);
        try {
            await withTimeout(uploadBytes(storageRef, file), UPLOAD_TIMEOUT_MS);
            const downloadURL = await withTimeout(getDownloadURL(storageRef), 15000);
            setUploadedImage(downloadURL);
            setStatus('success');
        } catch (err) {
            // Never fail silently. The `pending:` marker stays so the shop's email flags
            // the incomplete upload, and the customer is told plainly.
            console.error('Error uploading file:', err);
            setStatus('error');
        }
    };

    const handleNext = () => {
        // Don't advance mid-upload, or the quote could send before the art lands.
        if (status === 'uploading') return;
        onNext();
    };

    return (
        <>
            <div className='slide-header'>
                <h1 className='slide-title'>Add your artwork</h1>
                <p className='slide-sub'>Upload a file, describe what you have in mind, or both. We can work with either.</p>
            </div>
            <div className='slide-content'>
                <div>
                    <label className='slide-label' htmlFor='artwork-file'>Upload a design file</label>
                    <p className='slide-note'>JPG, PNG, PDF, AI, EPS or SVG, up to 20MB.</p>
                    <input
                        id='artwork-file'
                        type='file'
                        accept='image/*,.pdf,.ai,.eps,.svg'
                        onChange={handleFileUpload}
                        className='field field--file'
                    />
                    {imageFile && status === 'uploading' && (
                        <p className='slide-note slide-note--status'>Uploading {imageFile.name}...</p>
                    )}
                    {imageFile && status === 'success' && (
                        <p className='slide-note slide-note--status'>Uploaded {imageFile.name}</p>
                    )}
                    {imageFile && status === 'error' && (
                        <div className='notice'>
                            <p><strong>Your file didn't finish uploading.</strong></p>
                            <p>Try again, or just keep going. Your quote still goes through and we'll email you for the art.</p>
                        </div>
                    )}
                    {error && <div className='notice'><p>{error}</p></div>}
                </div>

                <div>
                    <label className='slide-label' htmlFor='artwork-description'>Or describe it</label>
                    <p className='slide-note'>Colors, layout, sizes, anything oversized. Names and numbers too.</p>
                    <textarea
                        id='artwork-description'
                        placeholder='Describe your design...'
                        value={artworkDescription || ''}
                        onChange={(e) => setArtworkDescription(e.target.value)}
                        className='field'
                    />
                </div>
            </div>
            <div className='slide-nav'>
                <NavBtn onClick={onPrevious} direction='prev'>&larr; Prev</NavBtn>
                <NavBtn onClick={handleNext}>{status === 'uploading' ? 'Uploading...' : <>Next &rarr;</>}</NavBtn>
            </div>
        </>
    );
}
