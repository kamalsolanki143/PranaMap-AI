import api from '@/lib/api';

export async function getForecast() {
  const { data } = await api.get('/forecast');
  return data;
}
