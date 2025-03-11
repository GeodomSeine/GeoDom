import React, { useRef, useState } from "react";
import { useAuth } from "../Auth/AuthContext";
import "../AdminContent.scss";
import ButtonComponent from "../../SimpleComponents/ButtonComponent";
import InputComponent from "../../SimpleComponents/InputComponent";

const AddProgram: React.FC = () => {
  const { token } = useAuth();
  const [name, setName] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [variables, setVariables] = useState("");
  const [exutoireId, setExutoireId] = useState("");
  const [active, setIsActive] = useState(true);

  const [background, setBackground] = useState<File | null>(null);
  const [pkMap, setPkMap] = useState<File | null>(null);
  const [senequeAesnHydroBasin, setSenequeAesnHydroBasin] = useState<File | null>(null);
  const [senequeAesnHydro, setSenequeAesnHydro] = useState<File | null>(null);
  const [stationsDonuts, setStationsDonuts] = useState<File | null>(null);

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

  const handleFileChange = (setter: React.Dispatch<React.SetStateAction<File | null>>) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        setter(e.target.files[0]);
      }
    };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("name", name);
    formData.append("title", title);
    formData.append("description", description);
    formData.append("variables", variables);
    formData.append("exutoire_id", exutoireId);
    formData.append("is_actived", (!active).toString());

    if (background) formData.append("background", background);
    if (pkMap) formData.append("pk_map", pkMap);
    if (senequeAesnHydroBasin) formData.append("seneque_aesn_hydro_basin", senequeAesnHydroBasin);
    if (senequeAesnHydro) formData.append("seneque_aesn_hydro", senequeAesnHydro);
    if (stationsDonuts) formData.append("stations_donuts", stationsDonuts);

    try {
      const response = await fetch("/admin/add", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();
      setMessage(data.message);
    } catch (error) {
      setMessage("Erreur lors de l'ajout du programme");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLFormElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      triggerSubmit();
    }
  };

  return (
    <form ref={formRef} onKeyDown={handleKeyDown} onSubmit={handleSubmit} className="admin_content">
      {message && <p className="status_message">{message}</p>}
      
      <InputComponent label="Nom du Programme" type="text" value={name} onChange={(e) => setName(e.target.value)} required />
      <InputComponent label={'Titre du Programme'} type="text" value={title} onChange={(e) => setTitle(e.target.value)} required />
      <InputComponent label={'Description du Programme'} type="textarea" value={description} onChange={(e) => setDescription(e.target.value)} />
      <InputComponent label={'Variables (exemple: ["flow", "no3", "nh4"])'} type="text" value={variables} onChange={(e) => setVariables(e.target.value)} required />
      <InputComponent label="Exutoire ID" type="number" value={exutoireId} onChange={(e) => setExutoireId(e.target.value)} required />
      <InputComponent label="Image de fond" type="file" accept=".png" selectedFile={background?.name} onChange={handleFileChange(setBackground)} />
      <InputComponent label="PK map sld" type="file" accept=".sld" selectedFile={pkMap?.name} onChange={handleFileChange(setPkMap)} />
      <InputComponent label="Seneque_aesn_hydro_basin sld" type="file" accept=".sld" selectedFile={senequeAesnHydroBasin?.name} onChange={handleFileChange(setSenequeAesnHydroBasin)} />
      <InputComponent label="Seneque_aesn_hydro sld" type="file" accept=".sld" selectedFile={senequeAesnHydro?.name} onChange={handleFileChange(setSenequeAesnHydro)} />
      <InputComponent label="Stations_donuts sld" type="file" accept=".sld" selectedFile={stationsDonuts?.name} onChange={handleFileChange(setStationsDonuts)} />
      <InputComponent label="Prévisualisation" type="checkbox" checked={active} onChange={(e) => setIsActive((e.target as HTMLInputElement).checked)} />
      <ButtonComponent txt="Ajouter" onClick={triggerSubmit}/>
    </form>
  );
};

export default AddProgram;
