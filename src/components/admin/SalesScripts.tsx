import React, { useState } from 'react';
import Card from '../common/Card';

const salesScripts = [
  {
    title: '1. Apresentação Inicial do Plano',
    messages: [
      {
        id: 'intro-1',
        text: `Olá, boa tarde! Será um prazer ajudar você.\n\nNosso plano Descont' Saúde oferece até 70% de desconto em consultas, exames e procedimentos em uma ampla rede credenciada.`
      },
      {
        id: 'intro-2',
        text: `Estamos com uma ótima novidade para o ano de 2025. Nosso cartão Descont' saúde estará dando até 30% de desconto na sua conta de energia.`
      },
      {
        id: 'intro-3',
        text: `Com ele, você terá acesso a:\n\n✅ Consultas com médicos especialistas.\n✅ Exames laboratoriais e de imagem.\n✅ Procedimentos a preços acessíveis.`
      },
      {
        id: 'intro-4',
        text: `Vantagens:\n\n✅ Primeira mensalidade zero.\n✅ Só mente uma taxa de cadastro no valor de R$30,00\n✅ Sem carência, ou seja, você começa a usufruir dos benefícios imediatamente!`
      },
      {
        id: 'intro-5',
        text: `Valores:\nTitular sem dependentes: R$24,00\nTitular + 3 dependentes: R$27,00\nTitular + 4 dependentes: R$30,00\nTitular + 5/6 dependentes: R$34,00\nTitular + 7 dependentes: R$36,00\n\nAdicionais: R$6,00 por dependente extra.\n\nPara saber mais ou fazer seu cadastro, estou à disposição.`
      }
    ]
  },
  {
    title: '2. Resposta ao Cliente Interessado (Promoção)',
    messages: [
      {
        id: 'promo-1',
        text: `Boa tarde! Estamos com uma promoção especial em [NOME DA CIDADE]:\n\n✅ *PRIMEIRA MENSALIDADE GRÁTIS!*\n✅ *SEM TAXA DE CADASTRO!*\n✅ *SEM CARÊNCIA:* você se cadastra e já pode usar no mesmo dia!`
      },
      {
        id: 'promo-2',
        text: `Com o plano, você terá acesso a consultas, exames e procedimentos com até 70% de desconto.`
      },
      {
        id: 'promo-3',
        text: `Com certeza! Nosso processo é 100% digital e rápido, você consegue assinar e já ter o plano liberado para uso ainda hoje. 😄`
      },
      {
        id: 'promo-4',
        text: `Para começarmos, qual destes planos atende melhor você e sua família?\n\n🔹 *Titular (sozinho):* R$ 23,00/mês\n🔹 *Titular + até 3 dependentes:* R$ 26,00/mês\n🔹 *Titular + até 4 dependentes:* R$ 29,00/mês\n🔹 *Titular + até 5 dependentes:* R$ 33,00/mês`
      },
      {
        id: 'promo-5',
        text: `Lembrando que a primeira mensalidade é GRÁTIS! Assim que você escolher, já te envio a ficha de cadastro para preencher.`
      }
    ]
  },
  {
    title: '3. Envio da Ficha de Cadastro',
    messages: [
      {
        id: 'form-1',
        text: `Perfeito! Vou enviar a ficha para preencher e darmos início ao seu cadastro!`
      },
      {
        id: 'form-2',
        text: `📄 *Ficha de Cadastro Descont' saúde*\n\nPara dar início ao seu cadastro, por favor, preencha os seguintes dados:\n\n*Informações do Titular:*\n- Nome completo:\n- Data de nascimento:\n- CPF:\n- CEP:\n- Cidade:\n- Endereço:\n- Bairro:\n- Número:\n- Telefone:\n- WhatsApp:\n- E-mail:\n\n*Dependentes:*\n(Para cada um)\n- Nome:\n- Data de nascimento:\n- CPF:\n\n**🧾 Vencimento dos Boletos:**\nEscolha uma data de vencimento:\n- 5️⃣ ( )\n- 1️⃣0️⃣ ( )\n- 1️⃣5️⃣ ( )\n- 2️⃣0️⃣ ( )\n- 2️⃣5️⃣ ( )\n- 3️⃣0️⃣ ( )\n\n**📝 Observação:**\n*Plano sem carência.\nSem taxa de cadastro e primeira mensalidade zero*`
      }
    ]
  }
];


const Accordion: React.FC<{ title: string; children: React.ReactNode; defaultOpen?: boolean }> = ({ title, children, defaultOpen = false }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);
    
    return (
        <div className="border border-gray-200 rounded-lg overflow-hidden">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex justify-between items-center p-4 bg-gray-50 hover:bg-gray-100 focus:outline-none"
                aria-expanded={isOpen}
            >
                <h3 className="text-lg font-semibold text-ds-vinho text-left">{title}</h3>
                <svg className={`w-6 h-6 transform transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>
            {isOpen && (
                <div className="p-4 border-t border-gray-200 bg-white">
                    {children}
                </div>
            )}
        </div>
    );
};

const SalesScripts: React.FC = () => {
    const [copiedId, setCopiedId] = useState<string | null>(null);

    const handleCopy = (text: string, id: string) => {
        navigator.clipboard.writeText(text).then(() => {
            setCopiedId(id);
            setTimeout(() => setCopiedId(null), 2000);
        }).catch(err => {
            console.error('Failed to copy text: ', err);
            alert('Falha ao copiar texto.');
        });
    };

    const CopyIcon = () => (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
      </svg>
    );

    const CheckIcon = () => (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
    );


    return (
        <Card title="Scripts de Venda para WhatsApp">
            <p className="text-gray-600 mb-6">
                Use estes scripts para agilizar seu atendimento via WhatsApp. Clique em "Copiar" para copiar a mensagem para a área de transferência. Os textos entre colchetes, como [NOME DA CIDADE], devem ser substituídos manualmente.
            </p>
            <div className="space-y-4">
                {salesScripts.map((section, index) => (
                    <Accordion key={section.title} title={section.title} defaultOpen={index === 0}>
                        <div className="space-y-4">
                            {section.messages.map(message => (
                                <div key={message.id} className="bg-gray-100 p-4 rounded-lg">
                                    <pre className="whitespace-pre-wrap font-sans text-gray-800 text-sm">
                                        {message.text}
                                    </pre>
                                    <div className="text-right mt-3">
                                        <button
                                            onClick={() => handleCopy(message.text, message.id)}
                                            className={`inline-flex items-center text-sm font-semibold py-1 px-3 rounded-full transition-colors ${
                                                copiedId === message.id 
                                                ? 'bg-green-500 text-white' 
                                                : 'bg-ds-dourado text-ds-vinho hover:bg-opacity-80'
                                            }`}
                                        >
                                            {copiedId === message.id ? <CheckIcon/> : <CopyIcon/>}
                                            {copiedId === message.id ? 'Copiado!' : 'Copiar'}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Accordion>
                ))}
            </div>
        </Card>
    );
};

export default SalesScripts;
