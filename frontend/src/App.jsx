import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AppsList from './pages/AppsList';
import AppDetail from './pages/AppDetail';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<AppsList />} />
        <Route path="/app/:id" element={<AppDetail />} />
      </Routes>
    </Router>
  );
}

export default App;