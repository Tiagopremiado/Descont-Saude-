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

const BackgroundWatermark = () => (
    <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none flex items-center justify-center overflow-hidden">
         <svg viewBox="0 0 200 200" className="w-[150%] h-[150%] animate-spin-slow">
            <path fill="currentColor" d="M100 0 L130 70 L200 100 L130 130 L100 200 L70 130 L0 100 L70 70 Z" />
         </svg>
    </div>
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

const MedicalCross = () => (
    <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md">
        {/* Diamond Background */}
        <path d="M50 5 L95 50 L50 95 L5 50 Z" fill="#f3f4f6" stroke="#D0AB6A" strokeWidth="2"/>
        {/* Cross */}
        <path d="M40 25 H60 V40 H75 V60 H60 V75 H40 V60 H25 V40 H40 Z" fill="#750721" stroke="#D0AB6A" strokeWidth="2" />
    </svg>
);


const IdCardView: React.FC<IdCardViewProps> = ({ name, role, cardNumber, holderName }) => {
    const { issue, expiry } = generateCardDates();

    return (
        <div className="bg-white rounded-xl shadow-xl max-w-[360px] mx-auto overflow-hidden font-sans relative border border-gray-300">
            {/* Header Stripe */}
            <div className="bg-ds-vinho h-24 relative overflow-hidden">
                {/* Decorative curve */}
                <div className="absolute -bottom-8 -left-4 w-[120%] h-20 bg-[#5c061a] rounded-[50%] opacity-50"></div>
                <div className="relative z-10 flex flex-col items-center justify-center h-full pt-2">
                    <p className="text-[10px] text-ds-dourado tracking-[0.2em] uppercase font-semibold">Cartão de Identificação Digital</p>
                    <div className="flex items-center justify-center mt-1">
                        <h1 className="text-4xl text-white drop-shadow-md">
                            <span className="font-script">Descont'</span>
                            <span className="font-serif italic -ml-1">Saúde</span>
                        </h1>
                    </div>
                    <p className="text-[8px] text-white/70 mt-1">BRASIL ASSISTENCIAL LTDA FRANQUIA MASTER AUTORIZADA ®</p>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="relative p-6 bg-white min-h-[380px] flex flex-col items-center">
                <BackgroundWatermark />
                
                {/* Card Number Badge */}
                <div className="bg-gray-100 px-4 py-1 rounded-full border border-gray-200 mb-6 shadow-inner relative z-10">
                    <p className="text-xs font-bold text-ds-vinho tracking-widest">CARTÃO Nº {cardNumber}</p>
                </div>

                {/* Central Emblem */}
                <div className="w-24 h-24 mb-6 relative z-10">
                    <MedicalCross />
                </div>

                {/* Dates Row */}
                <div className="flex gap-4 w-full justify-center mb-6 relative z-10">
                    <div className="bg-ds-vinho text-white px-3 py-1 rounded-md shadow text-[10px] font-bold">
                        EMISSÃO: {issue}
                    </div>
                    <div className="bg-ds-vinho text-white px-3 py-1 rounded-md shadow text-[10px] font-bold">
                        VÁLIDO: {expiry}
                    </div>
                </div>

                {/* Name Block */}
                <div className="w-full text-center mb-6 relative z-10">
                    <div className="bg-ds-vinho text-white py-1 px-4 rounded-t-lg inline-block">
                        <p className="text-[10px] font-bold uppercase tracking-widest">{role}</p>
                    </div>
                    <div className="bg-white border-2 border-ds-vinho rounded-lg p-3 shadow-sm -mt-[2px]">
                        <p className="text-xl font-bold text-gray-800 uppercase leading-tight font-serif tracking-wide">{name}</p>
                        
                        {role === 'DEPENDENTE' && holderName && (
                            <div className="mt-2 pt-2 border-t border-gray-200">
                                <p className="text-[8px] text-gray-500 uppercase tracking-wider">TITULAR RESPONSÁVEL</p>
                                <p className="text-sm font-semibold text-gray-700 uppercase">{holderName}</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Legal Text */}
                <div className="text-[9px] text-center text-gray-500 leading-tight space-y-1 relative z-10 px-2">
                    <p>Dependente autorizado a se beneficiar do desconto previsto em toda rede de credenciados.</p>
                    <p className="font-bold text-ds-vinho">Válido mediante apresentação de documento de identidade.</p>
                </div>
            </div>

            {/* Footer with Contact */}
            <div className="bg-ds-vinho p-3">
                <div className="flex flex-col gap-2">
                    <div className="flex justify-center gap-3">
                        <a href="#" className="flex items-center gap-1.5 bg-[#25D366] text-white text-[10px] font-bold px-2 py-1 rounded shadow hover:bg-opacity-90">
                            <WhatsAppIcon /> 53 9 9156 - 0861
                        </a>
                        <a href="#" className="flex items-center gap-1.5 bg-[#1877F2] text-white text-[10px] font-bold px-2 py-1 rounded shadow hover:bg-opacity-90">
                            <FacebookIcon /> @Descontsaude
                        </a>
                    </div>
                    <p className="text-[8px] text-white/60 text-center font-mono mt-1">CNPJ: 09.371.421/0001-01 • Pedro Osório/RS</p>
                </div>
            </div>
        </div>
    );
};

export default IdCardView;