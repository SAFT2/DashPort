class DashboardPage {
    constructor() {
        this.charts = {};
        this.init();
    }

    async init() {
        await this.loadStats();
        await this.loadCharts();
        await this.loadActivities();
    }

    async loadStats() {
        try {
            const response = await api.get('/dashboard/stats');
            
            if (response.success) {
                const { users, products, revenue, activities } = response.data;
                
                // Update stats cards
                this.updateStatCard('users-stat', {
                    value: users.total,
                    label: 'Total Users',
                    trend: users.growth,
                    icon: 'users'
                });

                this.updateStatCard('products-stat', {
                    value: products.total,
                    label: 'Total Products',
                    trend: 12, // Example growth
                    icon: 'products'
                });

                this.updateStatCard('revenue-stat', {
                    value: `$${revenue.total}`,
                    label: 'Total Revenue',
                    trend: revenue.growth,
                    icon: 'revenue'
                });

                this.updateStatCard('activities-stat', {
                    value: activities.length,
                    label: 'Recent Activities',
                    trend: 8, // Example growth
                    icon: 'activities'
                });
            }
        } catch (error) {
            console.error('Failed to load stats:', error);
            Toast.error('Failed to load dashboard statistics');
        }
    }

    updateStatCard(id, data) {
        const card = document.getElementById(id);
        if (!card) return;

        const valueEl = card.querySelector('.stat-value');
        const labelEl = card.querySelector('.stat-label');
        const trendEl = card.querySelector('.stat-trend');

        if (valueEl) valueEl.textContent = data.value;
        if (labelEl) labelEl.textContent = data.label;
        
        if (trendEl) {
            const trendClass = data.trend >= 0 ? 'trend-up' : 'trend-down';
            const icon = data.trend >= 0 ? 'fas fa-arrow-up' : 'fas fa-arrow-down';
            trendEl.innerHTML = `
                <i class="${icon}"></i>
                <span>${Math.abs(data.trend)}%</span>
            `;
            trendEl.className = `stat-trend ${trendClass}`;
        }
    }

    async loadCharts() {
        try {
            const response = await api.get('/dashboard/charts');
            
            if (response.success) {
                this.createRevenueChart(response.data.monthlyRevenue);
                this.createCategoryChart(response.data.categoryDistribution);
                this.createTopProductsChart(response.data.topProducts);
            }
        } catch (error) {
            console.error('Failed to load charts:', error);
            Toast.error('Failed to load chart data');
        }
    }

    createRevenueChart(data) {
        const ctx = document.getElementById('revenue-chart');
        if (!ctx) return;

        if (this.charts.revenue) {
            this.charts.revenue.destroy();
        }

        this.charts.revenue = new Chart(ctx, {
            type: 'line',
            data: {
                labels: data.map(d => d.month),
                datasets: [{
                    label: 'Revenue',
                    data: data.map(d => d.revenue),
                    borderColor: '#4f46e5',
                    backgroundColor: 'rgba(79, 70, 229, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)'
                        },
                        ticks: {
                            callback: value => `$${value.toLocaleString()}`
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        }
                    }
                }
            }
        });
    }

    createCategoryChart(data) {
        const ctx = document.getElementById('category-chart');
        if (!ctx) return;

        if (this.charts.category) {
            this.charts.category.destroy();
        }

        const colors = [
            '#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
            '#06b6d4', '#84cc16', '#f97316', '#ec4899', '#64748b'
        ];

        this.charts.category = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: data.map(d => d.name),
                datasets: [{
                    data: data.map(d => d.value),
                    backgroundColor: colors.slice(0, data.length),
                    borderWidth: 1,
                    borderColor: 'rgba(255, 255, 255, 0.1)'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'right',
                        labels: {
                            padding: 20,
                            usePointStyle: true,
                            pointStyle: 'circle'
                        }
                    }
                }
            }
        });
    }

    createTopProductsChart(data) {
        const ctx = document.getElementById('products-chart');
        if (!ctx) return;

        if (this.charts.products) {
            this.charts.products.destroy();
        }

        this.charts.products = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: data.map(d => d.name),
                datasets: [{
                    label: 'Sales',
                    data: data.map(d => d.sales),
                    backgroundColor: 'rgba(16, 185, 129, 0.8)',
                    borderColor: '#10b981',
                    borderWidth: 1,
                    borderRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)'
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        }
                    }
                }
            }
        });
    }

    async loadActivities() {
        try {
            const response = await api.get('/dashboard/activities', { limit: 10 });
            
            if (response.success) {
                this.renderActivities(response.data);
            }
        } catch (error) {
            console.error('Failed to load activities:', error);
            Toast.error('Failed to load activities');
        }
    }

    renderActivities(activities) {
        const container = document.getElementById('activities-list');
        if (!container) return;

        container.innerHTML = '';

        if (activities.length === 0) {
            container.innerHTML = `
                <div class="no-data">
                    <i class="fas fa-history"></i>
                    <p>No activities found</p>
                </div>
            `;
            return;
        }

        activities.forEach(activity => {
            const activityEl = this.createActivityElement(activity);
            container.appendChild(activityEl);
        });
    }

    createActivityElement(activity) {
        const div = document.createElement('div');
        div.className = 'activity-item';

        const icon = this.getActivityIcon(activity.action);
        const time = Helpers.formatDate(activity.timestamp);
        const user = activity.user ? `${activity.user.name} (${activity.user.role})` : 'System';

        div.innerHTML = `
            <div class="activity-icon">
                <i class="${icon}"></i>
            </div>
            <div class="activity-content">
                <div class="activity-title">${activity.action}</div>
                <div class="activity-meta">
                    <span class="activity-user">${user}</span>
                    <span class="activity-time">${time}</span>
                </div>
                <div class="activity-details">
                    <span class="badge">${activity.method}</span>
                    <span class="badge status-${activity.statusCode >= 400 ? 'error' : 'success'}">
                        ${activity.statusCode}
                    </span>
                    <span class="activity-duration">${activity.duration}</span>
                </div>
            </div>
        `;

        return div;
    }

    getActivityIcon(action) {
        if (action.includes('GET')) return 'fas fa-eye';
        if (action.includes('POST')) return 'fas fa-plus';
        if (action.includes('PUT') || action.includes('PATCH')) return 'fas fa-edit';
        if (action.includes('DELETE')) return 'fas fa-trash';
        return 'fas fa-info-circle';
    }

    getContent() {
        return `
            <div class="dashboard-page">
                <div class="stats-grid">
                    <div class="stat-card" id="users-stat">
                        <div class="stat-header">
                            <div class="stat-icon users">
                                <i class="fas fa-users"></i>
                            </div>
                            <div class="stat-trend trend-up">
                                <i class="fas fa-arrow-up"></i>
                                <span>12%</span>
                            </div>
                        </div>
                        <div class="stat-value">0</div>
                        <div class="stat-label">Total Users</div>
                    </div>
                    
                    <div class="stat-card" id="products-stat">
                        <div class="stat-header">
                            <div class="stat-icon products">
                                <i class="fas fa-box"></i>
                            </div>
                            <div class="stat-trend trend-up">
                                <i class="fas fa-arrow-up"></i>
                                <span>8%</span>
                            </div>
                        </div>
                        <div class="stat-value">0</div>
                        <div class="stat-label">Total Products</div>
                    </div>
                    
                    <div class="stat-card" id="revenue-stat">
                        <div class="stat-header">
                            <div class="stat-icon revenue">
                                <i class="fas fa-dollar-sign"></i>
                            </div>
                            <div class="stat-trend trend-up">
                                <i class="fas fa-arrow-up"></i>
                                <span>24%</span>
                            </div>
                        </div>
                        <div class="stat-value">$0</div>
                        <div class="stat-label">Total Revenue</div>
                    </div>
                    
                    <div class="stat-card" id="activities-stat">
                        <div class="stat-header">
                            <div class="stat-icon activities">
                                <i class="fas fa-history"></i>
                            </div>
                            <div class="stat-trend trend-up">
                                <i class="fas fa-arrow-up"></i>
                                <span>5%</span>
                            </div>
                        </div>
                        <div class="stat-value">0</div>
                        <div class="stat-label">Recent Activities</div>
                    </div>
                </div>
                
                <div class="charts-container">
                    <div class="chart-card">
                        <div class="chart-header">
                            <h4>Monthly Revenue</h4>
                        </div>
                        <div class="chart-container">
                            <canvas id="revenue-chart"></canvas>
                        </div>
                    </div>
                    
                    <div class="chart-card">
                        <div class="chart-header">
                            <h4>Product Categories</h4>
                        </div>
                        <div class="chart-container">
                            <canvas id="category-chart"></canvas>
                        </div>
                    </div>
                </div>
                
                <div class="chart-card">
                    <div class="chart-header">
                        <h4>Top Products</h4>
                    </div>
                    <div class="chart-container">
                        <canvas id="products-chart"></canvas>
                    </div>
                </div>
                
                <div class="table-container">
                    <div class="table-header">
                        <h4>Recent Activities</h4>
                        <button class="btn btn-secondary" id="refresh-activities">
                            <i class="fas fa-sync-alt"></i> Refresh
                        </button>
                    </div>
                    <div class="activities-list" id="activities-list">
                        <!-- Activities will be loaded here -->
                    </div>
                </div>
            </div>
        `;
    }

    bindEvents() {
        // Refresh activities button
        const refreshBtn = document.getElementById('refresh-activities');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => this.loadActivities());
        }
    }
}