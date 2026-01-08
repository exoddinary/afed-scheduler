'use client';

import React, { useState, useEffect } from 'react';
import Avatar, { genConfig, AvatarConfig, AvatarFullConfig } from 'react-nice-avatar';

interface User {
    id: string;
    name: string;
    department: string;
    gender: 'male' | 'female';
    avatarConfig: AvatarFullConfig;
}

interface RegistrationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onRegister: (user: User) => void;
}

const DEPARTMENTS = [
    'Consumer',
    'Energy',
    'Tricipta',
    'Others'
];

export default function RegistrationModal({ isOpen, onClose, onRegister }: RegistrationModalProps) {
    const [name, setName] = useState('');
    const [department, setDepartment] = useState(DEPARTMENTS[0]);
    const [gender, setGender] = useState<'male' | 'female'>('male');
    const [config, setConfig] = useState<AvatarFullConfig>(genConfig({ sex: 'man' }));

    // Regenerate avatar when gender changes
    useEffect(() => {
        setConfig(genConfig({ sex: gender === 'male' ? 'man' : 'woman' }));
    }, [gender]);

    const handleRandomize = () => {
        setConfig(genConfig({ sex: gender === 'male' ? 'man' : 'woman' }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;

        onRegister({
            id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            name: name.trim(),
            department,
            gender,
            avatarConfig: config
        });
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content registration-modal" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <div>
                        <h2 className="modal-title">Welcome! Let's get you set up</h2>
                        <p className="registration-remark">
                            You only need to register this once for your device. This is to enable you to edit or delete your meeting plans.
                        </p>
                    </div>
                    <button className="modal-close" onClick={onClose} aria-label="Close">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="registration-preview">
                    <div className="avatar-container">
                        <Avatar className="registration-avatar" {...config} />
                        <button type="button" className="randomize-btn" onClick={handleRandomize}>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                            </svg>
                        </button>
                    </div>
                    <div className="gender-toggle">
                        <button
                            type="button"
                            className={`gender-btn ${gender === 'male' ? 'active' : ''}`}
                            onClick={() => setGender('male')}
                        >
                            Male
                        </button>
                        <button
                            type="button"
                            className={`gender-btn ${gender === 'female' ? 'active' : ''}`}
                            onClick={() => setGender('female')}
                        >
                            Female
                        </button>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="modal-form">
                    <div className="form-group">
                        <label htmlFor="reg-name" className="form-label">Full Name</label>
                        <input
                            type="text"
                            id="reg-name"
                            className="form-input"
                            placeholder="Enter your name..."
                            value={name}
                            onChange={e => setName(e.target.value)}
                            required
                            autoFocus
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="reg-dept" className="form-label">Department</label>
                        <select
                            id="reg-dept"
                            className="form-input form-select"
                            value={department}
                            onChange={e => setDepartment(e.target.value)}
                        >
                            {DEPARTMENTS.map(dept => (
                                <option key={dept} value={dept}>
                                    {dept}
                                </option>
                            ))}
                        </select>
                    </div>

                    <button
                        type="submit"
                        className="modal-submit"
                        disabled={!name.trim()}
                    >
                        Complete Registration
                    </button>
                </form>
            </div>
        </div>
    );
}
