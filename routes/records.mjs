import express from 'express';
import { Service } from '../models.mjs';
const router = express.Router();

router.get('/records', async (req, res) => {
  const services = req.app.get('dbConnected') ? await Service.find().sort({ date: -1 }) : [...req.app.locals.store.services].sort((a, b) => new Date(b.date) - new Date(a.date));
  const totalLabour = services.reduce((sum, s) => {
    const charge = Number(s && s.labourCharge);
    return sum + (Number.isFinite(charge) && charge > 0 ? charge : 20000);
  }, 0);
  const completedCount = services.filter(s => (s.status || 'pending') === 'completed').length;
  const pendingCount = services.filter(s => (s.status || 'pending') === 'pending' || (s.status || 'pending') === 'parts_required').length;
  res.render('records', {
    title: 'Records',
    pageTitle: 'All Service Records',
    services,
    totalLabour,
    completedCount,
    pendingCount
  });
});

export default router;
