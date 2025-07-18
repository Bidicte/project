// import { API_CONFIG } from '../config/api.config';

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public statusText: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export const createApiUrl = (endpoint: string): string => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};

export const handleApiResponse = async <T>(response: Response): Promise<T> => {
  if (!response.ok) {
    const errorText = await response.text();
    throw new ApiError(
      errorText || "Une erreur est survenue",
      response.status,
      response.statusText
    );
  }

  // Handle empty responses (like DELETE)
  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
};

export const createFetchOptions = (
  method: string = "GET",
  body?: object
): RequestInit => {
  const options: RequestInit = {
    method,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    signal: AbortSignal.timeout(API_CONFIG.TIMEOUT),
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  return options;
};

/**
 * Retourne true si les deux périodes [startA, endA] et [startB, endB] se chevauchent (dates incluses)
 */
export function periodesChevauchent(
  startA: string,
  endA: string,
  startB: string,
  endB: string
): boolean {
  return !(endA < startB || endB < startA);
}
