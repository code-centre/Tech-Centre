import React, { useEffect, useState } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { storage, db } from "@/../firebase";
import { ref as storageRef, getDownloadURL } from "firebase/storage";
import { useUploadFile } from "react-firebase-hooks/storage";
import { Upload, Camera } from "lucide-react";
import AlertModal from "./AlertModal";
import Image from "next/image";


interface FileUploadProps {
  isImage: boolean
  entityId: string;
  onFileUpload: (url: string) => void;
  previewUrl: string | undefined;
  isCourseCard?: boolean;
}

const FileUpload = ({ entityId, onFileUpload, previewUrl, isImage, isCourseCard = false }: FileUploadProps) => {
  const [uploadFile, uploading, snapshot, error] = useUploadFile();
  const path = isImage && isCourseCard ? `programs/${entityId}/coverImage` : isImage && !isCourseCard ? `events/${entityId}/heroImage` : `programs/${entityId}/heroVideo`;
  const ref = storageRef(storage, path);
  const [selectedFile, setSelectedFile] = useState<File>();
  const [isHovered, setIsHovered] = useState(false);
  const [modal, setModal] = useState(
    {
      isOpen: false,
      title: "",
      description: "",
    }
  );

  const showModal = (title: string, description: string) => {
    setModal({
      isOpen: true,
      title,
      description,
    });
  };

  useEffect(() => {
    const upload = async () => {
      if (selectedFile) {
        const result = await uploadFile(ref, selectedFile, {
          contentType: selectedFile.type,
        });
        if (result) {
          const downloadURL = await getDownloadURL(result.ref);
          await updateDoc(doc(db, `${isImage && isCourseCard ? 'programs' : isImage && !isCourseCard ? 'events' : 'programs'}`, entityId), {
            ...(isImage && isCourseCard ? { image: downloadURL } : isImage && !isCourseCard ? { heroImage: downloadURL } : { heroVideo: downloadURL })
          });
          onFileUpload(downloadURL);
          showModal(
            "Imagen de portada actualizada",
            "La imagen de portada ha sido actualizada exitosamente");
          ;
        }
      }
    };
    upload();
  }, [selectedFile]);

  const inputId = `hero-image-upload-${entityId}`;
  return (
    <div className={`absolute ${isCourseCard ? ' right-2' : 'top-10 right-4'}  z-10`}>
      <label
        htmlFor={inputId}
        className="group relative flex items-center justify-center cursor-pointer"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className={`relative ${isCourseCard ? 'w-12 h-12' : 'w-16 h-16'} bg-white rounded-full shadow-lg overflow-hidden transition-transform duration-300 hover:scale-105 border-2 border-blueApp`}>
          {previewUrl && !isCourseCard ? (
            <>
              <Image
                src={previewUrl}
                alt="Preview"
                layout="fill"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <Camera className="w-6 h-6 text-white" />
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full bg-gray-50">
              <Upload className="w-6 h-6 text-blueApp" />
            </div>
          )}
        </div>

        {isHovered && (
          <div className={`absolute ${isCourseCard ? 'top-10 right-4' : ' -top-8 right-0'} bg-white px-3 py-1.5 rounded-lg shadow-md text-sm font-medium text-gray-700 whitespace-nowrap`}>
            {isImage ? 'Cambiar imagen de portada' : 'Cambiar/poner video de portada'}
          </div>
        )}

        <input
          id={inputId}
          type="file"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files ? e.target.files[0] : undefined;
            setSelectedFile(file);
          }}
          accept={`${isImage ? 'image/*' : "video/*"}`}
          disabled={uploading}
        />
      </label>

      {/* Estados de carga y error */}
      <div className="absolute right-0 top-full mt-2">
        {error && (
          <div className="bg-red-50 text-red-600 px-4 py-2 rounded-lg shadow-lg text-sm font-medium border border-red-200">
            Error: {error.message}
          </div>
        )}
        {uploading && (
          <div className="bg-blue-50 text-blue-600 px-4 py-2 rounded-lg shadow-lg text-sm font-medium border border-blue-200 flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            Subiendo...
          </div>
        )}
      </div>
      <AlertModal
        isOpen={modal.isOpen}
        onClose={() => {
          setModal({ ...modal, isOpen: false });
        }}
        title={modal.title}
        description={modal.description}
        uploadingVideo={!isImage && true}
      />
    </div>
  );
};

export default FileUpload;