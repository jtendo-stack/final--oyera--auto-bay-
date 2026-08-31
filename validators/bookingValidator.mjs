export function validateBooking(body) {
  const errors = [];
  if (!body) {
    errors.push('Missing request body');
    return errors;
  }
  if (!body.customerName || String(body.customerName).trim() === '') errors.push('Customer name is required');
  if (body.customerName && String(body.customerName).trim().length < 2) errors.push('Customer name must be at least 2 characters long');
  if (!body.carPlate || String(body.carPlate).trim() === '') errors.push('Car plate is required');
  if (body.carPlate && !/^[A-Z0-9\-\s]+$/i.test(String(body.carPlate).trim())) errors.push('Car plate contains invalid characters');
  if (!body.serviceType || String(body.serviceType).trim() === '') errors.push('Service type is required');
  if (body.phone && !/^[0-9+\s()-]{7,20}$/.test(String(body.phone).trim())) errors.push('Phone number is invalid');
  return errors.length ? errors : null;
}
