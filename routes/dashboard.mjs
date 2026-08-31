import express from 'express';
import { Service } from '../models.mjs';
const router = express.Router();

router.get('/dashboard', async (req, res) => {
  const role = req.session && req.session.role;
  const name = req.session && req.session.name ? String(req.session.name).trim() : '';
  const allowedTechnicians = ['Kwagala Joy', 'Katumba Jordan'];

  if (!role || role !== 'technician') return res.status(403).send('Access denied');
  if (!name) return res.status(403).send('Access denied');
  if (!allowedTechnicians.some((person) => person.toLowerCase() === name.toLowerCase())) return res.status(403).send('Access denied');

  const allServices = req.app.get('dbConnected') ? await Service.find().sort({ date: -1 }) : [...req.app.locals.store.services].sort((a, b) => new Date(b.date) - new Date(a.date));

  const technicianName = req.session && req.session.name ? String(req.session.name).trim() : '';
  const filteredServices = allServices.filter((service) => {
    if (role === 'admin' || role === 'senior') return true;

    const assigned = (service && service.technician ? String(service.technician).trim() : '');
    const serviceType = (service && service.serviceType ? String(service.serviceType).toLowerCase() : '');

    if (technicianName === 'Kwagala Joy') return true;
    if (technicianName === 'Katumba Jordan') {
      return !assigned || assigned === technicianName || /alignment|balance/.test(serviceType);
    }
    if (assigned && assigned === technicianName) return true;
    return !assigned;
  });

  const totalBookings = filteredServices.length;
  const today = new Date();
  const isSameDay = (d1, d2) => d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth() && d1.getDate() === d2.getDate();
  const todayCount = filteredServices.reduce((acc, s) => {
    const sd = s && s.date ? new Date(s.date) : null;
    return sd && isSameDay(sd, today) ? acc + 1 : acc;
  }, 0);
  const pendingCount = filteredServices.filter(s => (s.status || 'pending') === 'pending' || (s.status || 'pending') === 'parts_required').length;
  const inServiceCount = filteredServices.filter(s => (s.status || 'pending') === 'in_service').length;
  const recentServices = filteredServices.slice(0, 6);
  res.render('dashboard', {
    title: 'Technician Dashboard',
    pageTitle: 'Bookings',
    services: filteredServices,
    totalBookings,
    todayCount,
    pendingCount,
    inServiceCount,
    recentServices,
    technicianName
  });
});

export default router;
