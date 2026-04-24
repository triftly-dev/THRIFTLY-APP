import { useState, useEffect } from 'react'
import AdminLayout from '../../components/layout/AdminLayout'
import DataTable from '../../components/common/DataTable'
import Button from '../../components/common/Button'
import Modal from '../../components/common/Modal'
import { complaintService } from '../../services/complaintService'
import { userService } from '../../services/userService'
import { MessageSquareReply, Eye, Trash2 } from 'lucide-react'
import { formatDate } from '../../utils/helpers'
import toast from 'react-hot-toast'

const AdminComplaints = () => {
  const [complaints, setComplaints] = useState([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedComplaint, setSelectedComplaint] = useState(null)
  
  const [formData, setFormData] = useState({
    status: 'open',
    adminReply: ''
  })

  useEffect(() => {
    loadComplaints()
  }, [])

  const loadComplaints = () => {
    const allComplaints = complaintService.getAllComplaints()
    // Enrich with user data
    const enriched = allComplaints.map(c => {
      const user = userService.getUserById(c.userId)
      return {
        ...c,
        userName: user?.profile?.nama || user?.email || 'Unknown User'
      }
    }).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    
    setComplaints(enriched)
  }

  const handleOpenModal = (complaint) => {
    setSelectedComplaint(complaint)
    setFormData({
      status: complaint.status,
      adminReply: complaint.adminReply || ''
    })
    setIsModalOpen(true)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    try {
      complaintService.updateComplaintStatus(
        selectedComplaint.id, 
        formData.status, 
        formData.adminReply
      )
      toast.success('Aduan berhasil diupdate')
      setIsModalOpen(false)
      loadComplaints()
    } catch (error) {
      toast.error('Gagal mengupdate aduan')
    }
  }

  const handleDelete = (id) => {
    if (window.confirm('Yakin ingin menghapus aduan ini?')) {
      complaintService.deleteComplaint(id)
      toast.success('Aduan berhasil dihapus')
      loadComplaints()
    }
  }

  const getStatusBadge = (status) => {
    const styles = {
      open: 'bg-amber-100 text-amber-700 border-amber-200',
      in_progress: 'bg-blue-100 text-blue-700 border-blue-200',
      resolved: 'bg-emerald-100 text-emerald-700 border-emerald-200'
    }
    const labels = {
      open: 'Open',
      in_progress: 'In Progress',
      resolved: 'Resolved'
    }
    return (
      <span className={`px-2.5 py-1 text-xs font-medium rounded-full border ${styles[status]}`}>
        {labels[status]}
      </span>
    )
  }

  const columns = [
    {
      header: 'ID & Date',
      accessor: 'id',
      render: (row) => (
        <div>
          <p className="font-medium text-gray-900 text-sm">{row.id}</p>
          <p className="text-xs text-gray-500">{formatDate(row.createdAt)}</p>
        </div>
      )
    },
    {
      header: 'User',
      accessor: 'userName',
      render: (row) => (
        <div>
          <p className="font-medium text-gray-900 text-sm">{row.userName}</p>
          <p className="text-xs text-gray-500 capitalize">{row.role}</p>
        </div>
      )
    },
    {
      header: 'Subject',
      accessor: 'subjek',
      render: (row) => (
        <p className="text-sm text-gray-900 truncate max-w-[200px]" title={row.subjek}>
          {row.subjek}
        </p>
      )
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (row) => getStatusBadge(row.status)
    },
    {
      header: 'Actions',
      accessor: 'actions',
      className: 'text-right',
      render: (row) => (
        <div className="flex items-center justify-end gap-2">
          <button 
            onClick={() => handleOpenModal(row)}
            className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
            title="Respond"
          >
            <MessageSquareReply size={18} />
          </button>
          <button 
            onClick={() => handleDelete(row.id)}
            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Delete"
          >
            <Trash2 size={18} />
          </button>
        </div>
      )
    }
  ]

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">User Complaints</h1>
        <p className="text-gray-500 mt-1">Manage and respond to complaints from buyers and sellers.</p>
      </div>

      <DataTable 
        title="Complaints List"
        columns={columns}
        data={complaints}
        itemsPerPage={10}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Respond to Complaint"
      >
        {selectedComplaint && (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Complaint Details */}
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
              <div className="mb-3">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">From</span>
                <p className="text-sm font-medium text-gray-900">{selectedComplaint.userName} ({selectedComplaint.role})</p>
              </div>
              <div className="mb-3">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Subject</span>
                <p className="text-sm font-medium text-gray-900">{selectedComplaint.subjek}</p>
              </div>
              <div>
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Description</span>
                <p className="text-sm text-gray-700 mt-1 whitespace-pre-wrap">{selectedComplaint.deskripsi}</p>
              </div>
            </div>

            {/* Response Form */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Update Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                >
                  <option value="open">Open (Menunggu Respon)</option>
                  <option value="in_progress">In Progress (Sedang Diproses)</option>
                  <option value="resolved">Resolved (Selesai)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Admin Reply</label>
                <textarea
                  value={formData.adminReply}
                  onChange={(e) => setFormData({...formData, adminReply: e.target.value})}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
                  placeholder="Tulis balasan atau solusi untuk user..."
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
              <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">
                Save Response
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </AdminLayout>
  )
}

export default AdminComplaints