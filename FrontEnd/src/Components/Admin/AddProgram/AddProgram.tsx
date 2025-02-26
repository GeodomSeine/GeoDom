import React, { useState } from "react";
import { useAuth } from "../Auth/AuthContext";
import "./AddProgram.scss";

const AddProgram: React.FC = () => {
  const { token } = useAuth();
  const [name, setName] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [variables, setVariables] = useState("");
  const [exutoireId, setExutoireId] = useState("");

  const [background, setBackground] = useState<File | null>(null);
  const [pkMap, setPkMap] = useState<File | null>(null);
  const [senequeAesnHydroBasin, setSenequeAesnHydroBasin] = useState<File | null>(null);
  const [senequeAesnHydro, setSenequeAesnHydro] = useState<File | null>(null);
  const [stationsDonuts, setStationsDonuts] = useState<File | null>(null);

  const [message, setMessage] = useState<string | null>(null);

  const handleFileChange = (setter: React.Dispatch<React.SetStateAction<File | null>>) => 
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) {
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

  return (
    <div className="add-program-container">
      <h3 className="add-program-title">Ajouter un Programme</h3>
      {message && <p className="add-program-message">{message}</p>}
      <form onSubmit={handleSubmit} className="add-program-form">
        <label>Nom du Programme</label>
        <input type="text" className="add-program-input" value={name} onChange={(e) => setName(e.target.value)} required />

        <label>Titre</label>
        <input type="text" className="add-program-input" value={title} onChange={(e) => setTitle(e.target.value)} required />

        <label>Description</label>
        <textarea className="add-program-textarea" value={description} onChange={(e) => setDescription(e.target.value)} />

        <label>Variables (exemple: ["flow", "no3", "nh4"])</label>
        <input type="text" className="add-program-input" value={variables} onChange={(e) => setVariables(e.target.value)} required />

        <label>Exutoire ID</label>
        <input type="number" className="add-program-input" value={exutoireId} onChange={(e) => setExutoireId(e.target.value)} required />

        <label>Image de fond</label>
        <input type="file" className="add-program-file" onChange={handleFileChange(setBackground)} />

        <label>PK map sld</label>
        <input type="file" className="add-program-file" onChange={handleFileChange(setPkMap)} />

        <label>seneque_aesn_hydro_basin sld</label>
        <input type="file" className="add-program-file" onChange={handleFileChange(setSenequeAesnHydroBasin)} />

        <label>seneque_aesn_hydro sld</label>
        <input type="file" className="add-program-file" onChange={handleFileChange(setSenequeAesnHydro)} />

        <label>stations_donuts sld</label>
        <input type="file" className="add-program-file" onChange={handleFileChange(setStationsDonuts)} />

        <button type="submit" className="add-program-button">Ajouter</button>
      </form>
    </div>
  );
};

export default AddProgram;
