export const EXCHANGE_RATE = 53; //To be changed dynamically

export function convertBudget(
  amount: number,
  currency: "TRY" | "EUR"
) {

  if (currency === "EUR") {
    return Math.round(amount / EXCHANGE_RATE);
  }

  return amount;
}

export function convertPrice(
  price: number,
  currency: "TRY" | "EUR"
) {

  if (currency === "EUR") {
    return price / EXCHANGE_RATE;
  }

  return price;
}

export function currencySymbol(
  currency: "TRY" | "EUR"
) {

  return currency === "TRY"
    ? "₺"
    : "€";
}