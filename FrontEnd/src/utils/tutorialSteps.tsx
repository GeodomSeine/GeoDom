interface TutoStep {
    // title of the tuto window
    title: string;
    // used to target the element you want to add .highlight (see in the _base.scss) you need to scope an element class
    targetClass?: string; 
    // element or text you want in the tuto window
    content: React.ReactNode;
    // current route where the user needs to be, moostly usefull in the home section, in order to go back from a visualisation to the home page
    route?: string; 
    // no continue button, to force the user to interact with the app, without having a continue button, for example when clicking a visualisation
    noContinueButton?: boolean;
    // set the position of the tuto window, right_bottom, right_top, left_bottom, left_top
    position: string;
}

export const steps: TutoStep[] = [
    {
      title: "Geodom tutoriel",
      content: (
        <p>
          GeoDom est un outil de visualisation et d’analyse de la qualité de l’eau, permettant de comparer les données d'observation aux données de modélisation.
          Souhaitez-vous suivre un tutoriel pour découvrir ses fonctionnalités ?
        </p>
      ),
      position : "right_bottom",
      // Optional route: '/',
    },
    {
      title: "Page d'accueil",
      content: (
        <p>
          Ici, vous pouvez choisir parmi différentes <strong>visualisations</strong>, qui regroupent des cartes interactives et des graphiques pour analyser ou observer les résultats du modèle par rapport aux données réelles.
          Chaque visualisation se concentre sur une zone géographique spécifique et des indicateurs prédéfinis, afin de vous aider à cibler plus facilement les informations qui vous intéressent.
        </p>
      ),
      position : "right_bottom",
    },
    {
      title: "Haut de page",
      targetClass: 'header_component', 
      content: (
        <p>
          <strong>En haut à gauche</strong>, le logo LastProject-PirenSeine vous permet de revenir en haut de la page en un clic.<br/>
          <strong>Une barre de recherche</strong> vous aide à trouver une visualisation en fonction de son nom, de sa description ou des indicateurs souhaités.<br/>
          <strong>À droite</strong>, un bouton permet d’importer une session de visualisation avec des paramètres prédéfinis. Nous reviendrons sur cette fonctionnalité plus tard.<br/>
        </p>
      ),
      position : "right_bottom",
    },
    {
      title: "Choix visualisation",
      targetClass: 'card_component', 
      content: (
        <p>
          Cliquez, par exemple, sur la visualisation mise en surbrillance sur votre écran.
        </p>
      ),
      noContinueButton: true,
      route: '/',
      position : "right_bottom",
    },
    {
      title: "Visualisation",
      content: (
        <p>
          Vous êtes maintenant dans la visualisation de l'Orgeval. Celle-ci regroupe plusieurs fenêtres d'intérêt, que vous pouvez ouvrir et fermer à votre convenance.
        </p>
      ),
      position : "right_bottom",
    },
    {
      title : "Paramétrage général",
      targetClass: 'space_container_1', 
      content: (
        <p>
          <strong>Mode "Complet"</strong> : Agrège les données sur l’ensemble des Strahler sélectionnés via le curseur ci-dessous.<br/>
          <strong>Mode "Amont-Aval"</strong>: Vous sélectionnez un tronçon et le définissez comme amont. Le programme calculera automatiquement les données jusqu’à l’exutoire. Vous pourrez ensuite sélectionner l’aval.
        </p>
      ),
      position : "right_bottom",
    },
    {
      title : "Indicateurs",
      targetClass: 'space_container_1',
      content: (
        <p>
          Il est également possible de choisir différents <strong>scénarios</strong> (années de modélisation). 
          Chaque scénario est associé à une <strong>couleur spécifique</strong>, qui sera utilisée dans les graphiques sous 
          forme de bulles pour représenter <strong>les données d'observation</strong> correspondantes.
        </p>
      ),
      position : "right_bottom",
    },
    {
      title : "Curseur",
      targetClass: 'space_container_1 .slider_container', 
      content: (
        <div>
          <p>
            En mode "Complet", le curseur ci-dessous s’exprimera en <strong>Strahler</strong><br/>
            En mode "Amont-Aval", le curseur ci-dessous s’exprimera en points kilométriques, vous permettant d’afficher les statistiques 
            à l’échelle souhaitée. Ces points seront mis en évidence en vert sur la carte.
          </p>
        </div>
      ),
      position : "right_bottom",
    },
    {
      title: "Visualisation des données",
      targetClass: 'space_container_2', 
      content: (
        <p>
          Dans cette fenêtre, nous visualisons les <strong>données de modélisation</strong> selon les percentiles <strong>5, 50 et 90</strong>.<br/>
          La zone entre les percentiles <strong>5 et 90</strong> est <strong>grisée</strong>, indiquant que la majorité des valeurs se situent dans cet intervalle.<br/>
          Les <strong>données d'observation</strong> sont représentées par des <strong>bulles colorées</strong>, chaque couleur correspondant à un scénario spécifique.<br/>
        </p>
      ),
      position : "left_bottom",
    },
    {
      title: "Axes du graphique",
      targetClass: 'space_container_2', 
      content: (
        <p>
          L’<strong>axe des X</strong> représente les <strong>36 décades</strong>.<br/>
          L’<strong>axe des Y</strong> affiche la valeur de l’indicateur sélectionné, avec son <strong>unité de mesure</strong>.<br/>
        </p>
      ),
      position : "left_bottom",
    },
    {
      title: "Filtrage des données",
      targetClass: 'space_container_2 .slider_container', 
      content: (
        <p>
          Grâce au <strong>curseur situé en bas</strong>, vous pouvez choisir d’afficher les données en fonction :<br/>
          <strong>D’un Strahler donné</strong>, si vous êtes en mode <strong>"Complet"</strong>.<br/>
          <strong>D’un point kilométrique précis</strong>, si vous êtes en mode <strong>"Amont-Aval"</strong>.<br/>
        </p>
      ),
      position : "left_bottom",
    },
    {
      title: "Cartes des seuils",
      targetClass: 'space_container_3', 
      content: (
        <p>Dans cet espace, chaque <strong>indicateur</strong> est représenté par une <strong>carte dédiée</strong>. Les valeurs sont converties en couleurs selon la <strong>classe de valeur</strong> définie dans la légende.</p>
      ),
      position : "right_bottom",
    },
    {
      title:"Options de filtrage",
      targetClass: 'space_container_3 .slider_container', 
      content: (
        <p>
          Grâce au <strong>double curseur</strong> situé en dessous, vous pouvez définir une période spécifique (par exemple, de la <strong>décade 1 à 9</strong>).
        </p>
      ),
      position : "right_bottom",
    },
    {
      title: "Options de filtrage",
      targetClass: 'space_container_3 .percentile_selector', 
      content: (
        <p>
          Vous pouvez également choisir quel <strong>percentile</strong> afficher (<strong>5, 50 ou 90</strong>) en utilisant la sélection <strong>radio</strong> ci-dessous.
        </p>
      ),
      position : "right_bottom",
    },
    {
      title: "Graphiques en profil en long",
      targetClass: 'space_container_4', 
      content: (
        <p>
          Dans cet espace, nous affichons des <strong>graphiques en profil en long</strong>, avec un graphique par <strong>indicateur</strong>. Comme dans les graphiques temporels, nous visualisons :
          <br/>
          Les percentiles <strong>5, 50 et 90</strong>.<br/>
          Les <strong>données d'observation</strong>, représentées sous forme de bulles colorées.<br/>
        </p>
      ),
      position : "left_bottom",
    },
    {
      title:"Axes du graphique",
      targetClass: 'space_container_4', 
      content: (
        <p>
            Sur l’<strong>axe des X</strong> : <br/>
            En mode <strong>Strahler</strong>, les valeurs sont triées du <strong>plus petit au plus grand</strong>.<br/>
            En mode <strong>Amont-Aval</strong>, les points kilométriques sélectionnés sont triés de <strong>l’amont jusqu’à l’aval</strong>.<br/>
            Sur l’<strong>axe des Y</strong>, nous affichons la valeur de l’<strong>indicateur sélectionné</strong> avec son <strong>unité de mesure</strong>.<br/>
        </p>
      ),
      position : "left_bottom",
    },
    {
      title:"Options de filtrage",
      targetClass: 'space_container_4  .slider_container', 
      content: (
        <p>
          Comme pour les cartes, le <strong>double curseur</strong> situé en dessous permet de sélectionner une période spécifique (par exemple, de la <strong>décade 1 à 9</strong>).
        </p>
      ),
      position : "left_bottom",
    },
    {
      title:"Navigation et exportation",
      targetClass: 'floating_card_component', 
      content: (
        <p>
          Ici, le <strong>logo</strong> permet de revenir à l’<strong>accueil</strong>, tandis que le <strong>bouton situé à droite</strong> offre plusieurs options d’exportation des données.
        </p>
      ),
      position : "left_bottom",
    },
    {
      title:"Formats d'exportation disponibles",
      targetClass: 'floating_card_component', 
      content: (
        <p>
          <strong>CSV</strong> – Export des données sous forme de tableau.<br/>
          <strong>PDF</strong> – Génération d’un rapport imprimable.<br/>
          <strong>GeoPackage</strong> – Format géospatial standard.<br/>
          <strong>Export de session JSON</strong> – Permet de sauvegarder votre session pour la réimporter plus tard depuis l’accueil, 
          ou la partager avec un collègue afin qu’il puisse visualiser les mêmes données que vous.
        </p>
      ),
      position : "left_bottom",
    },
];