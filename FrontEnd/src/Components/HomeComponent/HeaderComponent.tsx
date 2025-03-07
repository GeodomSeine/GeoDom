import React, { useState } from 'react';
import LogoComponent from '../SimpleComponents/LogoComponent';
import Import from "../../assets/import.svg?react";
import Tutorial from "../../assets/question.svg?react";

import "./HeaderComponent.scss";
import SearchComponent from '../SimpleComponents/SearchComponent';
import Modal from '../Modal/Modal';
import ImportJsonComponent from '../ImportComponents/ImportJsonComponent';

interface HeaderComponentProps {
    onSearch?: (query: string) => void;
    showImportButton?: boolean;
    visualizationData?: { name: string; variables: string[] }[];
    setTutorialOpen?: (value: boolean) => void;
}

const HeaderComponent: React.FC<HeaderComponentProps> = ({
    // on search function
    onSearch,
    // if you dont want any imports
    showImportButton = false,
    // all the text data from a visualisation 
    visualizationData = [],
    // tutorial set state
    setTutorialOpen,
}) => {
    // current state of the modal
    const [isModalOpen, setIsModalOpen] = useState(false);

    // in order to stay on top of the window when going clicking the home button
    const handleHomeClick = () => {
        window.scroll({
            top: 0,
            behavior: 'smooth'
        });
    };

    return (
        <div className="header_component">
            <div onClick={handleHomeClick} className='action_header left'>
                {/* Home button*/}
                <LogoComponent size={"45px"} />
                <h1>Geodom</h1>
            </div>
            <div className='action_header right'>
                {/* search Input*/}
                {onSearch && <SearchComponent onSearch={onSearch} />}
                <LogoComponent className={"logo_container tuto"} size={"25px"} Icon={Tutorial} onClick={() => setTutorialOpen && setTutorialOpen(true)}/>
                {/* Import button*/}
                {showImportButton && (
                    <LogoComponent size={"30px"} Icon={Import} onClick={() => setIsModalOpen(true)} />
                )}
            </div>
            {/* import modal*/}
            <Modal title='Importer la session' isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
                <ImportJsonComponent visualizationData={visualizationData} />
            </Modal>
        </div>
    );
}

export default HeaderComponent;