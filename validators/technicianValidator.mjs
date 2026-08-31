export function validateTechnician(body) {
  const errors = [];
  if (!body) {
    errors.push('Missing request body');
    return errors;
  }
  if (!body.name || String(body.name).trim() === '') errors.push('Technician name is required');
  if (body.name && String(body.name).trim().length < 2) errors.push('Technician name must be at least 2 characters long');
  if (body.email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(String(body.email).trim())) errors.push('Email is invalid');
  if (body.phone && !/^[0-9+\s()-]{7,20}$/.test(String(body.phone).trim())) errors.push('Phone number is invalid');
  return errors.length ? errors : null;
}
