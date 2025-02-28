import React from "react";
import Modal from "../../Modal/Modal";
import "./DeleteProgramModal.scss";
import ButtonComponent from "../../SimpleComponents/ButtonComponent";

interface DeleteProgramModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  programName: string;
}

const DeleteProgramModal: React.FC<DeleteProgramModalProps> = ({ isOpen, onClose, onConfirm, programName }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Confirmer la suppression">
      <div className="delete-program-content">
        <p>Voulez-vous vraiment supprimer le programme <strong>{programName}</strong> ?</p>
        <div className="delete-program-actions">
          <ButtonComponent onClick={onClose} txt={"Annuler"}/>
          <ButtonComponent onClick={onConfirm} txt={"Supprimer"}/>
        </div>
      </div>
    </Modal>
  );
};

export default DeleteProgramModal;
