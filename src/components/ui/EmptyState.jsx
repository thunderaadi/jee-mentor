import { FileQuestion } from 'lucide-react'

export default function EmptyState({ icon: Icon = FileQuestion, title, description }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 animate-fade-in">
      <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
           style={{ background: 'rgba(99, 102, 241, 0.1)', border: '1px solid rgba(99, 102, 241, 0.15)' }}>
        <Icon size={28} style={{ color: 'var(--color-text-muted)' }} />
      </div>
      <h3 className="text-base font-semibold mb-1" style={{ color: 'var(--color-text-secondary)' }}>
        {title}
      </h3>
      <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
        {description}
      </p>
    </div>
  )
}
