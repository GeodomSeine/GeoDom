import React, { useEffect, useState } from "react";
import { useAuth } from "../Auth/AuthContext";
import "../AdminContent.scss";
import EditVariableStyleModal from "../EditVariableStyleModal/EditVariableStyleModal";
import DeleteVariableModal from "../DeleteVariableStyleModal/DeleteVariableStyleModal";
import ButtonComponent from "../../SimpleComponents/ButtonComponent";

const ListVariableStyles: React.FC = () => {
  const { token } = useAuth();
  const [variables, setVariables] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedVariable, setSelectedVariable] = useState<any | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const fetchVariables = async () => {
    try {
      const response = await fetch("/admin/variable/list", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error("Erreur lors de la récupération des variables.");
      const data = await response.json();
      setVariables(Object.entries(data).map(([key, value]) => ({ code: key, ...(value as object) })));
    } catch (err) {
      setError("Impossible de récupérer les variables.");
    } finally {
      setLoading(false);
    }
  };

  const openEditModal = (variable: any) => {
    setSelectedVariable(variable);
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (variable: any) => {
    setSelectedVariable(variable);
    setIsDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedVariable) return;
    try {
      await fetch(`/admin/variable/delete/${selectedVariable.code}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      fetchVariables();
    } catch (err) {
      console.error("Erreur lors de la suppression de la variable :", err);
    } finally {
      setIsDeleteModalOpen(false);
    }
  };

  useEffect(() => {
    fetchVariables();
  }, [token]);

  return (
    <div className="admin_content">
      {loading ? (
        <p>Chargement...</p>
      ) : error ? (
        <p className="status_message">{error}</p>
      ) : (
        <ul className="admin_content_list">
          {variables.map((variable) => (
            <li key={variable.code} className="is_visible">
              <div>
                <h4>{variable.code}</h4>
                <p>Classification : {variable.classification}</p>
              </div>
              <div>
                <ButtonComponent txt={"Éditer"} onClick={() => openEditModal(variable)} />
                <ButtonComponent txt={"Supprimer"} onClick={() => openDeleteModal(variable)} />
              </div>
            </li>
          ))}
        </ul>
      )}
      {selectedVariable && (
        <>
          <EditVariableStyleModal
            isOpen={isEditModalOpen}
            onClose={() => setIsEditModalOpen(false)}
            variable={selectedVariable}
            onUpdate={fetchVariables}
          />
          <DeleteVariableModal
            isOpen={isDeleteModalOpen}
            onClose={() => setIsDeleteModalOpen(false)}
            onConfirm={handleDelete}
            variableCode={selectedVariable.code}
          />
        </>
      )}
    </div>
  );
};

export default ListVariableStyles;
