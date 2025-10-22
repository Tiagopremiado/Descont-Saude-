import React from 'react';

interface IdCardViewProps {
    name: string;
    role: 'TITULAR' | 'DEPENDENTE';
    cardNumber: string;
    holderName?: string;
}

const generateCardDates = () => {
    const issueDate = new Date();
    const expiryDate = new Date();
    expiryDate.setFullYear(issueDate.getFullYear() + 1);

    const format = (d: Date) => `${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getFullYear()).slice(2)}`;

    return {
        issue: format(issueDate),
        expiry: format(expiryDate),
    };
};

const FamilyWatermark = () => (
    <svg viewBox="0 0 200 100" className="absolute w-2/3 h-2/3 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-gray-500 opacity-20 z-0">
        <path fill="currentColor" d="M100 20 a10 10 0 1 0 0 -20 a10 10 0 1 0 0 20z M100 25 l-10 20 h20z M125 20 a10 10 0 1 0 0 -20 a10 10 0 1 0 0 20z M125 25 l-10 20 h20z M112.5 50 a5 5 0 1 0 0 -10 a5 5 0 1 0 0 10z M112.5 55 l-5 10 h10z M75 20 a10 10 0 1 0 0 -20 a10 10 0 1 0 0 20z M75 25 l-10 20 h20z M87.5 50 a5 5 0 1 0 0 -10 a5 5 0 1 0 0 10z M87.5 55 l-5 10 h10z" />
    </svg>
);

const WhatsAppIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.894 11.892-1.99 0-3.903-.52-5.586-1.459l-6.554 1.73zM7.51 21.683l.341-.188c1.643-.906 3.518-1.391 5.472-1.391 5.433 0 9.875-4.442 9.875-9.875 0-5.433-4.442-9.875-9.875-9.875s-9.875 4.442-9.875 9.875c0 2.12.67 4.108 1.868 5.768l-.24 1.125 1.196.241z"/>
    </svg>
);

const FacebookIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
    </svg>
);


