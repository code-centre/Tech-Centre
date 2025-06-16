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
      <div className="flex gap-2">
        <button
          onClick={onSave}
          className="self-start bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        >
          Guardar
        </button>
        <button
          onClick={onCancel}
          className="self-start bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
        >
          Cancelar
        </button>
      </div>
    </div>
  )
}

export default React.memo(Editor)