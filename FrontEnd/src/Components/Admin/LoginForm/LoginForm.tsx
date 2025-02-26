import React, { useState } from "react";
import { useAuth } from "../Auth/AuthContext";
import { useNavigate } from "react-router-dom";

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

  return (
    <div className="container">
      <h2>Connexion Admin</h2>
      {error && <p className="error">{error}</p>}
      <form onSubmit={handleSubmit}>
        <label>Nom d'utilisateur</label>
        <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} required />

        <label>Mot de passe</label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />

        <button type="submit">Se connecter</button>
      </form>
    </div>
  );
};

export default LoginForm;
