const { body, param, validationResult } = require('express-validator');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// Employee validation rules
const employeeValidation = [
  body('employee_id')
    .trim()
    .notEmpty().withMessage('Employee ID is required')
    .matches(/^[A-Z0-9]+$/).withMessage('Employee ID must be alphanumeric uppercase'),
  body('employee_name')
    .trim()
    .notEmpty().withMessage('Employee name is required')
    .isLength({ min: 2 }).withMessage('Employee name must be at least 2 characters'),
  body('employee_email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Must be a valid email address'),
  body('department')
    .trim()
    .notEmpty().withMessage('Department is required'),
  body('branch')
    .trim()
    .notEmpty().withMessage('Branch is required'),
  body('manager_id')
    .optional({ nullable: true, checkFalsy: true })
    .trim()
];

// System validation rules
const systemValidation = [
  body('system_id')
    .trim()
    .notEmpty().withMessage('System ID is required')
    .matches(/^[A-Z0-9]+$/).withMessage('System ID must be alphanumeric uppercase'),
  body('system_name')
    .trim()
    .notEmpty().withMessage('System name is required')
    .isLength({ min: 2 }).withMessage('System name must be at least 2 characters'),
  body('description')
    .optional({ nullable: true, checkFalsy: true })
    .trim(),
  body('business_function')
    .trim()
    .notEmpty().withMessage('Business function is required'),
  body('owner_id')
    .trim()
    .notEmpty().withMessage('Owner ID is required')
];

// Role validation rules
const roleValidation = [
  body('role_id')
    .trim()
    .notEmpty().withMessage('Role ID is required')
    .matches(/^[A-Z0-9]+$/).withMessage('Role ID must be alphanumeric uppercase'),
  body('role_name')
    .trim()
    .notEmpty().withMessage('Role name is required'),
  body('system_id')
    .trim()
    .notEmpty().withMessage('System ID is required'),
  body('description')
    .optional({ nullable: true, checkFalsy: true })
    .trim(),
  body('security_level')
    .trim()
    .notEmpty().withMessage('Security level is required')
    .isIn(['Read', 'Write', 'Admin']).withMessage('Security level must be Read, Write, or Admin')
];

// Request validation rules
const requestValidation = [
  body('request_description')
    .trim()
    .notEmpty().withMessage('Request description is required')
    .isLength({ min: 10 }).withMessage('Request description must be at least 10 characters'),
  body('employee_id')
    .trim()
    .notEmpty().withMessage('Employee ID is required'),
  body('items')
    .isArray({ min: 1 }).withMessage('At least one system access must be requested'),
  body('items.*.system_id')
    .trim()
    .notEmpty().withMessage('System ID is required for each item'),
  body('items.*.role_id')
    .trim()
    .notEmpty().withMessage('Role ID is required for each item'),
  body('items.*.business_justification')
    .trim()
    .notEmpty().withMessage('Business justification is required for each item')
    .isLength({ min: 20 }).withMessage('Business justification must be at least 20 characters')
];

// Login validation rules
const loginValidation = [
  body('username')
    .trim()
    .notEmpty().withMessage('Username is required'),
  body('password')
    .notEmpty().withMessage('Password is required')
];

module.exports = {
  validate,
  employeeValidation,
  systemValidation,
  roleValidation,
  requestValidation,
  loginValidation
};

// Made with Bob
