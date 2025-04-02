import dayjs from "dayjs";

export const formatDate = (date: string | number | Date) => {
  return date ? dayjs(date).format("YYYY-MM-DD") : "";
};

export const formatMoney = (amount: number | string | null) => {
  if (amount === null || amount === undefined) {
    return "";
  }
  const numAmount = Number(amount);
  return isNaN(numAmount) ? "" : `￥${numAmount}`;
};
