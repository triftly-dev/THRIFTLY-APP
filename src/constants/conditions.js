export const CONDITIONS = [
  {
    id: 'like-new',
    label: 'Bekas - Like New',
    deskripsi: 'Kondisi sangat bagus, hampir seperti baru, minim bekas pemakaian',
    color: 'green'
  },
  {
    id: 'bagus',
    label: 'Bekas - Bagus',
    deskripsi: 'Kondisi bagus, ada sedikit bekas pemakaian tapi masih layak',
    color: 'blue'
  },
  {
    id: 'oke',
    label: 'Bekas - Oke',
    deskripsi: 'Kondisi oke, ada bekas pemakaian yang cukup terlihat tapi masih berfungsi baik',
    color: 'yellow'
  }
]

export const getConditionById = (id) => {
  return CONDITIONS.find(cond => cond.id === id)
}

export const getConditionLabel = (id) => {
  const condition = getConditionById(id)
  return condition ? condition.label : 'Kondisi Tidak Diketahui'
}
