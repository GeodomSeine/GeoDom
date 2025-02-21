import React from 'react';
import "./FooterComponent.scss";

interface FooterComponentProps {
    names: string[];
}

const FooterComponent: React.FC<FooterComponentProps> = ({ names }) => {
    const editorNames = names.join(", ");
    return (
        <div className='main_footer_container'>
            <div>
                <h2>Mentions Légales</h2>

                <h3>Éditeur du site et contributeurs</h3>
                <p>
                    Nom : <strong>{editorNames}</strong><br />
                    Projet étudiant, libre et non commercial.
                </p>
                <p>&copy; 2025 – Tous droits réservés.</p>
            </div>
            <div>
                <h3>Hébergeur</h3>
                <p>
                    Hostinger International Ltd.<br />
                    Adresse : 61 Lordou Vironos, 6023 Litochoro, Grèce<br />
                    Site web : <a href="https://www.hostinger.fr" target="_blank" rel="noopener noreferrer">https://www.hostinger.fr</a>
                </p>
            
                <h3>Protection des données personnelles</h3>
                <p>
                    Aucune collecte de données personnelles n'est effectuée sur ce site, à l'exception des cookies strictement nécessaires à son fonctionnement pour la partie tutoriel.
                    Pour toute question relative à la confidentialité, merci de nous contacter à l'adresse indiquée ci-dessus.
                </p>
                <h3>Cookies</h3>
                <p>
                    Ce site utilise uniquement des cookies techniques indispensables au bon fonctionnement du site (tutoriel).
                    Vous pouvez les désactiver via les paramètres de votre navigateur, bien que cela puisse affecter certaines fonctionnalités.
                </p>
            </div>
            
        </div>
    );
}

export default FooterComponent;
