const { body, validationResult } = require('express-validator');

const validate = (validations) => {
  return async (req, res, next) => {
    await Promise.all(validations.map(validation => validation.run(req)));

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    res.status(400).json({ errors: errors.array() });
  };
};

const loginValidation = validate([
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty()
]);

const registerValidation = validate([
  body('name').trim().notEmpty().isLength({ min: 2 }),
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('role').optional().isIn(['admin', 'user'])
]);

const userUpdateValidation = validate([
  body('name').optional().trim().isLength({ min: 2 }),
  body('email').optional().isEmail().normalizeEmail(),
  body('status').optional().isIn(['active', 'inactive']),
  body('role').optional().isIn(['admin', 'user'])
]);

const productValidation = validate([
  body('name').trim().notEmpty(),
  body('description').optional().trim(),
  body('price').isFloat({ min: 0 }),
  body('category').trim().notEmpty(),
  body('stock').isInt({ min: 0 })
]);

module.exports = {
  loginValidation,
  registerValidation,
  userUpdateValidation,
  productValidation
};