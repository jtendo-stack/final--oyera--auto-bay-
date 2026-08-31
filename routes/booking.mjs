import express from 'express';
import { Service, Customer, Technician } from '../models.mjs';
import { validateBooking } from '../validators/bookingValidator.mjs';
import sendMail from '../utils/mailer.mjs';
const router = express.Router();

const calculateLabourCharge = (serviceType = '') => {
  const type = String(serviceType || '').toLowerCase();
  if (/alignment/.test(type)) return 30000;
  if (/balance/.test(type)) return 20000;
  if (/oil/.test(type) || /brake/.test(type) || /gear/.test(type) || /greasing/.test(type) || /repair/.test(type)) return 20000;
  return 20000;
};

router.get('/booking', async (req, res) => {
  if (req.session && req.session.role === 'customer') {
    return res.redirect('/book');
  }
  const dbConnected = req.app.get('dbConnected');
  const technicians = dbConnected ? await Technician.find() : req.app.locals.store.technicians;
  const customers = dbConnected ? await Customer.find() : req.app.locals.store.customers;
  res.render('booking', { title: 'New Service', pageTitle: 'New Service Record', technicians, customers });
});

router.post('/add-service', async (req, res) => {
  if (req.session && req.session.role === 'customer') {
    return res.redirect('/book');
  }
  const errors = validateBooking(req.body);
  if (errors) {
    const technicians = req.app.get('dbConnected') ? await Technician.find() : req.app.locals.store.technicians;
    const customers = req.app.get('dbConnected') ? await Customer.find() : req.app.locals.store.customers;
    return res.status(400).render('booking', { title: 'New Service', pageTitle: 'New Service Record', technicians, customers, error: errors.join(', ') });
  }

  const labour = calculateLabourCharge(req.body.serviceType);

  const serviceData = { ...req.body, labourCharge: labour, date: new Date() };
  if (req.app.get('dbConnected')) {
    await Service.create(serviceData);
  } else {
    req.app.locals.store.services.unshift(serviceData);
  }
  res.redirect('/records');
});

router.get('/receipt', async (req, res) => {
  const serviceId = req.query.serviceId;
  if (!serviceId) {
    return res.status(404).render('receipt', { title: 'Receipt', pageTitle: 'Service Receipt', service: null });
  }

  let service = null;
  const dbConnected = req.app.get('dbConnected');
  if (dbConnected) {
    service = await Service.findById(serviceId);
  } else {
    service = req.app.locals.store.services.find(item => String(item._id || item.id || '') === String(serviceId));
  }

  if (!service) {
    return res.status(404).render('receipt', { title: 'Receipt', pageTitle: 'Service Receipt', service: null });
  }

  res.render('receipt', { title: 'Receipt', pageTitle: 'Service Receipt', service });
});

// Public booking
router.get('/book', async (req, res) => {
  const technicians = req.app.get('dbConnected') ? await Technician.find() : req.app.locals.store.technicians;
  const prefill = {
    customerName: req.query.customerName || '',
    phone: req.query.phone || '',
    carPlate: req.query.carPlate || '',
    carModel: req.query.carModel || ''
  };
  const showSuccess = req.query.success === '1';
  res.render('customer_booking', { title: 'Book Service', pageTitle: 'Book a Service', technicians, prefill, showSuccess });
});

router.post('/book', async (req, res) => {
  const { customerName, phone, carPlate, carModel, serviceType, technician, notes } = req.body;
  const errors = validateBooking(req.body);
  if (errors) {
    const technicians = req.app.get('dbConnected') ? await Technician.find() : req.app.locals.store.technicians;
    return res.status(400).render('customer_booking', { title: 'Book Service', pageTitle: 'Book a Service', technicians, prefill: { customerName, phone, carPlate, carModel }, error: errors.join(', ') });
  }
  const customerData = { fullName: customerName, phone, carPlate, carModel };
  if (req.body.email) customerData.email = req.body.email;
  if (req.app.get('dbConnected')) {
    await Customer.updateOne({ carPlate }, { $set: customerData }, { upsert: true });
  } else {
    const exists = req.app.locals.store.customers.find(c => c.carPlate === carPlate);
    if (!exists) req.app.locals.store.customers.push(customerData);
  }

  const labour = calculateLabourCharge(serviceType);

  const serviceData = { customerName, phone, carPlate, serviceType, notes, labourCharge: labour, technician, date: new Date() };
  let savedService;
  if (req.app.get('dbConnected')) {
    savedService = await Service.create(serviceData);
  } else {
    req.app.locals.store.services.unshift(serviceData);
    savedService = serviceData;
  }
  // Render receipt page
  res.render('receipt', { title: 'Receipt', pageTitle: 'Service Receipt', service: savedService });

  // Attempt to email receipt to customer if email provided
  const emailTo = req.body.email || (req.app.get('dbConnected') ? (await Customer.findOne({ carPlate }))?.email : undefined) || process.env.DEFAULT_RECEIPT_EMAIL;
  if (emailTo) {
    req.app.render('email_receipt', { service: savedService }, async (err, html) => {
      if (err) return console.error('Render email template error', err);
      try {
        const ok = await sendMail({ to: emailTo, subject: 'Your Service Receipt', html });
        if (!ok) console.log('Email not sent (mailer not configured)');
      } catch (e) {
        console.error('Error sending receipt email', e);
      }
    });
  }
});

export default router;
