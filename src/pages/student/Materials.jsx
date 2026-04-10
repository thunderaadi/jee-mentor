import { useEffect, useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import EmptyState from '../../components/ui/EmptyState'
import { Link2, ExternalLink, Calendar } from 'lucide-react'

export default function StudentMaterials() {
  const { profile } = useAuth()
  const [materials, setMaterials] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadMaterials() }, [])

  const loadMaterials = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('materials')
      .select('*')
      .eq('mentor_id', profile?.mentor_id)
      .order('material_date', { ascending: false })
    setMaterials(data || [])
    setLoading(false)
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
      <div>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>Study Materials</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>
          Access study material links shared by your mentor
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-3 border-t-transparent rounded-full animate-spin"
               style={{ borderColor: 'var(--color-accent-primary)', borderTopColor: 'transparent' }} />
        </div>
      ) : materials.length === 0 ? (
        <EmptyState icon={Link2} title="No materials yet" description="Your mentor will share study materials here" />
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
                  <a key={m.id} href={m.link_url} target="_blank" rel="noopener noreferrer"
                     className="glass-card p-4 flex items-center gap-4 cursor-pointer group">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                         style={{ background: 'rgba(30, 64, 175, 0.15)', border: '1px solid rgba(30, 64, 175, 0.2)' }}>
                      <Link2 size={18} style={{ color: 'var(--color-text-accent)' }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-semibold truncate" style={{ color: 'var(--color-text-primary)' }}>{m.title}</h4>
                      {m.description && (
                        <p className="text-xs truncate" style={{ color: 'var(--color-text-muted)' }}>{m.description}</p>
                      )}
                    </div>
                    <ExternalLink size={16} className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                  style={{ color: 'var(--color-text-accent)' }} />
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
