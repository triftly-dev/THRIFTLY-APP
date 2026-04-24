import AdminLayout from '../../components/layout/AdminLayout'
import DataTable from '../../components/common/DataTable'
import Button from '../../components/common/Button'
import Modal from '../../components/common/Modal'
import { userService } from '../../services/userService'
import { useEffect, useState } from 'react'
import { Eye, Edit, Trash2 } from 'lucide-react'
import { formatDate } from '../../utils/helpers'
import toast from 'react-hot-toast'

const UsersList = () => {
  const [users, setUsers] = useState([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'buyer',
    nama: '',
    noTelp: '',
    alamat: ''
  })

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    const data = await userService.getAllUsers()
    setUsers(data || [])
  }

  const handleOpenModal = (user = null) => {
    if (user) {
      setEditingUser(user)
      setFormData({
        email: user.email,
        password: '', // Don't show existing password
        role: user.role,
        nama: user.profile?.nama || '',
        noTelp: user.profile?.noTelp || '',
        alamat: user.profile?.alamat || ''
      })
    } else {
      setEditingUser(null)
      setFormData({
        email: '',
        password: '',
        role: 'buyer',
        nama: '',
        noTelp: '',
        alamat: ''
      })
    }
    setIsModalOpen(true)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    try {
      if (editingUser) {
        // Update existing user
        const updates = {
          email: formData.email,
          role: formData.role,
          profile: {
            ...editingUser.profile,
            nama: formData.nama,
            noTelp: formData.noTelp,
            alamat: formData.alamat
          }
        }
        
        if (formData.password) {
          updates.password = formData.password
        }
        
        userService.updateUser(editingUser.id, updates)
        toast.success('User berhasil diupdate')
      } else {
        // Create new user
        if (!formData.password) {
          toast.error('Password wajib diisi untuk user baru')
          return
        }
        
        userService.createUser({
          email: formData.email,
          password: formData.password,
          role: formData.role,
          profile: {
            nama: formData.nama,
            noTelp: formData.noTelp,
            alamat: formData.alamat
          }
        })
        toast.success('User baru berhasil ditambahkan')
      }
      
      loadUsers()
      setIsModalOpen(false)
    } catch (error) {
      toast.error(error.message)
    }
  }

  const handleDelete = (id, email) => {
    // Prevent deleting the last admin
    const adminCount = users.filter(u => u.role === 'admin').length
    const userToDelete = users.find(u => u.id === id)
    
    if (userToDelete.role === 'admin' && adminCount <= 1) {
      toast.error('Tidak dapat menghapus admin terakhir')
      return
    }

    if (window.confirm(`Yakin mau hapus user "${email}"?`)) {
      try {
        userService.deleteUser(id)
        toast.success('User berhasil dihapus')
        loadUsers()
      } catch (error) {
        toast.error(error.message)
      }
    }
  }

  const getRoleBadge = (role) => {
    const styles = {
      admin: 'bg-purple-100 text-purple-700 border-purple-200',
      seller: 'bg-blue-100 text-blue-700 border-blue-200',
      buyer: 'bg-emerald-100 text-emerald-700 border-emerald-200'
    }

    return (
      <span className={`px-2.5 py-1 text-xs font-medium rounded-full border capitalize ${styles[role] || styles.buyer}`}>
        {role}
      </span>
    )
  }

  const columns = [
    {
      header: 'User',
      accessor: 'nama',
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xs border border-indigo-200 shrink-0">
            {row.profile?.nama?.charAt(0).toUpperCase() || row.email.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-medium text-gray-900">{row.profile?.nama || 'Unknown'}</p>
            <p className="text-xs text-gray-500">{row.email}</p>
          </div>
        </div>
      )
    },
    {
      header: 'Role',
      accessor: 'role',
      render: (row) => getRoleBadge(row.role)
    },
    {
      header: 'Location',
      accessor: 'lokasi',
      render: (row) => <span className="text-gray-600 capitalize">{row.profile?.lokasi?.replace('-', ' ') || '-'}</span>
    },
    {
      header: 'Joined Date',
      accessor: 'createdAt',
      render: (row) => <span className="text-gray-600">{formatDate(row.createdAt)}</span>
    },
    {
      header: 'Actions',
      accessor: 'actions',
      className: 'text-right',
      render: (row) => (
        <div className="flex items-center justify-end gap-2">
          <button 
            onClick={() => handleOpenModal(row)}
            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" 
            title="Edit"
          >
            <Edit size={18} />
          </button>
          <button 
            onClick={() => handleDelete(row.id, row.email)}
            className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors" 
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
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Users Management</h1>
        <p className="text-gray-500 mt-1">Manage all registered buyers, sellers, and admins.</p>
      </div>

      <DataTable 
        title="All Users"
        columns={columns}
        data={users}
        onAdd={() => handleOpenModal()}
        itemsPerPage={10}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingUser ? 'Edit User' : 'Add New User'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password {editingUser && <span className="text-gray-400 font-normal">(Kosongkan jika tidak diubah)</span>}
              </label>
              <input
                type="password"
                required={!editingUser}
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap</label>
              <input
                type="text"
                required
                value={formData.nama}
                onChange={(e) => setFormData({...formData, nama: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({...formData, role: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
              >
                <option value="buyer">Buyer</option>
                <option value="seller">Seller</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">No. Telepon</label>
            <input
              type="tel"
              value={formData.noTelp}
              onChange={(e) => setFormData({...formData, noTelp: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Alamat</label>
            <textarea
              value={formData.alamat}
              onChange={(e) => setFormData({...formData, alamat: e.target.value})}
              rows={2}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
              Batal
            </Button>
            <Button type="submit">
              {editingUser ? 'Simpan Perubahan' : 'Tambah User'}
            </Button>
          </div>
        </form>
      </Modal>
    </AdminLayout>
  )
}

export default UsersList
