import { useState, useEffect, useRef } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { Send, ArrowLeft, Image as ImageIcon, Check, CheckCheck } from 'lucide-react'
import Header from '../../components/layout/Header'
import Container from '../../components/layout/Container'
import { useAuth } from '../../context/AuthContext'
import { messageService } from '../../services/messageService'
import { productService } from '../../services/productService'
import { userService } from '../../services/userService'
import { formatCurrency, formatDateTime } from '../../utils/helpers'

const Chat = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const productIdRaw = searchParams.get('product')
  const otherUserIdRaw = searchParams.get('user')
  const productId = productIdRaw === 'undefined' ? null : productIdRaw
  const otherUserId = otherUserIdRaw === 'undefined' ? null : otherUserIdRaw
  
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [product, setProduct] = useState(null)
  const [otherUser, setOtherUser] = useState(null)
  const messagesEndRef = useRef(null)

  const [conversations, setConversations] = useState([])

  useEffect(() => {
    if (!user) {
      navigate('/login')
      return
    }

    if (!productId && !otherUserId) {
      // Load conversations list
      const fetchConversations = async () => {
        const convos = messageService.getConversationsList(user.id)
        
        // Enrich with product and user details
        const enrichedConvos = await Promise.all(convos.map(async c => {
          let p = null
          let u = null
          
          if (c.productId) {
            try {
              p = await productService.getProductById(c.productId)
            } catch (e) {
              console.error("Gagal load product buat chat list", e)
            }
          }
          
          if (c.otherUserId) {
            try {
              u = await userService.getUserById(c.otherUserId)
            } catch (e) {
              console.error("Gagal load user buat chat list", e)
            }
          }
          
          return { ...c, product: p, otherUser: u }
        }))
        
        setConversations(enrichedConvos)
      }
      
      fetchConversations()
      return
    }

    const loadData = async () => {
      if (productId) {
        try {
          const p = await productService.getProductById(productId)
          setProduct(p)
          
          if (!otherUserId && p) {
            try {
              const seller = await userService.getUserById(p.sellerId || p.user_id)
              setOtherUser(seller)
            } catch(e) {}
          }
        } catch (e) {
          console.error("Gagal load product buat chat")
        }
      }

      if (otherUserId) {
        try {
          const u = await userService.getUserById(otherUserId)
          setOtherUser(u)
        } catch (e) {}
      }
    }
    loadData()
  }, [productId, otherUserId, user, navigate])

  useEffect(() => {
    if (user && otherUser && product) {
      loadMessages()
      // Mark as read
      messageService.markAllAsRead(user.id, product.id)
      
      // Simple polling for new messages (since we use localStorage)
      const interval = setInterval(() => {
        loadMessages()
      }, 3000)
      
      return () => clearInterval(interval)
    }
  }, [user, otherUser, product])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const loadMessages = () => {
    if (user && otherUser && product) {
      const msgs = messageService.getConversation(product.id, user.id, otherUser.id)
      setMessages(msgs)
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleSendMessage = (e) => {
    e.preventDefault()
    if (!newMessage.trim() || !user || !otherUser || !product) return

    messageService.createMessage({
      senderId: user.id,
      receiverId: otherUser.id,
      productId: product.id,
      message: newMessage.trim()
    })

    setNewMessage('')
    loadMessages()
  }

  if (!user) {
    return null
  }

  if (!productId || !otherUserId) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50 pb-20 md:pb-0">
        <Header />
        <Container maxWidth="max-w-3xl" className="py-6 flex-grow">
          <div className="bg-white rounded-2xl shadow-soft border border-gray-100 overflow-hidden">
            <div className="p-4 border-b border-gray-100 bg-white">
              <h1 className="text-xl font-bold text-gray-900">Pesan</h1>
            </div>
            
            <div className="divide-y divide-gray-100">
              {conversations.length === 0 ? (
                <div className="p-12 text-center">
                  <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <ImageIcon size={32} className="text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-1">Belum ada obrolan</h3>
                  <p className="text-gray-500 text-sm">Mulai cari barang dan chat dengan penjual!</p>
                </div>
              ) : (
                conversations.map((convo, idx) => (
                  <button 
                    key={idx}
                    onClick={() => navigate(`/chat?product=${convo.productId}&user=${convo.otherUserId}`)}
                    className="w-full text-left p-4 hover:bg-gray-50 transition-colors flex items-start gap-4"
                  >
                    <div className="relative shrink-0">
                      <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-lg border-2 border-white shadow-sm">
                        {convo.otherUser?.profile?.nama?.charAt(0) || '?'}
                      </div>
                      {convo.unread && (
                        <div className="absolute top-0 right-0 w-3.5 h-3.5 bg-red-500 border-2 border-white rounded-full"></div>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline mb-1">
                        <h3 className={`font-medium truncate pr-2 ${convo.unread ? 'text-gray-900' : 'text-gray-700'}`}>
                          {convo.otherUser?.profile?.nama || 'Pengguna'}
                        </h3>
                        <span className="text-xs text-gray-400 shrink-0">
                          {formatDateTime(convo.timestamp).split(' ')[0]}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {convo.product && (
                          <img 
                            src={convo.product.fotos?.[0]} 
                            alt="" 
                            className="w-8 h-8 rounded object-cover border border-gray-200 shrink-0"
                          />
                        )}
                        <p className={`text-sm truncate ${convo.unread ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>
                          {convo.lastMessage}
                        </p>
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </Container>
      </div>
    )
  }

  if (!product || !otherUser) return null;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 pb-16 md:pb-0">
      <Header />
      
      <main className="flex-grow py-6 md:py-8">
        <Container maxWidth="max-w-4xl" className="h-[calc(100vh-140px)] md:h-[calc(100vh-160px)]">
          <div className="bg-white rounded-2xl shadow-soft h-full flex flex-col overflow-hidden border border-gray-100">
            
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-100 flex items-center gap-4 bg-white z-10">
              <button 
                onClick={() => navigate(-1)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-600"
              >
                <ArrowLeft size={20} />
              </button>
              
              <div className="flex items-center gap-3 flex-1">
                <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-lg">
                  {otherUser.profile?.nama?.charAt(0) || '?'}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{otherUser.profile?.nama || 'Pengguna'}</h3>
                  <p className="text-xs text-gray-500 capitalize">{otherUser.role}</p>
                </div>
              </div>
            </div>

            {/* Product Info Bar */}
            <div className="bg-gray-50 p-3 border-b border-gray-100 flex items-center gap-3">
              <img 
                src={product.fotos?.[0]} 
                alt={product.nama} 
                className="w-12 h-12 rounded-lg object-cover border border-gray-200"
              />
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium text-gray-900 truncate">{product.nama}</h4>
                <p className="text-sm font-semibold text-primary-600">{formatCurrency(product.harga)}</p>
              </div>
              {user.role === 'seller' && product.sellerId === user.id && (
                <button 
                  onClick={() => navigate(`/toko/produk/edit/${product.id}`)}
                  className="text-xs px-3 py-1.5 bg-white border border-gray-200 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                >
                  Update Harga
                </button>
              )}
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#f8f9fa]">
              {messages.length === 0 ? (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center text-gray-500 bg-white px-4 py-3 rounded-xl shadow-sm border border-gray-100">
                    <p className="text-sm">Belum ada pesan. Mulai percakapan sekarang!</p>
                  </div>
                </div>
              ) : (
                messages.map((msg, index) => {
                  const isMe = msg.senderId === user.id
                  const showDate = index === 0 || 
                    new Date(msg.timestamp).toDateString() !== new Date(messages[index-1].timestamp).toDateString()

                  return (
                    <div key={msg.id}>
                      {showDate && (
                        <div className="flex justify-center my-4">
                          <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded-full">
                            {new Date(msg.timestamp).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' })}
                          </span>
                        </div>
                      )}
                      <div className={`flex ${isMe ? 'justify-end' : 'justify-start'} mb-2`}>
                        <div 
                          className={`max-w-[75%] rounded-2xl px-4 py-2 ${
                            isMe 
                              ? 'bg-primary-600 text-white rounded-tr-sm' 
                              : 'bg-white text-gray-800 border border-gray-100 shadow-sm rounded-tl-sm'
                          }`}
                        >
                          <p className="text-sm whitespace-pre-wrap break-words">{msg.message}</p>
                          <div className={`flex items-center justify-end gap-1 mt-1 ${isMe ? 'text-primary-200' : 'text-gray-400'}`}>
                            <span className="text-[10px]">
                              {new Date(msg.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            {isMe && (
                              msg.read ? <CheckCheck size={12} className="text-blue-300" /> : <Check size={12} />
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white border-t border-gray-100">
              <form onSubmit={handleSendMessage} className="flex items-end gap-2">
                <div className="flex-1 bg-gray-50 rounded-xl border border-gray-200 focus-within:border-primary-500 focus-within:ring-1 focus-within:ring-primary-500 transition-all flex items-center px-3 py-2">
                  <textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Ketik pesan..."
                    className="flex-1 bg-transparent border-none focus:ring-0 resize-none max-h-32 min-h-[40px] text-sm py-2 outline-none"
                    rows="1"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault()
                        handleSendMessage(e)
                      }
                    }}
                  />
                </div>
                <button 
                  type="submit"
                  disabled={!newMessage.trim()}
                  className="p-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex-shrink-0"
                >
                  <Send size={20} />
                </button>
              </form>
            </div>

          </div>
        </Container>
      </main>
    </div>
  )
}

export default Chat