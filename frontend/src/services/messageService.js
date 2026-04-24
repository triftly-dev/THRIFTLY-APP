import { storage, STORAGE_KEYS } from './localStorage'
import { generateId } from '../utils/helpers'

export const messageService = {
  getAllMessages() {
    return storage.get(STORAGE_KEYS.MESSAGES) || []
  },

  getMessageById(id) {
    const messages = this.getAllMessages()
    return messages.find(message => message.id === id)
  },

  getMessagesByProduct(productId) {
    const messages = this.getAllMessages()
    return messages
      .filter(message => message.productId === productId)
      .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
  },

  getConversation(productId, userId1, userId2) {
    const messages = this.getAllMessages()
    return messages
      .filter(message => 
        message.productId === productId &&
        ((message.senderId === userId1 && message.receiverId === userId2) ||
         (message.senderId === userId2 && message.receiverId === userId1))
      )
      .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
  },

  getMessagesByUser(userId) {
    const messages = this.getAllMessages()
    return messages.filter(message => 
      message.senderId === userId || message.receiverId === userId
    )
  },

  getUnreadMessages(userId) {
    const messages = this.getAllMessages()
    return messages.filter(message => 
      message.receiverId === userId && !message.read
    )
  },

  getUnreadCount(userId) {
    return this.getUnreadMessages(userId).length
  },

  createMessage(messageData) {
    const messages = this.getAllMessages()

    const newMessage = {
      id: generateId(),
      productId: messageData.productId,
      senderId: messageData.senderId,
      receiverId: messageData.receiverId,
      message: messageData.message,
      read: false,
      timestamp: new Date().toISOString()
    }

    messages.push(newMessage)
    storage.set(STORAGE_KEYS.MESSAGES, messages)
    return newMessage
  },

  markAsRead(id) {
    const messages = this.getAllMessages()
    const index = messages.findIndex(message => message.id === id)
    
    if (index === -1) {
      throw new Error('Pesan tidak ditemukan')
    }

    messages[index].read = true
    storage.set(STORAGE_KEYS.MESSAGES, messages)
    return messages[index]
  },

  markAllAsRead(userId, productId) {
    const messages = this.getAllMessages()
    let updated = false

    messages.forEach(message => {
      if (message.receiverId === userId && 
          message.productId === productId && 
          !message.read) {
        message.read = true
        updated = true
      }
    })

    if (updated) {
      storage.set(STORAGE_KEYS.MESSAGES, messages)
    }

    return updated
  },

  deleteMessage(id) {
    const messages = this.getAllMessages()
    const filtered = messages.filter(message => message.id !== id)
    storage.set(STORAGE_KEYS.MESSAGES, filtered)
    return true
  },

  deleteMessagesByProduct(productId) {
    const messages = this.getAllMessages()
    const filtered = messages.filter(message => message.productId !== productId)
    storage.set(STORAGE_KEYS.MESSAGES, filtered)
    return true
  },

  getConversationsList(userId) {
    const messages = this.getMessagesByUser(userId)
    const conversations = {}

    messages.forEach(message => {
      const otherUserId = message.senderId === userId ? message.receiverId : message.senderId
      const key = `${message.productId}-${otherUserId}`

      if (!conversations[key] || new Date(message.timestamp) > new Date(conversations[key].timestamp)) {
        conversations[key] = {
          productId: message.productId,
          otherUserId,
          lastMessage: message.message,
          timestamp: message.timestamp,
          unread: message.receiverId === userId && !message.read
        }
      }
    })

    return Object.values(conversations).sort((a, b) => 
      new Date(b.timestamp) - new Date(a.timestamp)
    )
  }
}
