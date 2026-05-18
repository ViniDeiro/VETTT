import jsPDF from 'jspdf';
import { Patient, Attendance, Receivable, Owner, Prescription, ExamRequest, GeneralSettings } from '../domain/types';
import { mockDB } from './mockDatabase';

class PdfService {
  private readonly examRequestCatalog: Array<{ title: string; items: string[] }> = [
    {
      title: 'Histopatologia',
      items: [
        'Biopsia fragmento',
        'Biopsia + margens cirurgicas',
        'Histopatologico de necropsia',
        'Necropsia - macroscopia',
        'Necropsia + histopatologico',
        'Necropsia cosmetica'
      ]
    },
    {
      title: 'Microbiologia',
      items: [
        'Cultura + antibiograma',
        'Cultura fungica',
        'Coprocultura + antibiograma',
        'Hemocultura',
        'Tricograma'
      ]
    },
    {
      title: 'Citologia',
      items: [
        'Citologia tecidos solidos',
        'Citologia efusoes/fluidos/lavado traqueal',
        'Citologia dermatologica',
        'Citologia otologica',
        'Citologia vaginal',
        'Citologia vaginal seriada',
        'Citologia de medula ossea'
      ]
    },
    {
      title: 'Urinalise',
      items: [
        'Urinalise completo',
        'Densidade urinaria',
        'Sedimentoscopia',
        'Exame fisico-quimico',
        'Qualificacao de calculos'
      ]
    },
    {
      title: 'Parasitologia',
      items: [
        'Coproparasitologico completo',
        'Coproparasitologico seriado',
        'Pesquisa de ovos em lavado traqueal e emeses',
        'Pesquisa de sangue oculto nas fezes',
        'Pesquisa de ectoparasitas',
        'Pesquisa de microfilarias',
        'Pesquisa de cryptosporidium e giardia',
        'OPG',
        'Pesquisa de fungos em raspado de pele',
        'Identificacao de helmintos'
      ]
    },
    {
      title: 'Hematologia',
      items: [
        'Hemograma completo',
        'Leucograma',
        'Eritrograma',
        'Contagem de eritrocitos',
        'Contagem de leucocitos',
        'Exame diferencial de leucocitos',
        'Contagem de plaquetas',
        'Contagem de reticulocitos',
        'Hematocrito',
        'Hemoglobina',
        'Proteina total plasmatica',
        'Fibrinogenio',
        'Velocidade de hemosedimentacao',
        'Tempo de coagulacao',
        'Pesquisa de hemoparasitas'
      ]
    },
    {
      title: 'Perfis',
      items: [
        'Perfil rotina',
        'Perfil hematologico',
        'Perfil renal I',
        'Perfil renal II',
        'Perfil hepatico I',
        'Perfil hepatico II',
        'Perfil triagem',
        'Perfil cirurgia',
        'Perfil oncologico'
      ]
    },
    {
      title: 'Bioquimica',
      items: [
        'Acido urico',
        'Albumina',
        'ALT/TGP',
        'Amilase',
        'AST/TGO',
        'Bilirrubina total e fracoes',
        'CK',
        'Calcio',
        'Colesterol total',
        'Creatinina',
        'Ferro',
        'Fosfatase alcalina',
        'Fosforo',
        'GGT',
        'Glicose',
        'Globulina',
        'LDH',
        'Lipase',
        'Potassio',
        'Proteina total',
        'Sodio',
        'Triglicerides',
        'Ureia'
      ]
    },
    {
      title: 'Imagens',
      items: [
        'Eletrocardiograma',
        'Ecocardiograma',
        'Raio-X',
        'Tomografia',
        'Ressonancia Magnetica'
      ]
    }
  ];

  private formatClinicAddress(settings: GeneralSettings) {
    const clinic = settings.clinic;
    return [
      clinic.address,
      clinic.number ? `nº ${clinic.number}` : null,
      clinic.complement || null,
      clinic.neighborhood || null,
      clinic.city ? `${clinic.city}/${clinic.state}` : clinic.state || null,
      clinic.zipCode ? `CEP: ${clinic.zipCode}` : null
    ].filter(Boolean).join(', ');
  }

