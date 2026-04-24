import { storage, STORAGE_KEYS } from './localStorage'
import { generateId } from '../utils/helpers'
import { productService } from './productService'
import { userService } from './userService'

export const transactionService = {
  getAllTransactions() {
    return storage.get(STORAGE_KEYS.TRANSACTIONS) || []
  },

  getTransactionById(id) {
    const transactions = this.getAllTransactions()
    return transactions.find(transaction => transaction.id === id)
  },

  getTransactionsByBuyer(buyerId) {
    const transactions = this.getAllTransactions()
    return transactions.filter(transaction => transaction.buyerId === buyerId)
  },

  getTransactionsBySeller(sellerId) {
    const transactions = this.getAllTransactions()
    return transactions.filter(transaction => transaction.sellerId === sellerId)
  },

  createTransaction(transactionData) {
    const transactions = this.getAllTransactions()

    const newTransaction = {
      id: generateId(),
      productId: transactionData.productId,
      buyerId: transactionData.buyerId,
      sellerId: transactionData.sellerId,
      hargaFinal: transactionData.hargaFinal,
      ongkir: transactionData.ongkir || 0,
      ongkirDitanggung: transactionData.ongkirDitanggung || 'buyer',
      alamatPengiriman: transactionData.alamatPengiriman,
      status: 'pending',
      videoPacking: '',
      videoUnboxing: '',
      createdAt: new Date().toISOString(),
      paidAt: null,
      shippedAt: null,
      completedAt: null
    }

    transactions.push(newTransaction)
    storage.set(STORAGE_KEYS.TRANSACTIONS, transactions)

    productService.markAsSold(transactionData.productId)

    try {
      const seller = userService.getUserById(transactionData.sellerId)
      if (seller) {
        userService.updateSaldo(transactionData.sellerId, {
          ketahan: (seller.saldo?.ketahan || 0) + transactionData.hargaFinal
        })
      }
    } catch (e) {
      console.warn("Legacy saldo update skipped.");
    }

    return newTransaction
  },

  updateTransaction(id, updates) {
    const transactions = this.getAllTransactions()
    const index = transactions.findIndex(transaction => transaction.id === id)
    
    if (index === -1) {
      throw new Error('Transaksi tidak ditemukan')
    }

    transactions[index] = {
      ...transactions[index],
      ...updates,
      updatedAt: new Date().toISOString()
    }

    storage.set(STORAGE_KEYS.TRANSACTIONS, transactions)
    return transactions[index]
  },

  markAsPaid(id) {
    const transactions = this.getAllTransactions()
    const index = transactions.findIndex(transaction => transaction.id === id)
    
    if (index === -1) {
      throw new Error('Transaksi tidak ditemukan')
    }

    transactions[index].status = 'paid'
    transactions[index].paidAt = new Date().toISOString()

    storage.set(STORAGE_KEYS.TRANSACTIONS, transactions)
    return transactions[index]
  },

  markAsShipped(id, videoPacking = '') {
    const transactions = this.getAllTransactions()
    const index = transactions.findIndex(transaction => transaction.id === id)
    
    if (index === -1) {
      throw new Error('Transaksi tidak ditemukan')
    }

    transactions[index].status = 'shipped'
    transactions[index].videoPacking = videoPacking
    transactions[index].shippedAt = new Date().toISOString()

    storage.set(STORAGE_KEYS.TRANSACTIONS, transactions)
    return transactions[index]
  },

  markAsCompleted(id) {
    const transactions = this.getAllTransactions()
    const index = transactions.findIndex(transaction => transaction.id === id)
    
    if (index === -1) {
      throw new Error('Transaksi tidak ditemukan')
    }

    const transaction = transactions[index]
    transactions[index].status = 'completed'
    transactions[index].completedAt = new Date().toISOString()

    storage.set(STORAGE_KEYS.TRANSACTIONS, transactions)

    try {
      const seller = userService.getUserById(transaction.sellerId)
      // Since seller is a Promise, this will gracefully bypass or fail inside updateSaldo without breaking the main app
      if (seller) {
        const newKetahan = (seller.saldo?.ketahan || 0) - transaction.hargaFinal
        const newBisaDitarik = (seller.saldo?.bisaDitarik || 0) + transaction.hargaFinal
        
        userService.updateSaldo(transaction.sellerId, {
          ketahan: Math.max(0, newKetahan),
          bisaDitarik: newBisaDitarik
        })
      }
    } catch(e) {
      console.warn("Legacy saldo update on completion skipped.", e)
    }

    return transactions[index]
  },

  markAsRetur(id, videoUnboxing = '') {
    const transactions = this.getAllTransactions()
    const index = transactions.findIndex(transaction => transaction.id === id)
    
    if (index === -1) {
      throw new Error('Transaksi tidak ditemukan')
    }

    const transaction = transactions[index]
    transactions[index].status = 'retur'
    transactions[index].videoUnboxing = videoUnboxing
    transactions[index].returAt = new Date().toISOString()

    storage.set(STORAGE_KEYS.TRANSACTIONS, transactions)

    const seller = userService.getUserById(transaction.sellerId)
    if (seller) {
      const newKetahan = (seller.saldo?.ketahan || 0) - transaction.hargaFinal
      
      userService.updateSaldo(transaction.sellerId, {
        ketahan: Math.max(0, newKetahan)
      })
    }

    return transactions[index]
  },

  deleteTransaction(id) {
    const transactions = this.getAllTransactions()
    const filtered = transactions.filter(transaction => transaction.id !== id)
    storage.set(STORAGE_KEYS.TRANSACTIONS, filtered)
    return true
  },

  getReturTransactions() {
    const transactions = this.getAllTransactions()
    return transactions.filter(transaction => transaction.status === 'retur')
  }
}
