import express from 'express';
import { Service } from '../models.mjs';
const router = express.Router();

// Senior technician assigns parts needed for a service
router.get('/service/:id/parts', async (req, res) => {
  const role = req.session && req.session.role;
  if (!role || !['senior', 'admin'].includes(role)) return res.status(403).send('Access denied');
  const id = req.params.id;
  const dbConnected = req.app.get('dbConnected');
  const service = dbConnected ? await Service.findById(id) : req.app.locals.store.services.find((s, i) => i.toString() === id || s._id == id);
  res.render('service_parts', { title: 'Assign Parts', pageTitle: 'Assign Parts & Oils', service });
});

router.post('/service/:id/parts', async (req, res) => {
  const role = req.session && req.session.role;
  if (!role || !['senior', 'admin'].includes(role)) return res.status(403).send('Access denied');
  const id = req.params.id;
  // expect parts as comma-separated names and qtys in the form
  // e.g. parts=Oil:1,Filter:1 prices optional
  const partsRaw = req.body.parts || '';
  const parts = partsRaw.split(',').map(p => {
    const [nameQty] = [p.trim()];
    const [name, qty] = nameQty.split(':').map(x => x && x.trim());
    return { name: name || '', qty: Number(qty) || 1, price: 0 };
  }).filter(p => p.name);
  const dbConnected = req.app.get('dbConnected');
  if (dbConnected) {
    await Service.findByIdAndUpdate(id, { $set: { partsNeeded: parts, status: 'parts_required', partsPurchased: false } });
  } else {
    const s = req.app.locals.store.services.find((s, i) => i.toString() === id || s._id == id);
    if (s) {
      s.partsNeeded = parts;
      s.status = 'parts_required';
      s.partsPurchased = false;
    }
  }
  res.redirect('/records');
});

// Mark parts purchased and proceed to service
router.post('/service/:id/parts/purchased', async (req, res) => {
  const role = req.session && req.session.role;
  if (!role || !['senior', 'admin', 'technician'].includes(role)) return res.status(403).send('Access denied');
  const id = req.params.id;
  const dbConnected = req.app.get('dbConnected');
  if (dbConnected) {
    await Service.findByIdAndUpdate(id, { $set: { partsPurchased: true, status: 'in_service' } });
  } else {
    const s = req.app.locals.store.services.find((s, i) => i.toString() === id || s._id == id);
    if (s) {
      s.partsPurchased = true;
      s.status = 'in_service';
    }
  }
  res.redirect('/records');
});

export default router;
