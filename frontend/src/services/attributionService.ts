import api from '@/lib/api';

export async function getAttribution() {
  const { data } = await api.get('/attribution');
  return data;
}
