import React, { useRef, useState } from "react";
import { useAuth } from "../Auth/AuthContext";
import "../AdminContent.scss";
import InputComponent from "../../SimpleComponents/InputComponent";
import ButtonComponent from "../../SimpleComponents/ButtonComponent";

const AddUser: React.FC = () => {
  const { token } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
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

  const handleKeyDown = (e: React.KeyboardEvent<HTMLFormElement>) => {
        if (e.key === "Enter") {
          e.preventDefault(); 
          triggerSubmit();
        }
      };

  return (
    <form ref={formRef} onKeyDown={handleKeyDown} onSubmit={handleSubmit} className="admin_content">
      {message && <p className="status_message">{message}</p>}
      
        <InputComponent label="Nom d'utilisateur" type="text" value={username}  onChange={(e) => setUsername(e.target.value)} required/>
        <InputComponent label="Mot de passe" type="password" value={password}  onChange={(e) => setPassword(e.target.value)} required/>

      <div>
        <p>Admin ?</p>
        <select value={isAdmin.toString()} onChange={(e) => setIsAdmin(e.target.value === "true")}>
          <option value="true">Oui</option>
          <option value="false">Non</option>
        </select>
      </div>

      <ButtonComponent txt="Ajouter" onClick={triggerSubmit}/>
    </form>
  );
};

export default AddUser;
