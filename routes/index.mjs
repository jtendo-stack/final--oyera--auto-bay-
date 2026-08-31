import express from 'express';
import { Service, Customer, Stock } from '../models.mjs';
const router = express.Router();

router.get('/', async (req, res) => {
  const dbConnected = req.app.get('dbConnected');
  const totalCustomers = dbConnected ? await Customer.countDocuments() : (req.app.locals.store.customers.length || 0);
  const totalServices = dbConnected ? await Service.countDocuments() : (req.app.locals.store.services.length || 0);
  const totalStock = dbConnected ? await Stock.countDocuments() : (req.app.locals.store.stock.length || 0);
  const recentServices = dbConnected
    ? await Service.find().sort({ date: -1 }).limit(3).lean()
    : [...req.app.locals.store.services].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 3);

  res.render('index', {
    title: 'Dashboard',
    pageTitle: 'Oyera Auto Service Bay',
    totalCustomers,
    totalServices,
    totalStock,
    recentServices
  });
});

export default router;
