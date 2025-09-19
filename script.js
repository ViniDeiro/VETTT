// Variáveis globais
let currentColor = '#FF4757';
let isEraserMode = false;
let paintedElements = new Map();
let currentTab = 'arcada-sup';

// Mapeamento de abas para arquivos SVG
const svgFiles = {
    'esquerda': 'src/assets/Esquerda/arcada lateral completa esq. sup.svg',
    'centro': 'src/assets/Esquerda/dentes superiores do fundo - esquerda.svg', 
    'direita': 'src/assets/Esquerda/arcada lateral completa inf. esq.svg'
};

// Mapeamento adicional para compatibilidade com nomes antigos
const svgAliases = {
    'arcada-sup': 'src/assets/Esquerda/arcada lateral completa esq. sup.svg',
    'arcada-inf': 'src/assets/Esquerda/arcada lateral completa inf. esq.svg',
    'dentes-inf': 'src/assets/Esquerda/dentes inf. do fundo - esquerda.svg'
};

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    setupColorPalette();
    setupTools();
    setupTabs();
    setupModal();
    setupBottomNavigation();
    loadSVG('esquerda');
    setupDateField();
    loadData();
}

function setupDateField() {
    const dateField = document.getElementById('exam-date');
    if (dateField) {
        const today = new Date().toISOString().split('T')[0];
        dateField.value = today;
    }
}

function setupColorPalette() {
    const colorOptions = document.querySelectorAll('.color-option');
    
    colorOptions.forEach(option => {
        option.addEventListener('click', function() {
            // Remove seleção anterior
            colorOptions.forEach(opt => opt.classList.remove('selected'));
            
            // Adiciona seleção atual
            this.classList.add('selected');
            
            // Atualiza cor atual
            currentColor = this.dataset.color;
            updateCurrentColorDisplay();
            
            // Desativa modo borracha
            isEraserMode = false;
            document.body.classList.remove('eraser-mode');
            
            console.log('Cor selecionada:', currentColor);
        });
    });
    
    // Seleciona primeira cor por padrão
    if (colorOptions.length > 0) {
        colorOptions[0].click();
    }
}

function updateCurrentColorDisplay() {
    const currentColorDisplay = document.getElementById('current-color');
    if (currentColorDisplay) {
        currentColorDisplay.style.backgroundColor = currentColor;
    }
}

function setupTools() {
    // Botão borracha
    const eraserBtn = document.getElementById('eraser-btn');
    if (eraserBtn) {
        eraserBtn.addEventListener('click', function() {
            isEraserMode = !isEraserMode;
            document.body.classList.toggle('eraser-mode', isEraserMode);
            
            // Remove seleção de cores quando ativa borracha
            if (isEraserMode) {
                document.querySelectorAll('.color-option').forEach(opt => 
                    opt.classList.remove('selected')
                );
                this.style.background = '#FF3B30';
                this.style.color = 'white';
            } else {
                this.style.background = '';
                this.style.color = '';
            }
            
            console.log('Modo borracha:', isEraserMode);
        });
    }
    
    // Botão limpar tudo
    const clearBtn = document.getElementById('clear-btn');
    if (clearBtn) {
        clearBtn.addEventListener('click', function() {
            if (confirm('Tem certeza que deseja limpar todas as pinturas?')) {
                clearAllPaintings();
            }
        });
    }
    
    // Botão salvar
    const saveBtn = document.getElementById('save-btn');
    if (saveBtn) {
        saveBtn.addEventListener('click', function() {
            showPatientModal();
        });
    }
    
    // Botão PDF
    const pdfBtn = document.getElementById('pdf-btn');
    if (pdfBtn) {
        pdfBtn.addEventListener('click', function() {
            showPatientModal();
        });
    }
}

function setupTabs() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove classe ativa de todos os botões
            tabButtons.forEach(btn => btn.classList.remove('active'));
            
            // Adiciona classe ativa ao botão clicado
            this.classList.add('active');
            
            // Carrega SVG correspondente
            const tabName = this.dataset.tab;
            currentTab = tabName;
            loadSVG(tabName);
            
            console.log('Aba selecionada:', tabName);
        });
    });
    
    // Carregar SVG inicial
    loadSVG('arcada-sup');
}

