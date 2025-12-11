const fs = require('fs').promises;
const path = require('path');

class Product {
  constructor() {
    this.dataPath = path.join(__dirname, '../../data/products.json');
  }

  async init() {
    try {
      await fs.access(this.dataPath);
    } catch {
      const initialProducts = [
        {
          id: 1,
          name: 'Wireless Headphones',
          description: 'High-quality wireless headphones with noise cancellation',
          price: 199.99,
          category: 'Electronics',
          stock: 50,
          image: 'product1.jpg',
          status: 'in_stock',
          sku: 'ELEC-001',
          rating: 4.5,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 2,
          name: 'Office Chair',
          description: 'Ergonomic office chair with lumbar support',
          price: 299.99,
          category: 'Furniture',
          stock: 25,
          image: 'product2.jpg',
          status: 'in_stock',
          sku: 'FURN-001',
          rating: 4.2,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 3,
          name: 'Coffee Maker',
          description: 'Automatic coffee maker with timer',
          price: 89.99,
          category: 'Home Appliances',
          stock: 0,
          image: 'product3.jpg',
          status: 'out_of_stock',
          sku: 'HOME-001',
          rating: 4.7,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ];
      await this.saveAll(initialProducts);
    }
  }

  async getAll() {
    const data = await fs.readFile(this.dataPath, 'utf8');
    return JSON.parse(data);
  }

  async getById(id) {
    const products = await this.getAll();
    return products.find(product => product.id === id);
  }

  async create(productData) {
    const products = await this.getAll();
    const newId = products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1;
    
    const newProduct = {
      id: newId,
      ...productData,
      status: productData.stock > 0 ? 'in_stock' : 'out_of_stock',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    products.push(newProduct);
    await this.saveAll(products);
    return newProduct;
  }

  async update(id, updates) {
    const products = await this.getAll();
    const index = products.findIndex(product => product.id === id);
    
    if (index === -1) return null;

    // Update status based on stock
    if (updates.stock !== undefined) {
      updates.status = updates.stock > 0 ? 'in_stock' : 'out_of_stock';
    }

    products[index] = {
      ...products[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    await this.saveAll(products);
    return products[index];
  }

  async delete(id) {
    const products = await this.getAll();
    const filteredProducts = products.filter(product => product.id !== id);
    
    if (filteredProducts.length === products.length) return false;
    
    await this.saveAll(filteredProducts);
    return true;
  }

  async saveAll(products) {
    await fs.writeFile(this.dataPath, JSON.stringify(products, null, 2));
  }

  async getStats() {
    const products = await this.getAll();
    const total = products.length;
    const inStock = products.filter(p => p.status === 'in_stock').length;
    const categories = [...new Set(products.map(p => p.category))];
    const totalValue = products.reduce((sum, p) => sum + (p.price * p.stock), 0);
    
    return { total, inStock, categories: categories.length, totalValue };
  }
}

module.exports = new Product();