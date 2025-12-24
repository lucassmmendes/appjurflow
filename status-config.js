// scripts/status-config.js - Configuração de Status do Sistema

const STATUS_CONFIG = {
    recebido: {
        label: 'Recebido',
        color: '#3498db',
        icon: 'fas fa-inbox',
        description: 'Pedido recebido, aguardando análise',
        nextStatus: ['em_andamento', 'aguardando_documentos']
    },
    em_andamento: {
        label: 'Em Andamento',
        color: '#f39c12',
        icon: 'fas fa-spinner',
        description: 'Caso em análise/elaboração',
        nextStatus: ['aguardando_documentos', 'enviado_ao_cliente']
    },
    aguardando_documentos: {
        label: 'Aguardando Documentos',
        color: '#9b59b6',
        icon: 'fas fa-file-upload',
        description: 'Aguardando documentos do cliente',
        nextStatus: ['em_andamento', 'enviado_ao_cliente']
    },
    enviado_ao_cliente: {
        label: 'Enviado ao Cliente',
        color: '#27ae60',
        icon: 'fas fa-paper-plane',
        description: 'Documentos enviados para o cliente',
        nextStatus: ['concluido', 'aguardando_assinatura']
    },
    aguardando_assinatura: {
        label: 'Aguardando Assinatura',
        color: '#e67e22',
        icon: 'fas fa-signature',
        description: 'Aguardando assinatura do cliente',
        nextStatus: ['concluido', 'enviado_ao_cliente']
    },
    concluido: {
        label: 'Concluído',
        color: '#2ecc71',
        icon: 'fas fa-check-circle',
        description: 'Caso finalizado com sucesso',
        nextStatus: ['arquivado']
    },
    arquivado: {
        label: 'Arquivado',
        color: '#95a5a6',
        icon: 'fas fa-archive',
        description: 'Caso arquivado',
        nextStatus: []
    }
};

// Configuração de áreas do direito
const AREAS_DIREITO = [
    { id: 'criminal', nome: 'Direito Criminal', icon: 'fas fa-gavel' },
    { id: 'civel', nome: 'Direito Cível', icon: 'fas fa-balance-scale' },
    { id: 'familia', nome: 'Direito de Família', icon: 'fas fa-heart' },
    { id: 'trabalhista', nome: 'Direito Trabalhista', icon: 'fas fa-briefcase' },
    { id: 'empresarial', nome: 'Direito Empresarial', icon: 'fas fa-building' },
    { id: 'consumidor', nome: 'Direito do Consumidor', icon: 'fas fa-shopping-cart' },
    { id: 'imobiliario', nome: 'Direito Imobiliário', icon: 'fas fa-home' },
    { id: 'digital', nome: 'Direito Digital', icon: 'fas fa-laptop-code' },
    { id: 'administrativo', nome: 'Direito Administrativo', icon: 'fas fa-landmark' },
    { id: 'contratos', nome: 'Contratos', icon: 'fas fa-file-contract' },
    { id: 'propriedade', nome: 'Propriedade Intelectual', icon: 'fas fa-copyright' }
];

// Funções utilitárias
function getStatusConfig(status) {
    return STATUS_CONFIG[status] || {
        label: 'Desconhecido',
        color: '#95a5a6',
        icon: 'fas fa-question-circle',
        description: 'Status não configurado'
    };
}

function getStatusBadge(status, isUrgent = false) {
    const config = getStatusConfig(status);
    return `
        <span class="badge badge-${status}" style="background:${config.color}20;color:${config.color};">
            <i class="${config.icon}"></i> ${config.label}
            ${isUrgent ? '<i class="fas fa-exclamation-triangle ml-1"></i>' : ''}
        </span>
    `;
}

function getAreaIcon(areaId) {
    const area = AREAS_DIREITO.find(a => a.id === areaId);
    return area ? area.icon : 'fas fa-folder';
}

function getAreaName(areaId) {
    const area = AREAS_DIREITO.find(a => a.id === areaId);
    return area ? area.nome : 'Outros';
}

function getNextStatusOptions(currentStatus) {
    const config = STATUS_CONFIG[currentStatus];
    if (!config) return [];
    
    return config.nextStatus.map(status => ({
        value: status,
        label: STATUS_CONFIG[status].label
    }));
}

// Disponibilizar globalmente
window.STATUS_CONFIG = STATUS_CONFIG;
window.AREAS_DIREITO = AREAS_DIREITO;
window.getStatusConfig = getStatusConfig;
window.getStatusBadge = getStatusBadge;
window.getAreaIcon = getAreaIcon;
window.getAreaName = getAreaName;
window.getNextStatusOptions = getNextStatusOptions;