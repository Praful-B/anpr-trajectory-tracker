import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api/v1';

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

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  email: string;
  role: string;
}

export const authApi = {
  login: (data: { email: string; password: string }) =>
    api.post<AuthResponse>('/auth/login', data).then(res => res.data),
  
  refresh: (refreshToken: string) =>
    api.post<AuthResponse>('/auth/refresh', refreshToken).then(res => res.data),
};

export interface HotlistEntry {
  id: string;
  plateNumber: string;
  complaintId: string;
  status: string;
  addedAt: string;
  firDeadline: string;
  firReferenceNo: string;
  cooldownUntil: string | null;
  lastSeenLat: string | null;
  lastSeenLng: string | null;
  lastSeenAt: string | null;
}

export const hotlistApi = {
  getAll: () => api.get<HotlistEntry[]>('/hotlist').then(res => res.data),
  getById: (id: string) => api.get<HotlistEntry>(`/hotlist/${id}`).then(res => res.data),
  verifyFir: (id: string, firReferenceNo: string) =>
    api.put<HotlistEntry>(`/hotlist/${id}/verify-fir`, firReferenceNo).then(res => res.data),
  markRecovered: (id: string) =>
    api.put<HotlistEntry>(`/hotlist/${id}/mark-recovered`, {}).then(res => res.data),
};

export interface Sighting {
  id: string;
  hotlistId: string;
  deviceId: string;
  latitude: number;
  longitude: number;
  capturedAt: string;
  confidence: number;
  photoStorageRef: string | null;
}

export const sightingApi = {
  getAll: () => api.get<Sighting[]>('/cop/sightings').then(res => res.data),
  getByPlate: (plateNumber: string) => 
    api.get<Sighting[]>(`/cop/sightings/plate/${plateNumber}`).then(res => res.data),
};

export interface AuditLog {
  id: string;
  actorId: string;
  role: string;
  action: string;
  targetEntity: string;
  timestamp: string;
  ipAddress: string;
}

export const auditApi = {
  getRecent: (limit: number = 50) =>
    api.get<AuditLog[]>('/cop/audit?limit=' + limit).then(res => res.data),
};
