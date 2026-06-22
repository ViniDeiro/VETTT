import React, { useEffect, useMemo, useState } from 'react';
import Layout from '../../components/Layout';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Label } from '../../components/ui/Label';
import { Select } from '../../components/ui/Select';
import { supabaseDataService } from '../../services/supabaseDataService';
import { CashFlowEntry, Receivable } from '../../domain/types';
import {
  Wallet,
  Search,
  FileText,
  DollarSign,
  Plus,
  LockKeyhole,
  Unlock,
  Receipt,
  AlertTriangle,
  CreditCard,
  Landmark
} from 'lucide-react';
import { cn } from '@/lib/utils';

const formatCurrency = (value: number) => new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL'
}).format(Number(value || 0));

const parseDate = (value?: string) => {
  if (!value) return new Date(0);
  if (value.includes('/')) {
    const [day, month, year] = value.split('/');
    return new Date(Number(year), Number(month) - 1, Number(day));
  }
  if (value.length === 10 && value.includes('-')) {
    const [year, month, day] = value.split('-');
    return new Date(Number(year), Number(month) - 1, Number(day));
  }
  return new Date(value);
};

const normalizePaymentMethod = (method?: string) => {
  if (method === 'credit') return 'credit_card';
  if (method === 'debit') return 'debit_card';
  if (method === 'boleto') return 'bank_slip';
  return method || 'cash';
};

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  cash: 'Dinheiro',
  pix: 'Pix',
  debit_card: 'Cartao de debito',
  credit_card: 'Cartao de credito',
  transfer: 'Transferencia',
  bank_slip: 'Boleto'
};

const buildCashSummary = (entries: CashFlowEntry[]) => {
  return entries.reduce((acc, entry) => {
    const amount = Number(entry.amount || 0);
    if (entry.type === 'income') {
      acc.totalIncome += amount;
      const method = normalizePaymentMethod(entry.paymentMethod);
      if (method === 'cash') acc.cash += amount;
      if (method === 'pix') acc.pix += amount;
      if (method === 'debit_card') acc.debit += amount;
      if (method === 'credit_card') acc.credit += amount;
      if (method === 'transfer') acc.transfer += amount;
      if (method === 'bank_slip') acc.bankSlip += amount;
    }
    if (entry.type === 'expense') {
      acc.totalExpense += amount;
    }
    acc.netAmount = acc.totalIncome - acc.totalExpense;
    return acc;
  }, {
    totalIncome: 0,
    totalExpense: 0,
    netAmount: 0,
    cash: 0,
    pix: 0,
    debit: 0,
    credit: 0,
    transfer: 0,
    bankSlip: 0
  });
};

