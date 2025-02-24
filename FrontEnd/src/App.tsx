import './styles/main.scss';
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomeComponent from './Components/HomeComponent/HomeComponent';
import VisualisationPage from './Components/Visulisation/VisualisationPage';
import ImportJsonComponent from './Components/ImportComponents/ImportJsonComponent';
import TutoComponent from './Components/Modal/TutoComponent';
import { getPrograms, ProgramResponse, ProgramVariable } from './services/api';

const steps = [
  {
    content: (
      <div>
        <p>
          GeoDom est un outil de visualisation et d’analyse de la qualité de l’eau, conçu pour comparer les données réelles issues de la base Donuts aux données prédictives modélisées dans la base PyNuts.
          Pour bien prendre en main l’outil et explorer ses fonctionnalités, souhaitez-vous suivre un tutoriel ?
        </p>
      </div>
    ),
    // Optional route: '/',
  },
  {
    content: (
      <div>
        <p>
          Vous voici sur la page d'accueil, cette page permet de choisir parmis ce qui est appelé des"visualisations", dans chaque visualisation se trouve des cartes intéractives, ainsi que des graphes permettant d'intépréter ou simplement d'observer des resultats du modèle pynuts par rapport au données réel. Une visualisation sera focalisé sur une zone géographique précise ainsi que des indicateurs prédéfinis, permettant de cibler plus facilement en fonction de votre intéret.
        </p>
      </div>
    ),
  },
  {
    targetClass: 'header_component', 
    content: (
      <div>
        Sur cette page vous pourrez retrouvez un haut de page avec lequel vous pourrez revenir en tout en haut de la page (bouton à gauche logo lastProject-pirenSeine), recherché une visualisation en fonction du nom, de la description, ou des indicateurs souhaité. Et enfin tout à droite un bouton qui permettra d'importer une session de visualisation avec des paramètres définis, nous reviendrons sur ce bouton plutard.   
      </div>
    ),
  },
  {
    targetClass: 'card_component', 
    content: (
      <div>
        <p>
          cliquez par exemple sur la visualization "le carbone dans l'orgeval" qui est affiché en surbrillance sur votre écran
        </p>
      </div>
    ),
    noContinueButton: true,
    route: '/',
  },
  {
    targetClass: 'footer', 
    content: (
      <div>
        <p>
          Vous êtes arrivé au pied de page. Vous avez terminé le tutoriel !
        </p>
      </div>
    ),
  },
  {
    targetClass: 'footer', 
    content: (
      <div>
        <p>
          Vous êtes arrivé au pied de page. Vous avez terminé le tutoriel !
        </p>
      </div>
    ),
  },
];

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
        steps={steps}
        title="Geodom Tutoriel"
        isOpen={tutorialOpen}
        onClose={() => setTutorialOpen(false)}
      />
    </Router>
  );
};

export default App;
