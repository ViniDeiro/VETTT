import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Label } from '../../components/ui/Label';
import { Select } from '../../components/ui/Select';
import { mockDB } from '../../services/mockDatabase';
import { Receivable } from '../../domain/types';
import { 
  TrendingUp, 
  TrendingDown, 
  Search, 
  FileText, 
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Filter,
  CreditCard,
  DollarSign
} from 'lucide-react';
import { cn } from '@/lib/utils';

export const ReceivablesList: React.FC = () => {
  const [receivables, setReceivables] = useState<Receivable[]>([]);
  const [animate, setAnimate] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Payment Modal State
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [selectedReceivable, setSelectedReceivable] = useState<Receivable | null>(null);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [installments, setInstallments] = useState(1);
  const [taxRate, setTaxRate] = useState(0);

  useEffect(() => {
    setReceivables(mockDB.getReceivables());
    setAnimate(true);
  }, []);

  const handleOpenPayModal = (rec: Receivable) => {
      setSelectedReceivable(rec);
      setPaymentMethod('cash');
      setInstallments(1);
      setTaxRate(0);
      setIsPayModalOpen(true);
  };

  const handleConfirmPay = () => {
    if (selectedReceivable) {
        mockDB.payReceivable(selectedReceivable.id, {
            method: paymentMethod,
            installments: paymentMethod === 'credit_card' ? installments : 1,
            taxRate: taxRate
        });
        setReceivables([...mockDB.getReceivables()]);
        setIsPayModalOpen(false);
        setSelectedReceivable(null);
    }
  };

  // Metrics
  const totalReceivables = receivables.filter(r => r.status === 'pending').reduce((acc, r) => acc + r.amount, 0);
  const totalReceived = receivables.filter(r => r.status === 'paid').reduce((acc, r) => acc + r.amount, 0);
  const countPending = receivables.filter(r => r.status === 'pending').length;

  const cards = [
    {
      title: 'A Receber (Total)',
      value: `R$ ${totalReceivables.toFixed(2)}`,
      change: `${countPending} pendentes`,
      isPositive: true,
      trend: 'up',
      color: 'text-orange-500' // Orange for pending
    },
    {
      title: 'Recebido (Hoje)',
      value: `R$ ${totalReceived.toFixed(2)}`, // Simplified
      change: '+12%',
      isPositive: true,
      trend: 'up',
      color: 'text-teal-500'
    },
    {
      title: 'Inadimplência',
      value: 'R$ 0,00',
      change: '0%',
      isPositive: true,
      trend: 'down',
      color: 'text-gray-500'
    },
    {
      title: 'Ticket Médio',
      value: receivables.length ? `R$ ${(totalReceived + totalReceivables) / receivables.length}` : 'R$ 0,00',
      change: '+1.5%',
      isPositive: true,
      trend: 'up',
      color: 'text-blue-500'
    }
  ];

  const handlePrintReceipt = (rec: Receivable) => {
      alert(`Imprimindo recibo para ${rec.patientName} - Valor: R$ ${rec.amount.toFixed(2)}`);
  };

  const handleExport = async () => {
    try {
      const { default: jsPDF } = await import('jspdf');
      const doc = new jsPDF();
      
      doc.setFontSize(18);
      doc.text('Relatório de Contas a Receber', 14, 20);
      doc.setFontSize(10);
      doc.text(`Gerado em: ${new Date().toLocaleDateString()}`, 14, 28);

      let y = 40;
      filteredReceivables.forEach((rec, i) => {
          if (y > 280) {
              doc.addPage();
              y = 20;
          }
          const status = rec.status === 'paid' ? 'PAGO' : rec.status === 'overdue' ? 'ATRASADO' : 'PENDENTE';
          doc.text(`${new Date(rec.dueDate).toLocaleDateString()} - ${rec.ownerName} (${rec.patientName}) - R$ ${rec.amount.toFixed(2)} - ${status}`, 14, y);
          y += 10;
      });

      doc.save('contas_a_receber.pdf');
    } catch (error) {
      console.error('Erro ao exportar PDF', error);
      alert('Erro ao gerar PDF');
    }
  };

  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'overdue' | 'paid'>('all');

  const handleFilterClick = () => {
      // Toggle filter for demo purposes
      if (filterStatus === 'all') setFilterStatus('pending');
      else if (filterStatus === 'pending') setFilterStatus('overdue');
      else if (filterStatus === 'overdue') setFilterStatus('paid');
      else setFilterStatus('all');
  };

  const filteredReceivables = receivables.filter(r => {
    const matchesSearch = r.patientName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          r.ownerName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || r.status === filterStatus;
    
    return matchesSearch && matchesFilter;
  });

  return (
    <Layout>
      <div className="space-y-6">
        
        {/* Header & Search */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-2">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Contas a Receber</h1>
                <p className="text-gray-500 text-sm">Gerencie os pagamentos pendentes dos atendimentos.</p>
            </div>
            <div className="relative w-full max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input 
                    type="text" 
                    placeholder="Buscar por cliente ou paciente..." 
                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                />
            </div>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {cards.map((card, index) => (
            <Card 
              key={index} 
              className={cn(
                "border-none shadow-sm transition-all duration-700 transform",
                animate ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
              )}
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              <CardContent className="p-6">
                <p className="text-gray-500 font-medium mb-2">{card.title}</p>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{card.value}</h3>
                <div className="flex items-center text-sm">
                  {card.trend === 'down' ? (
                     <TrendingDown className={`h-4 w-4 mr-1 ${card.color}`} />
                  ) : (
                     <TrendingUp className={`h-4 w-4 mr-1 ${card.color}`} />
                  )}
                  <span className={`${card.color} font-medium`}>
                    {card.change}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Transactions Table */}
        <Card className={cn(
            "border-none shadow-sm transition-all duration-1000 delay-300 transform",
            animate ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
        )}>
            <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-gray-900">Lançamentos {filterStatus !== 'all' && <span className="text-sm font-normal text-gray-500 ml-2">(Filtro: {filterStatus === 'paid' ? 'Pagos' : filterStatus === 'overdue' ? 'Atrasados' : 'Pendentes'})</span>}</h3>
                <div className="flex gap-2">
                    <Button 
                        variant="outline" 
                        className="gap-2 text-gray-600 border-gray-200"
                        onClick={handleFilterClick}
                    >
                        <Filter className="h-4 w-4" /> {filterStatus === 'all' ? 'Filtrar' : 'Próximo Filtro'}
                    </Button>
                    <Button 
                        variant="outline" 
                        className="gap-2 text-gray-600 border-gray-200"
                        onClick={handleExport}
                    >
                        <FileText className="h-4 w-4" /> Exportar
                    </Button>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="text-xs text-gray-500 font-semibold border-b border-gray-100">
                        <th className="pb-3 pl-2">Vencimento</th>
                        <th className="pb-3">Tutor / Paciente</th>
                        <th className="pb-3">Descrição</th>
                        <th className="pb-3">Método</th>
                        <th className="pb-3">Valor</th>
                        <th className="pb-3 text-center">Status</th>
                        <th className="pb-3 text-right pr-2">Ações</th>
                    </tr>
                </thead>
                <tbody className="text-sm">
                    {filteredReceivables.map((rec) => (
                        <tr key={rec.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors">
                            <td className="py-4 pl-2 text-gray-500 font-medium">{new Date(rec.dueDate).toLocaleDateString()}</td>
                            <td className="py-4">
                                <div className="font-medium text-gray-900">{rec.ownerName}</div>
                                <div className="text-xs text-gray-500">{rec.patientName}</div>
                            </td>
                            <td className="py-4 text-gray-500">{rec.description}</td>
                            <td className="py-4 text-gray-500">{rec.paymentMethod || '-'}</td>
                            <td className="py-4 text-gray-900 font-bold">R$ {rec.amount.toFixed(2)}</td>
                            <td className="py-4 text-center">
                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                    rec.status === 'paid' ? 'bg-teal-100 text-teal-700' : 
                                    rec.status === 'overdue' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-800'
                                }`}>
                                    {rec.status === 'paid' ? 'PAGO' : rec.status === 'overdue' ? 'ATRASADO' : 'PENDENTE'}
                                </span>
                            </td>
                            <td className="py-4 text-right pr-2">
                                {rec.status === 'pending' ? (
                                    <Button 
                                        onClick={() => handleOpenPayModal(rec)}
                                        className="h-8 text-xs bg-green-600 hover:bg-green-700 text-white"
                                    >
                                        <DollarSign className="h-3 w-3 mr-1" /> Receber
                                    </Button>
                                ) : (
                                    <Button 
                                        onClick={() => handlePrintReceipt(rec)}
                                        variant="outline"
                                        className="h-8 text-xs border-gray-300 text-gray-600 hover:bg-gray-50"
                                    >
                                        Recibo
                                    </Button>
                                )}
                            </td>
                        </tr>
                    ))}
                    {filteredReceivables.length === 0 && (
                        <tr>
                            <td colSpan={7} className="py-8 text-center text-gray-400">
                                Nenhum lançamento encontrado.
                            </td>
                        </tr>
                    )}
                </tbody>
                </table>
            </div>
            
            {/* Footer Pagination (Visual Only) */}
            <div className="mt-6 flex items-center justify-between border-t pt-4 text-sm text-gray-500">
                <span>Mostrando {filteredReceivables.length} resultados</span>
                <div className="flex gap-1">
                    <button className="p-1 hover:bg-gray-100 rounded"><ChevronLeft className="h-4 w-4" /></button>
                    <button className="px-3 py-1 bg-gray-100 rounded text-gray-900 font-medium">1</button>
                    <button className="p-1 hover:bg-gray-100 rounded"><ChevronRight className="h-4 w-4" /></button>
                </div>
            </div>

            </CardContent>
        </Card>

        {/* Payment Modal */}
        <Modal isOpen={isPayModalOpen} onClose={() => setIsPayModalOpen(false)} title="Registrar Pagamento">
            {selectedReceivable && (
                <div className="space-y-4">
                    <div className="bg-gray-50 p-4 rounded-lg flex justify-between items-center">
                        <div>
                            <p className="text-sm text-gray-500">Valor Original</p>
                            <p className="text-xl font-bold text-gray-900">R$ {selectedReceivable.amount.toFixed(2)}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-gray-500">Valor Líquido Estimado</p>
                            <p className="text-xl font-bold text-green-600">
                                R$ {(selectedReceivable.amount * (1 - (taxRate / 100))).toFixed(2)}
                            </p>
                        </div>
                    </div>

                    <div>
                        <Label>Forma de Pagamento</Label>
                        <Select 
                            value={paymentMethod}
                            onChange={(e) => setPaymentMethod(e.target.value)}
                        >
                            <option value="cash">Dinheiro</option>
                            <option value="pix">Pix</option>
                            <option value="debit_card">Cartão de Débito</option>
                            <option value="credit_card">Cartão de Crédito</option>
                            <option value="transfer">Transferência</option>
                        </Select>
                    </div>

                    {paymentMethod === 'credit_card' && (
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label>Parcelas</Label>
                                <Select 
                                    value={installments}
                                    onChange={(e) => setInstallments(Number(e.target.value))}
                                >
                                    {[1,2,3,4,5,6,10,12].map(i => (
                                        <option key={i} value={i}>{i}x</option>
                                    ))}
                                </Select>
                            </div>
                            <div>
                                <Label>Taxa / Juros (%)</Label>
                                <Input 
                                    type="number"
                                    value={taxRate}
                                    onChange={(e) => setTaxRate(Number(e.target.value))}
                                    placeholder="0"
                                />
                            </div>
                        </div>
                    )}

                    <div className="pt-4 flex justify-end gap-2 border-t mt-4">
                        <Button variant="outline" onClick={() => setIsPayModalOpen(false)}>Cancelar</Button>
                        <Button onClick={handleConfirmPay} className="bg-green-600 hover:bg-green-700 text-white">
                            Confirmar Recebimento
                        </Button>
                    </div>
                </div>
            )}
        </Modal>
      </div>
    </Layout>
  );
};
