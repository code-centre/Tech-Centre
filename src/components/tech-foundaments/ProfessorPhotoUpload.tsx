import Image from "next/image";
import { Upload } from "lucide-react";

interface FileUploadProps {
  onFileChange: (file: File) => void;
  previewUrl: string | null;
}

const SpeakersPhotoUpload = ({ onFileChange, previewUrl }: FileUploadProps) => {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileChange(file);
    }
  };

  return (
    <div className="flex items-center justify-center w-full">
      <label
        htmlFor="dropzone-file"
        className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 relative overflow-hidden"
      >
        {previewUrl ? (
          <div className="w-full h-full absolute inset-0">
            <Image
              src={previewUrl}
              alt="Preview"
              fill
              className="object-cover rounded-lg"
            />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center pt-5 pb-6 z-10 relative">
            <Upload className="w-10 h-10 mb-3 text-gray-400" />
            <p className="mb-2 text-sm text-gray-500">
              <span className="font-semibold">Click para subir</span> o arrastra y suelta
            </p>
            <p className="text-xs text-gray-500">SVG, PNG o JPG</p>
          </div>
        )}
        <input
          id="dropzone-file"
          type="file"
          className="hidden"
          onChange={handleFileChange}
          accept="image/*"
        />
      </label>
    </div>
  );
};

export default SpeakersPhotoUpload;