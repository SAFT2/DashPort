const fs = require('fs').promises;
const path = require('path');

class Log {
  constructor() {
    this.dataPath = path.join(__dirname, '../../data/logs.json');
  }

  async init() {
    try {
      await fs.access(this.dataPath);
    } catch {
      await this.saveAll([]);
    }
  }

  async getAll(limit = 100) {
    try {
      const data = await fs.readFile(this.dataPath, 'utf8');
      const logs = JSON.parse(data);
      return logs.slice(0, limit);
    } catch {
      return [];
    }
  }

  async create(logData) {
    const logs = await this.getAll();
    const newId = logs.length > 0 ? Math.max(...logs.map(l => l.id)) + 1 : 1;
    
    const newLog = {
      id: newId,
      ...logData,
      timestamp: new Date().toISOString()
    };

    logs.unshift(newLog); // Add to beginning for recent first
    if (logs.length > 1000) logs.pop(); // Keep only last 1000 logs
    
    await this.saveAll(logs);
    return newLog;
  }

  async getRecent(limit = 10) {
    const logs = await this.getAll();
    return logs.slice(0, limit);
  }

  async saveAll(logs) {
    await fs.writeFile(this.dataPath, JSON.stringify(logs, null, 2));
  }
}

module.exports = new Log();