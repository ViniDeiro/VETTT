import jsPDF from 'jspdf';
import { Patient, Attendance, Receivable, Owner, Prescription, ExamRequest } from '../domain/types';
import { mockDB } from './mockDatabase';

class PdfService {
  private hexToRgb(hex: string) {
    const sanitized = hex.replace('#', '');
    const value = sanitized.length === 3
      ? sanitized.split('').map(char => char + char).join('')
      : sanitized;

    const parsed = Number.parseInt(value, 16);
    return {
      r: (parsed >> 16) & 255,
      g: (parsed >> 8) & 255,
      b: parsed & 255
    };
  }

  private getDocumentContext() {
    const settings = mockDB.getSettings();
    const currentUser = mockDB.getCurrentUser();
    const teamMember = mockDB.getLinkedTeamMember(currentUser);
    const primary = this.hexToRgb(settings.appearance.primaryColor || '#0B2C4D');

    return { settings, currentUser, teamMember, primary };
  }

  private addHeader(doc: jsPDF, title: string) {
    const { settings, primary } = this.getDocumentContext();
    const model = settings.documents.selectedModel || 'classic';
    const logoUrl = settings.clinic.logoUrl;
    const logoPos = settings.documents.logoPosition || 'left';

    if (model === 'minimal') {
      // Minimal Model: Clean top with colored bar below
      if (logoUrl) {
          try {
              const xPos = logoPos === 'left' ? 20 : logoPos === 'right' ? 160 : 90;
              doc.addImage(logoUrl, 'PNG', xPos, 15, 30, 30, undefined, 'FAST');
          } catch (e) { console.error('Error adding logo to PDF', e); }
      }

      doc.setFillColor(primary.r, primary.g, primary.b);
      doc.rect(20, 50, 170, 1, 'F'); // Thin decorative line

      doc.setTextColor(primary.r, primary.g, primary.b);
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text(settings.clinic.fantasyName || 'Vet Tooth', logoPos === 'center' ? 105 : 20, logoUrl ? 58 : 30, { align: logoPos === 'center' ? 'center' : 'left' });
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(settings.documents.header || settings.clinic.legalName || '', logoPos === 'center' ? 105 : 20, logoUrl ? 63 : 35, { align: logoPos === 'center' ? 'center' : 'left' });

      doc.setTextColor(0, 0, 0);
      doc.setFontSize(16);
      doc.text(title, 105, 80, { align: 'center' });
    } else if (model === 'premium') {
      // Premium Model: Elegant centered layout with soft background
      doc.setFillColor(primary.r, primary.g, primary.b);
      doc.rect(0, 0, 210, 8, 'F'); // Top colored strip

      if (logoUrl) {
          try {
              doc.addImage(logoUrl, 'PNG', 90, 15, 30, 30, undefined, 'FAST');
          } catch (e) { console.error('Error adding logo to PDF', e); }
      }

      doc.setTextColor(50, 50, 50);
      doc.setFontSize(24);
      doc.setFont('helvetica', 'bold');
      doc.text(settings.clinic.fantasyName || 'Vet Tooth', 105, logoUrl ? 55 : 30, { align: 'center' });
      
      doc.setFontSize(11);
      doc.setFont('helvetica', 'italic');
      doc.text(settings.documents.header || settings.clinic.legalName || '', 105, logoUrl ? 62 : 37, { align: 'center' });

      doc.setDrawColor(primary.r, primary.g, primary.b);
      doc.setLineWidth(0.5);
      doc.line(60, logoUrl ? 68 : 42, 150, logoUrl ? 68 : 42);

      doc.setTextColor(primary.r, primary.g, primary.b);
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text(title.toUpperCase(), 105, 85, { align: 'center' });
    } else {
      // Classic Model: (Current) Solid header
      doc.setFillColor(primary.r, primary.g, primary.b);
      doc.rect(0, 0, 210, 40, 'F');
      
      if (logoUrl) {
          try {
              const xPos = logoPos === 'left' ? 15 : logoPos === 'right' ? 165 : 90;
              // If center, we might need to adjust text to not overlap
              doc.addImage(logoUrl, 'PNG', xPos, 5, 30, 30, undefined, 'FAST');
          } catch (e) { console.error('Error adding logo to PDF', e); }
      }

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(22);
      doc.setFont('helvetica', 'bold');
      
      const textX = logoPos === 'left' && logoUrl ? 50 : 20;
      doc.text(settings.clinic.fantasyName || 'Vet Tooth', textX, 25);
      
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text(settings.documents.header || settings.clinic.legalName || 'Odontologia Veterinaria Especializada', textX, 32);
      
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text(title, 105, 55, { align: 'center' });
    }
  }

