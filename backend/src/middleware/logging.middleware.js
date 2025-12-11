const Log = require('../models/Log');

const activityLogger = async (req, res, next) => {
  // Skip logging for certain endpoints
  const skipPaths = ['/api/health', '/api/auth/login'];
  
  if (skipPaths.includes(req.path)) {
    return next();
  }

  const originalSend = res.send;
  const startTime = Date.now();

  res.send = function(body) {
    const duration = Date.now() - startTime;
    
    // Log after response is sent
    process.nextTick(async () => {
      try {
        await Log.create({
          userId: req.user?.id || null,
          action: `${req.method} ${req.path}`,
          method: req.method,
          endpoint: req.path,
          statusCode: res.statusCode,
          userAgent: req.get('User-Agent'),
          ip: req.ip,
          duration: `${duration}ms`
        });
      } catch (error) {
        console.error('Failed to log activity:', error);
      }
    });

    return originalSend.call(this, body);
  };

  next();
};

module.exports = { activityLogger };