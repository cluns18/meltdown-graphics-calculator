import React from 'react';

// Next is the orange fill, Prev is the navy outline, same as the store's own
// primary and ghost buttons. Orange is the only button fill on this site.
const NavBtn = ({ onClick, direction = 'next', children, disabled = false, className = '' }) => {
    return (
        <button
            type='button'
            onClick={onClick}
            disabled={disabled}
            className={`nav-btn nav-btn--${direction} ${className}`.trim()}
        >
            {children || (direction === 'next' ? 'Next →' : '← Prev')}
        </button>
    );
};
export default NavBtn;
