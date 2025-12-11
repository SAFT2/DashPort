const express = require('express');
const User = require('../models/User');
const Product = require('../models/Product');
const Log = require('../models/Log');
const { authMiddleware, adminMiddleware } = require('../middleware/auth.middleware');

const router = express.Router();

// Initialize data
User.init();
Product.init();
Log.init();

// Apply auth middleware to all routes
router.use(authMiddleware);

// @route   GET /api/dashboard/stats
// @desc    Get dashboard statistics
// @access  Private (Admin only)
router.get('/stats', adminMiddleware, async (req, res) => {
  try {
    const [userStats, productStats, recentLogs] = await Promise.all([
      User.getStats(),
      Product.getStats(),
      Log.getRecent(10)
    ]);

    // Calculate revenue (simulated - in real app, this would come from orders)
    const products = await Product.getAll();
    const revenue = products.reduce((sum, product) => {
      // Simulate some sales
      const sales = Math.floor(product.stock * 0.8); // 80% of stock sold
      return sum + (product.price * sales);
    }, 0);

    // Calculate growth (simulated)
    const userGrowth = Math.floor(Math.random() * 20) + 5; // 5-25% growth
    const revenueGrowth = Math.floor(Math.random() * 30) + 10; // 10-40% growth

    res.json({
      success: true,
      data: {
        users: {
          total: userStats.total,
          active: userStats.active,
          admins: userStats.admins,
          growth: userGrowth
        },
        products: {
          total: productStats.total,
          inStock: productStats.inStock,
          categories: productStats.categories,
          totalValue: productStats.totalValue.toFixed(2)
        },
        revenue: {
          total: revenue.toFixed(2),
          growth: revenueGrowth
        },
        activities: recentLogs
      }
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/dashboard/charts
// @desc    Get data for charts
// @access  Private (Admin only)
router.get('/charts', adminMiddleware, async (req, res) => {
  try {
    const products = await Product.getAll();
    const users = await User.getAll();

    // Monthly revenue data (simulated)
    const monthlyRevenue = Array.from({ length: 12 }, (_, i) => {
      const month = new Date(2024, i, 1).toLocaleString('default', { month: 'short' });
      const revenue = Math.floor(Math.random() * 50000) + 10000;
      return { month, revenue };
    });

    // Product categories distribution
    const categoryDistribution = products.reduce((acc, product) => {
      acc[product.category] = (acc[product.category] || 0) + 1;
      return acc;
    }, {});

    // User registration by month (simulated)
    const userRegistrations = Array.from({ length: 12 }, (_, i) => {
      const month = new Date(2024, i, 1).toLocaleString('default', { month: 'short' });
      const count = Math.floor(Math.random() * 20) + 5;
      return { month, count };
    });

    // Top selling products (simulated)
    const topProducts = products
      .slice(0, 5)
      .map(product => ({
        name: product.name,
        sales: Math.floor(product.stock * (0.5 + Math.random() * 0.5))
      }))
      .sort((a, b) => b.sales - a.sales);

    res.json({
      success: true,
      data: {
        monthlyRevenue,
        categoryDistribution: Object.entries(categoryDistribution).map(([name, value]) => ({ name, value })),
        userRegistrations,
        topProducts
      }
    });
  } catch (error) {
    console.error('Get charts data error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/dashboard/activities
// @desc    Get recent activities
// @access  Private
router.get('/activities', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    const logs = await Log.getRecent(limit);

    // Enrich logs with user info
    const enrichedLogs = await Promise.all(logs.map(async log => {
      if (log.userId) {
        const user = await User.getById(log.userId);
        if (user) {
          return {
            ...log,
            user: {
              name: user.name,
              email: user.email,
              role: user.role
            }
          };
        }
      }
      return log;
    }));

    res.json({
      success: true,
      data: enrichedLogs
    });
  } catch (error) {
    console.error('Get activities error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;