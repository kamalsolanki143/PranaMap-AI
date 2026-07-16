import api from '@/lib/api';

export async function getAQIData() {
  const { data } = await api.get('/aqi');
  return data;
}
