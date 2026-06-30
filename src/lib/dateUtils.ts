export function getVietnamDate(inputDate?: Date): Date {
  const d = inputDate || new Date();
  return new Date(d.toLocaleString("en-US", { timeZone: "Asia/Ho_Chi_Minh" }));
}

export function getLocalDateString(inputDate?: Date): string {
  const date = getVietnamDate(inputDate);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
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

export function formatCreatedAt(
  timestamp?: number,
): { dateStr: string; daysStr: string } | null {
  if (!timestamp) return null;
  const date = getVietnamDate(new Date(timestamp));

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  const dateStr = `${day}/${month}/${year}`;

  const startStr = getLocalDateString(new Date(timestamp));
  const endStr = getLocalDateString();
  const [sy, sm, sd] = startStr.split("-").map(Number);
  const [ey, em, ed] = endStr.split("-").map(Number);
  const dateStart = new Date(sy, sm - 1, sd);
  const dateEnd = new Date(ey, em - 1, ed);
  const diffTime = dateEnd.getTime() - dateStart.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

  let daysStr = "";
  if (diffDays === 0) {
    daysStr = "Hôm nay";
  } else {
    daysStr = `${diffDays} ngày`;
  }

  return { dateStr, daysStr };
}
