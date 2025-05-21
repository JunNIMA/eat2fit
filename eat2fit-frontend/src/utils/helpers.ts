/**
 * 生成简单的UUID
 * 注意：这不是标准UUID，仅用于生成唯一ID
 */
export function generateUUID(): string {
  const timestamp = new Date().getTime().toString(36);
  const randomPart = Math.random().toString(36).substring(2, 8);
  return `${timestamp}-${randomPart}`;
}

/**
 * 简单地格式化日期
 * @param date 日期对象或时间戳
 * @returns 格式化后的日期字符串，格式为YYYY-MM-DD
 */
export function formatDate(date: Date | number): string {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * 将秒数转换为时间格式（分:秒）
 * @param seconds 秒数
 * @returns 格式化后的时间字符串
 */
export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
} 