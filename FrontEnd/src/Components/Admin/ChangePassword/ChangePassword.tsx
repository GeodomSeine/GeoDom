import React, { useState } from "react";
import { useAuth } from "../Auth/AuthContext";

const ChangePassword: React.FC = () => {
  const { token } = useAuth();
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      alert("Les mots de passe ne correspondent pas");
      return;
    }

    const formData = new URLSearchParams();
    formData.append("old_password", oldPassword);
    formData.append("new_password", newPassword);
    formData.append("confirm_password", confirmPassword);

    const response = await fetch("/auth/change_password", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    const data = await response.json();
    alert(data.message);
  };

  return (
    <div>
      <h3>Changer de Mot de Passe</h3>
      <form onSubmit={handleSubmit}>
        <label>Ancien mot de passe</label>
        <input type="password" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} required />
        <label>Nouveau mot de passe</label>
        <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
        <label>Confirmer le nouveau mot de passe</label>
        <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
        <button type="submit">Modifier</button>
      </form>
    </div>
  );
};

export default ChangePassword;
