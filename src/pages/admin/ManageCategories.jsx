import AdminLayout from '../../components/layout/AdminLayout'
import DataTable from '../../components/common/DataTable'
import Button from '../../components/common/Button'
import Modal from '../../components/common/Modal'
import { categoryService } from '../../services/categoryService'
import { Edit, Trash2 } from 'lucide-react'
import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'

const ManageCategories = () => {
  const [categories, setCategories] = useState([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState(null)
  
  const [formData, setFormData] = useState({
    nama: '',
    icon: '',
    deskripsi: ''
  })

  useEffect(() => {
    loadCategories()
  }, [])

  const loadCategories = () => {
    setCategories(categoryService.getAllCategories())
  }

  const handleOpenModal = (category = null) => {
    if (category) {
      setEditingCategory(category)
      setFormData({
        nama: category.nama,
        icon: category.icon,
        deskripsi: category.deskripsi
      })
    } else {
      setEditingCategory(null)
      setFormData({
        nama: '',
        icon: '📦',
        deskripsi: ''
      })
    }
    setIsModalOpen(true)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    try {
      if (editingCategory) {
        categoryService.updateCategory(editingCategory.id, formData)
        toast.success('Kategori berhasil diupdate')
      } else {
        categoryService.createCategory(formData)
        toast.success('Kategori baru berhasil ditambahkan')
      }
      
      loadCategories()
      setIsModalOpen(false)
    } catch (error) {
      toast.error(error.message)
    }
  }

  const handleDelete = (id, nama) => {
    if (window.confirm(`Yakin mau hapus kategori "${nama}"?`)) {
      categoryService.deleteCategory(id)
      toast.success('Kategori berhasil dihapus')
      loadCategories()
    }
  }

  const columns = [
    {
      header: 'Icon',
      accessor: 'icon',
      className: 'w-16 text-center text-2xl',
    },
    {
      header: 'Category Name',
      accessor: 'nama',
      className: 'font-medium text-gray-900',
    },
    {
      header: 'Description',
      accessor: 'deskripsi',
      className: 'text-gray-500',
    },
    {
      header: 'ID',
      accessor: 'id',
      className: 'text-gray-400 font-mono text-xs',
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
          >
            <Edit size={18} />
          </button>
          <button 
            onClick={() => handleDelete(row.id, row.nama)}
            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Master Data: Categories</h1>
        <p className="text-gray-500 mt-1">Manage product categories available in the marketplace.</p>
      </div>

      <DataTable 
        title="Categories List"
        columns={columns}
        data={categories}
        onAdd={() => handleOpenModal()}
        itemsPerPage={10}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCategory ? 'Edit Category' : 'Add New Category'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category Name</label>
            <input
              type="text"
              required
              value={formData.nama}
              onChange={(e) => setFormData({...formData, nama: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="e.g. Electronics"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Emoji Icon</label>
            <input
              type="text"
              required
              value={formData.icon}
              onChange={(e) => setFormData({...formData, icon: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="e.g. 💻"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={formData.deskripsi}
              onChange={(e) => setFormData({...formData, deskripsi: e.target.value})}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Brief description of this category"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">
              {editingCategory ? 'Save Changes' : 'Add Category'}
            </Button>
          </div>
        </form>
      </Modal>
    </AdminLayout>
  )
}

export default ManageCategories
