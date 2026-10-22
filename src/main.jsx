import { createRoot } from 'react-dom/client'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import './index.css'
import App from './App.jsx'

ScrollTrigger.config({ ignoreMobileResize: true })

createRoot(document.getElementById('root')).render(
  <App />
)
