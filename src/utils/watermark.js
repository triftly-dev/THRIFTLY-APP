export const addWatermarkToImage = (imageFile) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    
    reader.onload = (e) => {
      const img = new Image()
      img.src = e.target.result
      
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        
        canvas.width = img.width
        canvas.height = img.height
        
        ctx.drawImage(img, 0, 0)
        
        const watermarkText = 'Hanya untuk verifikasi Secondnesia'
        const timestamp = new Date().toLocaleDateString('id-ID')
        
        ctx.save()
        ctx.translate(canvas.width / 2, canvas.height / 2)
        ctx.rotate(-Math.PI / 6)
        
        ctx.font = 'bold 40px Arial'
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        
        ctx.fillText(watermarkText, 0, -30)
        
        ctx.font = 'bold 30px Arial'
        ctx.fillText(timestamp, 0, 30)
        
        ctx.restore()
        
        const watermarkedImage = canvas.toDataURL('image/jpeg', 0.9)
        resolve(watermarkedImage)
      }
      
      img.onerror = () => {
        reject(new Error('Gagal memuat gambar'))
      }
    }
    
    reader.onerror = () => {
      reject(new Error('Gagal membaca file'))
    }
    
    reader.readAsDataURL(imageFile)
  })
}

export const addWatermarkToBase64 = (base64Image) => {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.src = base64Image
    
    img.onload = () => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      
      canvas.width = img.width
      canvas.height = img.height
      
      ctx.drawImage(img, 0, 0)
      
      const watermarkText = 'Hanya untuk verifikasi Secondnesia'
      const timestamp = new Date().toLocaleDateString('id-ID')
      
      ctx.save()
      ctx.translate(canvas.width / 2, canvas.height / 2)
      ctx.rotate(-Math.PI / 6)
      
      ctx.font = 'bold 40px Arial'
      ctx.fillStyle = 'rgba(255, 255, 255, 0.3)'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      
      ctx.fillText(watermarkText, 0, -30)
      
      ctx.font = 'bold 30px Arial'
      ctx.fillText(timestamp, 0, 30)
      
      ctx.restore()
      
      const watermarkedImage = canvas.toDataURL('image/jpeg', 0.9)
      resolve(watermarkedImage)
    }
    
    img.onerror = () => {
      reject(new Error('Gagal memuat gambar'))
    }
  })
}
