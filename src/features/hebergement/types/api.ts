/* eslint-disable @typescript-eslint/no-explicit-any */
export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface ApiRequestConfig {
  method: "GET" | "POST" | "PUT" | "DELETE"
  headers?: Record<string, string>
  body?: any
}
