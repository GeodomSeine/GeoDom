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
    const navigate = useNavigate();
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleHomeClick = () => {
        navigate('/');
    };

    return (
        <>
            <div className="floating_card_component">
                <LogoComponent size={"40px"} onClick={handleHomeClick} />
                <LogoComponent size={"35px"} Icon={Export} onClick={() => setIsModalOpen(true)}/>
            </div>
            <Modal title='Exporter' isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
                {children}
            </Modal>
        </>
    );
}

export default FloatingAction;