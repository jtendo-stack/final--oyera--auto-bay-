export function validateStock(body) {
  const errors = [];
  if (!body) {
    errors.push('Missing request body');
    return errors;
  }
  if (!body.itemName || String(body.itemName).trim() === '') errors.push('Item name is required');
  if (body.itemName && String(body.itemName).trim().length < 2) errors.push('Item name must be at least 2 characters long');
  if (body.quantity === undefined || body.quantity === null || isNaN(Number(body.quantity))) errors.push('Quantity must be a number');
  if (Number(body.quantity) < 0) errors.push('Quantity cannot be negative');
  if (body.price === undefined || body.price === null || isNaN(Number(body.price))) errors.push('Price must be a number');
  if (Number(body.price) < 0) errors.push('Price cannot be negative');
  return errors.length ? errors : null;
}
