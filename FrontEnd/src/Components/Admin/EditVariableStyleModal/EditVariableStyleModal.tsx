import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../Auth/AuthContext";
import Modal from "../../Modal/Modal";
import "../AdminContent.scss";
import InputComponent from "../../SimpleComponents/InputComponent";
import ButtonComponent from "../../SimpleComponents/ButtonComponent";

interface EditVariableModalProps {
  isOpen: boolean;
  onClose: () => void;
  variable: any;
  onUpdate: () => void;
}

const EditVariableStyleModal: React.FC<EditVariableModalProps> = ({ isOpen, onClose, variable, onUpdate }) => {
  const { token } = useAuth();
  const [classification, setClassification] = useState(variable.classification);
  const [nbClasses, setNbClasses] = useState(variable.nb_classes || "");
  const [colors, setColors] = useState(variable.colors ? variable.colors.join(",") : "");
  const [sld, setSld] = useState<File | null>(null);

  useEffect(() => {
    setClassification(variable.classification);
    setNbClasses(variable.nb_classes || "");
    setColors(variable.colors ? variable.colors.join(",") : "");
    setSld(null);
  }, [variable]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSld(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("code", variable.code);
    formData.append("classification", classification);
    
    if (classification === "quantile") {
      formData.append("nb_classes", nbClasses.toString());
      formData.append("colors", colors);
    }

    if (classification === "sld" && sld) {
      formData.append("sld", sld);
    }

    try {
      const response = await fetch(`/admin/variable/edit`, {
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
      console.error("Erreur lors de la modification de la variable :", error);
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

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Éditer la Variable">
      <form ref={formRef} onSubmit={handleSubmit} className="modal_action_body_admin">
        <div>
          <p>Classification</p>
          <select value={classification} onChange={(e) => setClassification(e.target.value)} required>
            <option value="quantile">Quantile</option>
            <option value="sld">SLD</option>
          </select>
        </div>
        
        {classification === "quantile" && (
          <>
            <InputComponent label="Nombre de classes" type="number" value={nbClasses} onChange={(e) => setNbClasses(e.target.value)} required />
            <InputComponent label="Couleurs (format: #ff0000,#00ff00)" type="text" value={colors} onChange={(e) => setColors(e.target.value)} required />
          </>
        )}
        {classification === "sld" && (
          <InputComponent label="Fichier SLD" type="file" accept=".sld" selectedFile={sld?.name} onChange={handleFileChange} />
        )}
        <ButtonComponent txt="Sauvegarder" onClick={triggerSubmit} />
      </form>
    </Modal>
  );
};

export default EditVariableStyleModal;
