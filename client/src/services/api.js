import axios from 'axios';
import { Platform } from 'react-native';

// Current machine's Wi-Fi network IP for physical devices & web
export const LAN_HOST = 'http://10.236.231.240:5000';

function getInitialHost() {
  if (Platform.OS === 'web' && typeof window !== 'undefined' && window.location?.hostname) {
    return `http://${window.location.hostname}:5000`;
  }
  return LAN_HOST;
}

let currentApiUrl = getInitialHost();

export const setApiBaseUrl = (url) => {
  currentApiUrl = url.trim().replace(/\/+$/, '');
  console.log('[API] Base URL set to:', currentApiUrl);
};

export const getApiBaseUrl = () => currentApiUrl;

const CANDIDATE_HOSTS = [
  LAN_HOST,
  'http://localhost:5000',
  'http://10.0.2.2:5000',
  'http://127.0.0.1:5000'
];

export const autoDiscoverBackend = async () => {
  try {
    const res = await axios.get(`${currentApiUrl}/api/health`, { timeout: 2000 });
    if (res.data?.status === 'online') return currentApiUrl;
  } catch (e) {}

  for (const host of CANDIDATE_HOSTS) {
    if (host === currentApiUrl) continue;
    try {
      const res = await axios.get(`${host}/api/health`, { timeout: 1500 });
      if (res.data?.status === 'online') {
        currentApiUrl = host;
        return host;
      }
    } catch (e) {}
  }

  return null;
};

export const checkServerHealth = async () => {
  const discovered = await autoDiscoverBackend();
  return discovered !== null;
};

export const fetchTrending = async () => {
  try {
    const res = await axios.get(`${currentApiUrl}/api/trending`, { timeout: 4000 });
    return res.data?.data || [];
  } catch (e) {
    return [
      { id: '1', title: 'iPhone 15', query: 'iphone 15' },
      { id: '2', title: 'MacBook Air M3 16GB', query: 'macbook air m3 16gb' },
      { id: '3', title: 'Sony WH-1000XM5', query: 'sony wh 1000xm5' },
      { id: '4', title: 'Samsung Galaxy S24', query: 'samsung galaxy s24' },
      { id: '5', title: 'iPhone 15 charger', query: 'iphone 15 charger' },
      { id: '6', title: 'iPhone 15 cover', query: 'iphone 15 cover' }
    ];
  }
};

export const searchAndComparePrices = async (query) => {
  await autoDiscoverBackend();

  try {
    const res = await axios.get(`${currentApiUrl}/api/search`, {
      params: { q: query },
      timeout: 35000
    });
    return res.data;
  } catch (error) {
    console.error(`API Search Error on ${currentApiUrl}:`, error.message);
    if (error.code === 'ECONNABORTED') {
      throw new Error(`Scraping timed out. The e-commerce servers took too long to reply.`);
    }
    if (error.message.includes('Network Error')) {
      throw new Error(
        `Network Error connecting to ${currentApiUrl}. Make sure the Node.js server is running and your device is on the same Wi-Fi. (Tap Settings ⚙️ to adjust IP).`
      );
    }
    throw new Error(error.response?.data?.error || error.message || 'Failed to scrape prices');
  }
};
