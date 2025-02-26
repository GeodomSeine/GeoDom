import React, { useState } from "react";
import { useAuth } from "../Auth/AuthContext";

const AddUser: React.FC = () => {
  const { token } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const formData = new URLSearchParams();
    formData.append("username", username);
    formData.append("password", password);
    formData.append("is_admin", isAdmin.toString());

    const response = await fetch("/auth/add_user", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    const data = await response.json();
    setMessage(data.message);
  };

  return (
    <div>
      <h3>Ajouter un Utilisateur</h3>
      {message && <p className="message">{message}</p>}
      <form onSubmit={handleSubmit}>
        <label>Nom d'utilisateur</label>
        <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} required />

        <label>Mot de passe</label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />

        <label>Admin ?</label>
        <select value={isAdmin.toString()} onChange={(e) => setIsAdmin(e.target.value === "true")}>
          <option value="true">Oui</option>
          <option value="false">Non</option>
        </select>

        <button type="submit">Ajouter</button>
      </form>
    </div>
  );
};

export default AddUser;
