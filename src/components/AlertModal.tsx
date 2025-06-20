import React from 'react';
import ModalPortal from './ModalPortal';

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
  return (    <ModalPortal>
      <div className={`fixed inset-0 flex items-center justify-center z-[100] ${uploadingVideo && 'h-screen'}`}>
        <div className="fixed inset-0 bg-black opacity-20 backdrop-blur-[2px]" onClick={onClose} />
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full relative z-50 mx-4">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {title}
          </h3>
          <p className="text-sm text-gray-500 mb-6">
            {description}
          </p>
          <div className="flex justify-end">
            {actionFuction ? (
              <>
                <button
                  className="px-4 py-2 mx-5 bg-blueApp text-white font-semibold rounded-md hover:bg-blue-700 transition-colors"
                  onClick={() => actionFuction()}
                >
                  Aceptar
                </button>
                <button
                  onClick={onClose}
                  className="px-4 py-2 bg-gray-200 text-gray-700 font-semibold rounded-md mr-2 hover:bg-gray-300 transition-colors"
                >
                  Cancelar
                </button>
              </>
            ) : (
              <button
                onClick={onClose}
                className="px-4 py-2 bg-blueApp text-white font-semibold rounded-md hover:bg-blue-700 transition-colors"
              >
                {actionLabel}
              </button>
            )}          </div>
        </div>
      </div>
      </div>
    </ModalPortal>
  );
};

export default AlertModal;