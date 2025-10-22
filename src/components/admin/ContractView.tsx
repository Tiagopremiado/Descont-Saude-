import React from 'react';
import type { Client, Dependent } from '../../types';
import ContractClauses from './ContractClauses';

const FormField = ({ label, value, labelWidth = 'w-28', fullWidth = false, children }: { label: string; value: React.ReactNode; labelWidth?: string; fullWidth?: boolean, children?: React.ReactNode }) => (
    <div className={`flex items-stretch ${fullWidth ? 'w-full' : ''}`}>
        <div className={`flex-shrink-0 bg-ds-vinho text-white text-center font-bold text-xs flex items-center justify-center px-2 ${labelWidth}`}>
            <span>{label}</span>
        </div>
        <div className="flex-grow border-b-2 border-l-2 border-ds-vinho h-8 flex items-center px-3 text-sm font-semibold">
            {value}
            {children}
        </div>
    </div>
);

const GenderSelector = ({ gender }: { gender: string }) => (
    <div className="flex items-center space-x-4 ml-auto">
        <div className="flex items-center space-x-1.5">
            <div className="w-5 h-5 border-2 border-ds-vinho flex items-center justify-center">
                {gender === 'M' && <div className="w-3 h-3 bg-ds-vinho" />}
            </div>
            <span>M</span>
        </div>
        <div className="flex items-center space-x-1.5">
            <div className="w-5 h-5 border-2 border-ds-vinho flex items-center justify-center">
                {gender === 'F' || gender === 'X' ? <div className="w-3 h-3 bg-ds-vinho" /> : null}
            </div>
            <span>F/X</span>
        </div>
    </div>
);

const CalendarIcon = () => (
    <svg className="w-5 h-5 text-ds-vinho ml-auto" viewBox="0 0 24 24" fill="currentColor">
        <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zM9 14H7v-2h2v2zm4 0h-2v-2h2v2zm4 0h-2v-2h2v2z"/>
    </svg>
);

const GearIcon = () => (
    <svg className="w-5 h-5 text-ds-vinho" viewBox="0 0 24 24" fill="currentColor">
        <path d="M19.43 12.98c.04-.32.07-.64.07-.98s-.03-.66-.07-.98l2.11-1.65c.19-.15.24-.42.12-.64l-2-3.46c-.12-.22-.39-.3-.61-.22l-2.49 1c-.52-.4-1.08-.73-1.69-.98l-.38-2.65C14.46 2.18 14.25 2 14 2h-4c-.25 0-.46.18-.49.42l-.38 2.65c-.61.25-1.17.59-1.69.98l-2.49-1c-.23-.09-.49 0-.61.22l-2 3.46c-.13.22-.07.49.12.64l2.11 1.65c-.04.32-.07.65-.07.98s.03.66.07.98l-2.11 1.65c-.19.15-.24.42-.12.64l2 3.46c.12.22.39.3.61.22l2.49 1c.52.4 1.08.73 1.69.98l.38 2.65c.03.24.24.42.49.42h4c.25 0 .46.18.49.42l.38 2.65c.61-.25 1.17-.59-1.69.98l2.49 1c.23.09.49 0 .61.22l2-3.46c.12-.22-.07-.49-.12-.64l-2.11-1.65zM12 15.5c-1.93 0-3.5-1.57-3.5-3.5s1.57-3.5 3.5-3.5 3.5 1.57 3.5 3.5-1.57 3.5-3.5 3.5z"/>
    </svg>
);

// FIX: Define ContractViewProps interface to type the component's props.
interface ContractViewProps {
    client: Client;
}

