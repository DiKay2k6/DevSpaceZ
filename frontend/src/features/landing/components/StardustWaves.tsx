import React, { useRef } from 'react';
import { useStardustCanvas } from '../hooks/useStardustCanvas';

interface StardustWavesProps {
    isHoveringFeatures: boolean;
}

export const StardustWaves: React.FC<StardustWavesProps> = ({ isHoveringFeatures }) => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    useStardustCanvas(canvasRef, isHoveringFeatures);

    return (
        <canvas
            ref={canvasRef}
            className="absolute inset-0 z-0 pointer-events-none transition-opacity duration-300"
        />
    );
};