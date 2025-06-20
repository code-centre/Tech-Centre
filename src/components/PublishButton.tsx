import React, { useState } from "react";
import { doc, updateDoc, getDoc, deleteDoc } from "firebase/firestore";
import { db } from "@/../firebase";
import { useRouter } from "next/navigation";
import AlertModal from "./AlertModal";

interface PublishButtonProps {
  eventId: string;
  onPublish: () => void;
  onRemove: () => void;
  onDelete: () => void;
  onClose: () => void;
}

interface modalInterface {
  isOpen: boolean;
  title: string;
  description: string;
  pendingNavigation?: boolean;
  actionFunction?: Function;
  redirectUrl?: string;
}

const PublishButton = ({ eventId, onPublish, onRemove, onDelete }: PublishButtonProps) => {
  const router = useRouter();
  const [modalState, setModalState] = useState<modalInterface>({
    isOpen: false,
    title: "",
    description: "",
    pendingNavigation: false,
    actionFunction: Function,
    redirectUrl: "",
  });

  const showModal = (
    title: string,
    description: string,
    shouldNavigate: boolean = false,
    actionFunction?: Function | undefined,
    redirectUrl: string = ""
  ) => {
    setModalState({
      isOpen: true,
      title,
      description,
      pendingNavigation: shouldNavigate,
      actionFunction: actionFunction ? actionFunction : undefined,
      redirectUrl,
    });
  };

  const handleCancel = () => {
    if (modalState.pendingNavigation && modalState.redirectUrl) {
      router.push(modalState.redirectUrl);
    }
    setModalState(prev => ({
      ...prev,
      isOpen: false,
      pendingNavigation: false,
      actionFunction: undefined,
      redirectUrl: "",
    }));
  };

  const handlePublish = async () => {
    try {
      const eventDocRef = doc(db, "events", eventId);
      const eventDoc = await getDoc(eventDocRef);
      const eventData = eventDoc.data();

      if (!eventData || eventData.status === "published") {
        showModal(
          "Curso publicado",
          "El curso ya está publicado"
        );
        return;
      }

      await updateDoc(eventDocRef, { status: "published" });
      onPublish();
      setModalState(prev => ({ ...prev, isOpen: false }));
      showModal(
        "Éxito",
        "El curso ha sido publicado exitosamente",
        true,
        undefined,
        `/programas-academicos/${eventData.slug}`
      );
    } catch (error) {
      showModal(
        "Error",
        "Error al publicar el curso: " + error
      );
    }
  };

  const handleRemove = async () => {
    try {
      const eventDocRef = doc(db, "events", eventId);
      const eventDoc = await getDoc(eventDocRef);
      const eventData = eventDoc.data();

      if (!eventData || eventData.status === "draft") {
        showModal(
          "Curso Removido",
          "El curso ya está en estado borrador"
        );
        return;
      }

      await updateDoc(eventDocRef, { status: "draft" });
      onRemove();
      setModalState(prev => ({ ...prev, isOpen: false }));
      showModal(
        "Éxito",
        "El curso ha sido removido exitosamente",
        true,
        undefined,
        `/programas-academicos/${eventData.slug}`
      );
    } catch (error) {
      showModal(
        "Error",
        "Error al remover el curso: " + error
      );
    }
  };

  const handleDeleteEvent = async () => {
    try {
      const eventDocRef = doc(db, "events", eventId);
      await deleteDoc(eventDocRef);
      onDelete();
      setModalState(prev => ({ ...prev, isOpen: false }));
      showModal(
        "Éxito",
        "Curso borrado exitosamente",
        true,
        undefined,
        "/"
      );
    } catch (error) {
      showModal(
        "Error",
        "Error borrando curso: " + error
      );
    }
  };

  return (
    <>
      <div className="flex gap-4">
        <button
          onClick={() => showModal("Publicar Evento", "¿Estás seguro de que deseas publicar este evento?", false, handlePublish)}
          className="px-4 py-2 bg-blueApp text-white font-semibold rounded-md shadow-md hover:bg-blue-700 hover:text-white transition duration-300 ease-in-out transform hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Publicar curso
        </button>

        <button
          onClick={() => showModal("Remover evento", "¿Estás seguro de que deseas remover este evento?", false, handleRemove)}
          className="px-4 py-2 bg-red-600 text-white font-semibold rounded-md shadow-md hover:bg-red-800 hover:text-white transition duration-300 ease-in-out transform hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
        >
          Remover curso
        </button>

        <button
          onClick={() => showModal("Borrar evento", "¿Estás seguro de que deseas borrar este evento?", true, handleDeleteEvent)}
          className="px-4 py-2 bg-red-600 text-white font-semibold rounded-md shadow-md hover:bg-red-800 hover:text-white transition duration-300 ease-in-out transform hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
        >
          Borrar curso
        </button>
      </div>

      <AlertModal
        isOpen={modalState.isOpen}
        actionFuction={modalState.actionFunction}
        onClose={handleCancel}
        title={modalState.title}
        description={modalState.description}
      />
    </>
  );
};

export default PublishButton;