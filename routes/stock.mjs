import express from 'express';
import { Stock } from '../models.mjs';
import { validateStock } from '../validators/stockValidator.mjs';
const router = express.Router();

router.get('/stock', async (req, res) => {
  const role = req.session && req.session.role;
  if (!role || role !== 'senior') return res.status(403).send('Access denied');
  const stock = req.app.get('dbConnected') ? await Stock.find().sort({ itemName: 1 }) : [...req.app.locals.store.stock].sort((a, b) => a.itemName.localeCompare(b.itemName));
  res.render('stock', { title: 'Stock', pageTitle: 'Parts & Stock Management', stock });
});

router.post('/add-stock', async (req, res) => {
  const role = req.session && req.session.role;
  if (!role || role !== 'senior') return res.status(403).send('Access denied');
  const errors = validateStock(req.body);
  if (errors) {
    const stock = req.app.get('dbConnected') ? await Stock.find().sort({ itemName: 1 }) : [...req.app.locals.store.stock].sort((a, b) => a.itemName.localeCompare(b.itemName));
    return res.status(400).render('stock', { title: 'Stock', pageTitle: 'Parts & Stock Management', stock, error: errors.join(', ') });
  }
  if (req.app.get('dbConnected')) {
    await Stock.create(req.body);
  } else {
    req.app.locals.store.stock.push({
      itemName: req.body.itemName,
      quantity: Number(req.body.quantity) || 0,
      price: Number(req.body.price) || 0
    });
  }
  res.redirect('/stock');
});

export default router;
