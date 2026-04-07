export const formatCurrency = (value: number, symbol = '$') => {
  return `${symbol}${value.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
};

export const formatPercent = (value: number) => {
  return `${(value * 100).toFixed(2)}%`;
};

export const formatNumber = (value: number) => {
  return value.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

export const getColorClass = (value: number) => {
  if (value > 0) return 'text-green-600';
  if (value < 0) return 'text-red-600';
  return 'text-gray-600';
};

export const getColorBg = (value: number) => {
  if (value > 0) return 'bg-green-50';
  if (value < 0) return 'bg-red-50';
  return 'bg-gray-50';
};
