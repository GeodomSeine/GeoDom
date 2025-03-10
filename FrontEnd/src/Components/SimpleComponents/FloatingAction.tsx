import React, { ReactNode, useState } from 'react';
import LogoComponent from './LogoComponent';
import Export from "../../assets/export.svg?react";
import "./FloatingAction.scss";
import { useNavigate } from 'react-router';
import Modal from '../Modal/Modal';

interface FloatingActionProps {
    //add props here
    children?: ReactNode;
}

const FloatingAction: React.FC<FloatingActionProps> = ({
    children,
}) => {
    // navigate const
    const navigate = useNavigate();
    // define the state of the export modal (true, false)
    const [isModalOpen, setIsModalOpen] = useState(false);
    // navigate function when clicking home
    const handleHomeClick = () => {
        navigate('/');
    };

    return (
        <>
            <div className="floating_card_component">
                {/* Logo that goes to the homePage */}
                <LogoComponent className={"home_logo"} size={"35px"} onClick={handleHomeClick} />
                {/* Logo that opens the export modal */}
                <LogoComponent size={"35px"} Icon={Export} onClick={() => setIsModalOpen(true)}/>
            </div>
            {/* Modal export */}
            <Modal title='Exporter' isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
                {children}
            </Modal>
        </>
    );
}

export default FloatingAction;