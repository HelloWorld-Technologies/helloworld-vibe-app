import axios, { AxiosHeaders, type InternalAxiosRequestConfig } from 'axios';
import { Platform } from 'react-native';

import config from '@/config';
import { useAuthStore } from '@/stores/auth-store';

export const http = axios.create({
  baseURL: config.BASE_URL.endsWith('/') ? config.BASE_URL : `${config.BASE_URL}/`,
  timeout: 30_000,
});

function shellQuote(value: string) {
  return `'${value.replace(/'/g, `'\\''`)}'`;
}

function toCurl(request: InternalAxiosRequestConfig) {
  const method = (request.method ?? 'get').toUpperCase();
  const url = http.getUri(request);
  const lines = [`curl --request ${method}`, `--url ${shellQuote(url)}`];

  const headers = AxiosHeaders.from(request.headers).toJSON(true);
  for (const [key, value] of Object.entries(headers)) {
    if (!value || key.toLowerCase() === 'content-length') continue;
    lines.push(`--header ${shellQuote(`${key}: ${value}`)}`);
  }

  if (request.data != null && method !== 'GET' && method !== 'HEAD') {
    const body =
      typeof request.data === 'string' ? request.data : JSON.stringify(request.data);
    if (body) {
      lines.push(`--data-raw ${shellQuote(body)}`);
    }
  }

  return lines.join(' \\\n  ');
}

http.interceptors.request.use((request) => {
  const { token, mobile } = useAuthStore.getState();

  request.headers.mobile = mobile ?? '';
  request.headers.Authorization = token ? `Bearer ${token}` : '';
  request.headers.app = Platform.OS === 'ios' ? 'ios' : 'android';
  request.headers.Origin = config.PUBLIC_URL;

  if (__DEV__ && config.LOG_HTTP_CURL) {
    const url = http.getUri(request);
    console.log(`[HTTP] ${(request.method ?? 'GET').toUpperCase()} ${url}`);
    console.log(toCurl(request));
  }

  return request;
});

http.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().clearSession();
      void import('@/stores/tenant-store').then(({ useTenantStore }) => {
        useTenantStore.getState().clearProfile();
      });
    }
    return Promise.reject(error);
  },
);
