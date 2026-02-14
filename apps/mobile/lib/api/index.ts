import { BACKEND_URL } from "@/constants/config";

/**
 * Base API response interface
 */
export interface ApiResponse<T = any> {
  statusCode: number;
  data: T;
  message: string;
  success: boolean;
}

/**
 * Handle API response and errors
 */
export async function handleResponse<T = any>(
  response: Response
): Promise<ApiResponse<T>> {
  let data;
  try {
    data = await response.json();
    console.log(data);
  } catch (err) {
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return {
      statusCode: response.status,
      data: null as T,
      message: "No content",
      success: true,
    };
  }

  if (!response.ok) {
    throw new Error(data.message || data.error || "Something went wrong");
  }
  return data;
}

/**
 * Make authenticated API request
 */
export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const url = `${BACKEND_URL}${endpoint}`;

  const defaultOptions: RequestInit = {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    credentials: "include", // Important for cookies
    ...options,
  };
  const response = await fetch(url, defaultOptions);
  return handleResponse<T>(response);
}
