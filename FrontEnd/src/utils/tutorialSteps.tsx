interface TutoStep {
    targetClass?: string; 
    content: React.ReactNode;
    route?: string; 
    noContinueButton?: boolean;
}

export const steps: TutoStep[] = [
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
            Cliquez par exemple sur la visualization "le carbone dans l'orgeval" qui est affiché en surbrillance sur votre écran
          </p>
        </div>
      ),
      noContinueButton: true,
      route: '/',
    },
    {
      content: (
        <div>
          <p>
            Vous voici maintenant dans la visualisation de l'orgeval, cette visualisation regroupe plusieurs fenetre d'interet qui sont refermable et ouvrables à volonté
          </p>
        </div>
      ),
    },
    {
      targetClass: 'space_container_1', 
      content: (
        <div>
          <p>
            espace1 texte... slider etc
          </p>
        </div>
      ),
    },
    {
      targetClass: 'space_container_2', 
      content: (
        <div>
          <p>
            espace2 texte... slider etc
          </p>
        </div>
      ),
    },
    {
      targetClass: 'space_container_3', 
      content: (
        <div>
          <p>
            espace3 texte... decade etc
          </p>
        </div>
      ),
    },
    {
      targetClass: 'space_container_4', 
      content: (
        <div>
          <p>
            espace4 texte... decade etc
          </p>
        </div>
      ),
    },
    {
      targetClass: 'floating_card_component', 
      content: (
        <div>
          <p>
            floatin action where you can have action to return back to menu, or export thing
          </p>
        </div>
      ),
    },
];