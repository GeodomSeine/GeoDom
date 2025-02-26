import React, { useState } from "react";
import { useAuth } from "../Auth/AuthContext";
import "./ChangePassword.scss";

const ChangePassword: React.FC = () => {
  const { token } = useAuth();
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setMessage("Les mots de passe ne correspondent pas");
      return;
    }

    const formData = new URLSearchParams();
    formData.append("old_password", oldPassword);
    formData.append("new_password", newPassword);
    formData.append("confirm_password", confirmPassword);

    try {
      const response = await fetch("/auth/change_password", {
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
      setMessage("Erreur lors du changement de mot de passe");
    }
  };

  return (
    <div className="change-password-container">
      <h3 className="change-password-title">Changer de Mot de Passe</h3>
      {message && <p className="change-password-message">{message}</p>}
      <form onSubmit={handleSubmit} className="change-password-form">
        <label>Ancien mot de passe</label>
        <input
          type="password"
          className="change-password-input"
          value={oldPassword}
          onChange={(e) => setOldPassword(e.target.value)}
          required
        />
        <label>Nouveau mot de passe</label>
        <input
          type="password"
          className="change-password-input"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
        />
        <label>Confirmer le nouveau mot de passe</label>
        <input
          type="password"
          className="change-password-input"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />
        <button type="submit" className="change-password-button">
          Modifier
        </button>
      </form>
    </div>
  );
};

export default ChangePassword;
