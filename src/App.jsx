import React, { useState, useEffect, useRef, useCallback } from 'react';
import './App.css';
import IntroSlide from './pages/IntroSlide';
import GarmentTypeSelect from './pages/GarmentTypeSelect';
import GarmentPickSlide from './pages/GarmentPickSlide';
import ColorSelect from './pages/ColorSelect';
import ArtworkSelect from './pages/ArtworkSelect';
import PlacementSelect from './pages/PlacementSelect';
import ColorCount from './pages/ColorCount';
import TurnaroundSelect from './pages/TurnaroundSelect';
import FinalQuote from './pages/FinalQuote';
import ThankYou from './pages/ThankYou';
import tshirtGarments from './garments/tshirts';
import longSleeveGarments from './garments/longsleeves';
import hoodieGarments from './garments/hoodies';
import poloGarments from './garments/polos';

// The hand-built shortlist per type, shown only when the live catalog is off or fails
// to load, so the garment step never goes dark. A fallback pick carries no live cost,
// so it is quoted by hand (GARMENT_NOT_PRICED) rather than on stale data.
const FALLBACK_GARMENTS = {
  tshirt: Object.values(tshirtGarments),
  longsleeve: Object.values(longSleeveGarments),
  sweatshirt: Object.values(hoodieGarments),
  polo: Object.values(poloGarments),
};

const STEP_NAMES = {
  intro: '1 - Project Type',
  garmentType: '2 - Garment Type',
  garmentPick: '3 - Garment Select',
  colorSelect: '4 - Color',
  artworkSelect: '5 - Artwork',
  placement: '6 - Placement',
  colorCount: '7 - Ink Colors',
  turnaround: '8 - Turnaround',
  finalQuote: '9 - Quote',
  thankYou: '10 - Confirmation',
};

