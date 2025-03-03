import React, { useEffect, useState } from "react";
import { useAuth } from "../Auth/AuthContext";
import "../AdminContent.scss";
import { getPrograms, ProgramResponse } from "../../../services/api";
import { Program } from "../../../services/api";
import DeleteProgramModal from "../DeleteProgramModal/DeleteProgramModal";
import EditProgramModal from "../EditProgramModal/EditProgramModal";
import ButtonComponent from "../../SimpleComponents/ButtonComponent";

const ListPrograms: React.FC = () => {
  const { token } = useAuth();
  const [programs, setPrograms] = useState<ProgramResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const fetchPrograms = async () => {
    try {
      const response = await getPrograms();
      setPrograms(response);
    } catch (err) {
      console.log("errer : ", err)
      setError("Impossible de récupérer les programmes.");
    } finally {
      setLoading(false);
    }
  };

  const openDeleteModal = (program: Program) => {
    setSelectedProgram(program);
    setIsDeleteModalOpen(true);
  };

  const openEditModal = (program: Program) => {
    setSelectedProgram(program);
    setIsEditModalOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedProgram) return;

    try {
      await fetch(`/admin/delete/${selectedProgram.name}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Bearer ${token}`,
        },
      });
      await fetchPrograms();
    } catch (err) {
      console.error("Erreur lors de la suppression :", err);
    } finally {
      setIsDeleteModalOpen(false);
    }
  };

  useEffect(() => {
    fetchPrograms();
  }, [token]);


  return (
    <div className="admin_content">
      {loading ? (
        <p>Chargement...</p>
      ) : error ? (
        <p className="status_message">{error}</p>
      ) : (
        <ul className="admin_content_list">
          {Array.isArray(programs) && programs.map((item: Program) => (
            <li className={item.is_actived ? "is_visible" : "is_preview"} key={item.name}>
              <div>
                <h4>{item.title}{item.is_actived ? " (actif)" : " (preview)"}</h4>
                <p>{item.description}</p>
              </div>
              <div>
                <ButtonComponent txt={"Éditer"} onClick={() => openEditModal(item)}/>
                <ButtonComponent txt={"Supprimer"} onClick={() => openDeleteModal(item)}/>
              </div>
            </li>
          ))}
        </ul>
      )}
      {selectedProgram && (
        <>
          <DeleteProgramModal
            isOpen={isDeleteModalOpen}
            onClose={() => setIsDeleteModalOpen(false)}
            onConfirm={handleDelete}
            programName={selectedProgram.name}
          />
          <EditProgramModal
            isOpen={isEditModalOpen}
            onClose={() => setIsEditModalOpen(false)}
            program={selectedProgram}
            onUpdate={fetchPrograms}
          />
        </>
      )}
    </div>
  );
};

export default ListPrograms;
