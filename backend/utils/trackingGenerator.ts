export const generateTrackingNumber = (): string => {
  const prefix = 'SR';
  const year = new Date().getFullYear();
  const randomLetters = Array.from({ length: 2 }, () =>
    String.fromCharCode(65 + Math.floor(Math.random() * 26))
  ).join('');
  const randomDigits = Math.floor(100000 + Math.random() * 900000);
  return `${prefix}-${year}${randomLetters}-${randomDigits}`;
};

export const calculateShippingCost = (
  weightKg: number,
  parcelType: string,
  baseRate: number = 8.5,
  expressSurcharge: number = 15.0,
  fragileSurcharge: number = 7.5
): number => {
  let cost = Math.max(5.0, weightKg * baseRate);
  if (parcelType === 'express') cost += expressSurcharge;
  if (parcelType === 'fragile') cost += fragileSurcharge;
  if (parcelType === 'heavy') cost += 20.0;
  return Math.round(cost * 100) / 100;
};
