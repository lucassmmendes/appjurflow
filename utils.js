// scripts/utils.js - Funções Utilitárias

const JurisFlowUtils = {
    
    // Formatar data
    formatDate(date, includeTime = true) {
        if (!date) return 'N/A';
        
        const d = new Date(date);
        const options = {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        };
        
        if (includeTime) {
            options.hour = '2-digit';
            options.minute = '2-digit';
        }
        
        return d.toLocaleDateString('pt-BR', options);
    },
    
    // Formatar moeda
    formatCurrency(value) {
        if (!value) return 'R$ 0,00';
        
        // Remover R$ e espaços
        let cleanValue = value.toString().replace('R$', '').trim();
        
        // Converter para número
        const number = parseFloat(cleanValue.replace(/\./g, '').replace(',', '.'));
        
        if (isNaN(number)) return 'R$ 0,00';
        
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(number);
    },
    
    // Validar e-mail
    isValidEmail(email) {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    },
    
    // Validar CPF
    isValidCPF(cpf) {
        cpf = cpf.replace(/[^\d]+/g, '');
        
        if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) {
            return false;
        }
        
        let sum = 0;
        let remainder;
        
        for (let i = 1; i <= 9; i++) {
            sum = sum + parseInt(cpf.substring(i - 1, i)) * (11 - i);
        }
        
        remainder = (sum * 10) % 11;
        if (remainder === 10 || remainder === 11) remainder = 0;
        if (remainder !== parseInt(cpf.substring(9, 10))) return false;
        
        sum = 0;
        for (let i = 1; i <= 10; i++) {
            sum = sum + parseInt(cpf.substring(i - 1, i)) * (12 - i);
        }
        
        remainder = (sum * 10) % 11;
        if (remainder === 10 || remainder === 11) remainder = 0;
        if (remainder !== parseInt(cpf.substring(10, 11))) return false;
        
        return true;
    },
    
    // Validar telefone
    isValidPhone(phone) {
        const cleaned = phone.replace(/\D/g, '');
        return cleaned.length >= 10 && cleaned.length <= 11;
    },
    
    // Gerar ID único
    generateId(prefix = '') {
        const timestamp = Date.now().toString(36);
        const random = Math.random().toString(36).substring(2, 8);
        return `${prefix}${timestamp}${random}`.toUpperCase();
    },
    
    // Copiar para área de transferência
    copyToClipboard(text) {
        navigator.clipboard.writeText(text).then(() => {
            return true;
        }).catch(err => {
            console.error('Erro ao copiar:', err);
            return false;
        });
    },
    
    // Download de arquivo
    downloadFile(filename, content, type = 'text/plain') {
        const blob = new Blob([content], { type });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    },
    
    // Exportar dados
    exportData() {
        const data = JurisFlowDB.exportData();
        const filename = `jurisflow-backup-${new Date().toISOString().split('T')[0]}.json`;
        this.downloadFile(filename, JSON.stringify(data, null, 2), 'application/json');
    },
    
    // Importar dados
    importData(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = function(e) {
                try {
                    const data = JSON.parse(e.target.result);
                    JurisFlowDB.importData(data);
                    resolve(true);
                } catch (error) {
                    reject(new Error('Arquivo inválido'));
                }
            };
            
            reader.onerror = function() {
                reject(new Error('Erro ao ler arquivo'));
            };
            
            reader.readAsText(file);
        });
    },
    
    // Notificação
    showNotification(message, type = 'info', duration = 3000) {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div style="
                position: fixed;
                top: 20px;
                right: 20px;
                background: ${type === 'success' ? '#27ae60' : type === 'error' ? '#e74c3c' : '#3498db'};
                color: white;
                padding: 15px 20px;
                border-radius: 5px;
                box-shadow: 0 5px 15px rgba(0,0,0,0.2);
                z-index: 9999;
                animation: slideIn 0.3s ease;
            ">
                <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
                ${message}
            </div>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, duration);
    },
    
    // Verificar conexão
    checkConnection() {
        return navigator.onLine;
    },
    
    // Carregar template
    async loadTemplate(url) {
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error('Template não encontrado');
            return await response.text();
        } catch (error) {
            console.error('Erro ao carregar template:', error);
            return null;
        }
    }
};

// Adicionar estilos para notificações
const notificationStyles = document.createElement('style');
notificationStyles.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(notificationStyles);

// Disponibilizar globalmente
window.JurisFlowUtils = JurisFlowUtils;