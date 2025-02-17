import React, { useState } from 'react';
import LogoComponent from '../SimpleComponents/LogoComponent';
import Import from "../../assets/import.svg?react";
import "./HeaderComponent.scss";
import SearchComponent from '../SimpleComponents/SearchComponent';
import { useNavigate } from 'react-router';
import Modal from '../Modal/Modal';
import ImportJsonComponent from '../ImportComponents/ImportJsonComponent';

interface HeaderComponentProps {
    onSearch?: (query: string) => void;
    showImportButton?: boolean;
    visualizationData?: { name: string; variables: string[] }[];
}

const HeaderComponent: React.FC<HeaderComponentProps> = ({
    onSearch,
    showImportButton = false,
    visualizationData = [],
}) => {
    const navigate = useNavigate();
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleHomeClick = () => {
        navigate('/');
    };

    return (
        <div className="header_component">
            <LogoComponent size={"50px"} onClick={handleHomeClick} />
            <div className='action_header'>
                {onSearch && <SearchComponent onSearch={onSearch} />}
                {showImportButton && (
                    <LogoComponent size={"35px"} Icon={Import} onClick={() => setIsModalOpen(true)} />
                )}
            </div>
            <Modal title='Import Visualisation' isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
                <ImportJsonComponent visualizationData={visualizationData} />
            </Modal>
        </div>
    );
}

export default HeaderComponent;