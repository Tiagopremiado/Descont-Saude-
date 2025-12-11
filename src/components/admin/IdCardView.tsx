
import React, { useMemo } from 'react';

interface IdCardViewProps {
    name: string;
    role: 'TITULAR' | 'DEPENDENTE';
    cardNumber: string;
    holderName?: string;
}

const IdCardView: React.FC<IdCardViewProps> = ({ name = '', role = 'TITULAR', cardNumber = '', holderName }) => {
    // Define o ano de validade
    const validYear = new Date().getFullYear() + 1; 

    // Formata o número do cartão com segurança
    const safeCardNumber = String(cardNumber || '');
    const formattedCardNumber = safeCardNumber.padEnd(16, '0').match(/.{1,4}/g)?.join(' ') || safeCardNumber;

    // IDs únicos para evitar conflito
    const gradientId = useMemo(() => `gold-grad-${Math.random().toString(36).substr(2,9)}`, []);
    const dropShadowId = useMemo(() => `drop-shadow-${Math.random().toString(36).substr(2,9)}`, []);

    return (
        <div 
            className="w-full max-w-[480px] rounded-2xl relative overflow-hidden shadow-2xl bg-[#5c0416] text-white font-sans mx-auto transition-transform hover:scale-[1.02] duration-300 select-none"
            style={{ aspectRatio: '1.586 / 1', minHeight: '200px' }}
        >
            {/* Background Gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#750721] via-[#5c0416] to-[#2b020a] z-0"></div>

            {/* Geometric Patterns */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20 z-0" viewBox="0 0 480 302" preserveAspectRatio="none">
                <g stroke="#D0AB6A" strokeWidth="1.5" fill="none">
                    <path d="M480 40 L440 0" />
                    <path d="M480 80 L400 0" />
                    <path d="M480 120 L360 0" />
                    <rect x="420" y="20" width="30" height="30" transform="rotate(45 435 35)" />
                    <path d="M435 25 V45 M425 35 H445" strokeWidth="2" />
                </g>
                <g stroke="#D0AB6A" strokeWidth="1.5" fill="none">
                    <path d="M0 260 L40 302" />
                    <path d="M0 220 L80 302" />
                    <path d="M0 180 L120 302" />
                    <rect x="30" y="250" width="30" height="30" transform="rotate(45 45 265)" />
                    <path d="M35 260 Q45 250 55 260 T75 260" transform="rotate(45 45 265)" strokeWidth="1" />
                </g>
            </svg>

            {/* Logo Section */}
            <div className="absolute top-6 left-6 md:top-8 md:left-8 flex items-center gap-3 z-10">
                <div className="w-12 h-12 md:w-16 md:h-16 relative drop-shadow-md">
                    <svg viewBox="0 0 100 100" fill={`url(#${gradientId})`}>
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
                        <path d="M35 15 H65 V35 H85 V65 H65 V85 H35 V65 H15 V35 H35 V15 Z" filter={`url(#${dropShadowId})`} />
                        <path d="M10 65 Q 50 100 90 35" fill="none" stroke={`url(#${gradientId})`} strokeWidth="5" strokeLinecap="round" />
                    </svg>
                </div>
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight leading-none text-white drop-shadow-sm">
                        Desconto <span className="text-[#D0AB6A]">+</span> <span className="text-[#D0AB6A]">Saúde</span>
                    </h1>
                    <p className="text-[10px] md:text-xs tracking-wide text-gray-200 mt-1 font-light opacity-90">Seu parceiro em saúde e bem-estar.</p>
                </div>
            </div>

            {/* Chip */}
            <div className="absolute top-28 left-8 w-12 h-9 bg-gradient-to-tr from-[#e0c388] to-[#bfa065] rounded-md opacity-90 border border-[#917646] shadow-sm hidden sm:block z-10">
                <div className="w-full h-full relative opacity-50">
                    <div className="absolute top-1/2 left-0 w-full h-[1px] bg-black"></div>
                    <div className="absolute top-0 left-1/2 w-[1px] h-full bg-black"></div>
                    <div className="absolute top-2 left-2 w-8 h-5 border border-black rounded-sm"></div>
                </div>
            </div>

            {/* Content Body */}
            <div className="absolute bottom-6 left-6 right-6 md:bottom-8 md:left-8 md:right-8 z-10">
                <div className="flex flex-col">
                    {/* Role Label */}
                    <div className="flex items-center gap-2 mb-2">
                        <span className="text-[10px] font-bold text-[#D0AB6A] uppercase tracking-[0.15em] border border-[#D0AB6A] px-2 py-0.5 rounded shadow-sm bg-[#5c0416]/80 backdrop-blur-sm">
                            {role}
                        </span>
                        {role === 'DEPENDENTE' && holderName && (
                            <span className="text-[10px] text-gray-300 uppercase tracking-wider font-medium truncate max-w-[200px]">
                                Resp: {holderName.split(' ')[0]}
                            </span>
                        )}
                    </div>

                    {/* Name */}
                    <h2 className="text-xl md:text-2xl font-medium text-white uppercase tracking-widest drop-shadow-md truncate w-full" style={{ fontFamily: '"Courier New", Courier, monospace', letterSpacing: '0.05em', textShadow: '1px 1px 2px rgba(0,0,0,0.6)' }}>
                        {name}
                    </h2>
                    
                    <div className="flex justify-between items-end mt-1">
                        {/* Card Number */}
                        <p className="text-sm md:text-base text-gray-300 font-mono tracking-widest opacity-80" style={{ textShadow: '1px 1px 1px rgba(0,0,0,0.5)' }}>
                            {formattedCardNumber}
                        </p>

                        {/* Bottom Right Year */}
                        <div className="text-right">
                            <p className="text-sm font-bold text-[#D0AB6A] tracking-wider drop-shadow-sm">CARTÃO {validYear}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default IdCardView;
