import React from 'react';

const ContractClauses: React.FC = () => {
    
    const Clause: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
        <div className="mt-4">
            <p className="font-bold">{title}</p>
            <div className="space-y-2">{children}</div>
        </div>
    );

    return (
        <div className="page-break-before">
            <style>{`
                @media print {
                  .page-break-before {
                    page-break-before: always;
                  }
                }
            `}</style>
            <div className="bg-white p-6 sm:p-10 shadow-lg max-w-4xl mx-auto text-gray-800 font-sans printable-area A4-page">
                <div className="text-sm text-justify space-y-2 text-gray-700 tracking-wide leading-relaxed" style={{ wordSpacing: '0.5px' }}>
                    
                    <Clause title="CLÁUSULA PRIMEIRA: DO OBJETIVO">
                        <p>1.1 A CONTRATADA (FRANQUIA) assume neste ato a responsabilidade técnica e administrativa de estabelecer e manter ativos os convênios para as prestações de serviços e das áreas médicas, credenciamentos de profissionais e serviços adicionais (Farmácias, Óticas, etc), serviços diagnósticos, psicoterapia e terapia para o devido atendimento do Contratante e seus beneficiários, em todas as localidades do Rio Grande do Sul, onde a Descont’ Saúde tenha uma Rede credenciada ou qualquer Região, como Franquia. Sempre com descontos variáveis de acordo com o credenciamento.</p>
                        <p>1.2 O CONTRATANTE terá direito ao uso dos serviços acima identificados pelo sistema denominado Auto-Gestão, pagando sem ressarcimento por parte da Contratada, somente no momento do uso dos seus direitos diretamente aos profissionais ou serviços integrados à rede de assistência credenciada pela Contratada, gozando do direito de usufruir de valores diferenciados através de tabelas de Rede credenciada (com convênios especais sobre a tabela dos profissionais ou serviços contratados).</p>
                        <p>1.3 O CONTRATANTE titular é responsável pelos dependentes indicados no que se refere ao pagamento dos serviços utilizados perante os profissionais credenciados. A CONTRATADA se compromete sempre que solicitada, através do departamento de orçamento em qualquer tipo de atendimento a proceder à análise das contas e orçamentos cobrados do Contratante.</p>
                        <p>1.4 A CONTRATADA assume também a responsabilidade de defender os direitos do Contratante em casos que se originem prejuízos ou cobranças abusivas pela quebra do contrato de credenciamento com os profissionais médicos ou entidades credenciadas para o atendimento do mesmo.</p>
                    </Clause>

                    <Clause title="CLÁUSULA SEGUNDA: DA INCLUSÃO E DOS VALORES DA MENSALIDADE DE CIDADES FRANQUEADAS E SUAS RESPONSABILIDADES">
                        <p>2.1 No ato da assinatura da Proposta de inclusão Contratante e seus beneficiários, terão adquirido imediatamente, sem carência, direito aos benefícios assistenciais junto aos profissionais e serviços devidamente credenciados. O Contrato deverá em qualquer hipótese, estar carimbado com o CNPJ, da respectiva Franquia e devidamente assinado pelo Franqueado ou Gerente autorizado, para garantias do Contratante e da Central de Franquias Descont' Saúde.</p>
                    </Clause>

                    <Clause title="CLÁUSULA TERCEIRA: DA RENOVAÇÃO E DO CANCELAMENTO">
                        <p>3.1 A vigência do presente contrato será de 12(doze) meses, sendo que se renovará automaticamente caso não haja o cancelamento do convenio por parte do Contratante, em caso de cancelamento o Credenciado Titular deverá comunicar pessoalmente à administração da Franquia Contratada e proceder conforme consta no parágrafo único desta cláusula.</p>
                        <p><strong>PARÁGRAFO ÚNICO:</strong> Em caso de não haver interesse na renovação, na data de seu vencimento, o Contratante deverá entregar os seguintes documentos, abaixo descriminados: - Carteiras de identificação Descont Saúde, de todos os constantes na proposta de admissão e estar rigorosamente em dia com suas mensalidades, em caso de atraso, o Contratante deverá pagar as mensalidades evitando a inclusão do nome no SPC com a devida comunicação por escrito no prazo regido por lei.</p>
                    </Clause>

                    <Clause title="CLÁUSULA QUARTA: CREDENCIAL DE IDENTIFICAÇÃO (Carteiras)">
                        <p>4.1 A CREDENCIAL (cartão) de identificação Descont' Saúde, a ser apresentada sempre no momento de uso dos serviços credenciados será emitida pela administração da Franquia autorizada no prazo de 30 (trinta) dias contados da data do primeiro pagamento.</p>
                    </Clause>

                    <Clause title="CLÁUSULA QUINTA: DOS SERVIÇOS CREDENCIADOS">
                        <p>O credenciamento de médicos, clínicas especializadas, laboratórios e demais serviços auxiliares, bem como o cancelamento dos mesmos é de competência da Franquia autorizada, facultando, no entanto ao Contratante a colaboração espontânea na indicação de novos credenciados visando sempre à melhoria da qualidade no atendimento.</p>
                    </Clause>

                    <Clause title="CLÁUSULA SEXTA: DA MENSALIDADE DISPOSIÇÕES GERAIS">
                        <p><strong>A) COBERTURA ASSISTENCIAL E AMBULATORIAL (1) FAMILIAR EXTENSIVO:</strong> A mensalidade do presente convenio na hipótese de cobertura será de acordo com a região, sendo que, poderão beneficiar-se do presente convenio o titular e 07 (sete) pessoas, independente de laços familiares, que serão atendidos como um Titular e sete Dependentes; sendo que o valor da mensalidade dependerá de tabela vigente do Estipulante, Franquia, respeitando sempre o valor final da tabela e do valor expresso no momento da adesão conforme de admissão simplificada;</p>
                        <p><strong>E) COBERTURA E INCLUSÃO DE DEPENDENTES ADICIONAIS:</strong> Será aceito no máximo a inclusão de 02 (dois) Dependentes Adicionais no convenio Assistencial e Ambulatorial (1), e a cada Dependente deverá ser cobrado R$ 5 (cinco reais) a mais a mensalidade vigente, com exceção do convenio Assistencial GOLD, Cobertura Assistencial e Ambulatorial (2) e (3), que não há esse direito.</p>
                    </Clause>
                    
                    <Clause title="CLÁUSULA SÉTIMA: DO VENCIMENTO E COBRANÇA DE JUROS">
                        <p>A mensalidade terá o vencimento na data escolhida pelo titular do convenio assistencial segundo melhor lhe aprouver. A cobrança de juros sobre atrasos acrescidos a mensalidade original, que ocorrerá sempre que ultrapassar 01 (um) dia, do vencimento principal, a exceção desta cobrança (juros) dar-se-á sempre que houver atrasos por parte do Departamento de Cobrança (emissão de Recibos, Falha no sistema de Processamento de Dados), na qual o Contratante Titular, tem por obrigação entrar imediatamente em contato com a Central de Atendimento ao Cliente Descont' Saúde, para que seja processado o devido boleto bancário ou cobrança domiciliar sem ónus.</p>
                    </Clause>

                    <Clause title="CLÁUSULA OITAVA: DOS ATENDIMENTOS E SERVIÇOS ASSISTENCIAIS CREDENCIADOS OU PREFERENCIAIS">
                        <p>Não há limites para consultas, serviços e atendimento em toda Rede Credenciada Descont' Saúde. Não poderá fazer uso do presente convenio, aquele Titular (e demais dependentes), que estiver em atraso há mais de 30 (trinta) dias. Os benefícios do presente serão restabelecidos com a quitação da(s) mensalidade(s) atrasada(s), acrescida(s) de correção e de juros legais.</p>
                    </Clause>
                    
                    <Clause title="CLÁUSULA NONA: DO PRAZO DO CONTRATO DE PRESTAÇÃO DE SERVIÇOS ASSISTENCIAIS">
                        <p>9.1 O presente contrato terá duração de 12 (doze) meses, a partir da data de assinatura do Contrato, ao final da qual poderá ser renovado de conformidade com a Cláusula Terceira.</p>
                    </Clause>

                    <Clause title="CLÁUSULA DÉCIMA:">
                        <p>10.1 As partes elegem o foro da cidade de Pedro Osório RS para resolução de casos do não cumprimento dos seus objetivos, renunciando a qualquer outra, por mais privilegiado que seja.</p>
                        <p>10.2 O Contratante declara neste ato, estar ciente das normas de utilização do atendimento da Contratada, bem como da veracidade das informações prestadas no contrato de inclusão.</p>
                        <p>10.3 De comum acordo Contratante e Contratada após lidas todas as cláusulas deste contrato firmam o presente em 2 (duas) vias de igual teor e forma, para os mesmos efeitos juntamente com 2 (duas) testemunhas abaixo.</p>
                    </Clause>
                </div>

                <footer className="mt-16 pt-8 text-sm">
                    <div className="flex justify-between items-start gap-4 text-center">
                        <div className="flex-1">
                            <div className="border-b-2 border-black min-h-[2rem] mb-1"></div>
                            <p>Testemunha 1</p>
                        </div>
                         <div className="flex-1">
                            <div className="border-b-2 border-black min-h-[2rem] mb-1"></div>
                            <p className="font-bold">CONTRATANTE</p>
                        </div>
                         <div className="flex-1">
                            <div className="border-b-2 border-black min-h-[2rem] mb-1"></div>
                            <p>Testemunha 2</p>
                        </div>
                    </div>

                    <div className="flex justify-between items-start gap-4 text-center mt-12">
                         <div className="flex-1">
                             <p>(RS) _______ de ________________ de 20____</p>
                         </div>
                         <div className="flex-1">
                            <div className="border-b-2 border-black min-h-[2rem] mb-1"></div>
                            <p className="font-bold text-lg font-script text-ds-vinho">Descont' Saúde</p>
                            <p>CONTRATADA</p>
                        </div>
                    </div>
                    
                    <div className="text-center mt-12">
                        <p className="text-base font-bold italic text-ds-vinho">"O Convênio que já faz parte da sua vida"</p>
                        <p className="text-xs font-bold mt-4">FRANQUIA AUTORIZADA - CNPJ 09.371.421/0001-01 PEDRO OSÓRIO</p>
                    </div>
                </footer>
            </div>
        </div>
    );
};

export default ContractClauses;