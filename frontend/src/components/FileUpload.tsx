import { useState, useRef } from 'react'
import { Upload, X, Loader2, File as FileIcon } from 'lucide-react'
import { api } from '../lib/api'
import { toast } from 'sonner'

interface FileUploadProps {
  onUploadComplete?: (files: UploadedFile[]) => void
  multiple?: boolean
  accept?: string
  maxSize?: number // in MB
}

export interface UploadedFile {
  originalName: string
  storedName: string
  url: string
  size: number
  mimeType: string
}

export function FileUpload({ onUploadComplete, multiple = false, accept, maxSize = 10 }: FileUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [files, setFiles] = useState<File[]>([])
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || [])

    // Validate file size
    const maxBytes = maxSize * 1024 * 1024
    const oversized = selected.filter(f => f.size > maxBytes)
    if (oversized.length > 0) {
      toast.error(`Arquivo(s) muito grande(s). M\u00e1ximo: ${maxSize}MB`)
      return
    }

    setFiles(multiple ? [...files, ...selected] : selected)
  }

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index))
  }

  const handleUpload = async () => {
    if (files.length === 0) return

    setUploading(true)
    try {
      const formData = new FormData()

      if (multiple && files.length > 1) {
        files.forEach(file => formData.append('files', file))
        const response = await api.post<{ success: boolean; files: UploadedFile[] }>(
          '/upload/multiple',
          formData,
          { headers: { 'Content-Type': 'multipart/form-data' } }
        )
        onUploadComplete?.(response.data.files)
        toast.success(`${files.length} arquivo(s) enviado(s)!`)
      } else {
        formData.append('file', files[0])
        const response = await api.post<UploadedFile>('/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })
        onUploadComplete?.([response.data])
        toast.success('Arquivo enviado!')
      }

      setFiles([])
      if (inputRef.current) inputRef.current.value = ''
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Erro ao enviar arquivo')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-3">
      <div
        onClick={() => inputRef.current?.click()}
        className="border-2 border-dashed border-dark-600 rounded-lg p-6 text-center cursor-pointer hover:border-primary-500 transition-colors"
      >
        <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
        <p className="text-sm text-gray-400">Clique para selecionar {multiple ? 'arquivos' : 'arquivo'}</p>
        <p className="text-xs text-gray-500 mt-1">M\u00e1ximo: {maxSize}MB</p>
      </div>

      <input
        ref={inputRef}
        type="file"
        multiple={multiple}
        accept={accept}
        onChange={handleFileChange}
        className="hidden"
      />

      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((file, i) => (
            <div key={i} className="flex items-center gap-2 p-2 bg-dark-800 rounded-lg border border-dark-700">
              <FileIcon className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-300 flex-1 truncate">{file.name}</span>
              <span className="text-xs text-gray-500">{(file.size / 1024).toFixed(0)}KB</span>
              <button
                onClick={() => removeFile(i)}
                className="text-gray-500 hover:text-red-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}

          <button
            onClick={handleUpload}
            disabled={uploading}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-400 disabled:opacity-50"
          >
            {uploading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Enviando...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                Enviar {files.length > 1 ? `${files.length} arquivos` : 'arquivo'}
              </>
            )}
          </button>
        </div>
      )}
    </div>
  )
}
