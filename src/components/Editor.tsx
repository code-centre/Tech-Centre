import JoditEditor from "jodit-react"
import React, { useCallback, useMemo, useRef } from "react"

interface EditorComponentProps {
  value: string;
  onChange: (content: string) => void;
  onSave: () => void;
  onCancel: () => void;
}

const Editor: React.FC<EditorComponentProps> = ({ value, onChange, onSave, onCancel }) => {
  const editorRef = useRef(null)

  const editorConfig = useMemo(() => ({
    toolbarButtonSize: "middle" as const,
    toolbarAdaptive: false,
    showCharsCounter: false,
    showWordsCounter: false,
    showXPathInStatusbar: false,
    buttons: [
      "bold",
      "italic",
      "underline",
      "strikethrough",
      "ul",
      "ol",
      "outdent",
      "indent",
      "align",
      "link",
      "source",
    ],
    removeButtons: [
      "font",
      "fontsize",
      "brush",
      "paragraph",
      "image",
      "table",
      "video",
      "file",
      "copyformat",
      "hr",
      "eraser",
      "fullsize",
      "print",
      "about",
    ],
  }), [])

  const handleChange = useCallback((content: string) => {
    onChange(content)
    if (editorRef.current) {
      (editorRef.current as any).editor?.focus() // Forzar el enfoque después de cada cambio
    }
  }, [onChange])

  return (
    <div className="flex flex-col gap-4 text-black">
      <JoditEditor
        ref={editorRef}
        value={value}
        config={editorConfig}
        onChange={handleChange}
      />
      <div className="flex gap-3">
        <button
          onClick={onSave}
          className="px-4 py-2 text-sm font-medium text-gray-300 bg-gray-800/50 border border-gray-700 rounded-md hover:bg-gray-800 hover:border-gray-600 transition-colors duration-200"
        >
          Guardar
        </button>
        <button
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-400 bg-transparent border border-gray-700 rounded-md hover:bg-gray-800/30 hover:border-gray-600 transition-colors duration-200"
        >
          Cancelar
        </button>
      </div>
    </div>
  )
}

export default React.memo(Editor)