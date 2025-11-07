// client/src/utils/format.js
export function formatCoins(value, { minimumFractionDigits = 0 } = {}) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return "0";
  return numeric.toLocaleString(undefined, {
    minimumFractionDigits,
    maximumFractionDigits: minimumFractionDigits > 0 ? minimumFractionDigits : 2,
  });
}
