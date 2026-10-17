import { createRoot } from 'react-dom/client'
import App from './App'
import './index.css'

const rootElement = document.getElementById("root")!;

// Детект ботов — для них оставляем статический HTML
const isBot = /bot|crawler|spider|crawling|yandex|google|bing/i.test(navigator.userAgent);

if (!isBot) {
  // Для обычных пользователей запускаем React
  rootElement.innerHTML = '';
  createRoot(rootElement).render(<App />);
} else {
  // Для ботов оставляем статический HTML как есть
  console.log('Search bot detected, serving static HTML');
}
