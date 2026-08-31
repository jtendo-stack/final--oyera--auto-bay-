import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import session from 'express-session';
import dotenv from 'dotenv';
import connectDB from './db.mjs';
import indexRouter from './routes/index.mjs';
import authRouter from './routes/auth.mjs';
import customersRouter from './routes/customers.mjs';
import techniciansRouter from './routes/technicians.mjs';
import bookingRouter from './routes/booking.mjs';
import publicCustomersRouter from './routes/publicCustomers.mjs';
import stockRouter from './routes/stock.mjs';
import recordsRouter from './routes/records.mjs';
import dashboardRouter from './routes/dashboard.mjs';
import adminRouter from './routes/admin.mjs';
import serviceRouter from './routes/service.mjs';
import customerPortalRouter from './routes/customerPortal.mjs';
import { Customer, Technician, Stock, Service, store as modelsStore } from './models.mjs';

dotenv.config();
// global crash handlers to log and keep developer informed
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err && err.stack ? err.stack : err);
});
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err && err.stack ? err.stack : err);
  process.exit(1);
});
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Session setup (simple, for demo). Use a secure secret in production via .env
app.use(session({
  secret: process.env.SESSION_SECRET || 'oyera-secret',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}));

const dbConnected = await connectDB();

// use shared models store
app.locals.store = modelsStore;
app.set('dbConnected', dbConnected);

if (!dbConnected) {
  console.warn('⚠️ Running without MongoDB. Data will be stored in memory only during this session.');
}

// Seed technicians (three requested) if not present
const seedTechnicians = async () => {
  const seed = [
    { name: 'Kwagala Joy', skill: 'Engine, Brakes', phone: '070000001', email: 'kwagala.joy@example.com', role: 'technician' },
    { name: 'Kisakye Jonathan', skill: 'Senior - Parts & Oils', phone: '070000002', email: 'kisakye.jonathan@example.com', role: 'senior' },
    { name: 'Katumba Jordan', skill: 'Alignment, Balance', phone: '070000003', email: 'katumba.jordan@example.com', role: 'technician' }
  ];
  if (dbConnected) {
    for (const t of seed) {
      await Technician.updateOne({ email: t.email }, { $set: t }, { upsert: true });
    }
  } else {
    for (const t of seed) {
      const exists = app.locals.store.technicians.find(x => x.email === t.email || x.name === t.name);
      if (!exists) app.locals.store.technicians.push(t);
    }
  }
};
await seedTechnicians();

const seedSampleData = async () => {
  const sampleCustomers = [
    { fullName: 'Musa Kato', phone: '0772001001', email: 'musa@example.com', carPlate: 'UBB 123A', carModel: 'Toyota Premio' },
    { fullName: 'Sarah Nakitto', phone: '0772001002', email: 'sarah@example.com', carPlate: 'UBG 440M', carModel: 'Honda Fit' },
    { fullName: 'Brian Lubega', phone: '0772001003', email: 'brian@example.com', carPlate: 'UAX 889Z', carModel: 'Nissan Patrol' }
  ];
  const sampleStock = [
    { itemName: 'Engine Oil 5L', quantity: 18, price: 120000 },
    { itemName: 'Brake Pad Set', quantity: 8, price: 180000 },
    { itemName: 'Oil Filter', quantity: 25, price: 30000 },
    { itemName: 'Coolant', quantity: 12, price: 45000 }
  ];
  const sampleServices = [
    { customerName: 'Musa Kato', phone: '0772001001', carPlate: 'UBB 123A', serviceType: 'Engine Oil Change - 20,000 UGX', notes: 'Customer reported warning light after 5,000km.', labourCharge: 20000, technician: 'Kwagala Joy', date: new Date(Date.now() - 86400000), status: 'completed' },
    { customerName: 'Sarah Nakitto', phone: '0772001002', carPlate: 'UBG 440M', serviceType: 'Wheel Alignment - 30,000 UGX', notes: 'Vehicle drifts slightly to the left.', labourCharge: 30000, technician: 'Katumba Jordan', date: new Date(Date.now() - 172800000), status: 'in_service' },
    { customerName: 'Brian Lubega', phone: '0772001003', carPlate: 'UAX 889Z', serviceType: 'Brake Pads Change - 20,000 UGX', notes: 'Brake pulsation at 80 km/h.', labourCharge: 20000, technician: 'Kisakye Jonathan', date: new Date(Date.now() - 259200000), status: 'parts_required' }
  ];

  if (dbConnected) {
    for (const customer of sampleCustomers) {
      await Customer.updateOne({ carPlate: customer.carPlate }, { $set: customer }, { upsert: true });
    }
    for (const stockItem of sampleStock) {
      await Stock.updateOne({ itemName: stockItem.itemName }, { $set: stockItem }, { upsert: true });
    }
    for (const service of sampleServices) {
      await Service.updateOne({ carPlate: service.carPlate, date: service.date }, { $set: service }, { upsert: true });
    }
  } else {
    for (const customer of sampleCustomers) {
      if (!app.locals.store.customers.some(entry => entry.carPlate === customer.carPlate)) app.locals.store.customers.push(customer);
    }
    for (const stockItem of sampleStock) {
      if (!app.locals.store.stock.some(entry => entry.itemName === stockItem.itemName)) app.locals.store.stock.push(stockItem);
    }
    for (const service of sampleServices) {
      if (!app.locals.store.services.some(entry => entry.carPlate === service.carPlate && entry.serviceType === service.serviceType)) app.locals.store.services.push(service);
    }
  }
};
await seedSampleData();

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));

// Helper middleware: pass user role to views
app.use((req, res, next) => {
  res.locals.userRole = req.session && req.session.role ? req.session.role : null;
  res.locals.userName = req.session && req.session.name ? req.session.name : null;
  next();
});

// Role guard middleware
const ensureRole = (allowedRoles) => (req, res, next) => {
  const role = req.session && req.session.role;
  if (!role || (Array.isArray(allowedRoles) && !allowedRoles.includes(role))) {
    return res.status(403).send('Access denied');
  }
  next();
};

// models are imported from models.mjs

// ===== ROUTES =====
// mount routers
app.use('/', indexRouter);
app.use('/', authRouter);
app.use('/', publicCustomersRouter);
app.use('/', bookingRouter);
app.use('/', stockRouter);
app.use('/', recordsRouter);
app.use('/', dashboardRouter);
app.use('/', adminRouter);
app.use('/customers', customersRouter);
app.use('/technicians', techniciansRouter);
app.use('/', customerPortalRouter);
app.use('/', serviceRouter);



const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => console.log(`✅ Server running: http://localhost:${PORT}`));

server.on('error', (err) => {
  if (err && err.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} already in use. Kill the process using that port or set a different PORT environment variable.`);
  } else {
    console.error('Server error:', err && err.stack ? err.stack : err);
  }
  process.exit(1);
});

process.on('SIGINT', () => {
  console.log('Shutting down server...');
  server.close(() => process.exit(0));
});

