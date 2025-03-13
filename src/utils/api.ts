/**
 * Helper function to handle API requests
 */
export async function fetcher<T>(
  url: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(url, {
    ...options,
    headers: {
      ...options?.headers,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Helper function for making GET requests
 */
export function get<T>(url: string): Promise<T> {
  return fetcher<T>(url);
}

/**
 * Helper function for making POST requests
 */
export function post<T>(url: string, data: any): Promise<T> {
  return fetcher<T>(url, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

/**
 * Helper function for making PUT requests
 */
export function put<T>(url: string, data: any): Promise<T> {
  return fetcher<T>(url, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

/**
 * Helper function for making DELETE requests
 */
export function del<T>(url: string): Promise<T> {
  return fetcher<T>(url, {
    method: "DELETE",
  });
}