export const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('dz-DZ', {
        style: 'currency',
        currency: 'DZD',
        minimumFractionDigits: 2
    }).format(amount);
};

export const formatDate = (date: Date | string) => {
    if (!date) return '-';
    return new Intl.DateTimeFormat('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    }).format(new Date(date));
};

export const formatDateTime = (date: Date | string) => {
    if (!date) return '-';
    return new Intl.DateTimeFormat('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    }).format(new Date(date));
};
