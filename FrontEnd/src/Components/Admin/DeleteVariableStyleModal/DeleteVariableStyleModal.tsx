import React from "react";
import Modal from "../../Modal/Modal";
import "../AdminContent.scss";
import ButtonComponent from "../../SimpleComponents/ButtonComponent";

interface DeleteVariableModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  variableCode: string;
}

const DeleteVariableStyleModal: React.FC<DeleteVariableModalProps> = ({ isOpen, onClose, onConfirm, variableCode }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Confirmer la suppression">
      <div className="modal_action_body_admin">
        <p>Voulez-vous vraiment supprimer la variable <strong>{variableCode}</strong> ?</p>
        <div className="modal_action_delete">
          <ButtonComponent onClick={onClose} txt={"Annuler"} />
          <ButtonComponent onClick={onConfirm} txt={"Supprimer"} />
        </div>
      </div>
    </Modal>
  );
};

export default DeleteVariableStyleModal;
