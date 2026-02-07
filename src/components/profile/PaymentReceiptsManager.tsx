'use client'

import { useState, useEffect } from 'react'
import { useUser, useSupabaseClient } from '@/lib/supabase'
import { 
  FileText, Upload, Calendar, DollarSign, CheckCircle, 
  Clock, AlertCircle, Loader2, Download, X,
  Receipt
} from 'lucide-react'
import { toast } from 'sonner'
import NextImage from 'next/image'

interface Invoice {
  id: number
  enrollment_id: number
  label: string
  amount: number
  due_date: string
  status: string
  meta: any
  created_at: string
  paid_at: string | null
  url_recipe: string | null
}

interface Enrollment {
  id: number
  student_id: string
  status: string
  agreed_price: number
}

export default function PaymentReceiptsManager() {
  const { user } = useUser()
  const supabase = useSupabaseClient()
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [enrollments, setEnrollments] = useState<Enrollment[]>([])
  const [loading, setLoading] = useState(true)
  const [uploadingInvoiceId, setUploadingInvoiceId] = useState<number | null>(null)
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (user) {
      fetchUserEnrollmentsAndInvoices()
    }
  }, [user])

  const fetchUserEnrollmentsAndInvoices = async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch user's enrollments
      const { data: enrollmentData, error: enrollmentError } = await supabase
        .from('enrollments')
        .select('*')
        .eq('student_id', user?.id)

      if (enrollmentError) throw enrollmentError
      setEnrollments(enrollmentData || [])

      // Fetch invoices for those enrollments
      const enrollmentIds = enrollmentData?.map(e => e.id) || []
      if (enrollmentIds.length === 0) {
        setInvoices([])
        return
      }

      const { data: invoiceData, error: invoiceError } = await supabase
        .from('invoices')
        .select('*')
        .in('enrollment_id', enrollmentIds)
        .order('due_date', { ascending: true })

      if (invoiceError) throw invoiceError
      setInvoices(invoiceData || [])

    } catch (err: any) {
      console.error('Error fetching data:', err)
      setError('Error al cargar las facturas. Por favor, inténtalo de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  const uploadReceipt = async (file: File, invoiceId: number) => {
    if (!file || !user) return

    try {
      setUploadingInvoiceId(invoiceId)

      // Validate file type
      if (!file.type.startsWith('image/')) {
        throw new Error('Solo se permiten archivos de imagen')
      }

      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        throw new Error('El archivo no debe superar los 5MB')
      }

      const fileExt = file.name.split('.').pop()
      const fileName = `receipt_${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${fileExt}`
      const filePath = `receipts/${user.id}/${invoiceId}/${fileName}`

      // Upload to Supabase storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('activities')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        })

      if (uploadError) throw uploadError

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('activities')
        .getPublicUrl(filePath)

      // Update invoice with receipt URL and paid_at timestamp
      const { error: updateError } = await supabase
        .from('invoices')
        .update({
          url_recipe: publicUrl,
          paid_at: new Date().toISOString(),
          status: 'paid'
        })
        .eq('id', invoiceId)

      if (updateError) throw updateError

      // Refresh invoices list
      await fetchUserEnrollmentsAndInvoices()
      
      toast.success('Recibo subido correctamente')
      
    } catch (error: any) {
      console.error('Error uploading receipt:', error)
      toast.error(error.message || 'Error al subir el recibo. Por favor, inténtalo de nuevo.')
    } finally {
      setUploadingInvoiceId(null)
    }
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>, invoiceId: number) => {
    const file = event.target.files?.[0]
    if (file) {
      uploadReceipt(file, invoiceId)
    }
  }

  const handleDrop = (event: React.DragEvent<HTMLDivElement>, invoiceId: number) => {
    event.preventDefault()
    const file = event.dataTransfer.files[0]
    if (file) {
      uploadReceipt(file, invoiceId)
    }
  }

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP'
    }).format(amount)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 animate-spin text-secondary" />
          <p className="text-gray-400 text-sm">Cargando facturas...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-900/20 border border-red-800/50 rounded-xl p-6 text-center">
        <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
        <p className="text-red-400">{error}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-secondary/10 rounded-lg">
          <Receipt className="text-secondary" size={24} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white">Mis Facturas y Recibos</h2>
          <p className="text-sm text-gray-400 mt-1">
            {invoices.length > 0 
              ? `${invoices.length} ${invoices.length === 1 ? 'factura encontrada' : 'facturas encontradas'}`
              : 'Gestiona tus facturas y sube recibos de pago'
            }
          </p>
        </div>
      </div>

      {invoices.length === 0 ? (
        <div className="bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 rounded-xl border border-zinc-700/50 overflow-hidden shadow-xl">
          <div className="px-8 py-16 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-secondary/20 to-blue-600/20 mb-6">
              <FileText className="w-10 h-10 text-secondary" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-3">
              No tienes facturas pendientes
            </h3>
            <p className="text-lg text-gray-400 mb-2 max-w-md mx-auto">
              Aún no tienes facturas asociadas a tus matrículas.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {invoices.map((invoice) => (
            <div key={invoice.id} className="bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 rounded-xl border border-zinc-700/50 overflow-hidden shadow-lg">
              <div className="p-6">
                {/* Invoice Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-white mb-2">{invoice.label}</h3>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
                      <div className="flex items-center gap-1">
                        <DollarSign className="w-4 h-4" />
                        <span>{formatCurrency(invoice.amount)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>Vence: {formatDate(invoice.due_date)}</span>
                      </div>
                      {invoice.paid_at && (
                        <div className="flex items-center gap-1">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span className="text-green-400">Pagado: {formatDate(invoice.paid_at)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Status Badge */}
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full ${
                      invoice.status === 'paid' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      {invoice.status === 'paid' ? (
                        <>
                          <CheckCircle className="w-3 h-3" />
                          Pagada
                        </>
                      ) : (
                        <>
                          <Clock className="w-3 h-3" />
                          Pendiente
                        </>
                      )}
                    </span>
                  </div>
                </div>

                {/* Receipt Section */}
                {invoice.status === 'paid' && invoice.url_recipe ? (
                  <div className="mt-4 p-4 bg-green-900/20 border border-green-800/50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <CheckCircle className="w-5 h-5 text-green-400" />
                        <div>
                          <p className="text-green-400 font-medium">Recibo de pago adjunto</p>
                          <p className="text-green-300 text-sm">
                            Subido el {invoice.paid_at ? formatDate(invoice.paid_at) : 'N/A'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setPreviewImage(invoice.url_recipe)}
                          className="p-2 text-green-400 hover:text-green-300 hover:bg-green-800/50 rounded-lg transition-colors"
                          title="Ver recibo"
                        >
                          <FileText className="w-5 h-5" />
                        </button>
                        <a
                          href={invoice.url_recipe}
                          download={`recibo_${invoice.label.replace(/\s+/g, '_')}.jpg`}
                          className="p-2 text-green-400 hover:text-green-300 hover:bg-green-800/50 rounded-lg transition-colors"
                          title="Descargar recibo"
                        >
                          <Download className="w-5 h-5" />
                        </a>
                      </div>
                    </div>
                  </div>
                ) : invoice.status !== 'paid' ? (
                  <div className="mt-4">
                    <div
                      className="border-2 border-dashed border-zinc-700/50 rounded-lg p-6 text-center hover:border-secondary/50 transition-colors cursor-pointer"
                      onDrop={(e) => handleDrop(e, invoice.id)}
                      onDragOver={handleDragOver}
                      onClick={() => document.getElementById(`file-input-${invoice.id}`)?.click()}
                    >
                      <input
                        id={`file-input-${invoice.id}`}
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileSelect(e, invoice.id)}
                        className="hidden"
                      />
                      
                      {uploadingInvoiceId === invoice.id ? (
                        <div className="flex flex-col items-center gap-3">
                          <Loader2 className="w-8 h-8 animate-spin text-secondary" />
                          <p className="text-secondary">Subiendo recibo...</p>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-3">
                          <Upload className="w-8 h-8 text-zinc-500" />
                          <div>
                            <p className="text-white font-medium">Subir recibo de pago</p>
                            <p className="text-zinc-400 text-sm mt-1">
                              Arrastra una imagen aquí o haz clic para seleccionar
                            </p>
                            <p className="text-zinc-500 text-xs mt-2">
                              Formatos: JPG, PNG, JPEG (Máx. 5MB)
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Image Preview Modal */}
      {previewImage && (
        <div 
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
          onClick={() => setPreviewImage(null)}
        >
          <div className="relative max-w-4xl max-h-full">
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute -top-12 right-0 p-2 text-white hover:text-gray-300 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
            <NextImage
              src={previewImage}
              alt="Recibo de pago"
              width={800}
              height={600}
              className="max-w-full max-h-[80vh] object-contain rounded-lg"
            />
          </div>
        </div>
      )}
    </div>
  )
}
