import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Label } from '../ui/Label'
import { Select } from '../ui/Select'
import { 
  CreditCard, 
  FileText, 
  User, 
  Receipt,
  Download,
  Send,
  CheckCircle,
  
} from 'lucide-react'

export default function Billing({ data, onUpdate }) {
  const navigate = useNavigate()
  const [billingData, setBillingData] = useState({
    paymentMethod: '',
    paymentStatus: 'pending',
    discount: 0,
    discountType: 'percentage',
    notes: '',
    dueDate: '',
    installments: 1,
    ...data.billing
  })

  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false)
  const [isSendingEmail, setIsSendingEmail] = useState(false)

  useEffect(() => {
    onUpdate({ billing: billingData })
  }, [billingData, onUpdate])

  const handleInputChange = (field, value) => {
    setBillingData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const calculateTotals = () => {
    const subtotal = (data.procedures || []).reduce((sum, proc) => sum + parseFloat(proc.cost || 0), 0)
    let discountAmount = 0
    
    if (billingData.discountType === 'percentage') {
      discountAmount = (subtotal * billingData.discount) / 100
    } else {
      discountAmount = billingData.discount
    }
    
    const total = subtotal - discountAmount
    const installmentValue = total / billingData.installments
    
    return {
      subtotal,
      discountAmount,
      total,
      installmentValue
    }
  }

  const { subtotal, discountAmount, total, installmentValue } = calculateTotals()

  const handleGeneratePDF = async () => {
    setIsGeneratingPDF(true)
    // Simulate PDF generation
    await new Promise(resolve => setTimeout(resolve, 2000))
    setIsGeneratingPDF(false)
    alert('PDF gerado com sucesso!')
  }

  const handleSendEmail = async () => {
    setIsSendingEmail(true)
    // Simulate email sending
    await new Promise(resolve => setTimeout(resolve, 1500))
    setIsSendingEmail(false)
    alert('Email enviado com sucesso!')
  }

  const paymentMethods = [
    { value: 'cash', label: 'Dinheiro' },
    { value: 'credit', label: 'Cartão de Crédito' },
    { value: 'debit', label: 'Cartão de Débito' },
    { value: 'pix', label: 'PIX' },
    { value: 'transfer', label: 'Transferência' },
    { value: 'check', label: 'Cheque' }
  ]

  const paymentStatuses = [
    { value: 'pending', label: 'Pendente', color: 'text-yellow-600' },
    { value: 'paid', label: 'Pago', color: 'text-green-600' },
    { value: 'partial', label: 'Parcial', color: 'text-blue-600' },
    { value: 'overdue', label: 'Vencido', color: 'text-red-600' }
  ]

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Faturamento e Pagamento
        </h3>
        <p className="text-gray-600">
          Configure as informações de pagamento e finalize o gráfico
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Procedures Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5" />
              Resumo dos Procedimentos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.procedures && data.procedures.length > 0 ? (
                <>
                  {data.procedures.map((procedure) => (
                    <div key={procedure.id} className="flex justify-between items-center py-2 border-b">
                      <div>
                        <p className="font-medium text-sm">{procedure.name}</p>
                        {procedure.description && (
                          <p className="text-xs text-gray-600">{procedure.description}</p>
                        )}
                      </div>
                      <span className="font-medium">R$ {parseFloat(procedure.cost || 0).toFixed(2)}</span>
                    </div>
                  ))}
                  
                  <div className="pt-3 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Subtotal:</span>
                      <span>R$ {subtotal.toFixed(2)}</span>
                    </div>
                    
                    {discountAmount > 0 && (
                      <div className="flex justify-between text-sm text-green-600">
                        <span>Desconto:</span>
                        <span>- R$ {discountAmount.toFixed(2)}</span>
                      </div>
                    )}
                    
                    <div className="flex justify-between text-lg font-bold border-t pt-2">
                      <span>Total:</span>
                      <span className="text-green-600">R$ {total.toFixed(2)}</span>
                    </div>
                  </div>
                </>
              ) : (
                <p className="text-gray-500 text-center py-4">
                  Nenhum procedimento adicionado
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Payment Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Informações de Pagamento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="paymentMethod">Forma de Pagamento</Label>
                  <Select
                    id="paymentMethod"
                    value={billingData.paymentMethod}
                    onChange={(e) => handleInputChange('paymentMethod', e.target.value)}
                  >
                    <option value="">Selecione...</option>
                    {paymentMethods.map(method => (
                      <option key={method.value} value={method.value}>
                        {method.label}
                      </option>
                    ))}
                  </Select>
                </div>

                <div>
                  <Label htmlFor="paymentStatus">Status do Pagamento</Label>
                  <Select
                    id="paymentStatus"
                    value={billingData.paymentStatus}
                    onChange={(e) => handleInputChange('paymentStatus', e.target.value)}
                  >
                    {paymentStatuses.map(status => (
                      <option key={status.value} value={status.value}>
                        {status.label}
                      </option>
                    ))}
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="discount">Desconto</Label>
                  <div className="flex gap-2">
                    <Input
                      id="discount"
                      type="number"
                      min="0"
                      step="0.01"
                      value={billingData.discount}
                      onChange={(e) => handleInputChange('discount', parseFloat(e.target.value) || 0)}
                      placeholder="0"
                    />
                    <Select
                      value={billingData.discountType}
                      onChange={(e) => handleInputChange('discountType', e.target.value)}
                      className="w-24"
                    >
                      <option value="percentage">%</option>
                      <option value="fixed">R$</option>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="installments">Parcelas</Label>
                  <Select
                    id="installments"
                    value={billingData.installments}
                    onChange={(e) => handleInputChange('installments', parseInt(e.target.value))}
                  >
                    {[1, 2, 3, 4, 5, 6, 10, 12].map(num => (
                      <option key={num} value={num}>
                        {num}x {num > 1 && `(R$ ${installmentValue.toFixed(2)})`}
                      </option>
                    ))}
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="dueDate">Data de Vencimento</Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={billingData.dueDate}
                  onChange={(e) => handleInputChange('dueDate', e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="billingNotes">Observações</Label>
                <textarea
                  id="billingNotes"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows="3"
                  value={billingData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  placeholder="Observações sobre o pagamento..."
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Patient Information Summary */}
      {data.patient && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <User className="h-8 w-8 text-blue-600" />
              <div className="flex-1">
                <h4 className="font-semibold text-blue-900">
                  {data.patient.horseName} - {data.patient.clientName}
                </h4>
                <p className="text-sm text-blue-700">
                  {data.patient.horseBreed} • {data.patient.horseAge} anos
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-blue-700">Total do Atendimento</p>
                <p className="text-xl font-bold text-blue-900">R$ {total.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Finalizar Gráfico
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              onClick={handleGeneratePDF}
              disabled={isGeneratingPDF}
              className="flex items-center gap-2"
            >
              {isGeneratingPDF ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Gerando...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4" />
                  Gerar PDF
                </>
              )}
            </Button>

            <Button
              variant="outline"
              onClick={handleSendEmail}
              disabled={isSendingEmail}
              className="flex items-center gap-2"
            >
              {isSendingEmail ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
                  Enviando...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Enviar por Email
                </>
              )}
            </Button>

            <Button
              variant="success"
              className="flex items-center gap-2"
              onClick={() => {
                alert('Gráfico dental finalizado com sucesso!')
                // Save the data and redirect to dashboard
                navigate('/dashboard')
              }}
            >
              <CheckCircle className="h-4 w-4" />
              Finalizar Gráfico
            </Button>
          </div>

          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2 text-green-800">
              <CheckCircle className="h-5 w-5" />
              <span className="font-medium">Pronto para finalizar</span>
            </div>
            <p className="text-sm text-green-700 mt-1">
              Todas as informações foram coletadas. Você pode gerar o PDF, enviar por email ou finalizar o gráfico.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
