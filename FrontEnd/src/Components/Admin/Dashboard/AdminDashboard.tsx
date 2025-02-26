import React, { useState } from "react";
import { useAuth } from "../Auth/AuthContext";
import { useNavigate } from "react-router-dom";
import ChangePassword from "../ChangePassword/ChangePassword";
import AddUser from "../AddUser/AddUser";
import AddProgram from "../AddProgram/AddProgram";
import ListPrograms from "../ListPrograms/ListPrograms";
import "./AdminDashboard.scss";

const AdminDashboard: React.FC = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState("change-password");

  const handleLogout = () => {
    logout();
    navigate("/admin"); // Retourne à la page de login après déconnexion
  };

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <h1 className="admin-title">Administration</h1>
        <button onClick={handleLogout} className="logout-button">Déconnexion</button>
      </div>

      <div className="admin-nav">
        <button 
          className={`admin-nav-button ${activeSection === "change-password" ? "active" : ""}`} 
          onClick={() => setActiveSection("change-password")}
        >
          Changer Mot de Passe
        </button>
        <button 
          className={`admin-nav-button ${activeSection === "add-user" ? "active" : ""}`} 
          onClick={() => setActiveSection("add-user")}
        >
          Ajouter Utilisateur
        </button>
        <button 
          className={`admin-nav-button ${activeSection === "add-program" ? "active" : ""}`} 
          onClick={() => setActiveSection("add-program")}
        >
          Ajouter Programme
        </button>
        <button 
          className={`admin-nav-button ${activeSection === "list-programs" ? "active" : ""}`} 
          onClick={() => setActiveSection("list-programs")}
        >
          Gérer Programmes
        </button>
      </div>

      <div className="admin-content">
        {activeSection === "change-password" && <ChangePassword />}
        {activeSection === "add-user" && <AddUser />}
        {activeSection === "add-program" && <AddProgram />}
        {activeSection === "list-programs" && <ListPrograms/>}
      </div>
    </div>
  );
};

export default AdminDashboard;