function App() {
  const [currentSlide, setCurrentSlide] = useState('intro');
  const [slideHistory, setSlideHistory] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null); // 'dtf' | 'screenPrinting'
  const [garmentType, setGarmentType] = useState(null);
  const [pickedGarment, setPickedGarment] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedArtwork, setSelectedArtwork] = useState(null);
  // The raw File, kept alongside the Firebase URL so the quote email can carry the
  // artwork as a real attachment and not just a link.
  const [artworkFile, setArtworkFile] = useState(null);
  const [artworkDescription, setArtworkDescription] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState([]);
  const [locationColorCounts, setLocationColorCounts] = useState({});
  const [turnaround, setTurnaround] = useState('standard');
  const [hasError, setHasError] = useState(false);

  // The card. Its rendered height is what the parent iframe follows.
  const cardRef = useRef(null);
  const lastHeightRef = useRef(0);

  // Tell the parent page how tall we are. The store's mg-quote section reads
  // `type`, the older OBG bridge reads `event`, so both ride along. Measured from the
  // card plus the container padding, never documentElement.scrollHeight: that number
  // is floored at the iframe's viewport, so a frame sized from it can only ever grow.
  const postHeight = useCallback((force = false) => {
    const card = cardRef.current;
    if (!card) return;
    const container = card.parentElement;
    const cs = container ? getComputedStyle(container) : null;
    const pad = cs ? (parseFloat(cs.paddingTop) || 0) + (parseFloat(cs.paddingBottom) || 0) : 0;
    const height = Math.ceil(card.getBoundingClientRect().height + pad) + 2;
    if (!height) return;
    if (!force && height === lastHeightRef.current) return;
    lastHeightRef.current = height;
    window.parent.postMessage({ type: 'obgform_height', event: 'obgform_height', height }, '*');
  }, []);

  useEffect(() => {
    let raf = 0;
    const schedule = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => { raf = 0; postHeight(false); });
    };
    schedule();
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(schedule) : null;
    if (ro && cardRef.current) ro.observe(cardRef.current);
    window.addEventListener('resize', schedule);
    window.addEventListener('load', schedule);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(schedule).catch(() => {});
    return () => {
      if (ro) ro.disconnect();
      window.removeEventListener('resize', schedule);
      window.removeEventListener('load', schedule);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [postHeight]);

  const isValid = () => {
    switch (currentSlide) {
      case 'intro': return Boolean(selectedProject);
      case 'garmentType': return Boolean(garmentType);
      case 'garmentPick': return Boolean(pickedGarment);
      case 'colorSelect': return Boolean(selectedColor);
      case 'artworkSelect': return Boolean(selectedArtwork || (artworkDescription && artworkDescription.trim()));
      case 'placement': return selectedLocation.length > 0;
      default: return true;
    }
  };

  const nextOf = (slide) => {
    switch (slide) {
      case 'intro': return 'garmentType';
      case 'garmentType': return 'garmentPick';
      case 'garmentPick': return 'colorSelect';
      case 'colorSelect': return 'artworkSelect';
      case 'artworkSelect': return 'placement';
      case 'placement': return selectedProject === 'screenPrinting' ? 'colorCount' : 'turnaround';
      case 'colorCount': return 'turnaround';
      case 'turnaround': return 'finalQuote';
      case 'finalQuote': return 'thankYou';
      default: return '';
    }
  };

  const handleNext = () => {
    if (!isValid()) {
      setHasError(true);
      setTimeout(() => setHasError(false), 1200);
      return;
    }
    setHasError(false);
    const next = nextOf(currentSlide);
    if (next) {
      setSlideHistory([...slideHistory, currentSlide]);
      setCurrentSlide(next);
    }
  };

  const handlePrevious = () => {
    if (slideHistory.length === 0) return;
    const previous = slideHistory[slideHistory.length - 1];
    setSlideHistory(slideHistory.slice(0, -1));
    setCurrentSlide(previous);
  };

  // A new project or garment type invalidates everything picked after it.
  const chooseProject = (p) => {
    if (p !== selectedProject) {
      setSelectedLocation([]);
      setLocationColorCounts({});
    }
    setSelectedProject(p);
  };
  const chooseType = (t) => {
    if (t?.id !== garmentType?.id) {
      setPickedGarment(null);
      setSelectedColor(null);
    }
    setGarmentType(t);
  };

  // Analytics step event for the parent page, and bring the top of the card back
  // into view on every step change so a tall step never strands the customer below.
  const firstRender = useRef(true);
  useEffect(() => {
    window.parent.postMessage(
      { event: 'calculator_slide_view', calcSlideName: currentSlide, calcStepName: STEP_NAMES[currentSlide] || currentSlide },
      '*'
    );
    if (firstRender.current) { firstRender.current = false; return; }
    window.parent.postMessage({ type: 'obgform_scroll_top', event: 'obgform_scroll_top' }, '*');
    postHeight(true);
  }, [currentSlide, postHeight]);

  return (
    <div className='slide-container'>
      <div ref={cardRef} className={`slide-page ${hasError ? 'error-shake' : ''}`}>
        {currentSlide === 'intro' && (
          <IntroSlide selectedProject={selectedProject} setSelectedProject={chooseProject} onNext={handleNext} />
        )}
        {currentSlide === 'garmentType' && (
          <GarmentTypeSelect
            selectedProject={selectedProject}
            garmentType={garmentType}
            setGarmentType={chooseType}
            onNext={handleNext}
            onPrevious={handlePrevious}
          />
        )}
        {currentSlide === 'garmentPick' && garmentType && (
          <GarmentPickSlide
            key={garmentType.id}
            typeId={garmentType.id}
            typeName={garmentType.name}
            fallbackGarments={FALLBACK_GARMENTS[garmentType.id] || []}
            selected={pickedGarment}
            setSelected={(g) => {
              // A new garment means a new set of colorways, so the old colour pick
              // must not ride along into the colour step.
              if (g?.id !== pickedGarment?.id) setSelectedColor(null);
              setPickedGarment(g);
            }}
            onNext={handleNext}
            onPrevious={handlePrevious}
          />
        )}
        {currentSlide === 'colorSelect' && (
          <ColorSelect
            onNext={handleNext}
            onPrevious={handlePrevious}
            pickedGarment={pickedGarment}
            selectedColor={selectedColor}
            setSelectedColor={setSelectedColor}
          />
        )}
        {currentSlide === 'artworkSelect' && (
          <ArtworkSelect
            onNext={handleNext}
            onPrevious={handlePrevious}
            setUploadedImage={setSelectedArtwork}
            setArtworkFile={setArtworkFile}
            artworkDescription={artworkDescription}
            setArtworkDescription={setArtworkDescription}
          />
        )}
        {currentSlide === 'placement' && (
          <PlacementSelect
            onNext={handleNext}
            onPrevious={handlePrevious}
            selectedProject={selectedProject}
            garmentType={garmentType}
            selectedLocation={selectedLocation}
            setSelectedLocation={setSelectedLocation}
          />
        )}
        {currentSlide === 'colorCount' && (
          <ColorCount
            onNext={handleNext}
            onPrevious={handlePrevious}
            selectedLocations={selectedLocation}
            colorCounts={locationColorCounts}
            setColorCounts={setLocationColorCounts}
          />
        )}
        {currentSlide === 'turnaround' && (
          <TurnaroundSelect
            onNext={handleNext}
            onPrevious={handlePrevious}
            turnaround={turnaround}
            setTurnaround={setTurnaround}
          />
        )}
        {currentSlide === 'finalQuote' && (
          <FinalQuote
            onNext={handleNext}
            onPrevious={handlePrevious}
            selectedProject={selectedProject}
            garmentType={garmentType}
            pickedGarment={pickedGarment}
            selectedColor={selectedColor}
            selectedArtwork={selectedArtwork}
            artworkFile={artworkFile}
            artworkDescription={artworkDescription}
            selectedLocation={selectedLocation}
            locationColorCounts={locationColorCounts}
            turnaround={turnaround}
          />
        )}
        {currentSlide === 'thankYou' && <ThankYou />}
        {hasError && <p className='form-error' role='alert'>Make a selection to keep going.</p>}
      </div>
    </div>
  );
}

export default App;
