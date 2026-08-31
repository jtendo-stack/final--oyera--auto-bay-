import express from 'express';
import { Customer } from '../models.mjs';
const router = express.Router();

// Public registration page
router.get('/register', (req, res) => {
  res.render('customer_register', { title: 'Register', pageTitle: 'Register as Customer' });
});

// Handle registration and redirect to booking with prefill
router.post('/register', async (req, res) => {
  const { fullName, phone, carPlate, carModel } = req.body;
  const customerData = { fullName, phone, carPlate, carModel };
  if (req.app.get('dbConnected')) {
    await Customer.updateOne({ carPlate }, { $set: customerData }, { upsert: true });
  } else {
    const exists = req.app.locals.store.customers.find(c => c.carPlate === carPlate);
    if (!exists) req.app.locals.store.customers.push(customerData);
  }
  req.session.role = 'customer';
  req.session.name = fullName || 'Customer';
  req.session.email = req.body.email || '';
  const qs = new URLSearchParams({
    customerName: fullName || '',
    phone: phone || '',
    carPlate: carPlate || '',
    carModel: carModel || '',
    success: '1'
  }).toString();
  res.redirect('/book?' + qs);
});

export default router;
