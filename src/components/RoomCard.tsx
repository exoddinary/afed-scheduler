'use client';

import React from 'react';
import dynamic from 'next/dynamic';

// Dynamically import Model3DViewer to avoid SSR issues with Three.js
const Model3DViewer = dynamic(() => import('./Model3DViewer'), {
    ssr: false,
    loading: () => (
        <div className="model-3d-container model-loading">
            <div className="loading-spinner" />
        </div>
    )
});

interface RoomCardProps {
    name: string;
    modelPath?: string;
}

export default function RoomCard({ name, modelPath }: RoomCardProps) {
    return (
        <div className="room-card">
            {modelPath && <Model3DViewer modelPath={modelPath} />}
            <h1 className="room-name">{name}</h1>
        </div>
    );
}
