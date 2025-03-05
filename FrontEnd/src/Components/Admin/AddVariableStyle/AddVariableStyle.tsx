import React, { useRef, useState } from "react";
import { useAuth } from "../Auth/AuthContext";
import "../AdminContent.scss";
import ButtonComponent from "../../SimpleComponents/ButtonComponent";
import InputComponent from "../../SimpleComponents/InputComponent";

const AddVariableStyle: React.FC = () => {
  const { token } = useAuth();
  const [code, setCode] = useState("");
  const [classification, setClassification] = useState("quantile");
  const [nbClasses, setNbClasses] = useState<number | "">("");
  const [colors, setColors] = useState("");
  const [sld, setSld] = useState<File | null>(null);
  const [message, setMessage] = useState<string | null>(null);
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSld(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("code", code);
    formData.append("classification", classification);

    if (classification === "quantile") {
      if (nbClasses) formData.append("nb_classes", nbClasses.toString());
      if (colors) formData.append("colors", colors);
    }

    if (classification === "sld" && sld) {
      formData.append("sld", sld);
    }

    try {
      const response = await fetch("/admin/variable/add", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();
      setMessage(data.message);
    } catch (error) {
      setMessage("Erreur lors de l'ajout du style de variable");
    }
  };

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="admin_content">
      {message && <p className="status_message">{message}</p>}
      
      <InputComponent label="Code de la variable" type="text" value={code} onChange={(e) => setCode(e.target.value)} required />
      <div className="input_component">
        <span>Classification</span>
        <select value={classification} onChange={(e) => setClassification(e.target.value)} required>
          <option value="quantile">Quantile</option>
          <option value="sld">SLD</option>
        </select>
      </div>
      
      {classification === "quantile" && (
        <>
          <InputComponent label="Nombre de classes" type="number" value={nbClasses} onChange={(e) => setNbClasses(e.target.value ? parseInt(e.target.value) : "")} required />
          <InputComponent label="Couleurs (ex: #ff0000,#00ff00,#0000ff)" type="text" value={colors} onChange={(e) => setColors(e.target.value)} required />
        </>
      )}
      
      {classification === "sld" && (
        <InputComponent label="Fichier SLD" type="file" selectedFile={sld?.name} onChange={handleFileChange} required />
      )}
      
      <ButtonComponent txt="Ajouter" onClick={triggerSubmit} />
    </form>
  );
};

export default AddVariableStyle;
