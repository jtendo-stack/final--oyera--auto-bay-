import mongoose from 'mongoose';

// In-memory fallback store
export const store = {
  customers: [],
  technicians: [],
  stock: [],
  services: []
};

// Schemas + Models
const customerSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  phone: String,
  email: String,
  carPlate: { type: String, required: true },
  carModel: String
});
export const Customer = mongoose.model('Customer', customerSchema);

const technicianSchema = new mongoose.Schema({
  name: { type: String, required: true },
  skill: String,
  phone: String,
  email: String,
  role: { type: String, default: 'technician' }
});
export const Technician = mongoose.model('Technician', technicianSchema);

const stockSchema = new mongoose.Schema({
  itemName: { type: String, required: true },
  quantity: { type: Number, default: 0 },
  price: { type: Number, default: 0 }
});
export const Stock = mongoose.model('Stock', stockSchema);

const serviceSchema = new mongoose.Schema({
  customerName: String,
  carPlate: String,
  serviceType: String,
  notes: String,
  labourCharge: { type: Number, default: 20000 },
  technician: String,
  date: { type: Date, default: Date.now },
  partsNeeded: [{ name: String, qty: Number, price: Number }],
  partsPurchased: { type: Boolean, default: false },
  status: { type: String, default: 'pending' }
});
export const Service = mongoose.model('Service', serviceSchema);
