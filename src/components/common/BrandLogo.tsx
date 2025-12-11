
import React, { useMemo } from 'react';

interface BrandLogoProps {
    className?: string;
}

const BrandLogo: React.FC<BrandLogoProps> = ({ className = "w-12 h-12" }) => {
    // Gerar IDs únicos para evitar conflitos de gradiente quando múltiplos logos aparecem
    const uniqueId = useMemo(() => Math.random().toString(36).substr(2, 9), []);
    const gradientId = `gold-grad-logo-${uniqueId}`;
    const dropShadowId = `drop-shadow-logo-${uniqueId}`;

    return (
        <div className={`relative drop-shadow-md ${className}`}>
            <svg viewBox="0 0 100 100" fill={`url(#${gradientId})`} className="w-full h-full">
                <defs>
                    <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#F8E7B6" />
                        <stop offset="30%" stopColor="#D0AB6A" />
                        <stop offset="70%" stopColor="#9C7C38" />
                        <stop offset="100%" stopColor="#F8E7B6" />
                    </linearGradient>
                    <filter id={dropShadowId} x="-20%" y="-20%" width="140%" height="140%">
                        <feGaussianBlur in="SourceAlpha" stdDeviation="2"/>
                        <feOffset dx="1" dy="1" result="offsetblur"/>
                        <feComponentTransfer>
                            <feFuncA type="linear" slope="0.3"/>
                        </feComponentTransfer>
                        <feMerge> 
                            <feMergeNode/>
                            <feMergeNode in="SourceGraphic"/> 
                        </feMerge>
                    </filter>
                </defs>
                {/* Medical Cross shape with rounded edges */}
                <path d="M35 15 H65 V35 H85 V65 H65 V85 H35 V65 H15 V35 H35 V15 Z" filter={`url(#${dropShadowId})`} />
                {/* Dynamic Swoosh */}
                <path d="M10 65 Q 50 100 90 35" fill="none" stroke={`url(#${gradientId})`} strokeWidth="5" strokeLinecap="round" />
            </svg>
        </div>
    );
};

export default BrandLogo;
