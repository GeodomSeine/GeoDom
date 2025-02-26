import React, { useState } from "react";
import { useAuth } from "../Auth/AuthContext";
import { useNavigate } from "react-router-dom";
import ChangePassword from "../ChangePassword/ChangePassword";
import AddUser from "../AddUser/AddUser";
import AddProgram from "../AddProgram/AddProgram";

const AdminDashboard: React.FC = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState("change-password");

  const handleLogout = () => {
    logout();
    navigate("/admin"); // Retourne à la page de login après déconnexion
  };

  return (
    <div className="container">
      <button onClick={handleLogout} className="logout-button">Déconnexion</button>
      <h1>Administration</h1>

      <div className="admin-nav">
        <button onClick={() => setActiveSection("change-password")}>Changer Mot de Passe</button>
        <button onClick={() => setActiveSection("add-user")}>Ajouter Utilisateur</button>
        <button onClick={() => setActiveSection("add-program")}>Ajouter Programme</button>
      </div>

      {activeSection === "change-password" && <ChangePassword />}
      {activeSection === "add-user" && <AddUser />}
      {activeSection === "add-program" && <AddProgram />}
    </div>
  );
};

export default AdminDashboard;
