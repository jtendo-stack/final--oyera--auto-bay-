import express from 'express';
import { Service } from '../models.mjs';
const router = express.Router();

// Customer portal - search bookings by car plate or name
router.get('/customer/portal', (req, res) => {
  if (req.session && req.session.role === 'customer') {
    return res.redirect('/book');
  }
  res.render('customer_portal', { title: 'Customer Portal', pageTitle: 'Customer Portal' });
});

router.post('/customer/portal', async (req, res) => {
  if (req.session && req.session.role === 'customer') {
    return res.redirect('/book');
  }
  const { carPlate, customerName } = req.body;
  const dbConnected = req.app.get('dbConnected');
  let services = [];
  if (dbConnected) {
    const query = {};
    if (carPlate) query.carPlate = carPlate;
    if (customerName) query.customerName = customerName;
    services = await Service.find(query).sort({ date: -1 });
  } else {
    services = (req.app.locals.store.services || []).filter(s => {
      if (carPlate && s.carPlate && s.carPlate.toLowerCase() === carPlate.toLowerCase()) return true;
      if (customerName && s.customerName && s.customerName.toLowerCase() === customerName.toLowerCase()) return true;
      return false;
    });
  }
  res.render('customer_portal', { title: 'Customer Portal', pageTitle: 'Customer Portal', services, carPlate, customerName });
});

export default router;
