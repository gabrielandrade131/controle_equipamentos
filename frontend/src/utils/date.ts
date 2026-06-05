export const getLocalDateInput = () => {
  const now = new Date();
  const timezoneOffset = now.getTimezoneOffset() * 60000;
  return new Date(now.getTime() - timezoneOffset).toISOString().split('T')[0];
};

export const extractDateInput = (value?: string | null, fallbackToday = false) => {
  if (!value) {
    return fallbackToday ? getLocalDateInput() : '';
  }

  return value.includes('T') ? value.split('T')[0] : value;
};

export const formatDatePtBr = (value?: string | null) => {
  const datePart = extractDateInput(value, false);

  if (!datePart) {
    return '';
  }

  const [year, month, day] = datePart.split('-');

  if (!year || !month || !day) {
    const parsed = new Date(String(value));
    return Number.isNaN(parsed.getTime())
      ? String(value)
      : parsed.toLocaleDateString('pt-BR');
  }

  return `${day}/${month}/${year}`;
};