const IdCardView: React.FC<IdCardViewProps> = ({ name, role, cardNumber, holderName }) => {
    const { issue, expiry } = generateCardDates();

    const renderNameBlock = (
        currentRole: 'TITULAR' | 'DEPENDENTE', 
        displayName: string
    ) => {
        const isTitular = currentRole === 'TITULAR';
        const bgColor = isTitular ? 'bg-ds-vinho' : 'bg-ds-bege';
        const textColor = isTitular ? 'text-white' : 'text-black';
        const titleColor = isTitular ? 'text-white' : 'text-blue-900';
        const titleFont = 'font-serif';
        const nameFont = isTitular ? 'font-serif' : 'font-sans font-bold';

        return (
            <div className={`rounded-2xl p-3 shadow-lg border border-black/20 ${bgColor}`}>
                <p className={`text-sm uppercase ${titleFont} ${titleColor}`}>{currentRole}</p>
                <p className={`text-2xl tracking-wider uppercase ${nameFont} ${textColor} ${!isTitular ? 'text-shadow' : ''}`} style={{textShadow: !isTitular ? '1px 1px 2px rgba(0,0,0,0.3)' : 'none'}}>{displayName}</p>
            </div>
        );
    };

    return (
        <div className="bg-white rounded-2xl shadow-2xl max-w-md mx-auto overflow-hidden font-sans relative"
             style={{ backgroundImage: 'radial-gradient(#00000011 1px, transparent 1px)', backgroundSize: '6px 6px' }}>
            
            {/* Background Shapes & Watermark */}
            <div className="absolute top-0 left-0 right-0 h-48 bg-ds-vinho" style={{ clipPath: 'ellipse(100% 70% at 50% 30%)' }}></div>
            <div className="absolute bottom-0 left-0 right-0 h-40 bg-ds-vinho" style={{ clipPath: 'ellipse(120% 80% at 50% 100%)' }}></div>
            <FamilyWatermark />
            
            <div className="relative z-10">
                {/* Header */}
                <header className="p-6 text-center text-white space-y-1">
                    <p className="text-sm tracking-widest font-light">CARTÃO DE IDENTIFICAÇÃO DIGITAL</p>
                    <h1 className="text-4xl">
                        <span className="font-script" style={{ textShadow: '0px 1px 1px rgba(0,0,0,0.2)' }}>Descont'</span>
                        <span className="font-serif italic -ml-2">Saúde</span>
                    </h1>
                    <p className="text-[10px] opacity-80 pt-1">BRASIL ASSISTENCIAL LTDA FRANQUIA MASTER AUTORIZADA ®</p>
                </header>
                
                {/* Main Content */}
                <main className="p-6 pt-2 text-center">
                    <p className="text-sm font-semibold text-gray-700 mb-4">CARTÃO Nº{cardNumber}</p>
                    
                    {/* Emblem */}
                    <div className="flex justify-center items-center mb-6">
                        <div className="w-32 h-32 bg-gray-100 rounded-full shadow-lg p-1 relative flex items-center justify-center border-2 border-white" style={{boxShadow: 'inset 0 0 10px rgba(0,0,0,0.1), 0 4px 10px rgba(0,0,0,0.15)'}}>
                            <svg viewBox="0 0 100 100" className="w-full h-full">
                                {/* Simplified Emblem */}
                                <g>
                                    <path d="M50 20 L80 50 L50 80 L20 50 Z" fill="#D0AB6A"/>
                                    <path d="M42 30 H58 V43 H70 V57 H58 V70 H42 V57 H30 V43 H42Z" fill="#750721"/>
                                </g>
                            </svg>
                        </div>
                    </div>

                    {/* Dates */}
                    <div className="flex justify-around text-xs font-bold mb-6 max-w-xs mx-auto">
                        <div className="bg-ds-vinho text-white px-4 py-1 rounded-full shadow-md border border-black/20">EMISSÃO: {issue}</div>
                        <div className="bg-ds-vinho text-white px-4 py-1 rounded-full shadow-md border border-black/20">VÁLIDO: {expiry}</div>
                    </div>

                    {/* Holder Info */}
                    <div className="space-y-3 mb-6">
                        {role === 'TITULAR' && renderNameBlock('TITULAR', name)}
                        {role === 'DEPENDENTE' && (
                            <>
                                {renderNameBlock('TITULAR', holderName || '')}
                                {renderNameBlock('DEPENDENTE', name)}
                            </>
                        )}
                    </div>

                    {/* Footer Text */}
                    <div className="text-xs text-gray-700 space-y-2 mb-6 leading-snug">
                        <p>Dependente autorizado a se beneficiar do desconto previsto em toda rede de credenciados.</p>
                        <p className="font-bold">Descont' Saúde</p>
                        <p className="font-bold">Válido mediante a apresentação do comprovante de pagamento e identidade.</p>
                        <p className="font-bold text-ds-vinho">Este cartão não é válido impresso, somente digital.</p>
                    </div>

                    {/* Social links */}
                     <div className="flex flex-col sm:flex-row justify-center items-center gap-2 mb-4">
                        <a href="#" className="flex items-center gap-2 bg-green-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-md w-full sm:w-auto justify-center">
                            <WhatsAppIcon />
                            <span>53 9 9156 - 0861</span>
                        </a>
                         <a href="#" className="flex items-center gap-2 bg-blue-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-md w-full sm:w-auto justify-center">
                            <FacebookIcon />
                            <span>@Descontsaude</span>
                        </a>
                    </div>
                </main>
            </div>
            
            {/* Absolute Footer */}
            <footer className="relative bg-transparent text-white text-[10px] text-center p-2 z-10 -mt-8">
                 <p>Descont' Saúde CNPJ nº: 09.371.421/0001-01, Pedro Osório/RS.</p>
            </footer>
        </div>
    );
};

export default IdCardView;