function setupModal() {
    const modal = document.getElementById('patient-modal');
    const closeBtn = modal?.querySelector('.close-btn');
    const saveBtn = modal?.querySelector('.btn-save');
    
    if (closeBtn) {
        closeBtn.addEventListener('click', hidePatientModal);
    }
    
    if (saveBtn) {
        saveBtn.addEventListener('click', function() {
            saveData();
            generatePDF();
            hidePatientModal();
        });
    }
    
    // Fechar modal clicando fora
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                hidePatientModal();
            }
        });
    }
}

function setupBottomNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    
    navItems.forEach(item => {
        item.addEventListener('click', function() {
            // Remove classe ativa de todos os itens
            navItems.forEach(nav => nav.classList.remove('active'));
            
            // Adiciona classe ativa ao item clicado
            this.classList.add('active');
            
            // Aqui você pode adicionar lógica para navegar entre diferentes seções
            const label = this.querySelector('.nav-label').textContent;
            console.log('Navegação:', label);
            
            // Se for "Pacientes", mostra o modal
            if (label === 'Pacientes') {
                showPatientModal();
            }
        });
    });
}

function showPatientModal() {
    const modal = document.getElementById('patient-modal');
    if (modal) {
        modal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    }
}

function hidePatientModal() {
    const modal = document.getElementById('patient-modal');
    if (modal) {
        modal.classList.add('hidden');
        document.body.style.overflow = '';
    }
}

function loadSVG(tabName) {
    const svgDisplay = document.getElementById('svg-display');
    let svgPath = svgFiles[tabName] || svgAliases[tabName];
    
    if (!svgPath) {
        console.error('Arquivo SVG não encontrado para a aba:', tabName);
        svgDisplay.innerHTML = '<p class="loading">Arquivo não encontrado</p>';
        return;
    }
    
    console.log('Carregando SVG:', svgPath);
    svgDisplay.innerHTML = '<p class="loading">Carregando...</p>';
    
    fetch(svgPath)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.text();
        })
        .then(svgContent => {
            svgDisplay.innerHTML = svgContent;
            setupSVGInteraction();
            restorePaintings(tabName);
            console.log('SVG carregado com sucesso');
        })
        .catch(error => {
            console.error('Erro ao carregar SVG:', error);
            svgDisplay.innerHTML = `<p class="loading">Erro ao carregar o diagrama: ${error.message}</p>`;
        });
}

function setupSVGInteraction() {
    const svg = document.querySelector('#svg-display svg');
    if (!svg) return;

    // Buscar todos os elementos que podem ser pintados
    const paintableSelectors = ['path', 'rect', 'circle', 'ellipse', 'polygon', 'polyline'];
    
    let paintableCount = 0;
    
    paintableSelectors.forEach(selector => {
        const elements = svg.querySelectorAll(selector);
        elements.forEach(element => {
            // Verificar se o elemento é visível e pintável
            const fill = element.getAttribute('fill');
            const stroke = element.getAttribute('stroke');
            
            // Incluir elementos com qualquer fill ou stroke
            if (fill !== 'none' || stroke) {
                makePaintable(element);
                paintableCount++;
            }
        });
    });
    
    console.log(`${paintableCount} elementos pintáveis detectados`);
}

function makePaintable(element) {
    element.classList.add('paintable');
    
    // Garantir que toda a área seja clicável
    element.style.pointerEvents = 'all';
    element.style.fillRule = 'evenodd';
    
    // Para elementos sem fill, adicionar um fill quase transparente
    if (!element.getAttribute('fill') || element.getAttribute('fill') === 'none') {
        element.setAttribute('fill', 'rgba(0,0,0,0.01)');
    }
    
    // Salvar cor original
    if (!element.dataset.originalFill) {
        element.dataset.originalFill = element.getAttribute('fill') || '#D9D9D9';
    }
    
    if (!element.dataset.originalStroke) {
        element.dataset.originalStroke = element.getAttribute('stroke') || '';
    }

    element.addEventListener('click', (e) => {
        e.stopPropagation();
        paintElement(element);
    });

    element.addEventListener('mouseenter', () => {
        if (!isEraserMode) {
            element.style.filter = 'brightness(1.1)';
        }
    });

    element.addEventListener('mouseleave', () => {
        element.style.filter = '';
    });
}

