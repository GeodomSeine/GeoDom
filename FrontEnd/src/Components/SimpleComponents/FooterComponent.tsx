import React from 'react';
import "./FooterComponent.scss";

interface FooterComponentProps {
    // table of contributors
    names: string[];
}

const FooterComponent: React.FC<FooterComponentProps> = ({ names }) => {
    const editorNames = names.join(", ");
    return (
        <div className='main_footer_container'>
            <div className='main_footer_header'>
                <h2>Mentions Légales</h2>
                <div className='footer_sub_element'>
                    <p>
                        Éditeur du site et contributeurs : <strong> {editorNames} </strong>
                        Projet étudiant, libre et non commercial.
                    </p>
                </div>
            </div>
            <div className='main_footer_body'>
                <div className='footer_sub_element'>
                    <h3>Hébergeur</h3>
                    <p>
                        Hostinger International Ltd.
                        Adresse : Švitrigailos str. 34, Vilnius 03230 Lithuania
                        Site web : <a href="https://www.hostinger.fr" target="_blank" rel="noopener noreferrer">https://www.hostinger.fr</a>
                    </p>
                </div>

                <div className='footer_sub_element'>
                    <h3>Protection des données personnelles</h3>
                    <p>
                        Aucune collecte de données personnelles n'est effectuée sur ce site, à l'exception des cookies strictement nécessaires à son fonctionnement pour la partie tutoriel.
                        Pour toute question relative à la confidentialité, merci de nous contacter à l'adresse indiquée ci-dessus.
                    </p>
                </div>
                <div className='footer_sub_element'>
                    <h3>Cookies</h3>
                    <p>
                        Ce site utilise uniquement des cookies techniques indispensables au bon fonctionnement du site (tutoriel).
                        Vous pouvez les désactiver via les paramètres de votre navigateur, bien que cela puisse affecter certaines fonctionnalités.
                    </p>
                </div>
            </div>
            
        </div>
    );
}

export default FooterComponent;
