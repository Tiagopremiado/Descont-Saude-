import React from 'react';
import type { Client, ActivityLog } from '../../types';

interface ClientHistoryTabProps {
    client: Client;
}

const getActionIcon = (action: ActivityLog['action']) => {
    switch (action) {
        case 'create':
            return (
                <span className="bg-green-100 text-green-600 h-8 w-8 rounded-full flex items-center justify-center border-2 border-green-200">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                </span>
            );
        case 'update':
            return (
                <span className="bg-blue-100 text-blue-600 h-8 w-8 rounded-full flex items-center justify-center border-2 border-blue-200">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                </span>
            );
        case 'status_change':
            return (
                <span className="bg-orange-100 text-orange-600 h-8 w-8 rounded-full flex items-center justify-center border-2 border-orange-200">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
                </span>
            );
        case 'dependent_action':
            return (
                <span className="bg-purple-100 text-purple-600 h-8 w-8 rounded-full flex items-center justify-center border-2 border-purple-200">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M15 21a6 6 0 00-9-5.197M15 21V5a2 2 0 00-2-2H9a2 2 0 00-2 2v16" /></svg>
                </span>
            );
        case 'password_reset':
            return (
                <span className="bg-red-100 text-red-600 h-8 w-8 rounded-full flex items-center justify-center border-2 border-red-200">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" /></svg>
                </span>
            );
        case 'delivery_request':
            return (
                <span className="bg-gray-100 text-gray-600 h-8 w-8 rounded-full flex items-center justify-center border-2 border-gray-200">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" /></svg>
                </span>
            );
        default:
            return (
                <span className="bg-gray-100 text-gray-600 h-8 w-8 rounded-full flex items-center justify-center border-2 border-gray-200">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </span>
            );
    }
};

const ClientHistoryTab: React.FC<ClientHistoryTabProps> = ({ client }) => {
    const logs = client.logs || [];

    if (logs.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-2 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p>Nenhuma atividade registrada ainda.</p>
            </div>
        );
    }

    return (
        <div className="py-4">
            <h4 className="font-bold text-gray-700 mb-6 px-2">Linha do Tempo de Atividades</h4>
            <div className="relative border-l-2 border-gray-200 ml-4 space-y-8">
                {logs.map((log) => (
                    <div key={log.id} className="relative pl-8">
                        {/* Icon */}
                        <div className="absolute -left-4 top-0 bg-white">
                            {getActionIcon(log.action)}
                        </div>
                        
                        {/* Content */}
                        <div className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start mb-1">
                                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                    {new Date(log.timestamp).toLocaleString('pt-BR')}
                                </span>
                                <span className="text-xs text-gray-400 font-medium">
                                    Por: {log.author}
                                </span>
                            </div>
                            
                            <h5 className="font-bold text-gray-800 text-sm mb-1">{log.description}</h5>
                            
                            {log.details && log.details.length > 0 && (
                                <div className="mt-2 bg-gray-50 p-2 rounded text-xs text-gray-600 border border-gray-100">
                                    <ul className="list-disc list-inside space-y-1">
                                        {log.details.map((detail, idx) => (
                                            <li key={idx} className="break-words">{detail}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ClientHistoryTab;
