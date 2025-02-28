import React, { useRef, useState } from "react";
import { useAuth } from "../Auth/AuthContext";
import { useNavigate } from "react-router-dom";
import '../AdminContent.scss';
import InputComponent from "../../SimpleComponents/InputComponent";
import ButtonComponent from "../../SimpleComponents/ButtonComponent";

const LoginForm: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const formData = new URLSearchParams();
    formData.append("username", username);
    formData.append("password", password);

    try {
      const response = await fetch("/auth/token", {
        method: "POST",
        body: formData,
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      });

      const data = await response.json();
      if (response.ok) {
        login(data.access_token);
        navigate("/admin");
      } else {
        setError("Connexion échouée : " + data.detail);
      }
    } catch (err) {
      setError("Erreur de connexion");
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
    <div className="admin_dashboard">
      <div className="admin_card">
        <form ref={formRef} onKeyDown={handleKeyDown} onSubmit={handleSubmit} className="admin_content">
          <h3>Connexion Admin</h3>
          {error && <p className="status_message">{error}</p>}
          <InputComponent label="Nom d'utilisateur" type="text" value={username} onChange={(e) => setUsername(e.target.value)} required />
          <InputComponent label="Mot de passe" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          <ButtonComponent txt="Se connecter" onClick={triggerSubmit} />
        </form>
      </div>
    </div>
  );
};

export default LoginForm;
