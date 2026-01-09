import React from 'react';
// import ModalPortal from './ModalPortal';

interface AlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description: string;
  actionLabel?: string;
  actionFuction?: Function | undefined;
  uploadingVideo?: boolean
}

const AlertModal = ({
  isOpen,
  onClose,
  title,
  description,
  actionLabel = "Aceptar",
  actionFuction,
  uploadingVideo
}: AlertModalProps) => {
  if (!isOpen) return null;
  return (    
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">hey</div>
  );
};

export default AlertModal;