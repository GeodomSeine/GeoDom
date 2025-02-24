import { StrictMode, useState } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import TutoComponent from './Components/Modal/TutoComponent';

const steps = [
  {
    targetClass: 'header', 
    content: (
      <div>
        <p>GeoDom est un outil de visualisation et d’analyse de la qualité de l’eau, conçu pour comparer les données réelles issues de la base Donuts aux données prédictives modélisées dans la base PyNuts. Grâce à des cartes interactives, il met en évidence les écarts entre la réalité du terrain et les prévisions, offrant une meilleure compréhension des dynamiques hydrologiques.

Que ce soit pour évaluer la fiabilité des modèles, suivre l’évolution des paramètres environnementaux ou affiner les prédictions, GeoDom permet d’explorer ces données de manière claire et accessible.

Pour bien prendre en main l’outil et explorer ses fonctionnalités, souhaitez-vous suivre un tutoriel?</p>
      </div>
    ),
  },
  {
    targetClass: 'main-content', 
    content: (
      <div>
        <p>Ceci est le contenu principal. Suivez les instructions ici pour découvrir les fonctionnalités.</p>
      </div>
    ),
  },
  {
    targetClass: 'footer', 
    content: (
      <div>
        <p>Vous êtes arrivé au pied de page. Vous avez terminé le tutoriel !</p>
      </div>
    ),
  },
];

const Root = () => {
  const [tutorialOpen, setTutorialOpen] = useState(true);

  return (
    <>
      <App />
      <TutoComponent
        steps={steps}
        title="Geodom Tutoriel"
        isOpen={tutorialOpen}
        onClose={() => setTutorialOpen(false)}
      />
    </>
  );
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Root />
  </StrictMode>
);
