import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../Auth/AuthContext";
import Modal from "../../Modal/Modal";
import "../AdminContent.scss";
import { Program } from "../../../services/api";
import InputComponent from "../../SimpleComponents/InputComponent";
import ButtonComponent from "../../SimpleComponents/ButtonComponent";

interface EditProgramModalProps {
  isOpen: boolean;
  onClose: () => void;
  program: Program;
  onUpdate: () => void;
}

const EditProgramModal: React.FC<EditProgramModalProps> = ({ isOpen, onClose, program, onUpdate }) => {
  const { token } = useAuth();

  const [title, setTitle] = useState(program.title);
  const [description, setDescription] = useState(program.description);
  const [variables, setVariables] = useState(JSON.stringify(program.variables.map(variable => variable.var_code)));
  const [exutoireId, setExutoireId] = useState(program.exutoire_id.toString());
  const [active, setIsActive] = useState(!program.is_actived);

  useEffect(() => {
    setTitle(program.title);
    setDescription(program.description);
    setVariables(JSON.stringify(program.variables.map(variable => variable.var_code)));
    setExutoireId(program.exutoire_id.toString());
    setIsActive(!program.is_actived);
  }, [program]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("variables", variables);
    formData.append("exutoire_id", exutoireId);
    formData.append("is_actived", (!active).toString());

    try {
      const response = await fetch(`/admin/edit/${program.name}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();
      alert(data.message);
      onUpdate();
      onClose();
    } catch (error) {
      console.error("Erreur lors de l'édition du programme :", error);
    }
  };

  const formRef = useRef<HTMLFormElement>(null);

  const triggerSubmit = () => {
    if (formRef.current) {
      if (formRef.current.requestSubmit) {
        formRef.current.requestSubmit();
      } else {
        formRef.current.submit();
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLFormElement>) => {
      if (e.key === "Enter") {
        e.preventDefault(); 
        triggerSubmit();
      }
    };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Éditer le Programme">
      <form ref={formRef} onKeyDown={handleKeyDown} onSubmit={handleSubmit} className="modal_action_body_admin">
        <InputComponent label={"Titre"} type="text" value={title} onChange={(e) => setTitle(e.target.value)} required />
        <InputComponent label="Exutoire ID" type="textarea" value={description} onChange={(e) => setDescription(e.target.value)}></InputComponent>
        <InputComponent label="Variables (format JSON)" type="text" value={variables} onChange={(e) => setVariables(e.target.value)} required />
        <InputComponent label="Exutoire ID" type="number" value={exutoireId} onChange={(e) => setExutoireId(e.target.value)} required />
        <InputComponent label={"Prévisualisation"} type={"checkbox"} checked={active} onChange={(e) => setIsActive((e.target as HTMLInputElement).checked)} />
        <ButtonComponent txt="Ajouter" onClick={triggerSubmit} />
      </form>
    </Modal>
  );
};

export default EditProgramModal;
