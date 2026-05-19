type Option = { value: string; label: string };

export const buildSelectOptions = (
  values: Array<string | number | null | undefined>,
): Option[] => {
  const normalized = values
    .map((value) => (value == null ? '' : String(value).trim()))
    .filter(Boolean);
  const unique = Array.from(new Set(normalized));

  unique.sort((a, b) =>
    a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }),
  );

  return unique.map((value) => ({ value, label: value }));
};