function paintElement(element) {
    const elementId = getElementId(element);
    
    if (isEraserMode) {
        // Restaurar cor original
        const originalFill = element.dataset.originalFill || '#D9D9D9';
        const originalStroke = element.dataset.originalStroke || '';
        
        element.setAttribute('fill', originalFill);
        if (originalStroke) {
            element.setAttribute('stroke', originalStroke);
        }
        
        // Remover do mapa de elementos pintados
        paintedElements.delete(elementId);
        console.log(`Elemento ${elementId} despintado`);
    } else {
        // Pintar com a cor atual
        element.setAttribute('fill', currentColor);
        
        // Salvar no mapa de elementos pintados
        paintedElements.set(elementId, {
            element: element,
            color: currentColor,
            originalFill: element.dataset.originalFill,
            timestamp: new Date().toISOString(),
            tab: currentTab,
            diagnosis: getColorDiagnosis(currentColor)
        });
        
        console.log(`Elemento ${elementId} pintado com ${currentColor}`);
    }
    
    // Feedback visual
    element.style.transform = 'scale(1.05)';
    setTimeout(() => {
        element.style.transform = '';
    }, 150);
}

function getElementId(element) {
    // Criar ID único baseado na posição e características do elemento
    const rect = element.getBoundingClientRect();
    const id = element.id || 
              element.getAttribute('d') || 
              `${Math.round(rect.x)}-${Math.round(rect.y)}-${Math.round(rect.width)}-${Math.round(rect.height)}`;
    return `${currentTab}-${id}`;
}

function getColorDiagnosis(color) {
    const colorMap = {
        '#FF4757': 'Cárie Severa',
        '#FF6B6B': 'Cárie Moderada',
        '#FFA502': 'Inflamação',
        '#FF7675': 'Gengivite',
        '#00D2D3': 'Tratamento Realizado',
        '#0984E3': 'Tratamento Planejado',
        '#6C5CE7': 'Medicação',
        '#A29BFE': 'Observação',
        '#00B894': 'Saudável',
        '#FDCB6E': 'Atenção',
        '#E17055': 'Tártaro',
        '#636E72': 'Ausente'
    };
    return colorMap[color] || 'Não especificado';
}

function restorePaintings(tabName) {
    // Restaurar pinturas salvas para esta aba
    paintedElements.forEach((data, elementId) => {
        if (data.tab === tabName) {
            // Tentar encontrar o elemento novamente
            const svg = document.querySelector('#svg-display svg');
            if (svg) {
                const elements = svg.querySelectorAll('path, rect, circle, ellipse, polygon, polyline');
                elements.forEach(element => {
                    const currentElementId = getElementId(element);
                    if (currentElementId === elementId) {
                        element.setAttribute('fill', data.color);
                    }
                });
            }
        }
    });
}
function clearAllPaintings() {
    // Restaurar cor original de todos os elementos pintados
    document.querySelectorAll('.paintable').forEach(element => {
        const originalFill = element.dataset.originalFill || '#D9D9D9';
        const originalStroke = element.dataset.originalStroke || '';
        
        element.setAttribute('fill', originalFill);
        if (originalStroke) {
            element.setAttribute('stroke', originalStroke);
        }
    });
    
    // Limpar mapa de elementos pintados
    paintedElements.clear();
    console.log('Todas as pinturas foram removidas');
}

function saveData() {
    const data = {
        paintedElements: Array.from(paintedElements.entries()),
        currentTab: currentTab,
        timestamp: new Date().toISOString(),
        patientData: getPatientData()
    };
    
    localStorage.setItem('vettooth-data', JSON.stringify(data));
    console.log('Dados salvos:', data);
}

function loadData() {
    try {
        const saved = localStorage.getItem('vettooth-data');
        if (saved) {
            const data = JSON.parse(saved);
            
            // Restaurar elementos pintados
            if (data.paintedElements) {
                data.paintedElements.forEach(([id, elementData]) => {
                    paintedElements.set(id, elementData);
                });
            }
            
            // Restaurar dados do paciente
            if (data.patientData) {
                const patient = data.patientData;
                if (patient.animalName) document.getElementById('animal-name').value = patient.animalName;
                if (patient.species) document.getElementById('animal-species').value = patient.species;
                if (patient.ownerName) document.getElementById('owner-name').value = patient.ownerName;
                if (patient.examDate) document.getElementById('exam-date').value = patient.examDate;
                if (patient.clinicalNotes) document.getElementById('clinical-notes').value = patient.clinicalNotes;
            }
            
            console.log('Dados carregados:', data);
        }
    } catch (error) {
        console.error('Erro ao carregar dados:', error);
    }
}

