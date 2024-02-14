export function formatNumber(num: number, defaulDigits = 6){
  let digits = defaulDigits;
  if(num < 1 && num > 0){
    const fixNumberStr =  Number(num).toString();
    const firstDigit = fixNumberStr.search(/[1-9]/g);
    if(firstDigit >= defaulDigits + 1){
      digits = defaulDigits + 2;
    }
  }
  const fixedNumber = Number(num).toFixed(digits);
  return new Intl.NumberFormat('en-US', {maximumFractionDigits: digits}).format(Number(fixedNumber));
}