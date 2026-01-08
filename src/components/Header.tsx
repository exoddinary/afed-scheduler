'use client';

import React from 'react';

interface HeaderProps {
    date: Date;
    canGoPrev: boolean;
    canGoNext: boolean;
    onPrev?: () => void;
    onNext?: () => void;
}

export default function Header({ date, canGoPrev, canGoNext, onPrev, onNext }: HeaderProps) {
    const formatDate = (date: Date) => {
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const isToday = date.toDateString() === today.toDateString();
        const isTomorrow = date.toDateString() === tomorrow.toDateString();

        const options: Intl.DateTimeFormatOptions = {
            month: 'short',
            day: 'numeric'
        };
        const dateStr = date.toLocaleDateString('en-US', options);

        if (isToday) return `Today, ${dateStr}`;
        if (isTomorrow) return `Tomorrow, ${dateStr}`;
        return dateStr;
    };

    return (
        <header className="header">
            {canGoPrev ? (
                <button className="header-btn" onClick={onPrev} aria-label="Previous day">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                    </svg>
                </button>
            ) : (
                <div className="header-btn-placeholder" />
            )}

            <span className="header-date">{formatDate(date)}</span>

            {canGoNext ? (
                <button className="header-btn" onClick={onNext} aria-label="Next day">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                    </svg>
                </button>
            ) : (
                <div className="header-btn-placeholder" />
            )}
        </header>
    );
}
