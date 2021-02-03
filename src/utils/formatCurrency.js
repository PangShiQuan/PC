import { addCommas } from "utils";

export function formatCurrency(amount) {
  return addCommas(amount.toFixed(2));
}