const ContractView: React.FC<ContractViewProps> = ({ client }) => {
    const today = new Date();
    const formattedDate = today.toLocaleDateString('pt-BR');
    
    const displayDependents: Partial<Dependent>[] = [...(client.dependents || [])];
    while (displayDependents.length < 9) {
        displayDependents.push({ name: '----------------------------------', birthDate: '' });
    }
    
    return (
        <>
            <div id="pdf-page-1" className="bg-white p-6 font-sans text-black border-2 border-black max-w-4xl mx-auto A4-page">
                {/* Header */}
                <div className="text-center mb-1">
                    <p className="text-2xl font-bold">CONTRATO</p>
                </div>
                <div className="flex justify-between items-center mb-2 pb-2 border-b-4 border-ds-vinho">
                    <div className="text-center border-2 border-ds-vinho p-1">
                        <p className="text-xs font-bold text-ds-vinho">CONTRATO</p>
                        <p className="text-xs font-bold text-ds-vinho">N°{client.contractNumber}</p>
                    </div>
                    <h1 className="text-5xl font-script text-ds-vinho relative bottom-2">Descont' Saúde</h1>
                    <div className="w-32 text-center text-xs font-bold">
                        {/* Logo placeholder/area */}
                    </div>
                </div>
                
                {/* Main data form */}
                <div className="space-y-1.5">
                    <div className="flex items-baseline gap-1.5">
                        <FormField label="TITULAR" value={client.name} labelWidth="w-20" fullWidth />
                        <div className="flex items-stretch flex-shrink-0">
                            <div className="bg-ds-vinho text-white text-center font-bold text-xs flex items-center justify-center px-2">SEXO</div>
                            <div className="border-b-2 border-l-2 border-ds-vinho h-8 flex items-center px-3">
                                <GenderSelector gender={client.gender} />
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-1.5">
                        <FormField label="CPF" value={client.cpf} labelWidth="w-20" fullWidth />
                        <FormField label="DATA NASC." value={client.birthDate ? new Date(client.birthDate).toLocaleDateString('pt-BR', { timeZone: 'UTC' }) : ''} labelWidth="w-[90px]" fullWidth />
                    </div>
                    <div className="flex gap-1.5">
                        <FormField label="ENDEREÇO" value={client.address} labelWidth="w-20" fullWidth />
                        <FormField label="N°" value={client.addressNumber} labelWidth="w-[30px]" />
                    </div>
                    <div className="flex gap-1.5">
                        <FormField label="BAIRRO" value={client.neighborhood} labelWidth="w-20" fullWidth />
                        <FormField label="CIDADE" value={client.city} labelWidth="w-[90px]" fullWidth />
                    </div>
                    <div className="flex gap-1.5">
                        <FormField label="FONE" value={client.phone} labelWidth="w-20" fullWidth />
                        <FormField label="WHATSAPP" value={client.whatsapp} labelWidth="w-[90px]" fullWidth />
                    </div>
                </div>

                {/* Dependents */}
                <div className="bg-ds-vinho text-white text-center font-bold text-lg py-1 mt-6">DEPENDENTES</div>
                <div className="space-y-1 mt-1">
                    {displayDependents.slice(0, 7).map((dep, index) => (
                        <div key={index} className="flex items-center gap-1.5">
                            <div className="flex items-center gap-1.5">
                                <GearIcon />
                                <span className="font-bold">{index + 1}.</span>
                            </div>
                            <div className="flex-grow border-b-2 border-ds-vinho h-8 flex items-center px-3 text-sm font-semibold">{dep.name}</div>
                            <div className="border-b-2 border-ds-vinho h-8 w-48 flex items-center px-3 text-sm font-semibold">
                                {dep.birthDate ? new Date(dep.birthDate).toLocaleDateString('pt-BR', { timeZone: 'UTC' }) : '__ /__ /____'}
                                <CalendarIcon />
                            </div>
                        </div>
                    ))}
                </div>
                 
                {/* Adicionais */}
                <div className="bg-ds-vinho text-white text-center font-bold text-lg py-1 mt-6">ADICIONAIS</div>
                <div className="space-y-1 mt-1">
                    {displayDependents.slice(7, 9).map((dep, index) => (
                        <div key={index} className="flex items-center gap-1.5">
                            <div className="flex items-center gap-1.5">
                                <GearIcon />
                                <span className="font-bold">{index + 8}.</span>
                            </div>
                            <div className="flex-grow border-b-2 border-ds-vinho h-8 flex items-center px-3 text-sm font-semibold">{dep.name}</div>
                            <div className="border-b-2 border-ds-vinho h-8 w-48 flex items-center px-3 text-sm font-semibold">
                                {dep.birthDate ? new Date(dep.birthDate).toLocaleDateString('pt-BR', { timeZone: 'UTC' }) : '__ /__ /____'}
                                <CalendarIcon />
                            </div>
                        </div>
                    ))}
                </div>

                <p className="text-center text-sm text-ds-vinho font-semibold mt-4 tracking-wide leading-relaxed" style={{ wordSpacing: '1px' }}>
                    DECLARO VERDADE NAS INFORMAÇÕES EXPRESSAS NESTA ADESÃO E CONHECIMENTO DO TEOR DO CONTRATO CONTIDOS NO VERSO DESTA.
                </p>

                {/* Payment Box */}
                <div className="border-4 border-ds-vinho mt-4 p-2">
                    <h3 className="text-center font-bold text-lg tracking-wide">$ VALE COMO RECIBO E IDENTIFICAÇÃO POR 30 DIAS</h3>
                    <div className="flex flex-wrap justify-between items-center gap-x-4 gap-y-1 mt-1 text-sm font-bold">
                        <span>PROMOÇÃO: {client.promotion ? 'SIM' : 'NÃO'}</span>
                        <span>VENDA: WHATSAPP</span>
                        <span>VENCI: {client.paymentDueDateDay}</span>
                        <span>TAXA DE CADASTRO R$: {client.registrationFee.toFixed(2)}</span>
                        <span>MENSALIDADE R$: {client.monthlyFee.toFixed(2)}</span>
                        <span className="text-lg">TOTAL R$: {(client.registrationFee + client.monthlyFee).toFixed(2)}</span>
                    </div>
                </div>

                {/* Signatures */}
                <div className="flex justify-between items-end mt-12 text-center text-xs font-bold gap-8">
                    <div className="flex-1 border-b-2 border-black pb-1 min-h-[2rem]"></div>
                    <div className="border-b-2 border-black pb-1 px-8">{formattedDate}</div>
                    <div className="flex-1 border-b-2 border-black pb-1 min-h-[2rem]">{client.salesRep}</div>
                </div>
                 <div className="flex justify-between items-end text-center text-xs gap-8">
                    <div className="flex-1">ASSINATURA TITULAR</div>
                    <div>DATA</div>
                    <div className="flex-1">REPRESENTANTE DE VENDAS</div>
                </div>

                {/* Stamps */}
                <div className="flex justify-between items-start mt-6 text-xs text-center gap-8">
                    <div className="flex-1 border-2 border-black p-2 min-h-[6rem]">
                        <p className="font-bold">09.371.421/0001-01</p>
                        <p>Valtair da silva & Cia LTDA</p>
                        <p>PEDRO OSÓRIO - RS</p>
                        <p className="font-bold mt-2">CARIMBO COM O CNPJ DA FRANQUIA AUTORIZADA.</p>
                    </div>
                     <div className="flex-1 border-2 border-black p-2 min-h-[6rem]">
                        <p className="font-bold">TIAGO SILVA</p>
                        <p>Gerente Comercial</p>
                        <p>(53) 9 9156-0861</p>
                        <br/>
                        <p className="font-bold mt-2">CARIMBO REPRESENTANTE AUTORIZADA.</p>
                    </div>
                </div>

                {/* Footer */}
                <footer className="text-center text-xs font-bold mt-4">
                    FRANQUIA AUTORIZADA - CNPJ 09.371.421/0001-01 PEDRO OSÓRIO
                </footer>
            </div>
            <div id="pdf-page-2">
                <ContractClauses />
            </div>
        </>
    );
};

export default ContractView;