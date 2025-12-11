class Toast {
    constructor(options = {}) {
        this.options = {
            title: '',
            message: '',
            type: 'info', // info, success, error, warning
            duration: 5000,
            ...options
        };

        this.toast = null;
        this.timeout = null;
        this.init();
    }

    init() {
        this.createToast();
        this.show();
    }

    createToast() {
        this.toast = document.createElement('div');
        this.toast.className = `toast toast-${this.options.type}`;

        // Icon based on type
        const icons = {
            info: 'fas fa-info-circle',
            success: 'fas fa-check-circle',
            error: 'fas fa-exclamation-circle',
            warning: 'fas fa-exclamation-triangle'
        };

        const icon = document.createElement('i');
        icon.className = icons[this.options.type] || icons.info;

        // Content
        const content = document.createElement('div');
        content.className = 'toast-content';

        if (this.options.title) {
            const title = document.createElement('div');
            title.className = 'toast-title';
            title.textContent = this.options.title;
            content.appendChild(title);
        }

        const message = document.createElement('div');
        message.className = 'toast-message';
        message.textContent = this.options.message;
        content.appendChild(message);

        // Close button
        const closeBtn = document.createElement('button');
        closeBtn.className = 'toast-close';
        closeBtn.innerHTML = '<i class="fas fa-times"></i>';
        closeBtn.addEventListener('click', () => this.hide());

        // Assemble toast
        this.toast.appendChild(icon);
        this.toast.appendChild(content);
        this.toast.appendChild(closeBtn);

        // Auto hide
        if (this.options.duration > 0) {
            this.timeout = setTimeout(() => this.hide(), this.options.duration);
        }
    }

    show() {
        const container = this.getContainer();
        container.appendChild(this.toast);
    }

    hide() {
        if (this.timeout) {
            clearTimeout(this.timeout);
        }

        this.toast.style.transform = 'translateX(100%)';
        this.toast.style.opacity = '0';

        setTimeout(() => {
            if (this.toast.parentNode) {
                this.toast.parentNode.removeChild(this.toast);
            }
        }, 300);
    }

    getContainer() {
        let container = document.querySelector('.toast-container');
        if (!container) {
            container = document.createElement('div');
            container.className = 'toast-container';
            document.body.appendChild(container);
        }
        return container;
    }

    static info(message, title = 'Info') {
        return new Toast({ title, message, type: 'info' });
    }

    static success(message, title = 'Success') {
        return new Toast({ title, message, type: 'success' });
    }

    static error(message, title = 'Error') {
        return new Toast({ title, message, type: 'error' });
    }

    static warning(message, title = 'Warning') {
        return new Toast({ title, message, type: 'warning' });
    }
}