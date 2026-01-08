'use client';

import React from 'react';

interface BookButtonProps {
    onClick?: () => void;
}

export default function BookButton({ onClick }: BookButtonProps) {
    return (
        <div className="book-button-container">
            <button className="book-button" onClick={onClick}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                Book New Meeting
            </button>
        </div>
    );
}
