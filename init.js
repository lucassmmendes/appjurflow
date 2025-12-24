// scripts/init.js - Inicialização do Sistema

(function() {
    console.log('JurisFlow - Inicializando sistema...');
    
    // Verificar se o banco de dados foi carregado
    if (typeof JurisFlowDB === 'undefined') {
        console.error('JurisFlowDB não foi carregado!');
        alert('Erro ao carregar o sistema. Por favor, recarregue a página.');
        return;
    }
    
    // Inicializar dados de exemplo (apenas para demonstração)
    function initSampleData() {
        const cases = JurisFlowDB.getCases();
        const clients = JurisFlowDB.getClients();
        
        // Se não houver dados, criar exemplos
        if (cases.length === 0 && clients.length === 0) {
            console.log('Criando dados de exemplo...');
            
            // Criar cliente de exemplo
            const cliente = JurisFlowDB.registerClient({
                nome: 'João Silva',
                email: 'joao@exemplo.com',
                telefone: '(11) 99999-9999',
                cpf: '123.456.789-00',
                newsletter: true
            });
            
            // Criar casos de exemplo
            JurisFlowDB.addCase({
                cliente_id: cliente.id,
                nome: 'João Silva',
                email: 'joao@exemplo.com',
                telefone: '(11) 99999-9999',
                area: 'civel',
                pedido: 'Preciso de assistência para uma ação de cobrança contra uma empresa que não pagou por serviços prestados.',
                valor_estimado: 'R$ 15.000,00',
                urgencia: 'media',
                urgente: false
            });
            
            JurisFlowDB.addCase({
                cliente_id: cliente.id,
                nome: 'Maria Santos',
                email: 'maria@exemplo.com',
                telefone: '(11) 98888-8888',
                area: 'familia',
                pedido: 'Necessito de orientação para processo de divórcio consensual com partilha de bens.',
                valor_estimado: 'R$ 8.000,00',
                urgencia: 'normal',
                urgente: false
            });
            
            // Adicionar documentos de exemplo
            const caso = JurisFlowDB.getCases()[0];
            JurisFlowDB.addDocument(caso.id, {
                nome: 'Contrato de Prestação de Serviços',
                tipo: 'contrato',
                status: 'aprovado'
            });
            
            JurisFlowDB.addDocument(caso.id, {
                nome: 'Procuração',
                tipo: 'procuração',
                status: 'aprovado'
            });
            
            console.log('Dados de exemplo criados com sucesso!');
        }
    }
    
    // Executar inicialização
    try {
        initSampleData();
        console.log('JurisFlow - Sistema inicializado com sucesso!');
    } catch (error) {
        console.error('Erro na inicialização:', error);
    }
})();