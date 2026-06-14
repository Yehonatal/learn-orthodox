"use client";

import React from "react";

interface IlluminatedLetterProps {
    letter: string;
}

export default function IlluminatedLetter({ letter }: IlluminatedLetterProps) {
    if (!letter || letter.trim().length === 0) return null;

    return (
        <span className="inline-block float-left mr-2 mt-0.5 select-none relative z-10 w-9 h-9 md:w-10 md:h-10">
            <svg viewBox="0 0 100 100" className="w-full h-full">
                <defs>
                    <style>{`
                        @keyframes drawPath {
                            to {
                                stroke-dashoffset: 0;
                            }
                        }
                        .draw-stroke-cross {
                            stroke-dasharray: 400;
                            stroke-dashoffset: 400;
                            animation: drawPath 1.2s cubic-bezier(0.25, 1, 0.5, 1) forwards;
                        }
                    `}</style>
                </defs>
                
                {/* Outer frame border */}
                <rect x="15" y="15" width="70" height="70" fill="none" stroke="var(--color-accent-gold)" strokeWidth="1" opacity="0.35" />
                
                {/* Top loop of cross */}
                <path d="M 50 15 C 50 5, 40 5, 40 15 C 40 20, 60 20, 60 15 C 60 5, 50 5, 50 15" fill="none" stroke="var(--color-accent-gold)" strokeWidth="1.5" className="draw-stroke-cross" />
                {/* Bottom loop of cross */}
                <path d="M 50 85 C 50 95, 40 95, 40 85 C 40 80, 60 80, 60 85 C 60 95, 50 95, 50 85" fill="none" stroke="var(--color-accent-gold)" strokeWidth="1.5" className="draw-stroke-cross" />
                {/* Left loop of cross */}
                <path d="M 15 50 C 5 50, 5 40, 15 40 C 20 40, 20 60, 15 60 C 5 60, 5 50, 15 50" fill="none" stroke="var(--color-accent-gold)" strokeWidth="1.5" className="draw-stroke-cross" />
                {/* Right loop of cross */}
                <path d="M 85 50 C 95 50, 95 40, 85 40 C 80 40, 80 60, 85 60 C 95 60, 95 50, 85 50" fill="none" stroke="var(--color-accent-gold)" strokeWidth="1.5" className="draw-stroke-cross" />

                {/* Inner border dots */}
                <rect x="22" y="22" width="56" height="56" fill="none" stroke="var(--color-accent-gold)" strokeWidth="0.75" strokeDasharray="2,2" opacity="0.6" />

                {/* Centered Ge'ez letter */}
                <text 
                    x="50" 
                    y="59" 
                    textAnchor="middle" 
                    fontSize="32" 
                    fontWeight="bold" 
                    fill="var(--color-accent-indigo)" 
                    fontFamily="var(--font-noto-serif-ethiopic), serif"
                >
                    {letter}
                </text>
            </svg>
        </span>
    );
}
