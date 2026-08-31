export function validateCustomer(body) {
  const errors = [];
  if (!body) {
    errors.push('Missing request body');
    return errors;
  }
  if (!body.fullName || String(body.fullName).trim() === '') errors.push('Full name is required');
  if (body.fullName && String(body.fullName).trim().length < 2) errors.push('Full name must be at least 2 characters long');
  if (!body.carPlate || String(body.carPlate).trim() === '') errors.push('Car plate is required');
  if (body.carPlate && !/^[A-Z0-9\-\s]+$/i.test(String(body.carPlate).trim())) errors.push('Car plate contains invalid characters');
  if (body.phone && !/^[0-9+\s()-]{7,20}$/.test(String(body.phone).trim())) errors.push('Phone number is invalid');
  if (body.email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(String(body.email).trim())) errors.push('Email is invalid');
  return errors.length ? errors : null;
}
