class AdminDashboard {
    constructor() {
        this.currentPage = 'dashboard';
        this.pages = {};
        this.init();
    }

    async init() {
        // Initialize storage
        this.initTheme();
        
        // Check authentication
        await this.checkAuth();
        
        // Initialize pages
        this.initPages();
        
        // Bind events
        this.bindEvents();
        
        // Load initial page
        this.loadPage(this.currentPage);
    }

    initTheme() {
        const savedTheme = Storage.getTheme();
        document.documentElement.setAttribute('data-theme', savedTheme);
        
        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) {
            themeToggle.innerHTML = savedTheme === 'dark' 
                ? '<i class="fas fa-sun"></i>' 
                : '<i class="fas fa-moon"></i>';
        }
    }

    async checkAuth() {
        const token = api.token;
        const user = Storage.getUser();

        if (!token || !user) {
            this.showLogin();
            return;
        }

        try {
            // Verify token by fetching user info
            await api.get('/auth/me');
            this.showApp();
            this.updateUserInfo(user);
        } catch (error) {
            console.error('Auth check failed:', error);
            this.showLogin();
        }
    }

    showLogin() {
        document.getElementById('login-page').classList.remove('hidden');
        document.getElementById('app').classList.add('hidden');
    }

    showApp() {
        document.getElementById('login-page').classList.add('hidden');
        document.getElementById('app').classList.remove('hidden');
    }

    updateUserInfo(user) {
        const userAvatar = document.querySelector('.user-avatar');
        const userName = document.querySelector('.user-name');
        const userRole = document.querySelector('.user-role');

        if (userAvatar) {
            userAvatar.src = user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=4f46e5&color=fff`;
        }
        
        if (userName) {
            userName.textContent = user.name;
        }
        
        if (userRole) {
            userRole.textContent = user.role;
        }
    }

    initPages() {
        this.pages = {
            dashboard: new DashboardPage(),
            users: new UsersPage(),
            products: new ProductsPage(),
            activities: new ActivitiesPage(),
            profile: new ProfilePage()
        };
    }

    async loadPage(pageName) {
        if (!this.pages[pageName]) {
            console.error(`Page ${pageName} not found`);
            return;
        }

        this.currentPage = pageName;
        
        // Update active menu item
        this.updateActiveMenu(pageName);
        
        // Update page title
        this.updatePageTitle(pageName);
        
        // Load page content
        const contentContainer = document.getElementById('page-content');
        if (contentContainer) {
            contentContainer.innerHTML = this.pages[pageName].getContent();
            
            // Initialize page
            await this.pages[pageName].init();
            
            // Bind page events
            this.pages[pageName].bindEvents();
        }
    }

    updateActiveMenu(pageName) {
        const menuItems = document.querySelectorAll('.sidebar-menu li');
        menuItems.forEach(item => {
            item.classList.remove('active');
            if (item.dataset.page === pageName) {
                item.classList.add('active');
            }
        });
    }

    updatePageTitle(pageName) {
        const titleMap = {
            dashboard: 'Dashboard',
            users: 'User Management',
            products: 'Product Management',
            activities: 'Activity Logs',
            profile: 'My Profile',
            settings: 'Settings'
        };

        const titleElement = document.getElementById('page-title');
        if (titleElement) {
            titleElement.textContent = titleMap[pageName] || pageName;
        }
    }

    bindEvents() {
        // Login form
        const loginForm = document.getElementById('login-form');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }

        // Toggle password visibility
        const togglePassword = document.getElementById('toggle-password');
        if (togglePassword) {
            togglePassword.addEventListener('click', () => this.togglePasswordVisibility());
        }

        // Sidebar toggle
        const sidebarToggle = document.getElementById('sidebar-toggle');
        if (sidebarToggle) {
            sidebarToggle.addEventListener('click', () => this.toggleSidebar());
        }

        // Sidebar menu items
        const menuItems = document.querySelectorAll('.sidebar-menu li[data-page]');
        menuItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const page = item.dataset.page;
                this.loadPage(page);
            });
        });

        // Theme toggle
        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => this.toggleTheme());
        }

        // Logout button
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => this.handleLogout());
        }

        // Search functionality
        const searchInput = document.querySelector('.search-box input');
        if (searchInput) {
            searchInput.addEventListener('input', 
                Helpers.debounce((e) => this.handleSearch(e.target.value), 300)
            );
        }
    }

    async handleLogin(e) {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const remember = document.getElementById('remember').checked;

        try {
            Helpers.showLoading();
            
            const response = await api.post('/auth/login', {
                email,
                password
            });

            if (response.success) {
                api.setToken(response.token);
                Storage.setUser(response.user);
                
                if (remember) {
                    localStorage.setItem('remember', 'true');
                }

                Toast.success('Login successful!');
                this.showApp();
                this.updateUserInfo(response.user);
                this.loadPage('dashboard');
            }
        } catch (error) {
            Toast.error(error.message || 'Login failed');
        } finally {
            Helpers.hideLoading();
        }
    }

    togglePasswordVisibility() {
        const passwordInput = document.getElementById('password');
        const toggleIcon = document.querySelector('#toggle-password i');
        
        if (passwordInput.type === 'password') {
            passwordInput.type = 'text';
            toggleIcon.className = 'fas fa-eye-slash';
        } else {
            passwordInput.type = 'password';
            toggleIcon.className = 'fas fa-eye';
        }
    }

    toggleSidebar() {
        const sidebar = document.querySelector('.sidebar');
        sidebar.classList.toggle('collapsed');
    }

    toggleTheme() {
        const currentTheme = Storage.getTheme();
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        Storage.setTheme(newTheme);
        
        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) {
            themeToggle.innerHTML = newTheme === 'dark' 
                ? '<i class="fas fa-sun"></i>' 
                : '<i class="fas fa-moon"></i>';
        }
    }

    async handleLogout() {
        const confirmed = await Modal.confirm({
            title: 'Confirm Logout',
            content: 'Are you sure you want to logout?',
            confirmText: 'Logout',
            cancelText: 'Cancel'
        });

        if (confirmed) {
            try {
                await api.post('/auth/logout');
            } catch (error) {
                // Ignore logout errors
            }

            api.clearToken();
            Storage.clearUser();
            
            Toast.success('Logged out successfully');
            this.showLogin();
            
            // Clear form
            const loginForm = document.getElementById('login-form');
            if (loginForm) {
                loginForm.reset();
            }
        }
    }

    handleSearch(query) {
        if (this.currentPage === 'users') {
            this.pages.users.search(query);
        } else if (this.currentPage === 'products') {
            this.pages.products.search(query);
        }
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const app = new AdminDashboard();
    window.app = app; // For debugging
});