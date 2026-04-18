import { storage, STORAGE_KEYS } from './localStorage'
import { generateId } from '../utils/helpers'

export const complaintService = {
  getAllComplaints() {
    return storage.get(STORAGE_KEYS.COMPLAINTS) || []
  },

  getComplaintsByUser(userId) {
    const complaints = this.getAllComplaints()
    return complaints.filter(c => c.userId === userId).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  },

  getComplaintById(id) {
    const complaints = this.getAllComplaints()
    return complaints.find(c => c.id === id)
  },

  createComplaint(data) {
    const complaints = this.getAllComplaints()
    const newComplaint = {
      id: generateId('CMP'),
      userId: data.userId,
      role: data.role, // 'buyer' or 'seller'
      subjek: data.subjek,
      deskripsi: data.deskripsi,
      status: 'open', // open, in_progress, resolved
      adminReply: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    complaints.push(newComplaint)
    storage.set(STORAGE_KEYS.COMPLAINTS, complaints)
    return newComplaint
  },

  updateComplaintStatus(id, status, adminReply = null) {
    const complaints = this.getAllComplaints()
    const index = complaints.findIndex(c => c.id === id)
    
    if (index === -1) throw new Error('Aduan tidak ditemukan')

    complaints[index] = {
      ...complaints[index],
      status,
      ...(adminReply !== null && { adminReply }),
      updatedAt: new Date().toISOString()
    }

    storage.set(STORAGE_KEYS.COMPLAINTS, complaints)
    return complaints[index]
  },

  deleteComplaint(id) {
    const complaints = this.getAllComplaints()
    const filtered = complaints.filter(c => c.id !== id)
    storage.set(STORAGE_KEYS.COMPLAINTS, filtered)
    return true
  }
}
