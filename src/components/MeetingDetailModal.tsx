'use client';

import React from 'react';
import Avatar from 'react-nice-avatar';
import { Meeting } from './EventCard';

interface MeetingDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    meeting: Meeting | null;
}

export default function MeetingDetailModal({ isOpen, onClose, meeting }: MeetingDetailModalProps) {
    if (!isOpen || !meeting) return null;

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
    };

    const formatDate = (date: Date) => {
        return date.toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const getDuration = (start: Date, end: Date) => {
        const diff = (end.getTime() - start.getTime()) / (1000 * 60);
        if (diff < 60) return `${diff} min`;
        const hours = Math.floor(diff / 60);
        const mins = diff % 60;
        if (mins === 0) return `${hours} hour${hours > 1 ? 's' : ''}`;
        return `${hours}h ${mins}m`;
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content detail-modal" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2 className="modal-title">Meeting Details</h2>
                    <button className="modal-close" onClick={onClose} aria-label="Close">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="detail-content">
                    <h3 className="detail-meeting-title">{meeting.title}</h3>

                    <div className="detail-row">
                        <div className="detail-icon">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                            </svg>
                        </div>
                        <div className="detail-info">
                            <span className="detail-label">Date</span>
                            <span className="detail-value">{formatDate(meeting.start)}</span>
                        </div>
                    </div>

                    <div className="detail-row">
                        <div className="detail-icon">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div className="detail-info">
                            <span className="detail-label">Time</span>
                            <span className="detail-value">{formatTime(meeting.start)} - {formatTime(meeting.end)}</span>
                        </div>
                    </div>

                    <div className="detail-row">
                        <div className="detail-icon">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                            </svg>
                        </div>
                        <div className="detail-info">
                            <span className="detail-label">Duration</span>
                            <span className="detail-value">{getDuration(meeting.start, meeting.end)}</span>
                        </div>
                    </div>

                    {meeting.attendees.length > 0 && (
                        <div className="detail-section">
                            <h4 className="detail-section-title">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                                </svg>
                                Attendees ({meeting.attendees.length})
                            </h4>
                            <div className="attendee-list">
                                {meeting.attendees.map((attendee) => (
                                    <div key={attendee.id} className="attendee-item">
                                        {attendee.avatarConfig ? (
                                            <Avatar className="attendee-avatar-large" {...attendee.avatarConfig} />
                                        ) : (
                                            <img
                                                src={attendee.avatar}
                                                alt={attendee.name}
                                                className="attendee-avatar-large"
                                            />
                                        )}
                                        <span className="attendee-name">{attendee.name}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="detail-actions">
                    <button className="detail-btn detail-btn-secondary" onClick={onClose}>
                        Close
                    </button>
                    <button className="detail-btn detail-btn-primary">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                        </svg>
                        Edit Meeting
                    </button>
                </div>
            </div>
        </div>
    );
}
