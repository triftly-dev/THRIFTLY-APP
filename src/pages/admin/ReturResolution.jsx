import AdminLayout from '../../components/layout/AdminLayout'
import DataTable from '../../components/common/DataTable'
import { transactionService } from '../../services/transactionService'
import { useEffect, useState } from 'react'
import { Eye, CheckCircle, XCircle } from 'lucide-react'
import { formatCurrency, formatDate } from '../../utils/helpers'

const ReturResolution = () => {
  const [returTransactions, setReturTransactions] = useState([])

  useEffect(() => {
    // For demo purposes, we'll just get all transactions since we don't have real retur data
    // In a real app: setReturTransactions(transactionService.getReturTransactions())
    setReturTransactions(transactionService.getAllTransactions() || [])
  }, [])

  const columns = [
    {
      header: 'Transaction ID',
      accessor: 'id',
      className: 'font-mono text-xs text-gray-500',
      render: (row) => row.id.substring(0, 8).toUpperCase()
    },
    {
      header: 'Date',
      accessor: 'createdAt',
      render: (row) => <span className="text-gray-600">{formatDate(row.createdAt)}</span>
    },
    {
      header: 'Amount',
      accessor: 'hargaFinal',
      render: (row) => <span className="font-medium text-gray-900">{formatCurrency(row.hargaFinal)}</span>
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (row) => (
        <span className="px-2.5 py-1 text-xs font-medium rounded-full border bg-amber-100 text-amber-700 border-amber-200">
          Pending Review
        </span>
      )
    },
    {
      header: 'Actions',
      accessor: 'actions',
      className: 'text-right',
      render: () => (
        <div className="flex items-center justify-end gap-2">
          <button className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" title="View Details">
            <Eye size={18} />
          </button>
          <button className="p-1.5 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors" title="Approve Retur">
            <CheckCircle size={18} />
          </button>
          <button className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors" title="Reject Retur">
            <XCircle size={18} />
          </button>
        </div>
      )
    }
  ]

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Retur Resolution Center</h1>
        <p className="text-gray-500 mt-1">Manage and resolve buyer return requests and disputes.</p>
      </div>

      <DataTable 
        title="Active Disputes"
        columns={columns}
        data={returTransactions}
        itemsPerPage={10}
      />
    </AdminLayout>
  )
}

export default ReturResolution