  private addFooter(doc: jsPDF, signature: boolean = false) {
    const { settings, teamMember } = this.getDocumentContext();
    const pageHeight = doc.internal.pageSize.height;
    const qrCodeUrl = settings.documents.showQrCode ? settings.clinic.qrCodeUrl : null;

    if (qrCodeUrl) {
        try {
            doc.addImage(qrCodeUrl, 'PNG', 180, pageHeight - 40, 20, 20, undefined, 'FAST');
        } catch (e) { console.error('Error adding QR code to PDF', e); }
    }
    
    if (signature) {
      doc.setDrawColor(150);
      doc.line(70, pageHeight - 40, 140, pageHeight - 40);
      doc.setFontSize(10);
      doc.setTextColor(50);
      const signatureLabel = settings.documents.showSignature
        ? (teamMember?.signature || 'Assinatura digital do veterinario')
        : 'Documento emitido sem assinatura digital';
      doc.text(signatureLabel, 105, pageHeight - 35, { align: 'center' });
      doc.setFontSize(8);
      const credentialLine = [
        teamMember?.name,
        settings.documents.autoCrmv ? teamMember?.crmv : null,
        settings.documents.autoCnpj ? settings.clinic.cnpj : null
      ].filter(Boolean).join(' | ');
      doc.text(credentialLine || 'Responsavel tecnico', 105, pageHeight - 30, { align: 'center' });
    }

    doc.setFontSize(8);
    doc.setTextColor(150);
    const footerParts = [
      settings.documents.footer,
      settings.documents.showAddress ? settings.clinic.address : null,
      settings.clinic.phone || null,
      settings.fiscal.includeCnpjOnAllDocuments || settings.documents.autoCnpj ? `CNPJ: ${settings.clinic.cnpj}` : null
    ].filter(Boolean);
    doc.text(footerParts.join(' | ') || 'Gerado por Vet Tooth System', 105, pageHeight - 10, { align: 'center' });
  }

