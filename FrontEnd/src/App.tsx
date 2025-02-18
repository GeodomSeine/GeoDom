import './styles/main.scss';
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ProgramProvider } from './contexts/ProgramContext';
import HomeComponent from './Components/HomeComponent/HomeComponent';
import VisualisationPage from './Components/Visulisation/VisualisationPage';
import ImportJsonComponent from './Components/ImportComponents/ImportJsonComponent';
import { getPrograms, ProgramResponse, ProgramVariable } from './services/api';

const App: React.FC = () => {
  const [programs, setPrograms] = useState<ProgramResponse | null>(null);

  useEffect(() => {
      const fetchPrograms = async () => {
          const data = await getPrograms();
          setPrograms(data);
      };
      fetchPrograms();
  }, []);

  const visualizationData = Array.isArray(programs) ? programs.map(program => ({
    name: program.name,
    variables: program.variables.map((variable:ProgramVariable) => variable.var_code)
  })) : [];

  return (
    <Router>
      <ProgramProvider>
        <Routes>
          <Route path="/" element={<HomeComponent />} />
          <Route path="/visualisation" element={<VisualisationPage />} />
          <Route path="/import-json" element={<ImportJsonComponent visualizationData={visualizationData} />} />
        </Routes>
      </ProgramProvider>
    </Router>
  );
};

export default App;
