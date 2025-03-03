import React, { useState } from 'react';
import LogoComponent from '../SimpleComponents/LogoComponent';
import Import from "../../assets/import.svg?react";
import Tutorial from "../../assets/question.svg?react";

import "./HeaderComponent.scss";
import SearchComponent from '../SimpleComponents/SearchComponent';
import { useNavigate } from 'react-router';
import Modal from '../Modal/Modal';
import ImportJsonComponent from '../ImportComponents/ImportJsonComponent';

interface HeaderComponentProps {
    onSearch?: (query: string) => void;
    showImportButton?: boolean;
    visualizationData?: { name: string; variables: string[] }[];
    setTutorialOpen?: (value: boolean) => void;
}

const HeaderComponent: React.FC<HeaderComponentProps> = ({
    onSearch,
    showImportButton = false,
    visualizationData = [],
    setTutorialOpen,
}) => {
    const navigate = useNavigate();
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleHomeClick = () => {
        navigate('/');
    };

    return (
        <div className="header_component">
            <div onClick={handleHomeClick} className='action_header left'>
                <LogoComponent size={"45px"} />
                <h1>Geodom</h1>
            </div>
            <div className='action_header right'>
                {onSearch && <SearchComponent onSearch={onSearch} />}
                <LogoComponent size={"30px"} Icon={Tutorial} onClick={() => setTutorialOpen && setTutorialOpen(true)}/>
                {showImportButton && (
                    <LogoComponent size={"35px"} Icon={Import} onClick={() => setIsModalOpen(true)} />
                )}
            </div>
            <Modal title='Importer la session' isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
                <ImportJsonComponent visualizationData={visualizationData} />
            </Modal>
        </div>
    );
}

export default HeaderComponent;