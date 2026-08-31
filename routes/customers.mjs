import express from 'express';
import { Customer } from '../models.mjs';
import { validateCustomer } from '../validators/customerValidator.mjs';
const router = express.Router();

router.get('/', async (req, res) => {
  const role = req.session && req.session.role;
  if (role === 'customer') {
    return res.redirect('/register');
  }
  if (!role || role !== 'senior') {
    return res.redirect('/register');
  }
  const dbConnected = req.app.get('dbConnected');
  const customers = dbConnected ? await Customer.find().sort({ fullName: 1 }) : req.app.locals.store.customers;
  res.render('customers', { title: 'Customers', pageTitle: 'Customer Registration', customers });
});

router.post('/register-customer', async (req, res) => {
  if (req.session && req.session.role === 'customer') {
    return res.redirect('/book');
  }
  const errors = validateCustomer(req.body);
  if (errors) {
    const customers = req.app.get('dbConnected') ? await Customer.find().sort({ fullName: 1 }) : req.app.locals.store.customers;
    return res.status(400).render('customers', { title: 'Customers', pageTitle: 'Customer Registration', customers, error: errors.join(', ') });
  }
  const dbConnected = req.app.get('dbConnected');
  if (dbConnected) {
    await Customer.create(req.body);
  } else {
    req.app.locals.store.customers.push(req.body);
  }
  res.redirect('/customers');
});

export default router;
