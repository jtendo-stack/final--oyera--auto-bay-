import express from 'express';
import { Technician } from '../models.mjs';
import { validateTechnician } from '../validators/technicianValidator.mjs';
const router = express.Router();

router.get('/', async (req, res) => {
  const role = req.session && req.session.role;
  if (!role || role !== 'senior') return res.status(403).send('Access denied');
  const dbConnected = req.app.get('dbConnected');
  const technicians = dbConnected ? await Technician.find() : req.app.locals.store.technicians;
  res.render('technicians', { title: 'Technicians', pageTitle: 'Technicians', technicians });
});

router.post('/add-tech', async (req, res) => {
  const role = req.session && req.session.role;
  if (!role || role !== 'senior') return res.status(403).send('Access denied');
  const errors = validateTechnician(req.body);
  if (errors) {
    const technicians = req.app.get('dbConnected') ? await Technician.find() : req.app.locals.store.technicians;
    return res.status(400).render('technicians', { title: 'Technicians', pageTitle: 'Technicians', technicians, error: errors.join(', ') });
  }
  const dbConnected = req.app.get('dbConnected');
  if (dbConnected) {
    await Technician.create(req.body);
  } else {
    req.app.locals.store.technicians.push(req.body);
  }
  res.redirect('/technicians');
});

export default router;
