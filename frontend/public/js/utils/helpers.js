class Helpers {
    static formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    static formatCurrency(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    }

    static truncateText(text, maxLength = 50) {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    }

    static createElement(tag, classes = [], attributes = {}) {
        const element = document.createElement(tag);
        if (classes.length) {
            element.classList.add(...classes);
        }
        Object.keys(attributes).forEach(key => {
            element.setAttribute(key, attributes[key]);
        });
        return element;
    }

    static debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    static validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    static showLoading() {
        document.getElementById('loading').classList.remove('hidden');
    }

    static hideLoading() {
        document.getElementById('loading').classList.add('hidden');
    }

    static getQueryParams() {
        const params = {};
        window.location.hash.substr(1).split('&').forEach(pair => {
            const [key, value] = pair.split('=');
            if (key && value) {
                params[key] = decodeURIComponent(value);
            }
        });
        return params;
    }

    static setQueryParam(key, value) {
        const params = this.getQueryParams();
        params[key] = value;
        const hash = Object.keys(params).map(k => 
            `${k}=${encodeURIComponent(params[k])}`
        ).join('&');
        window.location.hash = hash;
    }
}