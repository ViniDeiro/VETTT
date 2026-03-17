import jsPDF from 'jspdf';
import { Patient, Attendance, Receivable, Owner, Prescription, ExamRequest } from '../domain/types';

class PdfService {
  private addHeader(doc: jsPDF, title: string) {
    // Clinic Logo/Header
    doc.setFillColor(11, 44, 77); // #0B2C4D
    doc.rect(0, 0, 210, 40, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.text('Vet Tooth', 20, 25);
    
    doc.setFontSize(12);
    doc.text('Odontologia Veterinária Especializada', 20, 32);
    
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(18);
    doc.text(title, 105, 55, { align: 'center' });
  }

  private addFooter(doc: jsPDF, signature: boolean = false) {
    const pageHeight = doc.internal.pageSize.height;
    
    if (signature) {
      doc.line(70, pageHeight - 40, 140, pageHeight - 40);
      doc.setFontSize(10);
      doc.setTextColor(50);
      doc.text('Assinatura Digital do Veterinário', 105, pageHeight - 35, { align: 'center' });
      doc.setFontSize(8);
      doc.text('Token: 8f7d9a8s7d98a7s9d87a9s8d7a9s8d7', 105, pageHeight - 30, { align: 'center' });
    }

    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text('Gerado por Vet Tooth System', 105, pageHeight - 10, { align: 'center' });
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

    let body = '';

    if (text) {
        body = text;
    } else {
        // Default Templates
        if (type === 'health') {
            body = `Atesto para os devidos fins que examinei nesta data o animal ${patient.species} de nome "${patient.name}", raça ${patient.breed}, sexo ${patient.gender}, idade ${patient.age} anos, pelagem ${patient.coat || 'não informada'}, de propriedade do Sr(a). ${ownerName}, encontrando-o clinicamente SAUDÁVEL, apto a conviver com outros animais e humanos, não apresentando sinais de doenças infectocontagiosas ou parasitárias no momento do exame.`;
        } else if (type === 'surgery') {
            body = `Eu, ${ownerName}, proprietário/responsável pelo animal "${patient.name}", autorizo a realização do procedimento cirúrgico/anestésico indicado pela equipe veterinária. Fui informado(a) sobre os riscos inerentes ao procedimento e à anestesia, bem como sobre os cuidados pós-operatórios necessários.`;
        } else if (type === 'euthanasia') {
            body = `Eu, ${ownerName}, proprietário/responsável pelo animal "${patient.name}", solicito e autorizo a realização do procedimento de eutanásia, estando ciente de que é um ato irreversível, realizado por razões humanitárias para aliviar o sofrimento do animal, conforme avaliado e indicado pelo Médico Veterinário.`;
        }
    }

    const splitBody = doc.splitTextToSize(body, 170);
    doc.text(splitBody, 20, y);
    
    y += (splitBody.length * 8) + 30;

    // Signatures
    doc.line(20, y, 90, y);
    doc.text('Médico Veterinário', 20, y + 5);
    
    doc.line(110, y, 180, y);
    doc.text('Responsável / Tutor', 110, y + 5);

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

    doc.text(`Data do Pagamento: ${new Date().toLocaleDateString('pt-BR')}`, 20, y);
    
    y += 40;
    doc.line(20, y, 100, y);
    doc.setFontSize(10);
    doc.text('Assinatura do Responsável', 20, y + 5);

    this.addFooter(doc);
    doc.save(`recibo_${receivable.id}.pdf`);
  }
}

export const pdfService = new PdfService();
