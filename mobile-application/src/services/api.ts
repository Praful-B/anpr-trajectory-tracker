import axios from 'axios';

const API_BASE_URL = 'http://10.0.2.2:8080/api/v1'; // Android emulator localhost

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const setAuthToken = (token: string | null) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
};

export const apiRequest = async <T>(method: string, endpoint: string, data?: any): Promise<T> => {
  const response = await api({
    method,
    url: endpoint,
    data,
  });
  return response.data;
};

export const authApi = {
  register: (data: { fullName: string; email: string; password: string; role?: string }) =>
    apiRequest<{ accessToken: string; refreshToken: string; email: string; role: string }>('post', '/auth/register', data),
  
  login: (data: { email: string; password: string }) =>
    apiRequest<{ accessToken: string; refreshToken: string; email: string; role: string }>('post', '/auth/login', data),
  
  refresh: (refreshToken: string) =>
    apiRequest<{ accessToken: string; refreshToken: string }>('post', '/auth/refresh', refreshToken),
};

export const complaintApi = {
  submit: (data: { plateNumber: string; ownerName: string; proofDocumentRef: string; vehicleMake?: string; vehicleModel?: string; color?: string; stolenDateTime?: string; lastKnownLocation?: string }) =>
    apiRequest<any>('post', '/complaints', data),
  
  getMy: () =>
    apiRequest<any[]>('get', '/complaints/my'),
  
  getById: (id: string) =>
    apiRequest<any>('get', `/complaints/${id}`),
  
  submitFir: (id: string, data: { firReferenceNo: string; firDocumentRef?: string }) =>
    apiRequest<any>('post', `/complaints/${id}/fir`, data),
};

export const deviceApi = {
  register: (data: { deviceId: string; type: string; token: string }) =>
    apiRequest<any>('post', '/devices/register', data),
};

export const hotlistApi = {
  getAll: () =>
    apiRequest<any[]>('get', '/hotlist'),
  
  getById: (id: string) =>
    apiRequest<any>('get', `/hotlist/${id}`),
  
  sync: () =>
    apiRequest<{ timestamp: number; entries: any[] }>('get', '/hotlist/sync'),
  
  verifyFir: (id: string, firReferenceNo: string) =>
    apiRequest<any>('put', `/hotlist/${id}/verify-fir`, firReferenceNo),
  
  markRecovered: (id: string) =>
    apiRequest<any>('put', `/hotlist/${id}/mark-recovered`, {}),
};

export const sightingApi = {
  ingest: (data: { sightings: Array<{ plateNumber: string; latitude: number; longitude: number; timestamp: number; confidence: number; photoBase64?: string }> }) =>
    apiRequest<void>('post', '/sightings/ingest', data),
};
