export function getFormatPrice(valPrice) {
    const num = Number(valPrice ?? 0);
    return num % 1 === 0
        ? num.toLocaleString("en-PH")
        : num.toLocaleString("en-PH", {
            minimumFractionDigits: 0,
            maximumFractionDigits: 2,
        });
}

export function getOriginalPrice(price) {
    const num = Number(price ?? 0);
    return num * 1.12;
}

export function getDiscount(price) {
    const originalNum = Number(getOriginalPrice(price) ?? 0);
    const priceNum = Number(price ?? 0);
    return Math.round(((originalNum - priceNum) / originalNum) * 100);
}