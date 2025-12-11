
import React, { useMemo } from 'react';
import { useData } from '../../context/DataContext';
import Card from '../common/Card';

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
};

const TrendingUpIcon = () => <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>;
const TrendingDownIcon = () => <svg className="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" /></svg>;
const UserGroupIcon = () => <svg className="w-8 h-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>;
const MoneyIcon = () => <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v.01m0 0v1m0-2c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const AlertIcon = () => <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>;

const StatCard: React.FC<{ title: string; value: string; subtext?: string; icon: React.ReactNode; trend?: 'up' | 'down' }> = ({ title, value, subtext, icon, trend }) => (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-start justify-between transition-all hover:shadow-md">
        <div>
            <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
            <h3 className="text-2xl font-bold text-gray-800">{value}</h3>
            {subtext && (
                <div className="flex items-center mt-2 text-xs">
                    {trend === 'up' && <TrendingUpIcon />}
                    {trend === 'down' && <TrendingDownIcon />}
                    <span className={`ml-1 ${trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-gray-400'}`}>
                        {subtext}
                    </span>
                </div>
            )}
        </div>
        <div className="p-3 bg-gray-50 rounded-lg">
            {icon}
        </div>
    </div>
);

const AdminHome: React.FC = () => {
    const { clients, payments } = useData();

    // 1. Cálculos de Estatísticas Gerais
    const stats = useMemo(() => {
        const activeClients = clients.filter(c => c.status === 'active').length;
        const totalDependents = clients.reduce((acc, c) => acc + (c.status === 'active' ? c.dependents.length : 0), 0);
        
        const currentMonth = new Date().toLocaleString('pt-BR', { month: 'long' });
        const currentYear = new Date().getFullYear();
        const CapitalizedMonth = currentMonth.charAt(0).toUpperCase() + currentMonth.slice(1);

        const thisMonthPayments = payments.filter(p => p.month === CapitalizedMonth && p.year === currentYear);
        const totalRevenue = thisMonthPayments.reduce((acc, p) => acc + p.amount, 0); // Potencial total
        const realizedRevenue = thisMonthPayments.filter(p => p.status === 'paid').reduce((acc, p) => acc + p.amount, 0);
        
        const overdueCount = thisMonthPayments.filter(p => p.status === 'overdue').length;
        const pendingCount = thisMonthPayments.filter(p => p.status === 'pending').length;
        const paidCount = thisMonthPayments.filter(p => p.status === 'paid').length;
        const totalCount = thisMonthPayments.length || 1;

        const delinquencyRate = ((overdueCount / totalCount) * 100).toFixed(1);
        const receivedRate = ((paidCount / totalCount) * 100).toFixed(1);

        return {
            activeClients,
            totalLives: activeClients + totalDependents,
            realizedRevenue,
            projectedRevenue: totalRevenue,
            delinquencyRate,
            receivedRate,
            currentMonth: CapitalizedMonth
        };
    }, [clients, payments]);

    // 2. Dados para o Gráfico de Barras (Últimos 6 meses)
    const chartData = useMemo(() => {
        const months = [];
        const today = new Date();
        
        for (let i = 5; i >= 0; i--) {
            const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
            const monthName = d.toLocaleString('pt-BR', { month: 'short' });
            const fullMonthName = d.toLocaleString('pt-BR', { month: 'long' });
            const year = d.getFullYear();
            const capitalizedMonth = fullMonthName.charAt(0).toUpperCase() + fullMonthName.slice(1);

            const monthPayments = payments.filter(p => p.month === capitalizedMonth && p.year === year);
            const paid = monthPayments.filter(p => p.status === 'paid').reduce((acc, p) => acc + p.amount, 0);
            const pending = monthPayments.filter(p => p.status !== 'paid').reduce((acc, p) => acc + p.amount, 0);

            months.push({ name: monthName, paid, pending });
        }
        return months;
    }, [payments]);

    // 3. Dados de Inadimplência por Bairro
    const delinquencyByNeighborhood = useMemo(() => {
        const overduePayments = payments.filter(p => p.status === 'overdue');
        const counts: Record<string, number> = {};
        const clientMap = new Map(clients.map(c => [c.id, c]));

        overduePayments.forEach(p => {
            const client = clientMap.get(p.clientId);
            if (client && client.neighborhood) {
                const hood = client.neighborhood.trim() || 'Não Inf.';
                counts[hood] = (counts[hood] || 0) + 1;
            }
        });

        return Object.entries(counts)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 5) // Top 5
            .map(([name, value], index) => ({ name, value, width: `${Math.min((value / overduePayments.length) * 100 * 2, 100)}%` }));
    }, [payments, clients]);

    const maxChartValue = Math.max(...chartData.map(d => d.paid + d.pending), 100);

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Top Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard 
                    title="Receita Realizada (Mês)" 
                    value={formatCurrency(stats.realizedRevenue)}
                    subtext={`de ${formatCurrency(stats.projectedRevenue)} previstos`}
                    icon={<MoneyIcon />}
                    trend="up"
                />
                <StatCard 
                    title="Vidas Protegidas" 
                    value={stats.totalLives.toString()}
                    subtext={`${stats.activeClients} titulares ativos`}
                    icon={<UserGroupIcon />}
                    trend="up"
                />
                <StatCard 
                    title="Taxa de Inadimplência" 
                    value={`${stats.delinquencyRate}%`}
                    subtext="Neste mês"
                    icon={<AlertIcon />}
                    trend={parseFloat(stats.delinquencyRate) > 15 ? 'down' : 'up'}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Financial Chart */}
                <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold text-ds-vinho mb-6">Histórico Financeiro (Semestral)</h3>
                    
                    <div className="flex items-end justify-between h-64 gap-2 sm:gap-4">
                        {chartData.map((data, index) => (
                            <div key={index} className="flex flex-col items-center flex-1 h-full justify-end group relative">
                                {/* Tooltip */}
                                <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none">
                                    Pago: {formatCurrency(data.paid)}<br/>
                                    Aberto: {formatCurrency(data.pending)}
                                </div>
                                
                                <div className="w-full max-w-[40px] flex flex-col justify-end h-full rounded-t-sm overflow-hidden">
                                    {/* Pending Bar (Top) */}
                                    <div 
                                        style={{ height: `${(data.pending / maxChartValue) * 100}%` }} 
                                        className="bg-gray-200 w-full transition-all duration-500 hover:bg-gray-300"
                                    ></div>
                                    {/* Paid Bar (Bottom) */}
                                    <div 
                                        style={{ height: `${(data.paid / maxChartValue) * 100}%` }} 
                                        className="bg-ds-vinho w-full transition-all duration-500 hover:bg-opacity-90 relative"
                                    >
                                        {/* Value Label inside bar if tall enough */}
                                        {(data.paid / maxChartValue) > 0.15 && (
                                            <span className="absolute bottom-2 left-0 right-0 text-center text-[10px] text-white font-bold hidden sm:block">
                                                {((data.paid / (data.paid + data.pending || 1)) * 100).toFixed(0)}%
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <span className="text-xs text-gray-500 mt-2 font-medium uppercase">{data.name}</span>
                            </div>
                        ))}
                    </div>
                    <div className="flex justify-center gap-6 mt-4 text-xs text-gray-500">
                        <div className="flex items-center gap-1"><div className="w-3 h-3 bg-ds-vinho rounded-sm"></div> Recebido</div>
                        <div className="flex items-center gap-1"><div className="w-3 h-3 bg-gray-200 rounded-sm"></div> Pendente/Atrasado</div>
                    </div>
                </div>

                {/* Side Panels */}
                <div className="space-y-6">
                    {/* Delinquency Ranking */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-full">
                        <h3 className="text-lg font-bold text-gray-800 mb-4">Inadimplência por Bairro</h3>
                        <div className="space-y-4">
                            {delinquencyByNeighborhood.length > 0 ? (
                                delinquencyByNeighborhood.map((item, idx) => (
                                    <div key={idx}>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span className="font-medium text-gray-700">{item.name}</span>
                                            <span className="text-red-600 font-bold">{item.value}</span>
                                        </div>
                                        <div className="w-full bg-gray-100 rounded-full h-2">
                                            <div 
                                                className="bg-red-500 h-2 rounded-full transition-all duration-1000" 
                                                style={{ width: item.width }}
                                            ></div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="flex flex-col items-center justify-center h-32 text-gray-400 text-sm">
                                    <svg className="w-8 h-8 mb-2 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                    Tudo em dia!
                                </div>
                            )}
                        </div>
                        <p className="text-xs text-gray-400 mt-4 text-center">Top 5 bairros com mais atrasos</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminHome;
