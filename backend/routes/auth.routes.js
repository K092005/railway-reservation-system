const express = require('express');
const { body } = require('express-validator');
const AuthController = require('../controllers/auth.controller');
const AuthMiddleware = require('../middleware/auth');

const router = express.Router();

router.post('/register', [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('phone').optional().trim()
], AuthController.register);

router.post('/login', [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required')
], AuthController.login);

router.get('/profile', AuthMiddleware.authenticate, AuthController.getProfile);

module.exports = router;
