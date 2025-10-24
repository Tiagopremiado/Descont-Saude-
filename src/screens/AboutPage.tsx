import React from 'react';
import { Link } from 'react-router-dom';

const AboutPage: React.FC = () => {
    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            <header className="bg-ds-vinho text-white shadow-lg p-4">
                <div className="max-w-5xl mx-auto flex justify-between items-center">
                    <div className="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-ds-dourado mr-3" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <h1 className="text-xl font-bold tracking-wider">Sobre a Descont'Saúde</h1>
                    </div>
                    <Link to="/login" className="bg-ds-dourado text-ds-vinho font-bold py-2 px-4 rounded-full hover:bg-opacity-90 transition-colors duration-200">
                        Voltar ao Login
                    </Link>
                </div>
            </header>
            <main className="p-4 sm:p-8">
                <div className="max-w-4xl mx-auto bg-white p-8 rounded-xl shadow-md">
                    <h2 className="text-3xl font-bold text-ds-vinho font-serif mb-6 text-center">Nosso Compromisso com o seu Bem-Estar</h2>

                    <div className="space-y-8 text-gray-700 text-lg leading-relaxed">
                        <section>
                            <h3 className="text-2xl font-semibold text-gray-800 border-b-2 border-ds-dourado pb-2 mb-4">Missão</h3>
                            <p>Facilitar o acesso a serviços de saúde de qualidade para todos, oferecendo uma rede credenciada completa com descontos justos e atendimento humanizado. Acreditamos que cuidar da saúde deve ser simples, acessível e acolhedor.</p>
                        </section>

                        <section>
                            <h3 className="text-2xl font-semibold text-gray-800 border-b-2 border-ds-dourado pb-2 mb-4">Visão</h3>
                            <p>Ser a principal referência em convênios de descontos em saúde na região, reconhecida pela excelência de nossa rede, pela inovação em nossos serviços e pelo impacto positivo que geramos na vida de nossos associados e suas famílias.</p>
                        </section>

                        <section>
                            <h3 className="text-2xl font-semibold text-gray-800 border-b-2 border-ds-dourado pb-2 mb-4">Valores</h3>
                            <ul className="list-disc list-inside space-y-2 pl-4">
                                <li><strong>Acessibilidade:</strong> Trabalhamos para que todos tenham a oportunidade de cuidar da saúde sem preocupações financeiras.</li>
                                <li><strong>Qualidade:</strong> Selecionamos cuidadosamente nossos parceiros para garantir um atendimento de excelência.</li>
                                <li><strong>Humanização:</strong> Colocamos as pessoas em primeiro lugar, valorizando cada vida e oferecendo um suporte empático.</li>
                                <li><strong>Transparência:</strong> Mantemos uma relação clara e honesta com nossos associados e parceiros.</li>
                                <li><strong>Compromisso:</strong> Estamos dedicados a promover o bem-estar e a qualidade de vida em nossa comunidade.</li>
                            </ul>
                        </section>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AboutPage;
