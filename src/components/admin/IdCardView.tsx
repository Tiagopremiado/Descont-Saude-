
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
                maxWidth: isZoomed ? '800px' : '540px',
                minHeight: '220px'
            }}
        >
            {/* Background Gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#750721] via-[#5c0416] to-[#2b020a] z-0"></div>

            {/* Geometric Patterns (Substituído SVG por DIVs para garantir o HTML2Canvas/Download) */}
            <div className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-hidden opacity-30">
                {/* Linhas Superior Direita */}
                <div className="absolute -top-10 -right-10 w-64 h-64 border-b-2 border-[#D0AB6A] transform -rotate-45"></div>
                <div className="absolute -top-6 -right-6 w-64 h-64 border-b border-[#D0AB6A] transform -rotate-45 opacity-50"></div>
                
                {/* Detalhe Quadrado Superior */}
                <div className="absolute top-8 right-12 w-4 h-4 border border-[#D0AB6A] transform rotate-45 opacity-60"></div>

                {/* Linhas Inferior Esquerda */}
                <div className="absolute -bottom-10 -left-10 w-64 h-64 border-t-2 border-[#D0AB6A] transform -rotate-45"></div>
                <div className="absolute -bottom-6 -left-6 w-64 h-64 border-t border-[#D0AB6A] transform -rotate-45 opacity-50"></div>
                <div className="absolute -bottom-16 -left-4 w-64 h-64 border-t border-[#D0AB6A] transform -rotate-45 opacity-30"></div>

                {/* Detalhe Curvo Inferior (Simulado com borda arredondada) */}
                <div className="absolute bottom-10 left-10 w-16 h-16 border-l-2 border-b-2 border-[#D0AB6A] rounded-bl-full opacity-40"></div>
            </div>

            {/* Logo Section */}
            <div className="absolute top-5 left-5 md:top-6 md:left-6 flex items-center gap-3 z-10">
                <div className={`${isZoomed ? 'w-16 h-16' : 'w-10 h-10 md:w-12 md:h-12'} relative drop-shadow-md transition-all`}>
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
                    <h1 className={`${isZoomed ? 'text-3xl' : 'text-lg md:text-xl'} font-bold tracking-tight leading-none text-white drop-shadow-sm transition-all`}>
                        Desconto <span className="text-[#D0AB6A]">+</span> <span className="text-[#D0AB6A]">Saúde</span>
                    </h1>
                    <p className={`${isZoomed ? 'text-xs' : 'text-[8px] md:text-[9px]'} tracking-wide text-gray-200 mt-0.5 font-light opacity-90 transition-all`}>Seu parceiro em saúde e bem-estar.</p>
                </div>
            </div>

            {/* Chip - Ajustado para ser menor */}
            <div className={`absolute ${isZoomed ? 'top-28 left-10 w-14 h-10' : 'top-20 left-6 w-10 h-7'} bg-gradient-to-tr from-[#e0c388] to-[#bfa065] rounded opacity-90 border border-[#917646] hidden sm:block z-10 transition-all shadow-sm`}>
                <div className="w-full h-full relative opacity-50">
                    <div className="absolute top-1/2 left-0 w-full h-[1px] bg-black"></div>
                    <div className="absolute top-0 left-1/2 w-[1px] h-full bg-black"></div>
                    <div className="absolute top-1 left-1 w-full h-full border-l border-t border-black rounded-sm scale-75"></div>
                </div>
            </div>

            {/* Content Body - Subido um pouco para dar espaço */}
            <div className={`absolute ${isZoomed ? 'bottom-8 left-10 right-10' : 'bottom-6 left-6 right-6'} z-10 transition-all`}>
                <div className="flex flex-col">
                    {/* Role Label - Borda removida, Sombreado adicionado */}
                    <div className={`flex items-center gap-2 ${isZoomed ? 'mb-3' : 'mb-1.5'}`}>
                        <span 
                            className={`inline-flex items-center justify-center ${isZoomed ? 'text-xs px-3 py-1' : 'text-[8px] px-2 py-0.5'} font-bold text-[#D0AB6A] uppercase tracking-[0.1em] rounded shadow-lg bg-[#3a020d]/60 backdrop-blur-sm transition-all`}
                            style={{ textShadow: '0px 1px 2px rgba(0,0,0,0.8)' }} 
                        >
                            {role}
                        </span>
                        {role === 'DEPENDENTE' && holderName && (
                            <span className={`${isZoomed ? 'text-xs' : 'text-[8px]'} text-gray-300 uppercase tracking-wide font-medium truncate max-w-[200px]`}>
                                Resp: {holderName.split(' ')[0]}
                            </span>
                        )}
                    </div>

                    {/* Name - FONTE REDUZIDA AQUI */}
                    <h2 className={`${isZoomed ? 'text-2xl' : 'text-sm md:text-base'} font-medium text-white uppercase tracking-wide drop-shadow-md whitespace-nowrap overflow-hidden pb-1 leading-tight transition-all`} style={{ fontFamily: '"Courier New", Courier, monospace', letterSpacing: '0.02em', textShadow: '1px 1px 2px rgba(0,0,0,0.6)' }}>
                        {name}
                    </h2>
                    
                    <div className="flex justify-between items-end mt-0.5">
                        {/* Card Number */}
                        <p className={`${isZoomed ? 'text-lg' : 'text-xs md:text-sm'} text-gray-300 font-mono tracking-widest opacity-80 transition-all`} style={{ textShadow: '1px 1px 1px rgba(0,0,0,0.5)' }}>
                            {formattedCardNumber}
                        </p>

                        {/* Bottom Right Year */}
                        <div className="text-right">
                            <p className={`${isZoomed ? 'text-sm' : 'text-[10px] md:text-xs'} font-bold text-[#D0AB6A] tracking-wider drop-shadow-sm transition-all`}>VALID: {validYear}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer CNPJ */}
            <div className="absolute bottom-1 w-full text-center z-10">
                <p className={`${isZoomed ? 'text-[9px]' : 'text-[7px]'} text-white/50 tracking-widest font-sans transition-all`}>CNPJ: 09.371.421/0001-01</p>
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
                    className="absolute top-2 right-2 p-1.5 bg-black/30 hover:bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-20 backdrop-blur-sm"
                    title="Ver em Tela Cheia"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
