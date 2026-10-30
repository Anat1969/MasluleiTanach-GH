import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import TopBar from './components/TopBar.jsx';
import Home from './pages/Home.jsx';
import RoutePage from './pages/RoutePage.jsx';
import TimelinePage from './pages/TimelinePage.jsx';
import ThreadsPage from './pages/ThreadsPage.jsx';
import PeoplePage from './pages/PeoplePage.jsx';
import TellsPage from './pages/TellsPage.jsx';

export default function App() {
  const loc = useLocation();
  return (
    <>
      <TopBar />
      <AnimatePresence mode="wait">
        <motion.div key={loc.pathname} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
          <Routes location={loc}>
            <Route path="/" element={<Home />} />
            <Route path="/route/:id" element={<RoutePage />} />
            <Route path="/timeline" element={<TimelinePage />} />
            <Route path="/threads" element={<ThreadsPage />} />
            <Route path="/people" element={<PeoplePage />} />
            <Route path="/tells" element={<TellsPage />} />
            <Route path="*" element={<Home />} />
          </Routes>
        </motion.div>
      </AnimatePresence>
    </>
  );
}
