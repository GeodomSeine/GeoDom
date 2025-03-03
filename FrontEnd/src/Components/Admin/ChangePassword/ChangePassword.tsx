import React, { useRef, useState } from "react";
import { useAuth } from "../Auth/AuthContext";
import "../AdminContent.scss";
import InputComponent from "../../SimpleComponents/InputComponent";
import ButtonComponent from "../../SimpleComponents/ButtonComponent";

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
    <form onKeyDown={handleKeyDown} ref={formRef} onSubmit={handleSubmit} className="admin_content">
      {message && <p className="status_message">{message}</p>}
      <InputComponent label="Ancien mot de passe" type="password" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} required />
      <InputComponent label="Nouveau mot de passe" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
      <InputComponent label="Confirmer le nouveau mot de passe" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
      <ButtonComponent txt="Modifier" onClick={triggerSubmit} />
    </form>
  );
};

export default ChangePassword;
