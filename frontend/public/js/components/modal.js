class Modal {
    constructor(options = {}) {
        this.options = {
            title: 'Modal',
            content: '',
            showClose: true,
            size: 'md', // sm, md, lg
            onClose: null,
            onConfirm: null,
            confirmText: 'Confirm',
            cancelText: 'Cancel',
            showConfirm: true,
            showCancel: true,
            ...options
        };

        this.modal = null;
        this.overlay = null;
        this.init();
    }

    init() {
        this.createModal();
        this.bindEvents();
    }

    createModal() {
        // Create overlay
        this.overlay = document.createElement('div');
        this.overlay.className = 'modal-overlay';

        // Create modal
        this.modal = document.createElement('div');
        this.modal.className = `modal modal-${this.options.size}`;

        // Modal header
        const header = document.createElement('div');
        header.className = 'modal-header';

        const title = document.createElement('h3');
        title.className = 'modal-title';
        title.textContent = this.options.title;

        header.appendChild(title);

        if (this.options.showClose) {
            const closeBtn = document.createElement('button');
            closeBtn.className = 'modal-close';
            closeBtn.innerHTML = '<i class="fas fa-times"></i>';
            closeBtn.addEventListener('click', () => this.close());
            header.appendChild(closeBtn);
        }

        // Modal body
        const body = document.createElement('div');
        body.className = 'modal-body';

        if (typeof this.options.content === 'string') {
            body.innerHTML = this.options.content;
        } else if (this.options.content instanceof HTMLElement) {
            body.appendChild(this.options.content);
        } else {
            body.textContent = this.options.content;
        }

        // Modal footer
        const footer = document.createElement('div');
        footer.className = 'modal-footer';

        if (this.options.showCancel) {
            const cancelBtn = document.createElement('button');
            cancelBtn.className = 'btn btn-secondary';
            cancelBtn.textContent = this.options.cancelText;
            cancelBtn.addEventListener('click', () => {
                this.close();
                if (typeof this.options.onClose === 'function') {
                    this.options.onClose();
                }
            });
            footer.appendChild(cancelBtn);
        }

        if (this.options.showConfirm) {
            const confirmBtn = document.createElement('button');
            confirmBtn.className = 'btn btn-primary';
            confirmBtn.textContent = this.options.confirmText;
            confirmBtn.addEventListener('click', () => {
                if (typeof this.options.onConfirm === 'function') {
                    this.options.onConfirm();
                }
                this.close();
            });
            footer.appendChild(confirmBtn);
        }

        // Assemble modal
        this.modal.appendChild(header);
        this.modal.appendChild(body);
        if (this.options.showConfirm || this.options.showCancel) {
            this.modal.appendChild(footer);
        }

        // Add to overlay
        this.overlay.appendChild(this.modal);
    }

    bindEvents() {
        // Close on overlay click
        this.overlay.addEventListener('click', (e) => {
            if (e.target === this.overlay) {
                this.close();
                if (typeof this.options.onClose === 'function') {
                    this.options.onClose();
                }
            }
        });

        // Close on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen()) {
                this.close();
                if (typeof this.options.onClose === 'function') {
                    this.options.onClose();
                }
            }
        });
    }

    open() {
        document.body.appendChild(this.overlay);
        setTimeout(() => {
            this.overlay.classList.remove('hidden');
        }, 10);
    }

    close() {
        this.overlay.classList.add('hidden');
        setTimeout(() => {
            if (this.overlay.parentNode) {
                this.overlay.parentNode.removeChild(this.overlay);
            }
        }, 300);
    }

    isOpen() {
        return document.body.contains(this.overlay);
    }

    updateContent(content) {
        const body = this.modal.querySelector('.modal-body');
        body.innerHTML = '';
        
        if (typeof content === 'string') {
            body.innerHTML = content;
        } else if (content instanceof HTMLElement) {
            body.appendChild(content);
        } else {
            body.textContent = content;
        }
    }

    static confirm(options) {
        return new Promise((resolve) => {
            const modal = new Modal({
                ...options,
                onConfirm: () => resolve(true),
                onClose: () => resolve(false)
            });
            modal.open();
        });
    }

    static alert(message, title = 'Alert') {
        const modal = new Modal({
            title,
            content: message,
            showConfirm: true,
            showCancel: false,
            confirmText: 'OK'
        });
        modal.open();
    }
}