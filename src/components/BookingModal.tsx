'use client';

import React, { useState, useEffect } from 'react';
import { Meeting } from '@/components/EventCard';

interface BookingModalProps {
    isOpen: boolean;
    onClose: () => void;
    onBook: (meeting: { title: string; start: Date; end: Date }) => void;
    selectedTime?: Date | null;
    date: Date;
    existingMeetings: Meeting[];
}

const DURATION_OPTIONS = [
    { value: 30, label: '30 min' },
    { value: 60, label: '1 hour' },
    { value: 90, label: '1.5 hours' },
    { value: 120, label: '2 hours' },
];

export default function BookingModal({
    isOpen,
    onClose,
    onBook,
    selectedTime,
    date,
    existingMeetings
}: BookingModalProps) {
    const [title, setTitle] = useState('');
    const [startTime, setStartTime] = useState('09:00');
    const [duration, setDuration] = useState(60);
    const [conflictingMeeting, setConflictingMeeting] = useState<string | null>(null);
    const [validationError, setValidationError] = useState<string | null>(null);

    // Update start time when selectedTime changes
    useEffect(() => {
        if (selectedTime) {
            const hours = selectedTime.getHours().toString().padStart(2, '0');
            const minutes = selectedTime.getMinutes().toString().padStart(2, '0');
            setStartTime(`${hours}:${minutes}`);
        } else {
            setStartTime('09:00');
        }
    }, [selectedTime, isOpen]);

    // Check for conflicts and validations whenever startTime, duration or date changes
    useEffect(() => {
        if (!isOpen) return;

        const [hours, minutes] = startTime.split(':').map(Number);
        const start = new Date(date);
        start.setHours(hours, minutes, 0, 0);

        const end = new Date(start);
        end.setMinutes(end.getMinutes() + duration);

        // 1. Check Weekend
        const day = date.getDay();
        if (day === 0 || day === 6) {
            setValidationError('Cannot book meetings on weekends (Saturday/Sunday).');
            setConflictingMeeting(null); // Clear conflict if there's a validation error
            return;
        }

        // 2. Check Office Hours (8 AM - 6 PM)
        const startHour = start.getHours();
        const endHour = end.getHours();
        const endMin = end.getMinutes();

        if (startHour < 8 || (endHour > 18 || (endHour === 18 && endMin > 0))) {
            setValidationError('Meetings must be within office hours (8:00 AM - 6:00 PM).');
            setConflictingMeeting(null); // Clear conflict if there's a validation error
            return;
        }

        setValidationError(null); // Clear validation error if checks pass

        // 3. Check Conflicts
        const conflict = existingMeetings.find(m => {
            const mStart = new Date(m.start);
            const mEnd = new Date(m.end);
            return start < mEnd && end > mStart;
        });

        if (conflict) {
            setConflictingMeeting(conflict.title);
        } else {
            setConflictingMeeting(null);
        }
    }, [startTime, duration, existingMeetings, date, isOpen]);

    // Reset form when modal closes
    useEffect(() => {
        if (!isOpen) {
            setTitle('');
            setDuration(60);
            setConflictingMeeting(null);
            setValidationError(null);
        }
    }, [isOpen]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!title.trim()) return;

        const [hours, minutes] = startTime.split(':').map(Number);
        const start = new Date(date);
        start.setHours(hours, minutes, 0, 0);

        const end = new Date(start);
        end.setMinutes(end.getMinutes() + duration);

        onBook({
            title: title.trim(),
            start,
            end,
        });

        onClose();
    };

    const formatTimeToAMPM = (timeStr: string) => {
        const [hours, minutes] = timeStr.split(':').map(Number);
        const ampm = hours >= 12 ? 'PM' : 'AM';
        const h12 = hours % 12 || 12;
        return `${h12}:${minutes.toString().padStart(2, '0')} ${ampm}`;
    };

    const getEndTime = () => {
        const [h, m] = startTime.split(':').map(Number);
        const endMinutes = h * 60 + m + duration;
        const endH = Math.floor(endMinutes / 60);
        const endM = endMinutes % 60;
        return `${endH.toString().padStart(2, '0')}:${endM.toString().padStart(2, '0')}`;
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content booking-modal" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2 className="modal-title">Book Meeting</h2>
                    <button className="modal-close" onClick={onClose} aria-label="Close">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="modal-form">
                    <div className="form-group">
                        <label htmlFor="title" className="form-label">Meeting Title</label>
                        <input
                            type="text"
                            id="title"
                            className="form-input"
                            placeholder="Enter meeting title..."
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            autoFocus
                        />
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="startTime" className="form-label">Start Time</label>
                            <input
                                type="time"
                                id="startTime"
                                className="form-input"
                                value={startTime}
                                onChange={e => setStartTime(e.target.value)}
                                min="08:00"
                                max="17:00"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="duration" className="form-label">Duration</label>
                            <select
                                id="duration"
                                className="form-input form-select"
                                value={duration}
                                onChange={e => setDuration(Number(e.target.value))}
                            >
                                {DURATION_OPTIONS.map(option => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="form-preview">
                        <div className="preview-row">
                            <div className="preview-label">Your meeting:</div>
                            <div className="preview-time">
                                {formatTimeToAMPM(startTime)} - {formatTimeToAMPM(getEndTime())}
                            </div>
                        </div>

                        {validationError && (
                            <div className="validation-error">
                                <span>❌</span>
                                <div><strong>Error:</strong> {validationError}</div>
                            </div>
                        )}

                        {!validationError && conflictingMeeting && (
                            <div className="conflict-warning">
                                <span>⚠️</span>
                                <div>
                                    meeting conflicts with <strong>{conflictingMeeting}</strong>, proceed anyway?
                                </div>
                            </div>
                        )}
                    </div>

                    <button
                        type="submit"
                        className="modal-submit"
                        disabled={!title.trim() || !!validationError}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                        </svg>
                        Confirm Booking
                    </button>
                </form>
            </div>
        </div>
    );
}
