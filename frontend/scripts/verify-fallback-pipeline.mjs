/**
 * Test failure resilience and cache fallback of weather and air quality service
 */
import { fetchLocationWeather } from '../src/services/weatherService.ts';

async function testFallback() {
  console.log('Testing network timeout & fallback resilience...');
  // Pass bogus coordinates or test fallback return
  const fallback = await fetchLocationWeather(999, 999, 142);
  
  console.log('Fallback response status:');
  console.log('Weather status:', fallback.weather.dataStatus, '| Source:', fallback.weather.source);
  console.log('Air Quality status:', fallback.airQuality.dataStatus, '| Source:', fallback.airQuality.source);
  console.log('AQI fallback value:', fallback.airQuality.aqi);
  console.log('Outlook title:', fallback.outlook.title);

  if (fallback.weather.dataStatus === 'CACHED' && fallback.airQuality.dataStatus === 'CACHED') {
    console.log('✅ PASS: Graceful fallback to CACHED status confirmed without crashing.');
  } else {
    console.error('❌ FAIL: Expected CACHED status on unreachable coordinates');
    process.exit(1);
  }
}

testFallback().catch(err => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
