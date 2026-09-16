function formatRupiah(value) {
  if (typeof value === 'string' && isNaN(value)) {
    return value; // Preserve exact string for inquiry items like "from Rp 12.500.000"
  }
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(value);
}

window.formatRupiah = formatRupiah;
