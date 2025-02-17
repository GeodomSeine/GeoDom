import React from 'react';
import './Modal.scss';
import LogoComponent from '../SimpleComponents/LogoComponent';
import Import from "../../assets/cross.svg?react";

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
    title?: string;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children, title }) => {
    if (!isOpen) return null;

    return (
        <div className="modal_overlay" onClick={onClose}>
            <div className="modal_action" onClick={(e) => e.stopPropagation()}>
                <div className="modal_action_header">
                    <p>{title}</p>
                    <LogoComponent
                        Icon={Import}
                        onClick={onClose}
                        size={"30px"}
                    />
                </div>
                <div className="modal_action_body">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default Modal;