import { Route, Routes } from 'react-router-dom';
import { RootLayout } from './components/layout/RootLayout';
import Home from './pages/Home';
import HowItWorks from './pages/HowItWorks';
import ForBusinesses from './pages/ForBusinesses';
import Materials from './pages/Materials';
import About from './pages/About';
import FoundingNetwork from './pages/FoundingNetwork';
import Contact from './pages/Contact';
import NotFound from './pages/NotFound';

export default function App() {
  return (
    <Routes>
      <Route element={<RootLayout />}>
        <Route index element={<Home />} />
        <Route path="how-it-works" element={<HowItWorks />} />
        <Route path="for-businesses" element={<ForBusinesses />} />
        <Route path="materials" element={<Materials />} />
        <Route path="about" element={<About />} />
        <Route path="founding-network" element={<FoundingNetwork />} />
        <Route path="contact" element={<Contact />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
