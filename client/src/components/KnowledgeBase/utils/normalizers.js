export const toRate = (v) => {
  if (v === "" || v === null || v === undefined) return undefined;
  const n = Number(v);
  if (!Number.isFinite(n)) return undefined;
  if (n >= -50 && n <= 50) return Math.round(n);
  if (n > 0 && n < 2)
    return Math.max(-50, Math.min(50, Math.round((n - 1) * 100)));
  return Math.max(-50, Math.min(50, Math.round(n)));
};

export const toPitch = (v) => {
  if (v === "" || v === null || v === undefined) return undefined;
  const n = Number(v);
  if (!Number.isFinite(n)) return undefined;
  return Math.max(-50, Math.min(50, Math.round(n)));
};
