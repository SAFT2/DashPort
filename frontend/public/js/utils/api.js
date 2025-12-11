class API {
    constructor() {
        this.baseURL = 'http://localhost:5000/api';
        this.token = localStorage.getItem('token');
        this.init();
    }

    init() {
        // Auto-refresh token
        this.setupAutoRefresh();
    }

    setupAutoRefresh() {
        // Refresh token every 30 minutes
        setInterval(() => {
            if (this.token) {
                this.refreshToken();
            }
        }, 30 * 60 * 1000);
    }

    async refreshToken() {
        try {
            const response = await this.post('/auth/refresh');
            if (response.success) {
                this.setToken(response.token);
            }
        } catch (error) {
            console.error('Token refresh failed:', error);
        }
    }

    setToken(token) {
        this.token = token;
        localStorage.setItem('token', token);
    }

    clearToken() {
        this.token = null;
        localStorage.removeItem('token');
    }

    getHeaders() {
        const headers = {
            'Content-Type': 'application/json',
        };

        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }

        return headers;
    }

    async request(endpoint, method = 'GET', data = null) {
        const url = `${this.baseURL}${endpoint}`;
        const options = {
            method,
            headers: this.getHeaders(),
            credentials: 'include'
        };

        if (data) {
            if (data instanceof FormData) {
                delete options.headers['Content-Type'];
                options.body = data;
            } else {
                options.body = JSON.stringify(data);
            }
        }

        try {
            const response = await fetch(url, options);
            const responseData = await response.json();

            if (!response.ok) {
                if (response.status === 401) {
                    // Token expired or invalid
                    this.clearToken();
                    window.location.hash = '#logout';
                }
                throw new Error(responseData.message || `HTTP ${response.status}`);
            }

            return responseData;
        } catch (error) {
            console.error('API Request Error:', error);
            throw error;
        }
    }

    async get(endpoint, params = {}) {
        const queryString = new URLSearchParams(params).toString();
        const url = queryString ? `${endpoint}?${queryString}` : endpoint;
        return this.request(url, 'GET');
    }

    async post(endpoint, data) {
        return this.request(endpoint, 'POST', data);
    }

    async put(endpoint, data) {
        return this.request(endpoint, 'PUT', data);
    }

    async patch(endpoint, data) {
        return this.request(endpoint, 'PATCH', data);
    }

    async delete(endpoint) {
        return this.request(endpoint, 'DELETE');
    }

    async uploadFile(endpoint, file, data = {}) {
        const formData = new FormData();
        formData.append('image', file);
        
        Object.keys(data).forEach(key => {
            formData.append(key, data[key]);
        });

        return this.request(endpoint, 'POST', formData);
    }
}

const api = new API();
window.api = api; // For debugging