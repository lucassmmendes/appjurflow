// scripts/database.js - Sistema de Banco de Dados Unificado

const JurisFlowDB = (function() {
    // Chaves do localStorage
    const KEYS = {
        CASES: 'jurisflow_cases',
        CLIENTS: 'jurisflow_clients',
        USERS: 'jurisflow_users',
        DOCUMENTS: 'jurisflow_documents',
        SEND_LOG: 'jurisflow_send_log',
        TIMELINE: 'jurisflow_timeline'
    };
    
    // Status padrão
    const DEFAULT_STATUS = 'recebido';
    
    // Inicializar banco de dados
    function init() {
        const requiredKeys = [KEYS.CASES, KEYS.CLIENTS, KEYS.USERS, KEYS.DOCUMENTS, KEYS.SEND_LOG, KEYS.TIMELINE];
        
        requiredKeys.forEach(key => {
            if (!localStorage.getItem(key)) {
                localStorage.setItem(key, JSON.stringify([]));
            }
        });
        
        console.log('JurisFlowDB: Banco de dados inicializado');
        return true;
    }
    
    // ========== CLIENTES ==========
    function registerClient(clientData) {
        const clients = getClients();
        const existingClient = clients.find(c => c.email === clientData.email);
        
        if (existingClient) {
            // Atualizar cliente existente
            Object.assign(existingClient, clientData);
            localStorage.setItem(KEYS.CLIENTS, JSON.stringify(clients));
            return existingClient;
        }
        
        const newClient = {
            id: 'CLI-' + Date.now().toString(36).toUpperCase(),
            ...clientData,
            created_at: new Date().toISOString(),
            casos: []
        };
        
        clients.push(newClient);
        localStorage.setItem(KEYS.CLIENTS, JSON.stringify(clients));
        return newClient;
    }
    
    function getClients() {
        return JSON.parse(localStorage.getItem(KEYS.CLIENTS)) || [];
    }
    
    function getClientById(id) {
        return getClients().find(c => c.id === id);
    }
    
    function getClientByEmail(email) {
        return getClients().find(c => c.email === email);
    }
    
    // ========== CASOS ==========
    function addCase(caseData) {
        const cases = getCases();
        
        const newCase = {
            id: 'SOL-' + Date.now().toString(36).toUpperCase(),
            status: DEFAULT_STATUS,
            created_at: new Date().toISOString(),
            documentos: [],
            timeline: [],
            envios: [],
            ...caseData
        };
        
        cases.push(newCase);
        localStorage.setItem(KEYS.CASES, JSON.stringify(cases));
        
        // Adicionar à timeline
        addToTimeline(newCase.id, {
            titulo: 'Pedido recebido',
            descricao: 'Novo pedido de orçamento recebido via formulário',
            status: DEFAULT_STATUS
        });
        
        return newCase;
    }
    
    function getCases() {
        return JSON.parse(localStorage.getItem(KEYS.CASES)) || [];
    }
    
    function getCaseById(id) {
        return getCases().find(c => c.id === id);
    }
    
    function updateCase(id, updates) {
        const cases = getCases();
        const index = cases.findIndex(c => c.id === id);
        
        if (index !== -1) {
            cases[index] = { ...cases[index], ...updates };
            localStorage.setItem(KEYS.CASES, JSON.stringify(cases));
            return cases[index];
        }
        return null;
    }
    
    function updateCaseTimeline(caseId, timelineEntry) {
        const cases = getCases();
        const caseIndex = cases.findIndex(c => c.id === caseId);
        
        if (caseIndex !== -1) {
            if (!cases[caseIndex].timeline) {
                cases[caseIndex].timeline = [];
            }
            
            const entry = {
                id: 'TL-' + Date.now().toString(36).toUpperCase(),
                created_at: new Date().toISOString(),
                ...timelineEntry
            };
            
            cases[caseIndex].timeline.unshift(entry);
            localStorage.setItem(KEYS.CASES, JSON.stringify(cases));
            return entry;
        }
        return null;
    }
    
    function addToTimeline(caseId, entry) {
        const timeline = JSON.parse(localStorage.getItem(KEYS.TIMELINE)) || [];
        
        const timelineEntry = {
            id: 'TL-' + Date.now().toString(36).toUpperCase(),
            case_id: caseId,
            created_at: new Date().toISOString(),
            ...entry
        };
        
        timeline.push(timelineEntry);
        localStorage.setItem(KEYS.TIMELINE, JSON.stringify(timeline));
        
        // Também adicionar ao caso
        const cases = getCases();
        const caseIndex = cases.findIndex(c => c.id === caseId);
        if (caseIndex !== -1) {
            if (!cases[caseIndex].timeline) {
                cases[caseIndex].timeline = [];
            }
            cases[caseIndex].timeline.unshift(timelineEntry);
            localStorage.setItem(KEYS.CASES, JSON.stringify(cases));
        }
        
        return timelineEntry;
    }
    
    function getTimelineByCaseId(caseId) {
        const timeline = JSON.parse(localStorage.getItem(KEYS.TIMELINE)) || [];
        return timeline.filter(t => t.case_id === caseId)
            .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }
    
    // ========== DOCUMENTOS ==========
    function addDocument(caseId, documentData) {
        const documents = getDocuments();
        
        const newDocument = {
            id: 'DOC-' + Date.now().toString(36).toUpperCase(),
            case_id: caseId,
            created_at: new Date().toISOString(),
            status: 'pendente',
            ...documentData
        };
        
        documents.push(newDocument);
        localStorage.setItem(KEYS.DOCUMENTS, JSON.stringify(documents));
        
        // Atualizar caso
        const cases = getCases();
        const caseIndex = cases.findIndex(c => c.id === caseId);
        if (caseIndex !== -1) {
            if (!cases[caseIndex].documentos) {
                cases[caseIndex].documentos = [];
            }
            cases[caseIndex].documentos.push(newDocument);
            localStorage.setItem(KEYS.CASES, JSON.stringify(cases));
        }
        
        // Adicionar à timeline
        addToTimeline(caseId, {
            titulo: 'Documento adicionado',
            descricao: `Documento "${documentData.nome}" adicionado ao caso`,
            tipo: 'documento'
        });
        
        return newDocument;
    }
    
    function getDocuments() {
        return JSON.parse(localStorage.getItem(KEYS.DOCUMENTS)) || [];
    }
    
    function getDocumentsByCaseId(caseId) {
        return getDocuments().filter(d => d.case_id === caseId);
    }
    
    function updateDocument(documentId, updates) {
        const documents = getDocuments();
        const index = documents.findIndex(d => d.id === documentId);
        
        if (index !== -1) {
            documents[index] = { ...documents[index], ...updates };
            localStorage.setItem(KEYS.DOCUMENTS, JSON.stringify(documents));
            
            // Atualizar também no caso
            const caseId = documents[index].case_id;
            const cases = getCases();
            const caseIndex = cases.findIndex(c => c.id === caseId);
            if (caseIndex !== -1 && cases[caseIndex].documentos) {
                const docIndex = cases[caseIndex].documentos.findIndex(d => d.id === documentId);
                if (docIndex !== -1) {
                    cases[caseIndex].documentos[docIndex] = documents[index];
                    localStorage.setItem(KEYS.CASES, JSON.stringify(cases));
                }
            }
            
            return documents[index];
        }
        return null;
    }
    
    // ========== ENVIOS ==========
    function logSend(sendData) {
        const sendLogs = getSendLogs();
        
        const newLog = {
            id: 'SEND-' + Date.now().toString(36).toUpperCase(),
            created_at: new Date().toISOString(),
            status: 'enviado',
            ...sendData
        };
        
        sendLogs.push(newLog);
        localStorage.setItem(KEYS.SEND_LOG, JSON.stringify(sendLogs));
        
        // Atualizar caso
        if (sendData.caseId) {
            const cases = getCases();
            const caseIndex = cases.findIndex(c => c.id === sendData.caseId);
            if (caseIndex !== -1) {
                if (!cases[caseIndex].envios) {
                    cases[caseIndex].envios = [];
                }
                cases[caseIndex].envios.push(newLog);
                localStorage.setItem(KEYS.CASES, JSON.stringify(cases));
            }
            
            // Adicionar à timeline
            addToTimeline(sendData.caseId, {
                titulo: 'Documentos enviados',
                descricao: `Documentos enviados ao cliente via ${sendData.method}`,
                tipo: 'envio',
                status: 'enviado_ao_cliente'
            });
        }
        
        return newLog;
    }
    
    function getSendLogs() {
        return JSON.parse(localStorage.getItem(KEYS.SEND_LOG)) || [];
    }
    
    function getSendLogsByCaseId(caseId) {
        return getSendLogs().filter(s => s.caseId === caseId);
    }
    
    // ========== FILTROS E BUSCAS ==========
    function filterCases(filters = {}) {
        let cases = getCases();
        
        if (filters.status) {
            cases = cases.filter(c => c.status === filters.status);
        }
        
        if (filters.search) {
            const searchTerm = filters.search.toLowerCase();
            cases = cases.filter(c => 
                c.nome.toLowerCase().includes(searchTerm) ||
                c.email.toLowerCase().includes(searchTerm) ||
                c.id.toLowerCase().includes(searchTerm) ||
                (c.pedido && c.pedido.toLowerCase().includes(searchTerm))
            );
        }
        
        if (filters.area && filters.area !== 'todas') {
            cases = cases.filter(c => c.area === filters.area);
        }
        
        if (filters.urgente) {
            cases = cases.filter(c => c.urgente === true);
        }
        
        // Ordenar por data (mais recente primeiro)
        cases.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        
        return cases;
    }
    
    function getStatistics() {
        const cases = getCases();
        const clients = getClients();
        const documents = getDocuments();
        
        const statusCounts = {};
        const areaCounts = {};
        
        cases.forEach(c => {
            statusCounts[c.status] = (statusCounts[c.status] || 0) + 1;
            areaCounts[c.area] = (areaCounts[c.area] || 0) + 1;
        });
        
        return {
            totalCasos: cases.length,
            totalClientes: clients.length,
            totalDocumentos: documents.length,
            statusCounts,
            areaCounts,
            casosUrgentes: cases.filter(c => c.urgente).length,
            casosPendentes: cases.filter(c => c.status === 'recebido' || c.status === 'pendente').length
        };
    }
    
    // ========== MIGRAÇÃO ==========
    function migrateFromOld() {
        // Tentar migrar dados de versões antigas
        const oldCasesKey = 'jurisflow_cases_old';
        const oldCases = JSON.parse(localStorage.getItem(oldCasesKey)) || [];
        
        if (oldCases.length > 0) {
            const currentCases = getCases();
            const mergedCases = [...oldCases, ...currentCases];
            localStorage.setItem(KEYS.CASES, JSON.stringify(mergedCases));
            localStorage.removeItem(oldCasesKey);
            console.log(`Migrados ${oldCases.length} casos antigos`);
            return oldCases.length;
        }
        return 0;
    }
    
    // ========== EXPORTAÇÃO/IMPORTAÇÃO ==========
    function exportData() {
        return {
            cases: getCases(),
            clients: getClients(),
            documents: getDocuments(),
            sendLogs: getSendLogs(),
            timeline: JSON.parse(localStorage.getItem(KEYS.TIMELINE)) || [],
            exported_at: new Date().toISOString(),
            version: '1.0'
        };
    }
    
    function importData(data) {
        if (data.version !== '1.0') {
            throw new Error('Versão de dados incompatível');
        }
        
        if (data.cases) localStorage.setItem(KEYS.CASES, JSON.stringify(data.cases));
        if (data.clients) localStorage.setItem(KEYS.CLIENTS, JSON.stringify(data.clients));
        if (data.documents) localStorage.setItem(KEYS.DOCUMENTS, JSON.stringify(data.documents));
        if (data.sendLogs) localStorage.setItem(KEYS.SEND_LOG, JSON.stringify(data.sendLogs));
        if (data.timeline) localStorage.setItem(KEYS.TIMELINE, JSON.stringify(data.timeline));
        
        return true;
    }
    
    // ========== LIMPEZA ==========
    function clearAllData() {
        Object.values(KEYS).forEach(key => {
            localStorage.setItem(key, JSON.stringify([]));
        });
        return true;
    }
    
    // Inicializar automaticamente
    init();
    
    // Retornar API pública
    return {
        // Inicialização
        init,
        
        // Clientes
        registerClient,
        getClients,
        getClientById,
        getClientByEmail,
        
        // Casos
        addCase,
        getCases,
        getCaseById,
        updateCase,
        updateCaseTimeline,
        addToTimeline,
        getTimelineByCaseId,
        filterCases,
        
        // Documentos
        addDocument,
        getDocuments,
        getDocumentsByCaseId,
        updateDocument,
        
        // Envios
        logSend,
        getSendLogs,
        getSendLogsByCaseId,
        
        // Utilitários
        getStatistics,
        migrateFromOld,
        exportData,
        importData,
        clearAllData
    };
})();

// Garantir que esteja disponível globalmente
window.JurisFlowDB = JurisFlowDB;