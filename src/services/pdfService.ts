import jsPDF from 'jspdf';
import { Patient, Attendance, Receivable, Owner } from '../domain/types';

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

  private addFooter(doc: jsPDF) {
    const pageHeight = doc.internal.pageSize.height;
    doc.setFontSize(10);
    doc.setTextColor(150);
    doc.text('Gerado por Vet Tooth System', 105, pageHeight - 10, { align: 'center' });
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

    // Prescription (if any)
    if (attendance.prescription) {
      y += 10;
      doc.setFont('helvetica', 'bold');
      doc.text('Prescrição:', 20, y);
      y += 7;
      doc.setFont('helvetica', 'normal');
      const splitPrescription = doc.splitTextToSize(attendance.prescription, 170);
      doc.text(splitPrescription, 20, y);
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
