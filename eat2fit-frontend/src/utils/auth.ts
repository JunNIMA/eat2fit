// Token在localStorage中的key
const TOKEN_KEY = 'eat2fit_token'

/**
 * 存储token到localStorage
 * @param token 用户token
 */
export const setToken = (token: string): void => {
  localStorage.setItem(TOKEN_KEY, token)
}

/**
 * 从localStorage获取token
 * @returns token字符串，如果不存在则返回null
 */
export const getToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY)
}

/**
 * 从localStorage删除token
 */
export const removeToken = (): void => {
  localStorage.removeItem(TOKEN_KEY)
}

/**
 * 检查是否登录
 * @returns 是否已登录
 */
export const isLoggedIn = (): boolean => {
  return !!getToken()
} 