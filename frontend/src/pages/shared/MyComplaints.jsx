import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { complaintService } from '../../services/complaintService'
import Header from '../../components/layout/Header'
import Footer from '../../components/layout/Footer'
import Container from '../../components/layout/Container'
import Button from '../../components/common/Button'
import Modal from '../../components/common/Modal'
import { Plus, MessageSquareWarning, Clock, CheckCircle2 } from 'lucide-react'
import { formatDate } from '../../utils/helpers'
import toast from 'react-hot-toast'

const MyComplaints = () => {
  const { user } = useAuth()
  const [complaints, setComplaints] = useState([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  
  const [formData, setFormData] = useState({
    subjek: '',
    deskripsi: ''
  })

  useEffect(() => {
    if (user) {
      loadComplaints()
    }
  }, [user])

  const loadComplaints = () => {
    setComplaints(complaintService.getComplaintsByUser(user.id))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    try {
      complaintService.createComplaint({
        userId: user.id,
        role: user.role,
        subjek: formData.subjek,
        deskripsi: formData.deskripsi
      })
      toast.success('Aduan berhasil dikirim')
      setFormData({ subjek: '', deskripsi: '' })
      setIsModalOpen(false)
      loadComplaints()
    } catch (error) {
      toast.error('Gagal mengirim aduan')
    }
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'open':
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200"><Clock size={14}/> Menunggu Respon</span>
      case 'in_progress':
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200"><Clock size={14}/> Sedang Diproses</span>
      case 'resolved':
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200"><CheckCircle2 size={14}/> Selesai</span>
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 pb-16 md:pb-0">
      <Header />
      
      <main className="flex-grow py-8">
        <Container maxWidth="max-w-4xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Pusat Bantuan & Aduan</h1>
              <p className="text-gray-500 mt-1">Sampaikan keluhan atau masalah Anda kepada admin.</p>
            </div>
            <Button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2">
              <Plus size={18} /> Buat Aduan Baru
            </Button>
          </div>

          <div className="space-y-4">
            {complaints.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center border border-gray-100 shadow-soft">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageSquareWarning size={32} className="text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-1">Belum ada aduan</h3>
                <p className="text-gray-500">Anda belum pernah membuat aduan sebelumnya.</p>
              </div>
            ) : (
              complaints.map(complaint => (
                <div key={complaint.id} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-soft">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="text-lg font-semibold text-gray-900">{complaint.subjek}</h3>
                        {getStatusBadge(complaint.status)}
                      </div>
                      <p className="text-sm text-gray-500">ID: {complaint.id} • {formatDate(complaint.createdAt)}</p>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 rounded-xl p-4 mb-4">
                    <p className="text-gray-700 whitespace-pre-wrap text-sm">{complaint.deskripsi}</p>
                  </div>

                  {complaint.adminReply && (
                    <div className="bg-primary-50 rounded-xl p-4 border border-primary-100">
                      <p className="text-xs font-semibold text-primary-800 mb-2 uppercase tracking-wider">Balasan Admin</p>
                      <p className="text-primary-900 whitespace-pre-wrap text-sm">{complaint.adminReply}</p>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </Container>
      </main>

      <Footer />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Buat Aduan Baru"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Subjek / Judul Aduan</label>
            <input
              type="text"
              required
              value={formData.subjek}
              onChange={(e) => setFormData({...formData, subjek: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="Contoh: Barang tidak sesuai deskripsi"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi Detail</label>
            <textarea
              required
              value={formData.deskripsi}
              onChange={(e) => setFormData({...formData, deskripsi: e.target.value})}
              rows={5}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
              placeholder="Jelaskan masalah Anda secara detail..."
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>
              Batal
            </Button>
            <Button type="submit">
              Kirim Aduan
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default MyComplaints