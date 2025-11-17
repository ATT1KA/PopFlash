import axios, { type AxiosInstance, type AxiosRequestConfig } from 'axios';

export const createHttpClient = (baseURL: string, timeout: number): AxiosInstance =>
  axios.create({
    baseURL,
    timeout,
    headers: {
      'Content-Type': 'application/json',
    },
  });

export const get = async <T>(client: AxiosInstance, url: string, config?: AxiosRequestConfig) => {
  const response = await client.get<T>(url, config);
  return response.data;
};

export const post = async <T>(
  client: AxiosInstance,
  url: string,
  data?: unknown,
  config?: AxiosRequestConfig,
) => {
  const response = await client.post<T>(url, data, config);
  return response.data;
};

export const del = async <T>(client: AxiosInstance, url: string, config?: AxiosRequestConfig) => {
  const response = await client.delete<T>(url, config);
  return response.data;
};
