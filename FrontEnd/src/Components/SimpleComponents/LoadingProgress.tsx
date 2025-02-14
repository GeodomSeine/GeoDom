import React, { useEffect, useState } from "react";
import "./LoadingProgress.scss";

interface LoadingProgressProps {
    currentIndex: number;
    lastIndex: number;
    onComplete?: () => void;
}

const LoadingProgress: React.FC<LoadingProgressProps> = ({ currentIndex, lastIndex, onComplete }) => {
    const [displayProgress, setDisplayProgress] = useState(0);

    // Calculer la cible en fonction de l'index actuel
    const targetProgress = Math.min((currentIndex / lastIndex) * 100, 100);

    useEffect(() => {
        const step = () => {
            setDisplayProgress((prev) => {
                const increment = (targetProgress - prev) * 0.1;
                const nextValue = prev + increment;

                if (Math.abs(targetProgress - nextValue) < 0.5) {
                    return targetProgress;
                }

                return nextValue;
            });
        };
        const interval = setInterval(step, 60);
        return () => clearInterval(interval);
    }, [targetProgress]);

    useEffect(() => {
        if (displayProgress >= 100 && onComplete) {
            onComplete();
        }
    }, [displayProgress, onComplete]);

    return (
        <div className="loading_bar">
            <div
                className="loading_bar_state"
                style={{ width: `${displayProgress}%` }}
            >
                {Math.round(displayProgress)}%
            </div>
        </div>
    );
};

export default LoadingProgress;
