import express from 'express';
import { Customer, Service, Stock } from '../models.mjs';
const router = express.Router();

router.get('/admin', async (req, res) => {
  const role = req.session && req.session.role;
  const name = req.session && req.session.name ? String(req.session.name).trim() : '';
  if (!role || role !== 'senior') return res.status(403).send('Access denied');
  if (name.toLowerCase() !== 'kisakye jonathan') return res.status(403).send('Access denied');

  const totalCustomers = req.app.get('dbConnected') ? await Customer.countDocuments() : req.app.locals.store.customers.length;
  const totalServices = req.app.get('dbConnected') ? await Service.countDocuments() : req.app.locals.store.services.length;
  const totalStock = req.app.get('dbConnected') ? await Stock.countDocuments() : req.app.locals.store.stock.length;
  const recentServices = req.app.get('dbConnected')
    ? await Service.find().sort({ date: -1 }).limit(6)
    : [...req.app.locals.store.services].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 6);
  const stock = req.app.get('dbConnected') ? await Stock.find().sort({ itemName: 1 }).limit(5) : [...req.app.locals.store.stock].sort((a, b) => a.itemName.localeCompare(b.itemName)).slice(0, 5);
  const customers = req.app.get('dbConnected') ? await Customer.find().sort({ fullName: 1 }).limit(5) : [...req.app.locals.store.customers].sort((a, b) => (a.fullName || '').localeCompare(b.fullName || '')).slice(0, 5);
  const technicians = req.app.get('dbConnected') ? await (await import('../models.mjs')).Technician.find().sort({ name: 1 }) : req.app.locals.store.technicians;

  res.render('admin', {
    title: 'Senior Technician',
    pageTitle: 'Kisakye Jonathan - Bay Management',
    totalCustomers,
    totalServices,
    totalStock,
    recentServices,
    stock,
    customers,
    technicians
  });
});

export default router;