  generatePrescriptionPdf(patient: Patient, prescription: Prescription, ownerName: string) {
    const doc = new jsPDF();
    this.addHeader(doc, 'Receituário Médico Veterinário');

    let y = 70;

    // Patient Info Compact
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Paciente: ${patient.name} (${patient.species}) | Tutor: ${ownerName}`, 20, y);
    doc.text(`Data: ${prescription.date}`, 160, y);
    y += 5;
    doc.setDrawColor(200);
    doc.line(20, y, 190, y);
    y += 15;

    // Items
    doc.setTextColor(0);
    prescription.items.forEach((item, index) => {
      // Item Title
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      const title = `${index + 1}. ${item.name} ${item.concentration ? item.concentration : ''}`;
      doc.text(title, 20, y);
      
      // Type Badge (Text representation)
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100);
      const typeLabel = item.type === 'industrialized' ? '[Industrializado]' : '[Manipulado]';
      doc.text(typeLabel, 160, y, { align: 'right' });

      y += 6;

      // Instructions
      doc.setTextColor(50);
      doc.setFontSize(11);
      const instruction = `Uso: ${item.route || 'Oral'} - ${item.dosage}`;
      doc.text(instruction, 25, y);
      y += 6;
      
      const frequency = `Frequência: ${item.frequency}`;
      doc.text(frequency, 25, y);
      y += 6;

      const duration = `Duração: ${item.duration}`;
      doc.text(duration, 25, y);
      y += 6;

      if (item.instructions) {
        doc.setFontSize(10);
        doc.setFont('helvetica', 'italic');
        const notes = `Obs: ${item.instructions}`;
        const splitNotes = doc.splitTextToSize(notes, 160);
        doc.text(splitNotes, 25, y);
        y += (splitNotes.length * 5) + 2;
      }
      
      // Quantity box
      doc.setDrawColor(200);
      doc.rect(160, y - 20, 30, 15);
      doc.setFontSize(8);
      doc.text('Quantidade:', 162, y - 16);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text(item.quantity, 175, y - 9, { align: 'center' });

      y += 10; // Spacing between items
    });

    // Digital Signature Placeholder
    if (prescription.digitalSignature) {
      y += 20;
      doc.setFillColor(240, 248, 255);
      doc.rect(20, y, 170, 20, 'F');
      doc.setTextColor(0, 100, 0);
      doc.setFontSize(10);
      doc.text('Documento assinado digitalmente.', 105, y + 12, { align: 'center' });
    }

    this.addFooter(doc, true);
    doc.save(`receita_${patient.name}_${prescription.date.replace(/\//g, '-')}.pdf`);
  }

  generateExamRequestPdf(patient: Patient, request: ExamRequest, ownerName: string) {
    const doc = new jsPDF();
    this.addHeader(doc, 'Solicitação de Exames');

    let y = 70;

    // Patient Info Compact
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Paciente: ${patient.name} (${patient.species}) | Tutor: ${ownerName}`, 20, y);
    doc.text(`Data: ${request.date}`, 160, y);
    y += 5;
    doc.setDrawColor(200);
    doc.line(20, y, 190, y);
    y += 15;

    // Clinical Indication
    if (request.clinicalIndication) {
      doc.setFontSize(12);
      doc.setTextColor(0);
      doc.setFont('helvetica', 'bold');
      doc.text('Suspeita Clínica / Motivo:', 20, y);
      y += 7;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(11);
      const splitIndication = doc.splitTextToSize(request.clinicalIndication, 170);
      doc.text(splitIndication, 20, y);
      y += (splitIndication.length * 6) + 10;
    }

    // Priority Badge
    if (request.priority === 'urgent') {
      doc.setFillColor(255, 235, 235);
      doc.rect(160, 65, 30, 10, 'F');
      doc.setTextColor(200, 0, 0);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('URGENTE', 175, 71, { align: 'center' });
    }

    // Items Header
    doc.setTextColor(0);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Exames Solicitados:', 20, y);
    y += 10;

    // Items List
    request.items.forEach((item, index) => {
      // Bullet point style
      doc.setDrawColor(100);
      doc.setFillColor(240, 240, 240);
      doc.rect(20, y - 5, 170, 15 + (item.instructions ? 10 : 0), 'F'); // Background box

      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text(`• ${item.name}`, 25, y);

      // Type Badge
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100);
      const typeLabel = item.type === 'laboratory' ? '[Laboratorial]' : 
                        item.type === 'imaging' ? '[Imagem]' : 
                        item.type === 'cardiology' ? '[Cardio]' : '[Outros]';
      doc.text(typeLabel, 180, y, { align: 'right' });

      if (item.instructions) {
        y += 6;
        doc.setFontSize(10);
        doc.setFont('helvetica', 'italic');
        doc.setTextColor(80);
        const notes = `Preparo: ${item.instructions}`;
        doc.text(notes, 30, y);
      }
      
      y += 15 + (item.instructions ? 5 : 0);
    });

    // Signature Area
    y = Math.max(y + 20, 240); // Push to bottom if space allows
    
    this.addFooter(doc, true);
    doc.save(`exames_${patient.name}_${request.date.replace(/\//g, '-')}.pdf`);
  }

  generateCertificatePdf(patient: Patient, ownerName: string, type: 'health' | 'surgery' | 'euthanasia' | 'travel', text?: string) {
    const doc = new jsPDF();
    const { teamMember } = this.getDocumentContext();
    
    let title = 'Atestado de Saúde';
    if (type === 'surgery') title = 'Termo de Consentimento Cirúrgico';
    if (type === 'euthanasia') title = 'Termo de Consentimento para Eutanásia';
    if (type === 'travel') title = 'Atestado para Viagem';

    this.addHeader(doc, title);

    let y = 70;
    const date = new Date().toLocaleDateString('pt-BR');

    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0);

    doc.text(`Eu, ${ownerName}, responsável pelo paciente ${patient.name}, declaro...`, 20, y);
    y += 10;
    
    if (text) {
      const splitCustom = doc.splitTextToSize(text, 170);
      doc.text(splitCustom, 20, y);
      y += (splitCustom.length * 7) + 10;
    } else {
      // Default text based on type
      let defaultText = '';
      if (type === 'health') defaultText = `Atesto para os devidos fins que o animal ${patient.name}, da espécie ${patient.species}, encontra-se em bom estado geral de saúde.`;
      if (type === 'surgery') defaultText = `Autorizo a realização do procedimento cirúrgico e anestésico no paciente ${patient.name}, estando ciente dos riscos inerentes.`;
      if (type === 'euthanasia') defaultText = `Autorizo a eutanásia do paciente ${patient.name} por motivos de saúde e bem-estar animal.`;
      if (type === 'travel') defaultText = `Atesto que o paciente ${patient.name} encontra-se apto para viajar, com vacinação em dia e sem sinais de doenças infectocontagiosas.`;
      
      const splitDefault = doc.splitTextToSize(defaultText, 170);
      doc.text(splitDefault, 20, y);
      y += (splitDefault.length * 7) + 10;
    }

    y += 40;
    doc.line(20, y, 90, y);
    doc.text(`${teamMember?.name || 'Medico Veterinario'}${teamMember?.crmv ? ` (${teamMember.crmv})` : ''}`, 20, y + 5);
    
    doc.line(110, y, 180, y);
    doc.text(`Tutor: ${ownerName}`, 110, y + 5);

    doc.setFontSize(10);
    doc.text(`Local e Data: Sorocaba, ${date}`, 20, y + 25);

    this.addFooter(doc);
    doc.save(`${title.toLowerCase().replace(/ /g, '_')}_${patient.name}.pdf`);
  }

  generateMedicalRecord(patient: Patient, attendance: Attendance, ownerName: string) {
    const doc = new jsPDF();
    
    this.addHeader(doc, 'Prontuário de Atendimento');

    let y = 70;

    // Patient Info
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Dados do Paciente', 20, y);
    y += 10;
    
    doc.setFont('helvetica', 'normal');
    doc.text(`Nome: ${patient.name}`, 20, y);
    doc.text(`Espécie: ${patient.species}`, 120, y);
    y += 8;
    doc.text(`Raça: ${patient.breed}`, 20, y);
    doc.text(`Sexo: ${patient.gender}`, 120, y);
    y += 8;
    doc.text(`Idade: ${patient.age} anos`, 20, y);
    doc.text(`Tutor: ${ownerName}`, 120, y);
    
    y += 15;
    doc.line(20, y, 190, y);
    y += 15;

    // Attendance Info
    doc.setFont('helvetica', 'bold');
    doc.text('Detalhes do Atendimento', 20, y);
    y += 10;

    doc.setFont('helvetica', 'normal');
    doc.text(`Data: ${attendance.date}`, 20, y);
    doc.text(`Motivo: ${attendance.reason}`, 120, y);
    y += 15;

    if (attendance.anamnesis) {
      doc.setFont('helvetica', 'bold');
      doc.text('Anamnese:', 20, y);
      y += 7;
      doc.setFont('helvetica', 'normal');
      const splitAnamnesis = doc.splitTextToSize(attendance.anamnesis, 170);
      doc.text(splitAnamnesis, 20, y);
      y += (splitAnamnesis.length * 7) + 5;
    }

    if (attendance.diagnosis) {
      doc.setFont('helvetica', 'bold');
      doc.text('Diagnóstico / Procedimentos:', 20, y);
      y += 7;
      doc.setFont('helvetica', 'normal');
      const splitDiagnosis = doc.splitTextToSize(attendance.diagnosis, 170);
      doc.text(splitDiagnosis, 20, y);
      y += (splitDiagnosis.length * 7) + 5;
    }

    // Prescriptions (if any)
    if (attendance.prescriptions && attendance.prescriptions.length > 0) {
      y += 10;
      doc.setFont('helvetica', 'bold');
      doc.text('Prescrições Emitidas:', 20, y);
      y += 7;
      
      attendance.prescriptions.forEach(p => {
         p.items.forEach(item => {
             doc.setFont('helvetica', 'normal');
             const line = `- ${item.name} ${item.concentration || ''} (${item.dosage}, ${item.frequency})`;
             const splitLine = doc.splitTextToSize(line, 170);
             doc.text(splitLine, 20, y);
             y += (splitLine.length * 7);
         });
      });
    }

    // Exam Requests (if any)
    if (attendance.examRequests && attendance.examRequests.length > 0) {
      y += 10;
      doc.setFont('helvetica', 'bold');
      doc.text('Exames Solicitados:', 20, y);
      y += 7;
      
      attendance.examRequests.forEach(req => {
         req.items.forEach(item => {
             doc.setFont('helvetica', 'normal');
             const line = `- ${item.name} (${item.type})`;
             const splitLine = doc.splitTextToSize(line, 170);
             doc.text(splitLine, 20, y);
             y += (splitLine.length * 7);
         });
      });
    }

    this.addFooter(doc);
    doc.save(`prontuario_${patient.name}_${attendance.date.replace(/\//g, '-')}.pdf`);
  }

  generateReceipt(receivable: Receivable) {
    const doc = new jsPDF();
    const { settings } = this.getDocumentContext();
    
    this.addHeader(doc, 'Recibo de Pagamento');

    let y = 70;

    doc.setFontSize(12);
    doc.text(`Recibo Nº: #${receivable.id.substr(0, 6).toUpperCase()}`, 20, y);
    y += 15;

    doc.setFontSize(14);
    doc.text(`Valor: R$ ${receivable.amount.toFixed(2)}`, 20, y);
    y += 15;

    doc.setFontSize(12);
    doc.text(`Recebemos de: ${receivable.ownerName}`, 20, y);
    y += 10;
    doc.text(`Referente a: ${receivable.description}`, 20, y);
    y += 10;
    doc.text(`Paciente: ${receivable.patientName}`, 20, y);
    y += 20;

    doc.text(`Data do Pagamento: ${new Date().toLocaleDateString(settings.regional.language || 'pt-BR')}`, 20, y);
    
    y += 40;
    doc.line(20, y, 100, y);
    doc.setFontSize(10);
    doc.text('Assinatura do Responsável', 20, y + 5);

    this.addFooter(doc);
    doc.save(`recibo_${receivable.id}.pdf`);
  }

  generateFiscalInvoice(data: {
    ownerName: string;
    patientName?: string;
    description: string;
    amount: number;
    city?: string;
    serviceCode?: string;
  }) {
    const doc = new jsPDF();
    const { settings } = this.getDocumentContext();
    const issueDate = new Date().toLocaleDateString(settings.regional.language || 'pt-BR');
    const invoiceNumber = String(settings.fiscal.nextInvoiceNumber || 1).padStart(6, '0');

    this.addHeader(doc, 'Nota Fiscal de Servico');

    let y = 70;
    doc.setFontSize(12);
    doc.text(`NFSe Nº: ${invoiceNumber}`, 20, y);
    doc.text(`Emissao: ${issueDate}`, 140, y);
    y += 12;
    doc.text(`Prestador: ${settings.clinic.legalName}`, 20, y);
    y += 8;
    doc.text(`CNPJ: ${settings.clinic.cnpj}`, 20, y);
    y += 8;
    doc.text(`Tomador: ${data.ownerName}`, 20, y);
    y += 8;
    if (data.patientName) {
      doc.text(`Paciente: ${data.patientName}`, 20, y);
      y += 8;
    }
    doc.text(`Servico: ${data.description}`, 20, y);
    y += 8;
    doc.text(`Codigo do servico: ${data.serviceCode || settings.fiscal.defaultServiceCode}`, 20, y);
    y += 8;
    doc.text(`Cidade integracao: ${data.city || settings.clinic.city}`, 20, y);
    y += 8;
    doc.text(`Ambiente API: ${settings.fiscal.environment}`, 20, y);
    y += 16;

    doc.setFontSize(16);
    doc.text(`Valor total: R$ ${Number(data.amount || 0).toFixed(2)}`, 20, y);
    y += 12;
    doc.setFontSize(10);
    doc.setTextColor(90);
    const fiscalNote = settings.fiscal.municipalApiUrl
      ? `Integracao configurada: ${settings.fiscal.municipalApiUrl}`
      : 'Integracao municipal pendente de credenciais. Documento emitido em modo interno.';
    doc.text(doc.splitTextToSize(fiscalNote, 170), 20, y);

    this.addFooter(doc, true);
    doc.save(`nfse_${invoiceNumber}.pdf`);
  }

  generatePaymentProof(data: {
    ownerName: string;
    patientName?: string;
    description: string;
    amount: number;
    method?: string;
    transactionId?: string;
  }) {
    const doc = new jsPDF();
    const { settings } = this.getDocumentContext();

    this.addHeader(doc, 'Comprovante de Pagamento');

    let y = 70;
    doc.setFontSize(12);
    doc.text(`Data: ${new Date().toLocaleDateString(settings.regional.language || 'pt-BR')}`, 20, y);
    y += 12;
    doc.text(`Recebido de: ${data.ownerName}`, 20, y);
    y += 8;
    if (data.patientName) {
      doc.text(`Paciente: ${data.patientName}`, 20, y);
      y += 8;
    }
    doc.text(`Descricao: ${data.description}`, 20, y);
    y += 8;
    doc.text(`Forma de pagamento: ${data.method || 'Nao informada'}`, 20, y);
    y += 8;
    doc.text(`Transacao: ${data.transactionId || 'Nao informada'}`, 20, y);
    y += 14;
    doc.setFontSize(16);
    doc.text(`Valor pago: R$ ${Number(data.amount || 0).toFixed(2)}`, 20, y);

    this.addFooter(doc, true);
    doc.save(`comprovante_pagamento_${Date.now()}.pdf`);
  }
}

export const pdfService = new PdfService();
