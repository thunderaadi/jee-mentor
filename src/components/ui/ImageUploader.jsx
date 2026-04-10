import { useRef, useState } from 'react'
import { Upload, X, ImageIcon } from 'lucide-react'
import { supabase } from '../../lib/supabase'

export default function ImageUploader({ bucket, folder, onUpload, maxFiles = 5 }) {
  const [previews, setPreviews] = useState([])
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const fileRef = useRef()

  const handleFiles = (files) => {
    const fileArr = Array.from(files).slice(0, maxFiles - previews.length)
    const newPreviews = fileArr.map((file) => ({
      file,
      url: URL.createObjectURL(file),
      name: file.name,
    }))
    setPreviews((prev) => [...prev, ...newPreviews].slice(0, maxFiles))
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    handleFiles(e.dataTransfer.files)
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    setDragOver(true)
  }

  const removePreview = (index) => {
    setPreviews((prev) => {
      const copy = [...prev]
      URL.revokeObjectURL(copy[index].url)
      copy.splice(index, 1)
      return copy
    })
  }

  const uploadAll = async () => {
    if (!previews.length) return
    setUploading(true)

    try {
      const urls = []
      for (const preview of previews) {
        const ext = preview.name.split('.').pop()
        const path = `${folder}/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`

        const { error } = await supabase.storage
          .from(bucket)
          .upload(path, preview.file)

        if (!error) {
          const { data } = supabase.storage.from(bucket).getPublicUrl(path)
          urls.push(data.publicUrl)
        }
      }

      if (onUpload) onUpload(urls)
      setPreviews([])
    } catch (err) {
      console.error('Upload error:', err)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Drop zone */}
      <div
        className={`upload-zone ${dragOver ? 'dragover' : ''}`}
        onClick={() => fileRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={() => setDragOver(false)}
      >
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
        <Upload size={32} style={{ color: 'var(--color-text-muted)', margin: '0 auto 12px' }} />
        <p className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>
          Drop images here or click to browse
        </p>
        <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
          Max {maxFiles} images • PNG, JPG, WEBP
        </p>
      </div>

      {/* Previews */}
      {previews.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
          {previews.map((p, i) => (
            <div key={i} className="relative group rounded-xl overflow-hidden aspect-square"
                 style={{ border: '1px solid var(--color-border-primary)' }}>
              <img src={p.url} alt="" className="w-full h-full object-cover" />
              <button
                onClick={(e) => { e.stopPropagation(); removePreview(i) }}
                className="absolute top-1 right-1 p-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ background: 'rgba(0,0,0,0.7)' }}
              >
                <X size={14} color="white" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Upload button */}
      {previews.length > 0 && (
        <button
          onClick={uploadAll}
          disabled={uploading}
          className="btn-primary"
        >
          {uploading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Uploading...</span>
            </>
          ) : (
            <>
              <Upload size={16} />
              <span>Upload {previews.length} image{previews.length > 1 ? 's' : ''}</span>
            </>
          )}
        </button>
      )}
    </div>
  )
}
