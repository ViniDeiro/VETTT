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
  ChevronLeft,
  ChevronRight,
  Filter,
  CreditCard,
  DollarSign,
  AlertTriangle,
  CheckCircle2
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

  const formatCurrency = (value: number) => new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(Number(value || 0));

  const parseDate = (value?: string) => {
    if (!value) return new Date(0);
    if (value.includes('/')) {
      const [day, month, year] = value.split('/');
      return new Date(`${year}-${month}-${day}T00:00:00`);
    }
    return new Date(value);
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const normalizedReceivables = receivables
    .map((receivable) => {
      const dueDate = parseDate(receivable.dueDate);
      const normalizedStatus =
        receivable.status === 'paid'
          ? 'paid'
          : dueDate.getTime() < today.getTime()
            ? 'overdue'
            : 'pending';

      return {
        ...receivable,
        normalizedStatus,
      };
    })
    .sort((a, b) => parseDate(a.dueDate).getTime() - parseDate(b.dueDate).getTime());

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
  const totalOpen = normalizedReceivables
    .filter(r => r.normalizedStatus !== 'paid')
    .reduce((acc, r) => acc + r.amount, 0);
  const totalReceived = normalizedReceivables
    .filter(r => r.normalizedStatus === 'paid')
    .reduce((acc, r) => acc + r.amount, 0);
  const totalOverdue = normalizedReceivables
    .filter(r => r.normalizedStatus === 'overdue')
    .reduce((acc, r) => acc + r.amount, 0);
  const countPending = normalizedReceivables.filter(r => r.normalizedStatus === 'pending').length;
  const averageTicket = normalizedReceivables.length
    ? normalizedReceivables.reduce((acc, r) => acc + r.amount, 0) / normalizedReceivables.length
    : 0;

  const cards = [
    {
      title: 'Em Aberto',
      value: formatCurrency(totalOpen),
      change: `${countPending} pendentes no prazo`,
      isPositive: true,
      trend: 'up',
      color: 'text-orange-500'
    },
    {
      title: 'Recebido',
      value: formatCurrency(totalReceived),
      change: `${normalizedReceivables.filter(r => r.normalizedStatus === 'paid').length} contas baixadas`,
      isPositive: true,
      trend: 'up',
      color: 'text-teal-500'
    },
    {
      title: 'Em Atraso',
      value: formatCurrency(totalOverdue),
      change: `${normalizedReceivables.filter(r => r.normalizedStatus === 'overdue').length} vencidas`,
      isPositive: false,
      trend: totalOverdue > 0 ? 'down' : 'up',
      color: totalOverdue > 0 ? 'text-red-500' : 'text-gray-500'
    },
    {
      title: 'Ticket Médio',
      value: formatCurrency(averageTicket),
      change: `${normalizedReceivables.length} lançamento(s)`,
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
          const status = rec.normalizedStatus === 'paid' ? 'PAGO' : rec.normalizedStatus === 'overdue' ? 'ATRASADO' : 'PENDENTE';
          doc.text(`${parseDate(rec.dueDate).toLocaleDateString('pt-BR')} - ${rec.ownerName} (${rec.patientName}) - ${formatCurrency(rec.amount)} - ${status}`, 14, y);
          y += 10;
      });

      doc.save('contas_a_receber.pdf');
    } catch (error) {
      console.error('Erro ao exportar PDF', error);
      alert('Erro ao gerar PDF');
    }
  };

  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'overdue' | 'paid'>('all');

  const filteredReceivables = normalizedReceivables.filter(r => {
    const matchesSearch = r.patientName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          r.ownerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          r.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (r.professionalName || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || r.normalizedStatus === filterStatus;
    
    return matchesSearch && matchesFilter;
  });

  return (
    <Layout>
      <div className="space-y-6">
        
        {/* Header & Search */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-2">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Contas a Receber</h1>
                <p className="text-gray-500 text-sm">Acompanhe cobranças geradas automaticamente pelos atendimentos e registre os recebimentos.</p>
            </div>
            <div className="relative w-full max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input 
                    type="text" 
                    placeholder="Buscar por tutor, paciente, descrição ou profissional..." 
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
                <div className="flex gap-2 items-center">
                    <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-600">
                        <Filter className="h-4 w-4" />
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value as 'all' | 'pending' | 'overdue' | 'paid')}
                            className="bg-transparent outline-none"
                        >
                            <option value="all">Todos</option>
                            <option value="pending">Pendentes</option>
                            <option value="overdue">Atrasados</option>
                            <option value="paid">Pagos</option>
                        </select>
                    </div>
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
                        <th className="pb-3">Profissional</th>
                        <th className="pb-3">Resumo</th>
                        <th className="pb-3">Método</th>
                        <th className="pb-3">Valor</th>
                        <th className="pb-3 text-center">Status</th>
                        <th className="pb-3 text-right pr-2">Ações</th>
                    </tr>
                </thead>
                <tbody className="text-sm">
                    {filteredReceivables.map((rec) => (
                        <tr key={rec.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors">
                            <td className="py-4 pl-2 text-gray-500 font-medium">
                                <div>{parseDate(rec.dueDate).toLocaleDateString('pt-BR')}</div>
                                {rec.paymentDate && (
                                  <div className="text-xs text-gray-400 mt-1">Pago em {parseDate(rec.paymentDate).toLocaleDateString('pt-BR')}</div>
                                )}
                            </td>
                            <td className="py-4">
                                <div className="font-medium text-gray-900">{rec.ownerName}</div>
                                <div className="text-xs text-gray-500">{rec.patientName}</div>
                            </td>
                            <td className="py-4 text-gray-500">{rec.description}</td>
                            <td className="py-4 text-gray-500">{rec.professionalName || '-'}</td>
                            <td className="py-4">
                                <div className="text-xs text-gray-500">Custo: {formatCurrency(rec.totalCost || 0)}</div>
                                <div className="text-xs text-emerald-600 font-medium">Lucro: {formatCurrency(rec.grossProfit || 0)}</div>
                            </td>
                            <td className="py-4 text-gray-500">
                                <div>{rec.paymentMethod || '-'}</div>
                                {rec.paymentDetails?.installments && rec.paymentDetails.installments > 1 && (
                                  <div className="text-xs text-gray-400 mt-1">{rec.paymentDetails.installments}x</div>
                                )}
                            </td>
                            <td className="py-4 text-gray-900 font-bold">{formatCurrency(rec.amount)}</td>
                            <td className="py-4 text-center">
                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                    rec.normalizedStatus === 'paid' ? 'bg-teal-100 text-teal-700' : 
                                    rec.normalizedStatus === 'overdue' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-800'
                                }`}>
                                    {rec.normalizedStatus === 'paid' ? 'PAGO' : rec.normalizedStatus === 'overdue' ? 'ATRASADO' : 'PENDENTE'}
                                </span>
                            </td>
                            <td className="py-4 text-right pr-2">
                                {rec.normalizedStatus !== 'paid' ? (
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
                            <td colSpan={9} className="py-8 text-center text-gray-400">
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="border-none shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                <h3 className="text-lg font-bold text-gray-900">Prioridades</h3>
              </div>
              <div className="space-y-3">
                {normalizedReceivables.filter(r => r.normalizedStatus === 'overdue').slice(0, 5).map((rec) => (
                  <div key={rec.id} className="rounded-lg border border-red-100 bg-red-50 p-3">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-medium text-red-900">{rec.patientName}</p>
                        <p className="text-xs text-red-700">{rec.ownerName} - vencimento em {parseDate(rec.dueDate).toLocaleDateString('pt-BR')}</p>
                      </div>
                      <p className="font-bold text-red-800">{formatCurrency(rec.amount)}</p>
                    </div>
                  </div>
                ))}
                {normalizedReceivables.filter(r => r.normalizedStatus === 'overdue').length === 0 && (
                  <p className="text-sm text-gray-500">Nenhuma conta em atraso no momento.</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle2 className="h-5 w-5 text-teal-500" />
                <h3 className="text-lg font-bold text-gray-900">Resumo Operacional</h3>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-lg bg-gray-50 p-4">
                  <p className="text-xs text-gray-500 uppercase font-semibold">Pendentes</p>
                  <p className="text-xl font-bold text-gray-900 mt-2">{normalizedReceivables.filter(r => r.normalizedStatus === 'pending').length}</p>
                </div>
                <div className="rounded-lg bg-gray-50 p-4">
                  <p className="text-xs text-gray-500 uppercase font-semibold">Atrasadas</p>
                  <p className="text-xl font-bold text-red-600 mt-2">{normalizedReceivables.filter(r => r.normalizedStatus === 'overdue').length}</p>
                </div>
                <div className="rounded-lg bg-gray-50 p-4">
                  <p className="text-xs text-gray-500 uppercase font-semibold">Pagas</p>
                  <p className="text-xl font-bold text-teal-600 mt-2">{normalizedReceivables.filter(r => r.normalizedStatus === 'paid').length}</p>
                </div>
                <div className="rounded-lg bg-gray-50 p-4">
                  <p className="text-xs text-gray-500 uppercase font-semibold">Lucro Previsto</p>
                  <p className="text-xl font-bold text-emerald-600 mt-2">
                    {formatCurrency(normalizedReceivables.reduce((acc, rec) => acc + (rec.grossProfit || 0), 0))}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Payment Modal */}
        <Modal isOpen={isPayModalOpen} onClose={() => setIsPayModalOpen(false)} title="Registrar Pagamento">
            {selectedReceivable && (
                <div className="space-y-4">
                    <div className="bg-gray-50 p-4 rounded-lg flex justify-between items-center">
                        <div>
                            <p className="text-sm text-gray-500">Valor Original</p>
                            <p className="text-xl font-bold text-gray-900">{formatCurrency(selectedReceivable.amount)}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-gray-500">Valor Líquido Estimado</p>
                            <p className="text-xl font-bold text-green-600">
                                {formatCurrency(selectedReceivable.amount * (1 - (taxRate / 100)))}
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
