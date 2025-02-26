import React, { useState } from "react";
import { useAuth } from "../Auth/AuthContext";
import "./AddUser.scss";

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

    try {
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
    } catch (error) {
      setMessage("Erreur lors de l'ajout de l'utilisateur");
    }
  };

  return (
    <div className="add-user-container">
      <h3 className="add-user-title">Ajouter un Utilisateur</h3>
      {message && <p className="add-user-message">{message}</p>}
      <form onSubmit={handleSubmit} className="add-user-form">
        <label>Nom d'utilisateur</label>
        <input
          type="text"
          className="add-user-input"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />

        <label>Mot de passe</label>
        <input
          type="password"
          className="add-user-input"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <label>Admin ?</label>
        <select className="add-user-select" value={isAdmin.toString()} onChange={(e) => setIsAdmin(e.target.value === "true")}>
          <option value="true">Oui</option>
          <option value="false">Non</option>
        </select>

        <button type="submit" className="add-user-button">Ajouter</button>
      </form>
    </div>
  );
};

export default AddUser;
