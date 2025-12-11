const fs = require('fs').promises;
const path = require('path');
const bcrypt = require('bcryptjs');

class User {
  constructor() {
    this.dataPath = path.join(__dirname, '../../data/users.json');
  }

  async init() {
    try {
      await fs.access(this.dataPath);
    } catch {
      const initialUsers = [
        {
          id: 1,
          username: 'admin',
          email: 'admin@example.com',
          password: await bcrypt.hash('admin123', 10),
          name: 'Administrator',
          role: 'admin',
          status: 'active',
          avatar: null,
          lastLogin: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 2,
          username: 'user1',
          email: 'user1@example.com',
          password: await bcrypt.hash('user123', 10),
          name: 'John Doe',
          role: 'user',
          status: 'active',
          avatar: null,
          lastLogin: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ];
      await this.saveAll(initialUsers);
    }
  }

  async getAll() {
    const data = await fs.readFile(this.dataPath, 'utf8');
    return JSON.parse(data);
  }

  async getById(id) {
    const users = await this.getAll();
    return users.find(user => user.id === id);
  }

  async getByEmail(email) {
    const users = await this.getAll();
    return users.find(user => user.email === email);
  }

  async getByUsername(username) {
    const users = await this.getAll();
    return users.find(user => user.username === username);
  }

  async create(userData) {
    const users = await this.getAll();
    const newId = users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1;
    
    const newUser = {
      id: newId,
      ...userData,
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    users.push(newUser);
    await this.saveAll(users);
    return newUser;
  }

  async update(id, updates) {
    const users = await this.getAll();
    const index = users.findIndex(user => user.id === id);
    
    if (index === -1) return null;

    users[index] = {
      ...users[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    await this.saveAll(users);
    return users[index];
  }

  async delete(id) {
    const users = await this.getAll();
    const filteredUsers = users.filter(user => user.id !== id);
    
    if (filteredUsers.length === users.length) return false;
    
    await this.saveAll(filteredUsers);
    return true;
  }

  async saveAll(users) {
    await fs.writeFile(this.dataPath, JSON.stringify(users, null, 2));
  }

  async getStats() {
    const users = await this.getAll();
    const total = users.length;
    const active = users.filter(u => u.status === 'active').length;
    const admins = users.filter(u => u.role === 'admin').length;
    
    return { total, active, admins };
  }
}

module.exports = new User();