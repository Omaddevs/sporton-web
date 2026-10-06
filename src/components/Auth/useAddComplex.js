import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/auth.js'

export const ADD_COMPLEX_PATH = '/majmua-qoshish'

/** «Majmua qo‘shish» tugmasi: kirgan bo‘lsa — formaga, aks holda kirish oynasi */
export function useAddComplex() {
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [gateOpen, setGateOpen] = useState(false)

  function openAddComplex() {
    if (isAuthenticated) navigate(ADD_COMPLEX_PATH)
    else setGateOpen(true)
  }

  return {
    openAddComplex,
    gateProps: { open: gateOpen, onClose: () => setGateOpen(false), from: ADD_COMPLEX_PATH },
  }
}
