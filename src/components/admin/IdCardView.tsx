
import React, { useMemo, useState } from 'react';

interface IdCardViewProps {
    name: string;
    role: 'TITULAR' | 'DEPENDENTE';
    cardNumber: string;
    holderName?: string;
}

const IdCardView: React.FC<IdCardViewProps> = ({ name = '', role = 'TITULAR', cardNumber = '', holderName }) => {
    const [isFullScreen, setIsFullScreen] = useState(false);

    // Define o ano de validade
    const validYear = new Date().getFullYear() + 1; 

    // Formata o número do cartão com segurança
    const safeCardNumber = String(cardNumber || '');
    const formattedCardNumber = safeCardNumber.padEnd(16, '0').match(/.{1,4}/g)?.join(' ') || safeCardNumber;

    // IDs únicos para evitar conflito
    const gradientId = useMemo(() => `gold-grad-${Math.random().toString(36).substr(2,9)}`, []);
    const dropShadowId = useMemo(() => `drop-shadow-${Math.random().toString(36).substr(2,9)}`, []);

    // Função para renderizar o conteúdo do cartão (usada tanto no modo normal quanto tela cheia)
    const renderCardContent = (isZoomed: boolean) => (
        <div 
            className={`w-full relative overflow-hidden shadow-2xl bg-[#5c0416] text-white font-sans mx-auto transition-transform duration-300 select-none rounded-2xl`}
            style={{ 
                aspectRatio: '1.586 / 1', 
                maxWidth: isZoomed ? '800px' : '540px', // Aumentado de 480px para 540px (normal) e 800px (zoom)
                minHeight: '220px'
            }}
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
            <div className="absolute top-6 left-6 md:top-8 md:left-8 flex items-center gap-4 z-10">
                <div className={`${isZoomed ? 'w-20 h-20' : 'w-12 h-12 md:w-16 md:h-16'} relative drop-shadow-md transition-all`}>
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
                    <h1 className={`${isZoomed ? 'text-4xl' : 'text-2xl md:text-3xl'} font-bold tracking-tight leading-none text-white drop-shadow-sm transition-all`}>
                        Desconto <span className="text-[#D0AB6A]">+</span> <span className="text-[#D0AB6A]">Saúde</span>
                    </h1>
                    <p className={`${isZoomed ? 'text-sm' : 'text-[10px] md:text-xs'} tracking-wide text-gray-200 mt-1 font-light opacity-90 transition-all`}>Seu parceiro em saúde e bem-estar.</p>
                </div>
            </div>

            {/* Chip */}
            <div className={`absolute ${isZoomed ? 'top-32 left-10 w-16 h-12' : 'top-28 left-8 w-12 h-9'} bg-gradient-to-tr from-[#e0c388] to-[#bfa065] rounded-md opacity-90 border border-[#917646] shadow-sm hidden sm:block z-10 transition-all`}>
                <div className="w-full h-full relative opacity-50">
                    <div className="absolute top-1/2 left-0 w-full h-[1px] bg-black"></div>
                    <div className="absolute top-0 left-1/2 w-[1px] h-full bg-black"></div>
                    <div className="absolute top-2 left-2 w-full h-full border-l border-t border-black rounded-sm scale-75"></div>
                </div>
            </div>

            {/* Content Body */}
            <div className={`absolute ${isZoomed ? 'bottom-10 left-10 right-10' : 'bottom-8 left-7 right-7 md:left-9 md:right-9'} z-10 transition-all`}>
                <div className="flex flex-col">
                    {/* Role Label - Aumentei mb para dar espaço */}
                    <div className={`flex items-center gap-2 ${isZoomed ? 'mb-4' : 'mb-3'}`}>
                        <span className={`inline-flex items-center justify-center ${isZoomed ? 'text-sm px-4 py-1.5' : 'text-[10px] px-3 py-1'} font-bold text-[#D0AB6A] uppercase tracking-[0.15em] border border-[#D0AB6A] rounded shadow-sm bg-[#5c0416]/80 backdrop-blur-sm transition-all`}>
                            {role}
                        </span>
                        {role === 'DEPENDENTE' && holderName && (
                            <span className={`${isZoomed ? 'text-sm' : 'text-[10px]'} text-gray-300 uppercase tracking-wider font-medium truncate max-w-[250px]`}>
                                Resp: {holderName.split(' ')[0]}
                            </span>
                        )}
                    </div>

                    {/* Name */}
                    <h2 className={`${isZoomed ? 'text-3xl' : 'text-xl md:text-2xl'} font-medium text-white uppercase tracking-wider drop-shadow-md whitespace-nowrap overflow-hidden pb-1 leading-normal transition-all`} style={{ fontFamily: '"Courier New", Courier, monospace', letterSpacing: '0.05em', textShadow: '1px 1px 2px rgba(0,0,0,0.6)' }}>
                        {name}
                    </h2>
                    
                    <div className="flex justify-between items-end mt-1">
                        {/* Card Number */}
                        <p className={`${isZoomed ? 'text-xl' : 'text-sm md:text-base'} text-gray-300 font-mono tracking-widest opacity-80 transition-all`} style={{ textShadow: '1px 1px 1px rgba(0,0,0,0.5)' }}>
                            {formattedCardNumber}
                        </p>

                        {/* Bottom Right Year */}
                        <div className="text-right">
                            <p className={`${isZoomed ? 'text-base' : 'text-xs md:text-sm'} font-bold text-[#D0AB6A] tracking-wider drop-shadow-sm transition-all`}>CARTÃO {validYear}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer CNPJ */}
            <div className="absolute bottom-1.5 w-full text-center z-10">
                <p className={`${isZoomed ? 'text-[10px]' : 'text-[8px]'} text-white/50 tracking-widest font-sans transition-all`}>CNPJ: 09.371.421/0001-01</p>
            </div>
        </div>
    );

    return (
        <div className="relative group">
            {/* Standard View */}
            <div className="relative">
                {renderCardContent(false)}
                
                {/* Expand Button */}
                <button 
                    onClick={() => setIsFullScreen(true)}
                    className="absolute top-2 right-2 p-2 bg-black/30 hover:bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-20 backdrop-blur-sm"
                    title="Ver em Tela Cheia"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                    </svg>
                </button>
            </div>

            {/* Fullscreen Modal */}
            {isFullScreen && (
                <div 
                    className="fixed inset-0 z-[100] bg-black/90 flex flex-col items-center justify-center p-4 animate-fade-in"
                    onClick={() => setIsFullScreen(false)}
                >
                    <button 
                        onClick={(e) => { e.stopPropagation(); setIsFullScreen(false); }}
                        className="absolute top-4 right-4 text-white/70 hover:text-white p-2"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                    
                    <div onClick={(e) => e.stopPropagation()} className="w-full flex justify-center">
                        {renderCardContent(true)}
                    </div>
                    
                    <p className="text-white/60 mt-6 text-sm font-medium">Toque fora para fechar</p>
                </div>
            )}
        </div>
    );
};

export default IdCardView;
