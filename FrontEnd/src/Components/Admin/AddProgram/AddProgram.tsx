import React, { useState } from "react";
import { useAuth } from "../Auth/AuthContext";

const AddProgram: React.FC = () => {
  const { token } = useAuth();
  const [name, setName] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [variables, setVariables] = useState("");
  const [exutoireId, setExutoireId] = useState("");
  const [background, setBackground] = useState<File | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setBackground(e.target.files[0]);
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
    if (background) {
      formData.append("background", background);
    }

    const response = await fetch("/admin/add", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    const data = await response.json();
    setMessage(data.message);
  };

  return (
    <div>
      <h3>Ajouter un Programme</h3>
      {message && <p className="message">{message}</p>}
      <form onSubmit={handleSubmit}>
        <label>Nom du Programme</label>
        <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />

        <label>Titre</label>
        <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required />

        <label>Description</label>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} />

        <label>Variables (exemple: ["flow", "no3", "nh4"])</label>
        <input type="text" value={variables} onChange={(e) => setVariables(e.target.value)} required />

        <label>Exutoire ID</label>
        <input type="number" value={exutoireId} onChange={(e) => setExutoireId(e.target.value)} required />

        <label>Image de fond</label>
        <input type="file" onChange={handleFileChange} />

        <button type="submit">Ajouter</button>
      </form>
    </div>
  );
};

export default AddProgram;
