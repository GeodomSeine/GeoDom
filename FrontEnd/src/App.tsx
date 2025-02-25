import './styles/main.scss';
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomeComponent from './Components/HomeComponent/HomeComponent';
import VisualisationPage from './Components/Visulisation/VisualisationPage';
import ImportJsonComponent from './Components/ImportComponents/ImportJsonComponent';
import TutoComponent from './Components/Modal/TutoComponent';
import { getPrograms, ProgramResponse, ProgramVariable } from './services/api';



const App: React.FC = () => {
  const [programs, setPrograms] = useState<ProgramResponse | null>(null);
  // cookie gestion
  const [tutorialOpen, setTutorialOpen] = useState(true);

  useEffect(() => {
    const fetchPrograms = async () => {
      const data = await getPrograms();
      setPrograms(data);
    };
    fetchPrograms();
  }, []);

  const visualizationData = Array.isArray(programs)
    ? programs.map(program => ({
        name: program.name,
        variables: program.variables.map((variable: ProgramVariable) => variable.var_code)
      }))
    : [];

  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomeComponent />} />
        <Route path="/:program_name" element={<VisualisationPage />} />
        <Route path="/import-json" element={<ImportJsonComponent visualizationData={visualizationData} />} />
      </Routes>
      <TutoComponent
        title="Geodom Tutoriel"
        isOpen={tutorialOpen}
        onClose={() => setTutorialOpen(false)}
      />
    </Router>
  );
};

export default App;
