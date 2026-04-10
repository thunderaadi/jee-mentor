import { useEffect, useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import Modal from '../../components/ui/Modal'
import EmptyState from '../../components/ui/EmptyState'
import { Plus, Link2, ExternalLink, Trash2, Calendar } from 'lucide-react'

export default function MentorMaterials() {
  const { profile } = useAuth()
  const [materials, setMaterials] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)

  // Form
  const [title, setTitle] = useState('')
  const [linkUrl, setLinkUrl] = useState('')
  const [description, setDescription] = useState('')
  const [materialDate, setMaterialDate] = useState(new Date().toISOString().split('T')[0])

  useEffect(() => { loadMaterials() }, [])

  const loadMaterials = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('materials')
      .select('*')
      .eq('mentor_id', profile?.id)
      .order('material_date', { ascending: false })
    setMaterials(data || [])
    setLoading(false)
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    await supabase.from('materials').insert({
      mentor_id: profile.id,
      title,
      link_url: linkUrl,
      description,
      material_date: materialDate,
    })
    setTitle(''); setLinkUrl(''); setDescription('')
    setShowModal(false)
    loadMaterials()
  }

  const deleteMaterial = async (id) => {
    await supabase.from('materials').delete().eq('id', id)
    loadMaterials()
  }

  // Group by date
  const grouped = materials.reduce((acc, m) => {
    const d = m.material_date
    if (!acc[d]) acc[d] = []
    acc[d].push(m)
    return acc
  }, {})

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>Materials</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>Share study material links with students</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary">
          <Plus size={16} /><span>Add Material</span>
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-3 border-t-transparent rounded-full animate-spin"
               style={{ borderColor: 'var(--color-accent-primary)', borderTopColor: 'transparent' }} />
        </div>
      ) : materials.length === 0 ? (
        <EmptyState icon={Link2} title="No materials yet" description="Add study material links for your students" />
      ) : (
        <div className="space-y-6 stagger-children">
          {Object.entries(grouped).map(([date, items]) => (
            <div key={date}>
              <div className="flex items-center gap-2 mb-3">
                <Calendar size={14} style={{ color: 'var(--color-text-muted)' }} />
                <h3 className="text-sm font-semibold" style={{ color: 'var(--color-text-secondary)' }}>
                  {new Date(date).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
                </h3>
              </div>
              <div className="grid gap-3">
                {items.map((m) => (
                  <div key={m.id} className="glass-card p-4 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                         style={{ background: 'rgba(99, 102, 241, 0.1)', border: '1px solid rgba(99, 102, 241, 0.15)' }}>
                      <Link2 size={18} style={{ color: 'var(--color-text-accent)' }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-semibold truncate" style={{ color: 'var(--color-text-primary)' }}>{m.title}</h4>
                      {m.description && (
                        <p className="text-xs truncate" style={{ color: 'var(--color-text-muted)' }}>{m.description}</p>
                      )}
                    </div>
                    <a href={m.link_url} target="_blank" rel="noopener noreferrer"
                       className="btn-secondary text-xs py-2 px-3 flex-shrink-0">
                      <ExternalLink size={14} /><span>Open</span>
                    </a>
                    <button onClick={() => deleteMaterial(m.id)} className="p-2 rounded-lg hover:bg-white/5 flex-shrink-0">
                      <Trash2 size={14} style={{ color: 'var(--color-accent-danger)' }} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Add Study Material">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-secondary)' }}>Title</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} className="input-field" placeholder="e.g. Thermodynamics Notes" required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-secondary)' }}>Link URL</label>
            <input value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)} className="input-field" placeholder="https://..." required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-secondary)' }}>Description (optional)</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="input-field" rows={2} placeholder="Brief description..." />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-secondary)' }}>Date</label>
            <input type="date" value={materialDate} onChange={(e) => setMaterialDate(e.target.value)} className="input-field" />
          </div>
          <button type="submit" className="btn-primary w-full justify-center">
            <Link2 size={16} /><span>Add Material</span>
          </button>
        </form>
      </Modal>
    </div>
  )
}
