/**
 * Chuyển Tiếng Việt có dấu thành không dấu
 * Ví dụ: "Đắc Kỷ" -> "dac ky"
 */
export const convertToUnaccentedString = (str: string): string => {
  if (!str) return "";
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .replace(/[^a-zA-Z0-9 ]/g, "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ");
};


export const createSlug = (str: string): string => {
  return convertToUnaccentedString(str).replace(/\s+/g, "-");
};