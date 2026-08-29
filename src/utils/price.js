export function getFormatPrice(valPrice) {
  const num = Number(valPrice ?? 0);
  return num % 1 === 0
    ? num.toLocaleString("en-PH")
    : num.toLocaleString("en-PH", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      });
}

export function getOriginalPrice(originalPrice) {
  const num = Number(originalPrice);
  return !isNaN(num) && num > 0 ? num : 0;
}

export function hasProductDiscount(originalPrice, price) {
  const originalNum = Number(originalPrice);
  const priceNum = Number(price);
  return (
    !isNaN(originalNum) &&
    !isNaN(priceNum) &&
    originalNum > 0 &&
    priceNum > 0 &&
    originalNum > priceNum
  );
}

export function getDiscount(originalPrice, price) {
  const originalNum = Number(originalPrice);
  const priceNum = Number(price);
  if (
    !isNaN(originalNum) &&
    !isNaN(priceNum) &&
    originalNum > 0 &&
    priceNum > 0 &&
    originalNum > priceNum
  ) {
    return Math.round(((originalNum - priceNum) / originalNum) * 100);
  }
  return 0;
}