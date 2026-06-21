export function getVietnamDate(inputDate?: Date): Date {
  const d = inputDate || new Date();
  return new Date(d.toLocaleString("en-US", {timeZone: "Asia/Ho_Chi_Minh"}));
}

export function getLocalDateString(inputDate?: Date): string {
  const date = getVietnamDate(inputDate);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getEndOfTodayTimestamp(): number {
  const vnDate = getVietnamDate();
  const year = vnDate.getFullYear();
  const month = vnDate.getMonth();
  const date = vnDate.getDate();
  // 23:59:59.999 in UTC+7 is 16:59:59.999 in UTC
  return Date.UTC(year, month, date, 16, 59, 59, 999);
}
