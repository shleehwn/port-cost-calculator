export function formatDateTime(value) {
  const digits = value.replace(/\D/g, "").slice(0, 12);

  if (digits.length <= 4) return digits;

  let result = digits.slice(0, 4) + "-";
  result += digits.slice(4, 6);

  if (digits.length > 6) {
    result += "-" + digits.slice(6, 8);
  }

  if (digits.length > 8) {
    result += " " + digits.slice(8, 10);
  }

  if (digits.length > 10) {
    result += ":" + digits.slice(10, 12);
  }

  return result;
}

export function parseDateTime(value) {
  const digits = value.replace(/\D/g, "");

  if (digits.length !== 12) return null;

  const year = Number(digits.slice(0, 4));
  const month = Number(digits.slice(4, 6));
  const day = Number(digits.slice(6, 8));
  const hour = Number(digits.slice(8, 10));
  const minute = Number(digits.slice(10, 12));

  const date = new Date(year, month - 1, day, hour, minute);

  // 잘못된 날짜 자동 보정 방지
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day ||
    date.getHours() !== hour ||
    date.getMinutes() !== minute
  ) {
    return null;
  }

  return date;
}

export function calculateBerthingHours(etb, etd) {
  const start = parseDateTime(etb);
  const end = parseDateTime(etd);

  if (!start || !end) return "";

  const hours = (end.getTime() - start.getTime()) / 3600000;

  return hours >= 0 ? hours : "";
}
