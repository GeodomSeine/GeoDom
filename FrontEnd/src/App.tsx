import './styles/main.scss';
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ProgramProvider } from './contexts/ProgramContext';
import HomeComponent from './Components/HomeComponent/HomeComponent';
import VisualisationPage from './Components/VisualisationComponent/VisualisationPage';
import ImportJsonComponent from './Components/ImportJsonComponent/ImportJsonComponent';


const App: React.FC = () => {
  return (
    <Router>
      <ProgramProvider>
        <Routes>
          <Route path="/" element={<HomeComponent />} />
          <Route path="/visualisation" element={<VisualisationPage />} />
          <Route path="/import-json" element={<ImportJsonComponent />} />
        </Routes>
      </ProgramProvider>
    </Router>
  );
};

export default App;