function getPatientData() {
    return {
        animalName: document.getElementById('animal-name')?.value || '',
        species: document.getElementById('animal-species')?.value || '',
        ownerName: document.getElementById('owner-name')?.value || '',
        examDate: document.getElementById('exam-date')?.value || '',
        clinicalNotes: document.getElementById('clinical-notes')?.value || ''
    };
}

function generatePDF() {
    try {
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF('p', 'mm', 'a4');
        
        // Dados do paciente
        const patientData = getPatientData();
        
        // Cabeçalho
        pdf.setFontSize(20);
        pdf.setTextColor(44, 62, 80);
        pdf.text('🦷 VetTooth - Relatório Odontológico', 20, 25);
        
        pdf.setFontSize(12);
        pdf.setTextColor(100, 100, 100);
        pdf.text('Sistema de Odontograma Veterinário', 20, 35);
        
        // Linha separadora
        pdf.setDrawColor(52, 152, 219);
        pdf.setLineWidth(0.5);
        pdf.line(20, 40, 190, 40);
        
        // Informações do paciente
        let yPos = 55;
        pdf.setFontSize(14);
        pdf.setTextColor(44, 62, 80);
        pdf.text('Dados do Paciente', 20, yPos);
        
        yPos += 10;
        pdf.setFontSize(10);
        pdf.setTextColor(0, 0, 0);
        
        const patientInfo = [
            `Nome do Animal: ${patientData.animalName || 'Não informado'}`,
            `Espécie: ${patientData.species || 'Não informado'}`,
            `Proprietário: ${patientData.ownerName || 'Não informado'}`,
            `Data do Exame: ${patientData.examDate || 'Não informado'}`
        ];
        
        patientInfo.forEach(info => {
            pdf.text(info, 20, yPos);
            yPos += 6;
        });
        
        // Diagnósticos encontrados
        yPos += 10;
        pdf.setFontSize(14);
        pdf.setTextColor(44, 62, 80);
        pdf.text('Diagnósticos Encontrados', 20, yPos);
        
        yPos += 10;
        pdf.setFontSize(10);
        
        if (paintedElements.size === 0) {
            pdf.text('Nenhum diagnóstico registrado.', 20, yPos);
            yPos += 6;
        } else {
            const diagnoses = groupDiagnosesByType();
            
            Object.entries(diagnoses).forEach(([diagnosis, count]) => {
                pdf.text(`• ${diagnosis}: ${count} dente(s)`, 20, yPos);
                yPos += 6;
            });
        }
        
        // Observações clínicas
        if (patientData.clinicalNotes) {
            yPos += 10;
            pdf.setFontSize(14);
            pdf.setTextColor(44, 62, 80);
            pdf.text('Observações Clínicas', 20, yPos);
            
            yPos += 10;
            pdf.setFontSize(10);
            pdf.setTextColor(0, 0, 0);
            
            const lines = pdf.splitTextToSize(patientData.clinicalNotes, 170);
            lines.forEach(line => {
                if (yPos > 280) {
                    pdf.addPage();
                    yPos = 20;
                }
                pdf.text(line, 20, yPos);
                yPos += 6;
            });
        }
        
        // Rodapé
        const pageCount = pdf.internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            pdf.setPage(i);
            pdf.setFontSize(8);
            pdf.setTextColor(150, 150, 150);
            pdf.text(`Relatório gerado em ${new Date().toLocaleString('pt-BR')}`, 20, 290);
            pdf.text(`Página ${i} de ${pageCount}`, 170, 290);
        }
        
        // Salvar PDF
        const fileName = `Odontograma_${patientData.animalName || 'Animal'}_${new Date().toISOString().split('T')[0]}.pdf`;
        pdf.save(fileName);
        
        console.log('PDF gerado com sucesso!');
        
    } catch (error) {
        console.error('Erro ao gerar PDF:', error);
        alert('Erro ao gerar PDF. Verifique o console para mais detalhes.');
    }
}

function groupDiagnosesByType() {
    const diagnoses = {};
    
    paintedElements.forEach(elementData => {
        const diagnosis = elementData.diagnosis;
        diagnoses[diagnosis] = (diagnoses[diagnosis] || 0) + 1;
    });
    
    return diagnoses;
}