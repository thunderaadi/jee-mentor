import { useEffect, useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import Modal from '../../components/ui/Modal'
import EmptyState from '../../components/ui/EmptyState'
import { 
  FileText, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Upload, 
  Image as ImageIcon, 
  X,
  FileDown,
  ArrowRight,
  ShieldCheck,
  ChevronRight
} from 'lucide-react'

export default function StudentAssignments() {
  const { profile } = useAuth()
  const [assignments, setAssignments] = useState([])
  const [submissions, setSubmissions] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [selectedAssignment, setSelectedAssignment] = useState(null)
  
  // Submission
  const [files, setFiles] = useState([])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => { loadAssignments() }, [])

  const loadAssignments = async () => {
    setLoading(true)
    const { data: asns } = await supabase
      .from('assignments')
      .select('*')
      .eq('mentor_id', profile?.mentor_id)
      .order('created_at', { ascending: false })

    setAssignments(asns || [])

    if (asns?.length > 0) {
      const { data: subs } = await supabase
        .from('assignment_submissions')
        .select('*')
        .eq('student_id', profile?.id)
      setSubmissions(subs || [])
    }
    setLoading(false)
  }

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files)
    setFiles([...files, ...selectedFiles])
  }

  const removeFile = (index) => {
    setFiles(files.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (files.length === 0) return setError('Please upload at least one image.')
    
    setSubmitting(true)
    setError('')
    setSuccess('')

    try {
      const imageUrls = []
      
      for (const file of files) {
        const fileExt = file.name.split('.').pop()
        const fileName = `${Math.random()}.${fileExt}`
        const filePath = `${profile.id}/${fileName}`

        const { error: uploadError } = await supabase.storage
          .from('assignment-submissions')
          .upload(filePath, file)

        if (uploadError) throw uploadError

        const { data: { publicUrl } } = supabase.storage
          .from('assignment-submissions')
          .getPublicUrl(filePath)
        
        imageUrls.push(publicUrl)
      }

      const { error: subError } = await supabase
        .from('assignment_submissions')
        .insert({
          assignment_id: selectedAssignment.id,
          student_id: profile.id,
          image_urls: imageUrls,
          submitted_at: new Date().toISOString()
        })

      if (subError) throw subError

      setSuccess('Fantastic! Assignment submitted successfully.')
      setFiles([])
      setTimeout(() => {
        setShowModal(false)
        setSuccess('')
        loadAssignments()
      }, 2000)
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-8 pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="w-8 h-8 rounded-lg bg-blue-600/10 flex items-center justify-center text-blue-500 border border-blue-500/20">
              <FileText size={16} />
            </span>
            <span className="text-[11px] font-black text-blue-500 uppercase tracking-[0.2em]">Academics</span>
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">Assignment <span className="text-blue-500">Vault</span></h1>
          <p className="text-gray-400 text-sm mt-1 font-medium">Complete your tasks to unlock your potential.</p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : assignments.length === 0 ? (
        <EmptyState icon={FileText} title="Clean Slate" description="No assignments posted yet. Enjoy the breather!" />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {assignments.map((a) => {
            const submission = submissions.find(s => s.assignment_id === a.id)
            return (
              <div key={a.id} className="group glass-card overflow-hidden flex flex-col h-full border-white/5 bg-[#080c1d]/40 transition-all hover:border-blue-500/30">
                <div className="p-6 flex-1 flex flex-col">
                  <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-2">
                      <div className={`p-2 rounded-lg ${submission ? 'bg-green-500/10 text-green-500' : 'bg-blue-500/10 text-blue-500'}`}>
                        {submission ? <CheckCircle2 size={18} /> : <Clock size={18} />}
                      </div>
                      <span className={`text-[10px] font-black uppercase tracking-widest ${submission ? 'text-green-500' : 'text-blue-500'}`}>
                        {submission ? 'Submitted' : 'Pending'}
                      </span>
                    </div>
                    <div className="text-[10px] font-bold text-gray-500 flex items-center gap-1.5 uppercase tracking-widest bg-white/5 py-1 px-3 rounded-full">
                      <Calendar size={12} />
                      {a.due_date ? new Date(a.due_date).toLocaleDateString() : 'No Deadline'}
                    </div>
                  </div>

                  <h3 className="text-lg font-black text-white mb-3 group-hover:text-blue-400 transition-colors uppercase tracking-tight">{a.title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed mb-6 flex-1 italic">{a.description || 'No detailed instructions provided.'}</p>

                  <div className="flex flex-wrap gap-3 mb-6">
                    {a.file_url && (
                      <a href={a.file_url} target="_blank" rel="noopener noreferrer" 
                         className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600/10 border border-blue-500/20 text-blue-400 text-xs font-bold transition-all hover:bg-blue-600/20">
                        <FileDown size={14} /> View Reference PDF
                      </a>
                    )}
                  </div>
                  
                  <div className="pt-6 border-t border-white/5">
                    {submission ? (
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex flex-col gap-1">
                          <span className="text-gray-500 font-bold uppercase tracking-widest">Submitted on</span>
                          <span className="text-white font-medium">{new Date(submission.submitted_at || submission.created_at).toLocaleString()}</span>
                        </div>
                        <div className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-green-500/10 text-green-500 border border-green-500/20 font-bold uppercase tracking-tighter">
                          <ShieldCheck size={12} /> Confirmed
                        </div>
                      </div>
                    ) : (
                      <button 
                        onClick={() => { setSelectedAssignment(a); setShowModal(true) }}
                        className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-3.5 rounded-2xl flex items-center justify-center gap-2 transition-all hover:shadow-[0_10px_30px_rgba(37,99,235,0.3)] hover:-translate-y-0.5 active:translate-y-0"
                      >
                        Submit Response <ArrowRight size={18} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Submission Modal */}
      <Modal isOpen={showModal} onClose={() => { setShowModal(false); setFiles([]); setError('') }} title="Submit Assignment">
        {success ? (
          <div className="text-center py-10 animate-in zoom-in duration-300">
            <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 size={44} className="text-green-500" />
            </div>
            <h3 className="text-xl font-black text-white mb-2 uppercase tracking-tight">Mission Accomplished</h3>
            <p className="text-gray-400 font-medium italic">{success}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="p-4 rounded-2xl bg-blue-600/5 border border-blue-500/10">
              <h4 className="text-sm font-bold text-white mb-1 uppercase tracking-tight">{selectedAssignment?.title}</h4>
              <p className="text-[11px] text-gray-500 font-medium">Please upload clear photos of your handwritten solutions.</p>
            </div>

            {error && (
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs flex items-center gap-3">
                <AlertCircle size={16} className="shrink-0" /> <span className="font-bold">{error}</span>
              </div>
            )}

            <div className="space-y-4">
              <div className="relative border-2 border-dashed border-white/10 rounded-[28px] p-10 text-center transition-all hover:border-blue-500/50 hover:bg-white/[0.02]">
                <input 
                  type="file" 
                  multiple 
                  accept="image/*"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="flex flex-col items-center gap-3">
                  <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center text-gray-500 group-hover:text-blue-500 transition-colors">
                    <Upload size={24} />
                  </div>
                  <div>
                    <p className="text-sm font-black text-white uppercase tracking-tight">Select Solutions</p>
                    <p className="text-[10px] text-gray-500 mt-1 font-bold uppercase tracking-widest">PDF or Images accepted</p>
                  </div>
                </div>
              </div>

              {files.length > 0 && (
                <div className="grid grid-cols-3 gap-3">
                  {files.map((file, i) => (
                    <div key={i} className="relative aspect-square rounded-xl overflow-hidden border border-white/10 group">
                      <img src={URL.createObjectURL(file)} alt="" className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                      <button 
                        type="button"
                        onClick={() => removeFile(i)}
                        className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 text-white hover:bg-red-500 transition-colors"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button 
              type="submit" 
              disabled={submitting}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-4 rounded-[20px] shadow-xl transition-all hover:shadow-blue-500/20 hover:-translate-y-0.5"
            >
              {submitting ? 'Enciphering...' : 'Finalize Submission'}
            </button>
          </form>
        )}
      </Modal>
    </div>
  )
}