export const ReceivablesList: React.FC = () => {
  const [receivables, setReceivables] = useState<Receivable[]>([]);
  const [cashSessions, setCashSessions] = useState<any[]>([]);
  const [currentSession, setCurrentSession] = useState<any | null>(null);
  const [sessionEntries, setSessionEntries] = useState<CashFlowEntry[]>([]);
  const [animate, setAnimate] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'overdue'>('all');
  const [settings, setSettings] = useState<any>({
    payment: {
      enabledMethods: ['cash', 'pix', 'debit', 'credit'],
      maxInstallments: 6,
      installmentRates: {}
    }
  });

  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [isOpenCashModalOpen, setIsOpenCashModalOpen] = useState(false);
  const [isCloseCashModalOpen, setIsCloseCashModalOpen] = useState(false);
  const [isManualEntryModalOpen, setIsManualEntryModalOpen] = useState(false);
  const [selectedReceivable, setSelectedReceivable] = useState<Receivable | null>(null);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [paymentAmount, setPaymentAmount] = useState('');
  const [installments, setInstallments] = useState(1);
  const [taxRate, setTaxRate] = useState(0);
  const [openCashForm, setOpenCashForm] = useState({ openingBalance: '', notes: '' });
  const [closeCashForm, setCloseCashForm] = useState({ closingBalance: '', notes: '' });
  const [manualEntryForm, setManualEntryForm] = useState({
    description: '',
    category: 'Venda avulsa',
    amount: '',
    paymentMethod: 'cash'
  });

  const loadData = async () => {
    try {
      const [session, recs, sessions, settingsData] = await Promise.all([
        supabaseDataService.getCurrentCashSession(),
        supabaseDataService.getReceivables(),
        supabaseDataService.getCashSessions(),
        supabaseDataService.getSettings()
      ]);
      setReceivables([...recs]);
      setCashSessions(sessions);
      setCurrentSession(session);
      setSettings(settingsData);
      setSessionEntries(session ? await supabaseDataService.getCashSessionEntries(session.id) : []);
    } catch (error) {
      console.error('Error loading receivables:', error);
    } finally {
      setAnimate(true);
    }
  };

  useEffect(() => {
    loadData();
    window.addEventListener('vet-settings-updated', loadData);
    return () => window.removeEventListener('vet-settings-updated', loadData);
  }, []);

  const enabledPaymentMethods = useMemo(() => {
    const configuredMethods = settings.payment?.enabledMethods || ['cash', 'pix', 'debit', 'credit'];
    return configuredMethods
      .map((method: string) => normalizePaymentMethod(method))
      .filter((method: string, index: number, list: string[]) => list.indexOf(method) === index);
  }, [settings]);

  const cashSummary = useMemo(() => buildCashSummary(sessionEntries), [sessionEntries]);
  const expectedClosing = currentSession
    ? Number((Number(currentSession.openingBalance || 0) + cashSummary.netAmount).toFixed(2))
    : 0;

  const normalizedReceivables = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return receivables
      .map(receivable => {
        const dueDate = parseDate(receivable.dueDate);
        const normalizedStatus =
          receivable.status === 'paid'
            ? 'paid'
            : dueDate.getTime() < today.getTime()
              ? 'overdue'
              : 'pending';

        return {
          ...receivable,
          normalizedStatus
        };
      })
      .sort((a, b) => parseDate(a.dueDate).getTime() - parseDate(b.dueDate).getTime());
  }, [receivables]);

  const filteredReceivables = useMemo(() => {
    return normalizedReceivables.filter(receivable => {
      if (receivable.normalizedStatus === 'paid') return false;

      const query = searchTerm.trim().toLowerCase();
      const matchesSearch = !query || [
        receivable.patientName,
        receivable.ownerName,
        receivable.description,
        receivable.professionalName || ''
      ].some(field => field.toLowerCase().includes(query));

      const matchesStatus = filterStatus === 'all' || receivable.normalizedStatus === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [filterStatus, normalizedReceivables, searchTerm]);

  const recentClosedSessions = useMemo(() => {
    return cashSessions
      .filter(session => session.status === 'closed')
      .slice(0, 5);
  }, [cashSessions]);

  const openPayModal = (receivable: Receivable) => {
    if (!currentSession) {
      alert('Abra o caixa do dia antes de registrar um recebimento.');
      return;
    }

    const defaultMethod = enabledPaymentMethods[0] || 'cash';
    setSelectedReceivable(receivable);
    setPaymentMethod(defaultMethod);
    setPaymentAmount(String(receivable.amount || ''));
    setInstallments(1);
    setTaxRate(settings.payment?.installmentRates?.[1] || 0);
    setIsPayModalOpen(true);
  };

  const handlePaymentMethodChange = (method: string) => {
    setPaymentMethod(method);
    if (method === 'credit_card') {
      const rate = settings.payment?.installmentRates?.[installments] || 0;
      setTaxRate(rate);
      return;
    }
    setInstallments(1);
    setTaxRate(0);
  };

  const handleInstallmentChange = (value: number) => {
    setInstallments(value);
    setTaxRate(settings.payment?.installmentRates?.[value] || 0);
  };

  const handleConfirmPayment = async () => {
    if (!selectedReceivable || !currentSession) return;

    const amount = Number(paymentAmount);
    if (!Number.isFinite(amount) || amount <= 0) {
      alert('Informe um valor valido para receber.');
      return;
    }

    try {
      await supabaseDataService.payReceivable(selectedReceivable.id, {
        method: paymentMethod,
        installments: paymentMethod === 'credit_card' ? installments : 1,
        taxRate: paymentMethod === 'credit_card' ? taxRate : 0,
        amount,
        cashSessionId: currentSession.id,
        businessDate: currentSession.businessDate
      });

      setIsPayModalOpen(false);
      setSelectedReceivable(null);
      await loadData();
    } catch (error) {
      console.error('Error paying receivable:', error);
      alert('Erro ao registrar recebimento.');
    }
  };

  const handleOpenCashSession = async () => {
    const openingBalance = Number(openCashForm.openingBalance || 0);
    try {
      await supabaseDataService.openCashSession({
        openingBalance: Number.isFinite(openingBalance) ? openingBalance : 0,
        notes: openCashForm.notes
      });
      setOpenCashForm({ openingBalance: '', notes: '' });
      setIsOpenCashModalOpen(false);
      await loadData();
    } catch (error) {
      console.error('Error opening cash session:', error);
      alert('Erro ao abrir caixa.');
    }
  };

  const handleCloseCashSession = async () => {
    if (!currentSession) return;

    const closingBalance = Number(closeCashForm.closingBalance || expectedClosing);
    try {
      await supabaseDataService.closeCashSession(currentSession.id, {
        closingBalance: Number.isFinite(closingBalance) ? closingBalance : expectedClosing,
        notes: closeCashForm.notes
      });
      setCloseCashForm({ closingBalance: '', notes: '' });
      setIsCloseCashModalOpen(false);
      await loadData();
    } catch (error) {
      console.error('Error closing cash session:', error);
      alert('Erro ao fechar caixa.');
    }
  };

  const handleCreateManualEntry = async () => {
    if (!currentSession) {
      alert('Abra o caixa do dia antes de adicionar valores.');
      return;
    }

    const amount = Number(manualEntryForm.amount);
    if (!manualEntryForm.description || !Number.isFinite(amount) || amount <= 0) {
      alert('Preencha descricao e valor da entrada manual.');
      return;
    }

    try {
      await supabaseDataService.createCashFlowEntry({
        date: currentSession.businessDate,
        businessDate: currentSession.businessDate,
        type: 'income',
        category: manualEntryForm.category,
        amount,
        grossAmount: amount,
        totalCost: 0,
        grossProfit: amount,
        marginPercent: 100,
        paymentStatus: 'paid',
        description: manualEntryForm.description,
        paymentMethod: manualEntryForm.paymentMethod,
        cashSessionId: currentSession.id,
        sourceType: 'manual_revenue'
      });

      setManualEntryForm({
        description: '',
        category: 'Venda avulsa',
        amount: '',
        paymentMethod: enabledPaymentMethods[0] || 'cash'
      });
      setIsManualEntryModalOpen(false);
      await loadData();
    } catch (error) {
      console.error('Error creating manual entry:', error);
      alert('Erro ao registrar valor no caixa.');
    }
  };

  const handleExport = async () => {
    try {
      const { default: jsPDF } = await import('jspdf');
      const doc = new jsPDF();

      doc.setFontSize(18);
      doc.text('Caixa Diario e Contas a Receber', 14, 20);
      doc.setFontSize(10);
      doc.text(`Gerado em ${new Date().toLocaleDateString('pt-BR')}`, 14, 28);

      let y = 38;
      if (currentSession) {
        doc.text(`Caixa aberto em ${currentSession.businessDate}`, 14, y);
        y += 8;
        doc.text(`Recebido no dia: ${formatCurrency(cashSummary.totalIncome)}`, 14, y);
        y += 8;
        doc.text(`Dinheiro: ${formatCurrency(cashSummary.cash)} | Pix: ${formatCurrency(cashSummary.pix)} | Cartao: ${formatCurrency(cashSummary.debit + cashSummary.credit)}`, 14, y);
        y += 12;
      }

      filteredReceivables.forEach(receivable => {
        if (y > 280) {
          doc.addPage();
          y = 20;
        }
        const status = receivable.normalizedStatus === 'overdue' ? 'ATRASADO' : 'PENDENTE';
        doc.text(
          `${parseDate(receivable.dueDate).toLocaleDateString('pt-BR')} - ${receivable.ownerName} / ${receivable.patientName} - ${formatCurrency(receivable.amount)} - ${status}`,
          14,
          y
        );
        y += 8;
      });

      doc.save('caixa_e_contas_a_receber.pdf');
    } catch (error) {
      console.error('Erro ao exportar contas a receber', error);
      alert('Nao foi possivel exportar o relatorio.');
    }
  };

  const totalPending = filteredReceivables.reduce((sum, item) => sum + item.amount, 0);
  const totalOverdue = normalizedReceivables
    .filter(item => item.normalizedStatus === 'overdue')
    .reduce((sum, item) => sum + item.amount, 0);
  const totalCard = cashSummary.debit + cashSummary.credit;

  const cards = [
    {
      title: 'Recebido no caixa',
      value: formatCurrency(cashSummary.totalIncome),
      detail: currentSession ? `${sessionEntries.filter(entry => entry.type === 'income').length} lancamentos do dia` : 'Caixa fechado',
      icon: Wallet,
      tone: 'text-teal-600 bg-teal-50'
    },
    {
      title: 'Dinheiro + Pix',
      value: formatCurrency(cashSummary.cash + cashSummary.pix),
      detail: `Dinheiro ${formatCurrency(cashSummary.cash)} | Pix ${formatCurrency(cashSummary.pix)}`,
      icon: DollarSign,
      tone: 'text-emerald-600 bg-emerald-50'
    },
    {
      title: 'Cartoes',
      value: formatCurrency(totalCard),
      detail: `Debito ${formatCurrency(cashSummary.debit)} | Credito ${formatCurrency(cashSummary.credit)}`,
      icon: CreditCard,
      tone: 'text-blue-600 bg-blue-50'
    },
    {
      title: 'Em aberto',
      value: formatCurrency(totalPending),
      detail: `${filteredReceivables.length} contas visiveis | Atrasado ${formatCurrency(totalOverdue)}`,
      icon: AlertTriangle,
      tone: 'text-orange-600 bg-orange-50'
    }
  ];

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">A Receber / Caixa Diario</h1>
            <p className="text-sm text-gray-500">
              O caixa do dia considera apenas a sessao aberta hoje. Valores antigos ficam no historico e nos relatorios.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            {currentSession ? (
              <>
                <Button variant="outline" className="gap-2" onClick={() => setIsManualEntryModalOpen(true)}>
                  <Plus className="h-4 w-4" />
                  Adicionar valor
                </Button>
                <Button className="gap-2 bg-red-600 hover:bg-red-700 text-white" onClick={() => {
                  setCloseCashForm({ closingBalance: String(expectedClosing), notes: '' });
                  setIsCloseCashModalOpen(true);
                }}>
                  <LockKeyhole className="h-4 w-4" />
                  Fechar caixa
                </Button>
              </>
            ) : (
              <Button className="gap-2 bg-green-600 hover:bg-green-700 text-white" onClick={() => setIsOpenCashModalOpen(true)}>
                <Unlock className="h-4 w-4" />
                Abrir caixa
              </Button>
            )}
            <Button variant="outline" className="gap-2" onClick={handleExport}>
              <FileText className="h-4 w-4" />
              Exportar
            </Button>
          </div>
        </div>

        <Card className={cn('border-none shadow-sm', currentSession ? 'bg-green-50' : 'bg-amber-50')}>
          <CardContent className="p-5 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-gray-900">
                {currentSession ? `Caixa aberto para ${parseDate(currentSession.businessDate).toLocaleDateString('pt-BR')}` : 'Caixa fechado para hoje'}
              </p>
              <p className="text-sm text-gray-600 mt-1">
                {currentSession
                  ? `Saldo de abertura ${formatCurrency(currentSession.openingBalance)} | Fechamento esperado ${formatCurrency(expectedClosing)}`
                  : 'Abra o caixa para registrar recebimentos, entradas manuais e consolidar formas de pagamento do dia.'}
              </p>
            </div>
            {currentSession && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                <div className="rounded-lg bg-white px-4 py-3">
                  <p className="text-gray-500">Dinheiro</p>
                  <p className="font-bold text-gray-900">{formatCurrency(cashSummary.cash)}</p>
                </div>
                <div className="rounded-lg bg-white px-4 py-3">
                  <p className="text-gray-500">Pix</p>
                  <p className="font-bold text-gray-900">{formatCurrency(cashSummary.pix)}</p>
                </div>
                <div className="rounded-lg bg-white px-4 py-3">
                  <p className="text-gray-500">Cartoes</p>
                  <p className="font-bold text-gray-900">{formatCurrency(totalCard)}</p>
                </div>
                <div className="rounded-lg bg-white px-4 py-3">
                  <p className="text-gray-500">Boleto/Transf.</p>
                  <p className="font-bold text-gray-900">{formatCurrency(cashSummary.transfer + cashSummary.bankSlip)}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {cards.map((card, index) => {
            const Icon = card.icon;
            return (
              <Card
                key={card.title}
                className={cn(
                  'border-none shadow-sm transition-all duration-700 transform',
                  animate ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
                )}
                style={{ transitionDelay: `${index * 80}ms` }}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm text-gray-500 font-medium mb-2">{card.title}</p>
                      <h3 className="text-2xl font-bold text-gray-900">{card.value}</h3>
                      <p className="text-sm text-gray-500 mt-2">{card.detail}</p>
                    </div>
                    <div className={cn('rounded-xl p-3', card.tone)}>
                      <Icon className="h-5 w-5" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <Card className="xl:col-span-2 border-none shadow-sm">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Contas pendentes para receber</h3>
                  <p className="text-sm text-gray-500">Baixe pagamentos dentro do caixa aberto no dia.</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative w-full sm:w-80">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={event => setSearchTerm(event.target.value)}
                      placeholder="Buscar por tutor, paciente ou descricao"
                      className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    />
                  </div>
                  <div className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm">
                    <select
                      value={filterStatus}
                      onChange={event => setFilterStatus(event.target.value as 'all' | 'pending' | 'overdue')}
                      className="bg-transparent outline-none"
                    >
                      <option value="all">Todos</option>
                      <option value="pending">Pendentes</option>
                      <option value="overdue">Atrasados</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="text-xs text-gray-500 font-semibold border-b border-gray-100">
                      <th className="pb-3 pl-2">Vencimento</th>
                      <th className="pb-3">Tutor / Paciente</th>
                      <th className="pb-3">Descricao</th>
                      <th className="pb-3">Profissional</th>
                      <th className="pb-3">Valor</th>
                      <th className="pb-3 text-center">Status</th>
                      <th className="pb-3 text-right pr-2">Acao</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    {filteredReceivables.map(receivable => (
                      <tr key={receivable.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors">
                        <td className="py-4 pl-2 text-gray-500 font-medium">
                          {parseDate(receivable.dueDate).toLocaleDateString('pt-BR')}
                        </td>
                        <td className="py-4">
                          <div className="font-medium text-gray-900">{receivable.ownerName}</div>
                          <div className="text-xs text-gray-500">{receivable.patientName}</div>
                        </td>
                        <td className="py-4 text-gray-500">{receivable.description}</td>
                        <td className="py-4 text-gray-500">{receivable.professionalName || '-'}</td>
                        <td className="py-4 text-gray-900 font-bold">{formatCurrency(receivable.amount)}</td>
                        <td className="py-4 text-center">
                          <span className={cn(
                            'px-3 py-1 rounded-full text-xs font-bold',
                            receivable.normalizedStatus === 'overdue'
                              ? 'bg-red-100 text-red-700'
                              : 'bg-yellow-100 text-yellow-800'
                          )}>
                            {receivable.normalizedStatus === 'overdue' ? 'ATRASADO' : 'PENDENTE'}
                          </span>
                        </td>
                        <td className="py-4 text-right pr-2">
                          <Button
                            onClick={() => openPayModal(receivable)}
                            disabled={!currentSession}
                            className="h-8 text-xs bg-green-600 hover:bg-green-700 text-white disabled:opacity-50"
                          >
                            <DollarSign className="h-3 w-3 mr-1" />
                            Receber
                          </Button>
                        </td>
                      </tr>
                    ))}
                    {filteredReceivables.length === 0 && (
                      <tr>
                        <td colSpan={7} className="py-8 text-center text-gray-400">
                          Nenhuma conta pendente encontrada.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card className="border-none shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-900">Movimentos do caixa</h3>
                  <Receipt className="h-5 w-5 text-gray-400" />
                </div>
                <div className="space-y-3 max-h-[420px] overflow-auto">
                  {sessionEntries.map(entry => (
                    <div key={entry.id} className="rounded-xl border border-gray-100 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-medium text-gray-900">{entry.description}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {entry.category} | {PAYMENT_METHOD_LABELS[normalizePaymentMethod(entry.paymentMethod)] || '-'}
                          </p>
                        </div>
                        <p className={cn(
                          'font-bold',
                          entry.type === 'expense' ? 'text-red-600' : 'text-emerald-600'
                        )}>
                          {entry.type === 'expense' ? '-' : '+'}
                          {formatCurrency(entry.amount)}
                        </p>
                      </div>
                    </div>
                  ))}
                  {sessionEntries.length === 0 && (
                    <p className="text-sm text-gray-400">
                      {currentSession ? 'Nenhum movimento registrado no caixa de hoje.' : 'Abra o caixa para comecar a registrar recebimentos.'}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-900">Ultimos fechamentos</h3>
                  <Landmark className="h-5 w-5 text-gray-400" />
                </div>
                <div className="space-y-3">
                  {recentClosedSessions.map(session => (
                    <div key={session.id} className="rounded-xl border border-gray-100 p-4">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="font-medium text-gray-900">{parseDate(session.businessDate).toLocaleDateString('pt-BR')}</p>
                          <p className="text-xs text-gray-500">
                            Recebido {formatCurrency(session.summary?.totalIncome || 0)}
                          </p>
                        </div>
                        <p className="font-bold text-gray-900">{formatCurrency(session.closingBalance || 0)}</p>
                      </div>
                    </div>
                  ))}
                  {recentClosedSessions.length === 0 && (
                    <p className="text-sm text-gray-400">Nenhum caixa fechado ainda.</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <Modal isOpen={isPayModalOpen} onClose={() => setIsPayModalOpen(false)} title="Dar baixa no pagamento">
          {selectedReceivable && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-lg bg-gray-50 p-4">
                  <p className="text-sm text-gray-500">Conta</p>
                  <p className="font-bold text-gray-900 mt-1">{selectedReceivable.ownerName}</p>
                  <p className="text-xs text-gray-500">{selectedReceivable.patientName}</p>
                </div>
                <div className="rounded-lg bg-gray-50 p-4 text-right">
                  <p className="text-sm text-gray-500">Valor liquido estimado</p>
                  <p className="font-bold text-green-600 mt-1">
                    {formatCurrency(Number(paymentAmount || 0) * (1 - (Number(taxRate || 0) / 100)))}
                  </p>
                </div>
              </div>

              <div>
                <Label>Valor recebido</Label>
                <Input
                  type="number"
                  min={0}
                  step="0.01"
                  value={paymentAmount}
                  onChange={event => setPaymentAmount(event.target.value)}
                />
              </div>

              <div>
                <Label>Forma de pagamento</Label>
                <Select value={paymentMethod} onChange={event => handlePaymentMethodChange(event.target.value)}>
                  {enabledPaymentMethods.map(method => (
                    <option key={method} value={method}>{PAYMENT_METHOD_LABELS[method] || method}</option>
                  ))}
                </Select>
              </div>

              {paymentMethod === 'credit_card' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Parcelas</Label>
                    <Select value={installments} onChange={event => handleInstallmentChange(Number(event.target.value))}>
                      {Array.from({ length: settings.payment.maxInstallments || 1 }, (_, index) => index + 1).map(item => (
                        <option key={item} value={item}>{item}x</option>
                      ))}
                    </Select>
                  </div>
                  <div>
                    <Label>Taxa / juros (%)</Label>
                    <Input
                      type="number"
                      min={0}
                      step="0.01"
                      value={taxRate}
                      onChange={event => setTaxRate(Number(event.target.value))}
                    />
                  </div>
                </div>
              )}

              <div className="pt-4 flex justify-end gap-2 border-t">
                <Button variant="outline" onClick={() => setIsPayModalOpen(false)}>Cancelar</Button>
                <Button onClick={handleConfirmPayment} className="bg-green-600 hover:bg-green-700 text-white">
                  Confirmar recebimento
                </Button>
              </div>
            </div>
          )}
        </Modal>

        <Modal isOpen={isOpenCashModalOpen} onClose={() => setIsOpenCashModalOpen(false)} title="Abrir caixa do dia">
          <div className="space-y-4">
            <div>
              <Label>Saldo inicial</Label>
              <Input
                type="number"
                min={0}
                step="0.01"
                value={openCashForm.openingBalance}
                onChange={event => setOpenCashForm(prev => ({ ...prev, openingBalance: event.target.value }))}
              />
            </div>
            <div>
              <Label>Observacoes</Label>
              <Input
                value={openCashForm.notes}
                onChange={event => setOpenCashForm(prev => ({ ...prev, notes: event.target.value }))}
                placeholder="Ex.: caixa aberto pela recepcao"
              />
            </div>
            <div className="pt-4 flex justify-end gap-2 border-t">
              <Button variant="outline" onClick={() => setIsOpenCashModalOpen(false)}>Cancelar</Button>
              <Button onClick={handleOpenCashSession} className="bg-green-600 hover:bg-green-700 text-white">
                Abrir caixa
              </Button>
            </div>
          </div>
        </Modal>

        <Modal isOpen={isCloseCashModalOpen} onClose={() => setIsCloseCashModalOpen(false)} title="Fechar caixa do dia">
          <div className="space-y-4">
            <div className="rounded-lg bg-gray-50 p-4">
              <p className="text-sm text-gray-500">Fechamento esperado</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(expectedClosing)}</p>
            </div>
            <div>
              <Label>Saldo final contado</Label>
              <Input
                type="number"
                min={0}
                step="0.01"
                value={closeCashForm.closingBalance}
                onChange={event => setCloseCashForm(prev => ({ ...prev, closingBalance: event.target.value }))}
              />
            </div>
            <div>
              <Label>Observacoes do fechamento</Label>
              <Input
                value={closeCashForm.notes}
                onChange={event => setCloseCashForm(prev => ({ ...prev, notes: event.target.value }))}
                placeholder="Ex.: conferencia do caixa"
              />
            </div>
            <div className="pt-4 flex justify-end gap-2 border-t">
              <Button variant="outline" onClick={() => setIsCloseCashModalOpen(false)}>Cancelar</Button>
              <Button onClick={handleCloseCashSession} className="bg-red-600 hover:bg-red-700 text-white">
                Fechar caixa
              </Button>
            </div>
          </div>
        </Modal>

        <Modal isOpen={isManualEntryModalOpen} onClose={() => setIsManualEntryModalOpen(false)} title="Adicionar valor ao caixa">
          <div className="space-y-4">
            <div>
              <Label>Descricao</Label>
              <Input
                value={manualEntryForm.description}
                onChange={event => setManualEntryForm(prev => ({ ...prev, description: event.target.value }))}
                placeholder="Ex.: venda de medicamento no balcao"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Categoria</Label>
                <Input
                  value={manualEntryForm.category}
                  onChange={event => setManualEntryForm(prev => ({ ...prev, category: event.target.value }))}
                />
              </div>
              <div>
                <Label>Valor</Label>
                <Input
                  type="number"
                  min={0}
                  step="0.01"
                  value={manualEntryForm.amount}
                  onChange={event => setManualEntryForm(prev => ({ ...prev, amount: event.target.value }))}
                />
              </div>
            </div>
            <div>
              <Label>Forma de pagamento</Label>
              <Select
                value={manualEntryForm.paymentMethod}
                onChange={event => setManualEntryForm(prev => ({ ...prev, paymentMethod: event.target.value }))}
              >
                {enabledPaymentMethods.map(method => (
                  <option key={method} value={method}>{PAYMENT_METHOD_LABELS[method] || method}</option>
                ))}
              </Select>
            </div>
            <div className="pt-4 flex justify-end gap-2 border-t">
              <Button variant="outline" onClick={() => setIsManualEntryModalOpen(false)}>Cancelar</Button>
              <Button onClick={handleCreateManualEntry} className="bg-[var(--clinic-button)] hover:bg-[var(--clinic-button)]/90 text-white">
                Salvar valor
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </Layout>
  );
};
