import React, { useState } from 'react'
import Layout from '../components/Layout'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Label } from '../components/ui/Label'
import { Select } from '../components/ui/Select'
import { Card, CardContent } from '../components/ui/Card'
import {
  Calendar,
  Plus,
  Paperclip,
  TrendingUp,
  FileText,
  FileSpreadsheet,
  File as FileIcon,
  MoreHorizontal,
  Bell,
} from 'lucide-react'
import { cn } from '@/lib/utils'

export default function FinanceRevenue() {
  const [revenueHistory] = useState([
    {
      id: 1,
      date: '14/06/2024',
      category: 'Consultas',
      desc: 'Consulta Dr. Ana',
      value: 'R$ 450,00',
      method: 'Cartão Crédito',
      status: 'Recebido',
      statusColor: 'bg-teal-100 text-teal-700'
    },
    {
      id: 2,
      date: '13/06/2024',
      category: 'Vacinas',
      desc: 'Vacina V8 Cão',
      value: 'R$ 120,00',
      method: 'PIX',
      status: 'Pendente',
      statusColor: 'bg-yellow-100 text-yellow-700'
    },
    {
      id: 3,
      date: '12/06/2024',
      category: 'Exames',
      desc: 'Ultrassom Abdominal',
      value: 'R$ 350,00',
      method: 'Cartão Débito',
      status: 'Recebido',
      statusColor: 'bg-teal-100 text-teal-700'
    },
    {
      id: 4,
      date: '11/06/2024',
      category: 'Vendas',
      desc: 'Ração Royal Canin',
      value: 'R$ 250,00',
      method: 'Boleto',
      status: 'Recebido',
      statusColor: 'bg-teal-100 text-teal-700'
    },
    {
      id: 5,
      date: '10/06/2024',
      category: 'Consultas',
      desc: 'Consulta Retorno',
      value: 'R$ 0,00',
      method: '-',
      status: 'Isento',
      statusColor: 'bg-gray-100 text-gray-700'
    }
  ])

  const [formData, setFormData] = useState({
    date: '',
    category: '',
    center: '',
    desc: '',
    value: '',
    method: ''
  })

  const handleDateChange = (e) => {
    let v = e.target.value.replace(/\D/g, "");
    if (v.length > 2) v = v.slice(0, 2) + "/" + v.slice(2);
    if (v.length > 5) v = v.slice(0, 5) + "/" + v.slice(5, 9); // Allow up to 4 digits for year (total 8 digits + 2 slashes)
    setFormData(prev => ({ ...prev, date: v }));
  };

  const handleValueChange = (e) => {
    let v = e.target.value.replace(/\D/g, "");
    v = (Number(v) / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    setFormData(prev => ({ ...prev, value: v }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveRevenue = () => {
      if (!formData.date || !formData.desc || !formData.value) {
          alert("Preencha os campos obrigatórios!");
          return;
      }

      const newRevenue = {
          id: Date.now(),
          date: formData.date,
          category: formData.category || 'Outros',
          desc: formData.desc,
          value: formData.value,
          method: formData.method || 'Dinheiro',
          status: 'Recebido', // Default for manual entry
          statusColor: 'bg-teal-100 text-teal-700'
      };

      setRevenueHistory([newRevenue, ...revenueHistory]);
      
      // Reset Form
      setFormData({
        date: '',
        category: '',
        center: '',
        desc: '',
        value: '',
        method: ''
      });
      
      alert("Receita salva com sucesso!");
  };

  const [activeFilter, setActiveFilter] = useState('Mês')

  const handleExport = async (type) => {
      console.log('Exporting as', type);
      const rows = [
          ['Data', 'Categoria', 'Descrição', 'Valor', 'Forma', 'Status'],
          ...revenueHistory.map(r => [r.date, r.category, r.desc, r.value, r.method, r.status])
      ];

      try {
        if (type === 'csv' || type === 'excel') {
            let csvContent = "data:text/csv;charset=utf-8," 
                + rows.map(e => e.join(",")).join("\n");
            
            const encodedUri = encodeURI(csvContent);
            const link = document.createElement("a");
            link.setAttribute("href", encodedUri);
            link.setAttribute("download", `relatorio_receita.${type === 'excel' ? 'xls' : 'csv'}`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } else if (type === 'pdf') {
            const { default: jsPDF } = await import('jspdf');
            const doc = new jsPDF();
            
            // Header
            doc.setFillColor(11, 44, 77); // #0B2C4D
            doc.rect(0, 0, 210, 20, 'F');
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(16);
            doc.text('Relatório de Receitas', 10, 13);
            
            let y = 30;
            doc.setTextColor(0, 0, 0);
            doc.setFontSize(10);

            // Filter context in PDF
            doc.text(`Filtro aplicado: ${activeFilter}`, 10, 25);

            const dataToExport = getFilteredData(); // Use filtered data

            dataToExport.forEach((item, index) => {
                doc.text(`${item.date} - ${item.category} - ${item.desc} - ${item.value} (${item.status})`, 10, y);
                y += 10;
                if (y > 280) {
                    doc.addPage();
                    y = 20;
                }
            });

            doc.save('relatorio_receita.pdf');
        }
      } catch (error) {
          console.error('Export Error:', error);
          alert('Erro ao exportar. Verifique o console.');
      }
  };

  const getFilteredData = () => {
    if (activeFilter === 'Todos') return revenueHistory;
    
    const now = new Date();
    // Mock date parsing for dd/mm/yyyy
    const parseDate = (dateStr) => {
        const [d, m, y] = dateStr.split('/');
        return new Date(y, m - 1, d);
    };

    return revenueHistory.filter(item => {
        const itemDate = parseDate(item.date);
        
        if (activeFilter === 'Hoje') {
            return itemDate.toDateString() === now.toDateString();
        }
        if (activeFilter === 'Semana') {
            const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            return itemDate >= oneWeekAgo && itemDate <= now;
        }
        if (activeFilter === 'Mês') {
            return itemDate.getMonth() === now.getMonth() && itemDate.getFullYear() === now.getFullYear();
        }
        return true;
    });
  };

  const filteredHistory = getFilteredData();

  return (
    <Layout>
      <div className="flex flex-col lg:flex-row gap-6">
        
        {/* Main Content */}
        <div className="flex-1 space-y-6">
          
          {/* Header Section (Nova Receita Form) */}
          <Card className="border-none shadow-sm overflow-hidden">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row gap-8">
                {/* Form */}
                <div className="flex-1 space-y-4">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Nova Receita</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label className="text-xs font-semibold text-gray-700 mb-1.5 block">Data</Label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input 
                            value={formData.date}
                            onChange={handleDateChange}
                            maxLength={10}
                            placeholder="DD/MM/AAAA" 
                            className="pl-10" 
                        />
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs font-semibold text-gray-700 mb-1.5 block">Categoria</Label>
                      <Select 
                        name="category"
                        value={formData.category}
                        onChange={handleInputChange}
                      >
                        <option value="">Selecione uma categoria</option>
                        <option value="Consultas">Consultas</option>
                        <option value="Vacinas">Vacinas</option>
                        <option value="Exames">Exames</option>
                        <option value="Vendas">Vendas</option>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-xs font-semibold text-gray-700 mb-1.5 block">Centro de receita</Label>
                      <Select
                        name="center"
                        value={formData.center}
                        onChange={handleInputChange}
                      >
                        <option value="">Selecione um centro</option>
                        <option value="Clínica">Clínica</option>
                        <option value="Pet Shop">Pet Shop</option>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label className="text-xs font-semibold text-gray-700 mb-1.5 block">Descrição</Label>
                    <Input 
                        name="desc"
                        value={formData.desc}
                        onChange={handleInputChange}
                        placeholder="Breve descrição da receita" 
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label className="text-xs font-semibold text-gray-700 mb-1.5 block">Valor</Label>
                      <Input 
                        value={formData.value}
                        onChange={handleValueChange}
                        placeholder="R$ 0,00" 
                      />
                    </div>
                    <div>
                      <Label className="text-xs font-semibold text-gray-700 mb-1.5 block">Forma de recebimento</Label>
                      <Select
                        name="method"
                        value={formData.method}
                        onChange={handleInputChange}
                      >
                        <option value="">Selecione</option>
                        <option value="Cartão Crédito">Cartão Crédito</option>
                        <option value="Cartão Débito">Cartão Débito</option>
                        <option value="PIX">PIX</option>
                        <option value="Dinheiro">Dinheiro</option>
                        <option value="Boleto">Boleto</option>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-xs font-semibold text-gray-700 mb-1.5 block">Anexo</Label>
                      <Button variant="outline" className="w-full justify-start text-gray-500 font-normal border-dashed">
                        <Paperclip className="mr-2 h-4 w-4" />
                        Adicionar arquivo...
                      </Button>
                    </div>
                  </div>

                  <Button 
                    onClick={handleSaveRevenue}
                    className="w-full bg-[#00BFA5] hover:bg-[#00BFA5]/90 text-white font-bold h-12 mt-2"
                  >
                    <Plus className="mr-2 h-5 w-5" /> Salvar receita
                  </Button>
                </div>

                {/* Mini Dashboard inside Card */}
                <div className="w-full lg:w-72 bg-[#0B2C4D] rounded-xl p-5 text-white flex flex-col justify-between flex-shrink-0">
                  <div>
                    <h3 className="text-sm font-medium text-blue-200 mb-1">Resumo de Receitas - Junho 2024</h3>
                    <p className="text-3xl font-bold">R$ 18.920,00</p>
                  </div>
                  
                  <div className="mt-6">
                    <div className="flex items-center justify-between mb-4">
                      <p className="text-sm font-semibold">Receitas por categoria</p>
                      <TrendingUp className="h-4 w-4 text-[#00BFA5]" />
                    </div>
                    
                    <div className="flex items-end justify-between h-32 gap-2">
                      {/* Bar Chart Simulation */}
                      <div className="flex flex-col items-center gap-1 w-1/4">
                        <span className="text-[10px] text-blue-200 font-bold">R$ 9.500</span>
                        <div className="w-full bg-[#00BFA5] rounded-t-sm h-[80%]"></div>
                        <span className="text-[10px] text-blue-300">Consultas</span>
                      </div>
                      <div className="flex flex-col items-center gap-1 w-1/4">
                        <span className="text-[10px] text-blue-200 font-bold">R$ 5.200</span>
                        <div className="w-full bg-[#00BFA5] opacity-80 rounded-t-sm h-[50%]"></div>
                        <span className="text-[10px] text-blue-300">Vacinas</span>
                      </div>
                      <div className="flex flex-col items-center gap-1 w-1/4">
                        <span className="text-[10px] text-blue-200 font-bold">R$ 3.100</span>
                        <div className="w-full bg-[#00BFA5] opacity-60 rounded-t-sm h-[30%]"></div>
                        <span className="text-[10px] text-blue-300">Exames</span>
                      </div>
                      <div className="flex flex-col items-center gap-1 w-1/4">
                        <span className="text-[10px] text-blue-200 font-bold">R$ 1.120</span>
                        <div className="w-full bg-[#00BFA5] opacity-40 rounded-t-sm h-[15%]"></div>
                        <span className="text-[10px] text-blue-300">Vendas</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* History Table */}
          <Card className="border-none shadow-sm">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row items-center justify-between mb-6 gap-4">
                <h3 className="text-lg font-bold text-gray-900">Histórico de Receitas Recentes</h3>
                <div className="flex bg-gray-100 p-1 rounded-lg">
                  {['Hoje', 'Semana', 'Mês', 'Todos'].map((filter) => (
                    <button 
                      key={filter} 
                      onClick={() => setActiveFilter(filter)}
                      className={cn(
                        "px-3 py-1 text-xs font-medium rounded-md transition-all",
                        activeFilter === filter ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
                      )}
                    >
                      {filter}
                    </button>
                  ))}
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="text-xs text-gray-500 font-semibold border-b border-gray-100">
                      <th className="pb-3 pl-2">Data</th>
                      <th className="pb-3">Categoria</th>
                      <th className="pb-3">Descrição</th>
                      <th className="pb-3">Valor</th>
                      <th className="pb-3">Forma</th>
                      <th className="pb-3 text-center">Status</th>
                      <th className="pb-3 text-center">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    {filteredHistory.map((item) => (
                      <tr key={item.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors">
                        <td className="py-4 pl-2 text-gray-500 font-medium">{item.date}</td>
                        <td className="py-4 text-gray-900">{item.category}</td>
                        <td className="py-4 text-gray-500">{item.desc}</td>
                        <td className="py-4 text-gray-900 font-bold">{item.value}</td>
                        <td className="py-4 text-gray-500">{item.method}</td>
                        <td className="py-4 text-center">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${item.statusColor}`}>
                            {item.status}
                          </span>
                        </td>
                        <td className="py-4 text-center">
                          <button className="text-gray-400 hover:text-gray-600">
                            <MoreHorizontal className="h-5 w-5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Sidebar (Alerts & Export) */}
        <div className="w-full lg:w-80 space-y-6">
          {/* Alerts */}
          <div className="bg-[#0B2C4D] rounded-xl p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg">Alertas</h3>
              <Bell className="h-5 w-5 text-[#00BFA5]" />
            </div>
            <div className="space-y-3">
              <div className="bg-white text-[#0B2C4D] p-3 rounded-lg text-sm font-medium border-l-4 border-[#00BFA5] shadow-sm">
                <p className="font-bold mb-1">Alerta de Recebimento</p>
                <p className="text-xs opacity-90">Consulta Dr. Ana em 12/06 - Pendente</p>
              </div>
              <div className="bg-white text-[#0B2C4D] p-3 rounded-lg text-sm font-medium border-l-4 border-red-500 shadow-sm">
                <p className="font-bold mb-1">Alerta de Pagamento</p>
                <p className="text-xs opacity-90">Pendente - Vacina Sra. Lima em 10/06</p>
              </div>
            </div>
          </div>

          {/* Export */}
          <div className="bg-[#00BFA5] rounded-xl p-6 text-white">
            <h3 className="font-bold text-lg mb-4">Exportar</h3>
            <div className="flex gap-4">
               <button 
                onClick={() => handleExport('csv')}
                className="flex-1 bg-white/20 hover:bg-white/30 transition-colors rounded-lg p-3 flex flex-col items-center gap-2 border border-white/30"
               >
                 <FileText className="h-6 w-6" />
                 <span className="text-xs font-bold">CSV</span>
               </button>
               <button 
                onClick={() => handleExport('pdf')}
                className="flex-1 bg-white/20 hover:bg-white/30 transition-colors rounded-lg p-3 flex flex-col items-center gap-2 border border-white/30"
               >
                 <FileIcon className="h-6 w-6" />
                 <span className="text-xs font-bold">PDF</span>
               </button>
               <button 
                onClick={() => handleExport('excel')}
                className="flex-1 bg-white/20 hover:bg-white/30 transition-colors rounded-lg p-3 flex flex-col items-center gap-2 border border-white/30"
               >
                 <FileSpreadsheet className="h-6 w-6" />
                 <span className="text-xs font-bold">Excel</span>
               </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
