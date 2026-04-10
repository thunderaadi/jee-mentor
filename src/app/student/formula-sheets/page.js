'use client'
import { useEffect, useState } from 'react'
import { db } from '@/lib/firebase'
import { supabase } from '@/lib/supabase'
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  doc, 
  setDoc,
  serverTimestamp 
} from 'firebase/firestore'
import { useAuth } from '@/contexts/AuthContext'
import { 
  Upload, 
  FileDown, 
  Loader2, 
  CheckCircle2, 
  AlertCircle,
  Zap,
  BookOpen,
  Waves
} from 'lucide-react'

const SUBJECTS = [
  { id: 'physics', label: 'Physics', icon: Zap, color: 'blue' },
  { id: 'chemistry', label: 'Chemistry', icon: Waves, color: 'emerald' },
  { id: 'maths', label: 'Mathematics', icon: BookOpen, color: 'orange' }
]

export default function FormulaVault() {
  const { profile } = useAuth()
  const [sheets, setSheets] = useState({})
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState({})

  useEffect(() => {
    if (profile) loadSheets()
  }, [profile])

  const loadSheets = async () => {
    try {
      const q = query(collection(db, "formula_sheets"), where("student_id", "==", profile.uid));
      const snap = await getDocs(q);
      const data = {};
      snap.docs.forEach(d => {
        data[d.data().subject] = d.data();
      });
      setSheets(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const handleUpload = async (subject, file) => {
    if (!file) return;
    setUploading(prev => ({ ...prev, [subject]: true }));

    try {
      const filePath = `formula_sheets/${profile.uid}/${subject}.png`;
      // We use .upsert(true) to allow students to overwrite their own sheets
      const { data, error } = await supabase.storage
        .from('jee_mentor')
        .upload(filePath, file, { upsert: true });
      
      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('jee_mentor')
        .getPublicUrl(filePath);

      const sheetData = {
        student_id: profile.uid,
        mentor_id: profile.mentor_id,
        subject,
        file_url: publicUrl,
        updated_at: serverTimestamp()
      };

      await setDoc(doc(db, "formula_sheets", `${profile.uid}_${subject}`), sheetData);
      
      setSheets(prev => ({ ...prev, [subject]: sheetData }));
    } catch (err) {
      alert(err.message);
    } finally {
      setUploading(prev => ({ ...prev, [subject]: false }));
    }
  }

  return (
    <div className="space-y-10 animate-fade-in max-w-6xl mx-auto">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <span className="px-3 py-1 rounded-full bg-blue-600/10 border border-blue-500/20 text-[10px] font-black text-blue-500 tracking-widest uppercase">Academic Arsenal</span>
        </div>
        <h1 className="text-4xl font-black text-white tracking-tight uppercase">Formula <span className="text-blue-500">Vault</span></h1>
        <p className="text-gray-500 text-sm mt-2 font-medium italic">Store your strategic intelligence. Upload images for each subject, auto-updated.</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-10 h-10 border-2 border-blue-600 border-t-white rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {SUBJECTS.map((sub) => {
            const sheet = sheets[sub.id];
            const isUploading = uploading[sub.id];
            const Icon = sub.icon;

            return (
              <div key={sub.id} className="group glass-card p-8 flex flex-col items-center text-center transition-all hover:border-white/10 hover:bg-white/[0.02]">
                <div className={`w-20 h-20 rounded-[28px] mb-6 flex items-center justify-center bg-${sub.color}-600/10 text-${sub.color}-500 border border-${sub.color}-500/20 shadow-xl shadow-${sub.color}-500/5`}>
                  <Icon size={40} />
                </div>
                
                <h3 className="text-xl font-black text-white uppercase tracking-tight mb-2">{sub.label}</h3>
                <p className="text-xs text-gray-500 font-bold mb-8 uppercase tracking-widest">
                  {sheet ? `Last updated: ${sheet.updated_at?.toDate ? new Date(sheet.updated_at.toDate()).toLocaleDateString() : 'Just now'}` : 'No image uploaded yet'}
                </p>

                <div className="w-full mt-auto space-y-4">
                  {sheet && (
                    <a href={sheet.file_url} target="_blank" rel="noopener noreferrer" 
                       className="flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl bg-white/5 border border-white/5 text-xs font-black text-white hover:bg-white/10 transition-all uppercase tracking-widest">
                      <FileDown size={14} /> Open Current Image
                    </a>
                  )}

                  <div className="relative overflow-hidden group/btn">
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={(e) => handleUpload(sub.id, e.target.files[0])}
                      className="absolute inset-0 opacity-0 cursor-pointer z-10"
                      disabled={isUploading}
                    />
                    <button 
                      className={`flex items-center justify-center gap-2 w-full py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${
                        isUploading 
                        ? 'bg-blue-600/20 text-blue-500' 
                        : 'bg-blue-600 text-white hover:bg-blue-500 shadow-lg shadow-blue-500/20'
                      }`}
                    >
                      {isUploading ? <Loader2 className="animate-spin" size={16} /> : <><Upload size={16} /> {sheet ? 'Update Image' : 'Upload Image'}</>}
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Warning/Info Box */}
      <div className="p-6 rounded-[32px] bg-blue-600/5 border border-blue-500/10 flex items-start gap-5">
        <div className="p-3 rounded-2xl bg-blue-500/10 text-blue-500">
          <AlertCircle size={24} />
        </div>
        <div>
          <h4 className="text-sm font-black text-white uppercase tracking-tight mb-1">Standard Operating Procedure</h4>
          <p className="text-xs text-gray-500 font-medium leading-relaxed italic">
            Your Mentor has direct access to this Vault. Ensure your photos are clear, high-resolution, and updated weekly. 
            Uploading a new image will automatically replace any existing one for that subject.
          </p>
        </div>
      </div>
    </div>
  )
}
