import React, { useState } from 'react';
import LogoComponent from '../SimpleComponents/LogoComponent';
import Import from "../../assets/import.svg?react";
import Export from "../../assets/export.svg?react";
import "./HeaderComponent.scss";
import SearchComponent from '../SimpleComponents/SearchComponent';
import { useNavigate } from 'react-router';
import Modal from '../Modal/Modal';
import ImportJsonComponent from '../ImportJsonComponent/ImportJsonComponent';

interface HeaderComponentProps {
    onSearch?: (query: string) => void;
    showImportButton?: boolean;
    showExportButton?: boolean;
    exportData?: {
        name: string | undefined;
        selected: string | null;
        hydro_id_start: number | null;
        hydro_id_end: number | null;
        variables: string[];
        scenarios: number[];
    };
    visualizationData?: { name: string; variables: string[] }[];
}

const HeaderComponent: React.FC<HeaderComponentProps> = ({
    onSearch,
    showImportButton = false,
    showExportButton = false,
    exportData,
    visualizationData = [],
}) => {
    const navigate = useNavigate();
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleHomeClick = () => {
        navigate('/');
    };

    const handleExportJson = () => {
        if (exportData) {
            const jsonString = JSON.stringify(exportData, null, 2);
            const blob = new Blob([jsonString], { type: "application/json" });

            const url = URL.createObjectURL(blob);

            const downloadLink = document.createElement("a");
            downloadLink.href = url;
            downloadLink.download = exportData.name + ".json";
            downloadLink.click();
            URL.revokeObjectURL(url);
        }
    };

    return (
        <div className="header_component">
            <LogoComponent size={"50px"} onClick={handleHomeClick} />
            <div className='action_header'>
                {onSearch && <SearchComponent onSearch={onSearch} />}
                {showImportButton && (
                    <LogoComponent size={"35px"} Icon={Import} onClick={() => setIsModalOpen(true)} />
                )}
                {showExportButton && exportData && (
                    <LogoComponent size={"35px"} Icon={Export} onClick={handleExportJson} />
                )}
            </div>
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
                <ImportJsonComponent visualizationData={visualizationData} />
            </Modal>
        </div>
    );
}

export default HeaderComponent;