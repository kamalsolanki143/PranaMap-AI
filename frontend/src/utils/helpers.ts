export function getAQIColor(value: number): string {
  const level = AQI_LEVELS.find((l) => value >= l.range[0] && value <= l.range[1]);
  return level?.color ?? '#000000';
}

export function formatTimestamp(ts: string): string {
  return new Date(ts).toLocaleString();
}

import { AQI_LEVELS } from './constants';
