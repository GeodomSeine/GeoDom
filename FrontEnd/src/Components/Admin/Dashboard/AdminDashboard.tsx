import React, { useState } from "react";
import { useAuth } from "../Auth/AuthContext";
import { useNavigate } from "react-router-dom";
import ChangePassword from "../ChangePassword/ChangePassword";
import AddUser from "../AddUser/AddUser";
import AddProgram from "../AddProgram/AddProgram";
import ListPrograms from "../ListPrograms/ListPrograms";
import "../AdminContent.scss";
import ButtonComponent from "../../SimpleComponents/ButtonComponent";
import AddVariableStyle from "../AddVariableStyle/AddVariableStyle";
import ListVariableStyles from "../ListVariableStyles/ListVariableStyles";

const AdminDashboard: React.FC = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState("change-password");

  const handleLogout = () => {
    logout();
    navigate("/admin"); // Retourne à la page de login après déconnexion
  };

  return (
    <div className="admin_dashboard">
      <div className="admin_card">
        <div className="admin_header">
          <h2 className="admin_title">Administration</h2>
          <ButtonComponent txt="Déconnexion" onClick={handleLogout} />
        </div>

        <div className="admin_nav">
          <ButtonComponent
            txt="Changer Mot de Passe"
            onClick={() => setActiveSection("change-password")}
            onDark={activeSection !== "change-password"}
          />
          <ButtonComponent
            txt="Ajouter Utilisateur"
            onClick={() => setActiveSection("add-user")}
            onDark={activeSection !== "add-user"}
          />
          <ButtonComponent
            txt="Ajouter Programme"
            onClick={() => setActiveSection("add-program")}
            onDark={activeSection !== "add-program"}
          />
          <ButtonComponent
            txt="Ajouter style de variable"
            onClick={() => setActiveSection("add-variable-style")}
            onDark={activeSection !== "add-variable-style"}
          />
          <ButtonComponent
            txt="Gérer Programmes"
            onClick={() => setActiveSection("list-programs")}
            onDark={activeSection !== "list-programs"}
          />
          <ButtonComponent
            txt="Gérer styles de variables"
            onClick={() => setActiveSection("list-variables")}
            onDark={activeSection !== "list-variables"}
          />
        </div>
        {activeSection === "change-password" && <ChangePassword />}
        {activeSection === "add-user" && <AddUser />}
        {activeSection === "add-program" && <AddProgram />}
        {activeSection === "list-programs" && <ListPrograms />}
        {activeSection === "add-variable-style" && <AddVariableStyle/>}
        {activeSection === "list-variables" && <ListVariableStyles />}
      </div>
    </div>
  );
};

export default AdminDashboard;