  private formatOwnerAddress(owner?: Owner | null) {
    if (!owner) return '';
    return [
      owner.street || owner.address,
      owner.number || null,
      owner.neighborhood || null,
      owner.city ? `${owner.city}/${owner.state || ''}`.trim() : owner.state || null,
      owner.zipCode ? `CEP: ${owner.zipCode}` : null
    ].filter(Boolean).join(', ');
  }

  private formatSpeciesLabel(species: string) {
    const labels: Record<string, string> = {
      Equine: 'Equino',
      Bovine: 'Bovino',
      Canine: 'Canino',
      Feline: 'Felino',
      Other: 'Outro'
    };

    return labels[species] || species;
  }

  private resolveOwner(patient: Patient, ownerNameFallback?: string) {
    const owner = mockDB.getOwners().find(item => item.id === patient.ownerId) || null;
    return {
      owner,
      ownerName: owner?.name || ownerNameFallback || patient.ownerName || 'Tutor não informado'
    };
  }

  private normalizeText(value?: string) {
    return (value || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^\w\s/+.-]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  private addPatientOwnerBlock(doc: jsPDF, patient: Patient, ownerNameFallback?: string, startY: number = 70) {
    const { owner, ownerName } = this.resolveOwner(patient, ownerNameFallback);
    const ownerAddress = this.formatOwnerAddress(owner);
    const ageLabel = patient.age ? `${patient.age} anos` : 'Não informado';
    const weightLabel = patient.weight ? `${patient.weight} kg` : 'Não informado';

    doc.setFontSize(11);
    doc.setTextColor(60);
    this.setPdfFont(doc, 'bold');
    doc.text('Dados do Paciente', 20, startY);
    this.setPdfFont(doc, 'normal');
    doc.setFontSize(10);

    const line1 = `Nome: ${patient.name} | Espécie: ${this.formatSpeciesLabel(patient.species)} | Raça: ${patient.breed || 'Não informado'}`;
    const line2 = `Sexo: ${patient.gender || 'Não informado'} | Idade: ${ageLabel} | Peso: ${weightLabel}`;
    const line3 = `Tutor: ${ownerName}`;
    const line4 = ownerAddress ? `Endereço do tutor: ${ownerAddress}` : '';

    doc.text(line1, 20, startY + 6);
    doc.text(line2, 20, startY + 12);
    doc.text(line3, 20, startY + 18);
    if (line4) {
      const splitOwnerAddress = doc.splitTextToSize(line4, 170);
      doc.text(splitOwnerAddress, 20, startY + 24);
      doc.setDrawColor(200);
      doc.line(20, startY + 24 + (splitOwnerAddress.length * 5), 190, startY + 24 + (splitOwnerAddress.length * 5));
      return startY + 24 + (splitOwnerAddress.length * 5) + 8;
    }

    doc.setDrawColor(200);
    doc.line(20, startY + 24, 190, startY + 24);
    return startY + 32;
  }

  private getPdfFontFamily() {
    const selectedFont = (mockDB.getSettings().documents.fontFamily || 'helvetica').toLowerCase();

    const fontAliases: Record<string, string> = {
      helvetica: 'helvetica',
      arial: 'helvetica',
      verdana: 'helvetica',
      tahoma: 'helvetica',
      'trebuchet-ms': 'helvetica',
      times: 'times',
      'times-new-roman': 'times',
      georgia: 'times',
      courier: 'courier',
      'courier-new': 'courier'
    };

    return fontAliases[selectedFont] || 'helvetica';
  }

  private setPdfFont(doc: jsPDF, style: 'normal' | 'bold' | 'italic' | 'bolditalic' = 'normal') {
    doc.setFont(this.getPdfFontFamily(), style);
  }

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

  private getDocumentLogo(settings: GeneralSettings) {
    return settings.clinic.documentLogo || settings.clinic.logo || null;
  }

  private getImageFormat(imageSource: string) {
    const lowerSource = imageSource.toLowerCase();

    if (lowerSource.startsWith('data:image/jpeg') || lowerSource.startsWith('data:image/jpg') || lowerSource.endsWith('.jpg') || lowerSource.endsWith('.jpeg')) {
      return 'JPEG';
    }

    if (lowerSource.startsWith('data:image/webp') || lowerSource.endsWith('.webp')) {
      return 'WEBP';
    }

    return 'PNG';
  }

  private addImageSafely(doc: jsPDF, imageSource: string, x: number, y: number, width: number, height: number) {
    try {
      doc.addImage(imageSource, this.getImageFormat(imageSource), x, y, width, height, undefined, 'FAST');
    } catch (e) {
      console.error('Error adding logo to PDF', e);
    }
  }

  private addHeader(doc: jsPDF, title: string) {
    const { settings, primary } = this.getDocumentContext();
    const model = settings.documents.selectedModel || 'classic';
    const logoUrl = this.getDocumentLogo(settings);
    const logoPos = settings.documents.logoPosition || 'left';

    if (model === 'minimal') {
      // Minimal Model: Clean top with colored bar below
      if (logoUrl) {
          const xPos = logoPos === 'left' ? 20 : logoPos === 'right' ? 160 : 90;
          this.addImageSafely(doc, logoUrl, xPos, 15, 30, 30);
      }

      doc.setFillColor(primary.r, primary.g, primary.b);
      doc.rect(20, 50, 170, 1, 'F'); // Thin decorative line

      doc.setTextColor(primary.r, primary.g, primary.b);
      doc.setFontSize(18);
      this.setPdfFont(doc, 'bold');
      doc.text(settings.clinic.fantasyName || 'Vet Tooth', logoPos === 'center' ? 105 : 20, logoUrl ? 58 : 30, { align: logoPos === 'center' ? 'center' : 'left' });
      
      doc.setFontSize(10);
      this.setPdfFont(doc, 'normal');
      doc.text(settings.documents.header || settings.clinic.legalName || '', logoPos === 'center' ? 105 : 20, logoUrl ? 63 : 35, { align: logoPos === 'center' ? 'center' : 'left' });

      doc.setTextColor(0, 0, 0);
      doc.setFontSize(16);
      doc.text(title, 105, 80, { align: 'center' });
    } else if (model === 'premium') {
      // Premium Model: Elegant centered layout with soft background
      doc.setFillColor(primary.r, primary.g, primary.b);
      doc.rect(0, 0, 210, 8, 'F'); // Top colored strip

      if (logoUrl) {
          this.addImageSafely(doc, logoUrl, 90, 15, 30, 30);
      }

      doc.setTextColor(50, 50, 50);
      doc.setFontSize(24);
      this.setPdfFont(doc, 'bold');
      doc.text(settings.clinic.fantasyName || 'Vet Tooth', 105, logoUrl ? 55 : 30, { align: 'center' });
      
      doc.setFontSize(11);
      this.setPdfFont(doc, 'italic');
      doc.text(settings.documents.header || settings.clinic.legalName || '', 105, logoUrl ? 62 : 37, { align: 'center' });

      doc.setDrawColor(primary.r, primary.g, primary.b);
      doc.setLineWidth(0.5);
      doc.line(60, logoUrl ? 68 : 42, 150, logoUrl ? 68 : 42);

      doc.setTextColor(primary.r, primary.g, primary.b);
      doc.setFontSize(18);
      this.setPdfFont(doc, 'bold');
      doc.text(title.toUpperCase(), 105, 85, { align: 'center' });
    } else {
      // Classic Model: (Current) Solid header
      doc.setFillColor(primary.r, primary.g, primary.b);
      doc.rect(0, 0, 210, 40, 'F');
      
      if (logoUrl) {
          const xPos = logoPos === 'left' ? 15 : logoPos === 'right' ? 165 : 90;
          this.addImageSafely(doc, logoUrl, xPos, 5, 30, 30);
      }

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(22);
      this.setPdfFont(doc, 'bold');
      
      const textX = logoPos === 'left' && logoUrl ? 50 : 20;
      doc.text(settings.clinic.fantasyName || 'Vet Tooth', textX, 25);
      
      doc.setFontSize(12);
      this.setPdfFont(doc, 'normal');
      doc.text(settings.documents.header || settings.clinic.legalName || 'Odontologia Veterinaria Especializada', textX, 32);
      
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(18);
      this.setPdfFont(doc, 'bold');
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
      const signatureValue = settings.documents.showSignature ? (teamMember?.signature || '') : '';
      const hasSignatureImage = Boolean(signatureValue) && (
        signatureValue.startsWith('data:image/') ||
        /\.(png|jpe?g|webp)$/i.test(signatureValue)
      );

      if (hasSignatureImage) {
        this.addImageSafely(doc, signatureValue, 78, pageHeight - 47, 54, 14);
      } else {
        doc.setFontSize(10);
        doc.setTextColor(50);
        const signatureLabel = settings.documents.showSignature
          ? (signatureValue || 'Assinatura digital do veterinario')
          : 'Documento emitido sem assinatura digital';
        doc.text(signatureLabel, 105, pageHeight - 35, { align: 'center' });
      }

      doc.setFontSize(8);
      const credentialLine = [
        teamMember?.name,
        settings.documents.autoCrmv ? teamMember?.crmv : null,
        settings.documents.autoCnpj ? (settings.clinic.cnpj || settings.clinic.cpf) : null
      ].filter(Boolean).join(' | ');
      doc.text(credentialLine || 'Responsavel tecnico', 105, pageHeight - 30, { align: 'center' });
    }

    doc.setFontSize(8);
    doc.setTextColor(150);
    const line1 = settings.documents.footer || 'Gerado por Vet Tooth System';
    const line2 = [
      settings.documents.showAddress ? this.formatClinicAddress(settings) : null,
      settings.clinic.phone || null
    ].filter(Boolean).join(' | ');
    const clinicDocument = settings.clinic.cnpj || settings.clinic.cpf;
    const line3 = [
      settings.fiscal.includeCnpjOnAllDocuments || settings.documents.autoCnpj
        ? `${settings.clinic.cnpj ? 'CNPJ' : 'CPF'}: ${clinicDocument || ''}`
        : null,
      settings.clinic.socialMedia || null
    ].filter(Boolean).join(' | ');

    doc.text(line1, 105, pageHeight - 18, { align: 'center' });
    if (line2) doc.text(line2, 105, pageHeight - 13, { align: 'center' });
    if (line3) doc.text(line3, 105, pageHeight - 8, { align: 'center' });
  }

  generatePrescriptionPdf(patient: Patient, prescription: Prescription, ownerName: string) {
    const doc = new jsPDF();
    const renderPrescriptionPage = (copyLabel?: string) => {
      const { settings, currentUser, teamMember } = this.getDocumentContext();
      this.addHeader(doc, 'Receituário Médico Veterinário');

      let y = this.addPatientOwnerBlock(doc, patient, ownerName, 70);
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(`Data: ${prescription.date}`, 160, y - 4);

      if (copyLabel) {
        doc.setTextColor(160, 80, 0);
        this.setPdfFont(doc, 'bold');
        doc.text(copyLabel, 20, y - 4);
      }

      doc.setTextColor(0);
      prescription.items.forEach((item, index) => {
        doc.setFontSize(12);
        this.setPdfFont(doc, 'bold');
        const title = `${index + 1}. ${item.name} ${item.concentration ? item.concentration : ''}`;
        doc.text(title, 20, y);

        doc.setFontSize(9);
        this.setPdfFont(doc, 'normal');
        doc.setTextColor(100);
        const typeLabel = item.type === 'industrialized' ? '[Industrializado]' : '[Manipulado]';
        doc.text(typeLabel, 160, y, { align: 'right' });

        y += 6;
        doc.setTextColor(50);
        doc.setFontSize(11);
        doc.text(`Uso: ${item.route || 'Oral'} - ${item.dosage}`, 25, y);
        y += 6;
        doc.text(`Frequência: ${item.frequency}`, 25, y);
        y += 6;
        doc.text(`Duração: ${item.duration}`, 25, y);
        y += 6;

        if (item.instructions) {
          doc.setFontSize(10);
          this.setPdfFont(doc, 'italic');
          const splitNotes = doc.splitTextToSize(`Obs: ${item.instructions}`, 160);
          doc.text(splitNotes, 25, y);
          y += (splitNotes.length * 5) + 2;
        }

        doc.setDrawColor(200);
        doc.rect(160, y - 20, 30, 15);
        doc.setFontSize(8);
        doc.text('Quantidade:', 162, y - 16);
        doc.setFontSize(10);
        this.setPdfFont(doc, 'bold');
        doc.text(item.quantity, 175, y - 9, { align: 'center' });
        y += 10;
      });

      const professionalName = teamMember?.name || currentUser?.fullName || currentUser?.name || settings.clinic.legalName;
      const professionalCredential = teamMember?.crmv ? `CRMV: ${teamMember.crmv}` : '';
      const professionalAddress = this.formatClinicAddress(settings);

      doc.setTextColor(80);
      doc.setFontSize(9);
      this.setPdfFont(doc, 'normal');
      const professionalLine = [
        professionalName,
        professionalCredential
      ].filter(Boolean).join(' | ');
      doc.text(professionalLine, 20, 250);
      if (professionalAddress) {
        const splitAddress = doc.splitTextToSize(`Endereço profissional: ${professionalAddress}`, 170);
        doc.text(splitAddress, 20, 255);
      }

      if (prescription.digitalSignature) {
        doc.setFillColor(240, 248, 255);
        doc.rect(20, 262, 170, 14, 'F');
        doc.setTextColor(0, 100, 0);
        doc.setFontSize(10);
        doc.text('Documento assinado digitalmente.', 105, 271, { align: 'center' });
      }

      this.addFooter(doc, true);
    };

    renderPrescriptionPage(prescription.controlledMedication ? '1ª via - Farmácia' : undefined);
    if (prescription.controlledMedication) {
      doc.addPage();
      renderPrescriptionPage('2ª via - Tutor');
    }

    doc.save(`receita_${patient.name}_${prescription.date.replace(/\//g, '-')}.pdf`);
  }

  generateExamRequestPdf(patient: Patient, request: ExamRequest, ownerName: string) {
    const doc = new jsPDF();
    this.addHeader(doc, 'Solicitação de Exames');

    let y = this.addPatientOwnerBlock(doc, patient, ownerName, 70);
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Data: ${request.date}`, 160, y - 4);

    const { teamMember } = this.getDocumentContext();
    const vetName = teamMember?.name || 'Médico veterinário não informado';
    doc.setFontSize(10);
    doc.setTextColor(80);
    doc.text(`Méd. veterinário requisitante: ${vetName}`, 20, y);
    y += 8;

    // Clinical Indication
    if (request.clinicalIndication) {
      doc.setFontSize(12);
      doc.setTextColor(0);
      this.setPdfFont(doc, 'bold');
      doc.text('Suspeita Clínica / Motivo:', 20, y);
      y += 7;
      this.setPdfFont(doc, 'normal');
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
      this.setPdfFont(doc, 'bold');
      doc.text('URGENTE', 175, 71, { align: 'center' });
    }

    const selectedExamSet = new Set(request.items.map(item => this.normalizeText(item.name)));
    const catalogNameSet = new Set(
      this.examRequestCatalog.flatMap(section => section.items.map(item => this.normalizeText(item)))
    );

    for (const section of this.examRequestCatalog) {
      if (y > 260) {
        doc.addPage();
        this.addHeader(doc, 'Solicitação de Exames (continuação)');
        y = 70;
      }

      this.setPdfFont(doc, 'bold');
      doc.setFontSize(11);
      doc.setTextColor(0);
      doc.text(section.title.toUpperCase(), 20, y);
      y += 6;

      this.setPdfFont(doc, 'normal');
      doc.setFontSize(10);
      for (const sectionItem of section.items) {
        if (y > 275) {
          doc.addPage();
          this.addHeader(doc, 'Solicitação de Exames (continuação)');
          y = 70;
          this.setPdfFont(doc, 'bold');
          doc.setFontSize(11);
          doc.text(section.title.toUpperCase(), 20, y);
          y += 6;
          this.setPdfFont(doc, 'normal');
          doc.setFontSize(10);
        }

        const marker = selectedExamSet.has(this.normalizeText(sectionItem)) ? '☑' : '☐';
        const itemLine = `${marker} ${sectionItem}`;
        const splitItem = doc.splitTextToSize(itemLine, 170);
        doc.text(splitItem, 24, y);
        y += (splitItem.length * 4.6);
      }

      y += 4;
    }

    const otherRequested = request.items
      .filter(item => !catalogNameSet.has(this.normalizeText(item.name)))
      .map(item => item.instructions ? `${item.name} (Obs: ${item.instructions})` : item.name);

    if (otherRequested.length > 0) {
      if (y > 255) {
        doc.addPage();
        this.addHeader(doc, 'Solicitação de Exames (continuação)');
        y = 70;
      }
      this.setPdfFont(doc, 'bold');
      doc.setFontSize(11);
      doc.text('OUTROS EXAMES SOLICITADOS', 20, y);
      y += 6;
      this.setPdfFont(doc, 'normal');
      doc.setFontSize(10);
      const splitOther = doc.splitTextToSize(otherRequested.join(' | '), 170);
      doc.text(splitOther, 24, y);
      y += (splitOther.length * 5) + 4;
    }

    if (y > 265) {
      doc.addPage();
      this.addHeader(doc, 'Solicitação de Exames (continuação)');
      y = 70;
    }
    this.setPdfFont(doc, 'normal');
    doc.setFontSize(10);
    doc.setTextColor(60);
    doc.text('Assinatura do Méd. Vet. Requisitante: _______________________________________', 20, y + 8);
    
    this.addFooter(doc, true);
    doc.save(`exames_${patient.name}_${request.date.replace(/\//g, '-')}.pdf`);
  }

  generateCertificatePdf(
    patient: Patient,
    ownerName: string,
    type: 'health' | 'surgery' | 'euthanasia' | 'travel',
    text?: string,
    titleOverride?: string
  ) {
    const doc = new jsPDF();
    const { teamMember } = this.getDocumentContext();
    
    let title = 'Atestado de Saúde';
    if (type === 'surgery') title = 'Termo de Consentimento Cirúrgico';
    if (type === 'euthanasia') title = 'Termo de Consentimento para Eutanásia';
    if (type === 'travel') title = 'Atestado para Viagem';
    if (titleOverride) title = titleOverride;

    this.addHeader(doc, title);

    let y = 70;
    const date = new Date().toLocaleDateString('pt-BR');

    doc.setFontSize(12);
    this.setPdfFont(doc, 'normal');
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
    this.setPdfFont(doc, 'bold');
    doc.text('Dados do Paciente', 20, y);
    y += 10;
    
    this.setPdfFont(doc, 'normal');
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
    this.setPdfFont(doc, 'bold');
    doc.text('Detalhes do Atendimento', 20, y);
    y += 10;

    this.setPdfFont(doc, 'normal');
    doc.text(`Data: ${attendance.date}`, 20, y);
    doc.text(`Motivo: ${attendance.reason}`, 120, y);
    y += 15;

    if (attendance.anamnesis) {
      this.setPdfFont(doc, 'bold');
      doc.text('Anamnese:', 20, y);
      y += 7;
      this.setPdfFont(doc, 'normal');
      const splitAnamnesis = doc.splitTextToSize(attendance.anamnesis, 170);
      doc.text(splitAnamnesis, 20, y);
      y += (splitAnamnesis.length * 7) + 5;
    }

    if (attendance.diagnosis) {
      this.setPdfFont(doc, 'bold');
      doc.text('Diagnóstico / Procedimentos:', 20, y);
      y += 7;
      this.setPdfFont(doc, 'normal');
      const splitDiagnosis = doc.splitTextToSize(attendance.diagnosis, 170);
      doc.text(splitDiagnosis, 20, y);
      y += (splitDiagnosis.length * 7) + 5;
    }

    // Prescriptions (if any)
    if (attendance.prescriptions && attendance.prescriptions.length > 0) {
      y += 10;
      this.setPdfFont(doc, 'bold');
      doc.text('Prescrições Emitidas:', 20, y);
      y += 7;
      
      attendance.prescriptions.forEach(p => {
         p.items.forEach(item => {
             this.setPdfFont(doc, 'normal');
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
      this.setPdfFont(doc, 'bold');
      doc.text('Exames Solicitados:', 20, y);
      y += 7;
      
      attendance.examRequests.forEach(req => {
         req.items.forEach(item => {
             this.setPdfFont(doc, 'normal');
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
