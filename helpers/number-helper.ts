export function formatNumber(num: number, decimal = 6){
    const fixedNumber = Number(num).toFixed(decimal);
    return new Intl.NumberFormat('en-US', {maximumFractionDigits: decimal}).format(Number(fixedNumber));
}