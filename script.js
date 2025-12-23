// Variáveis globais
let currentColor = '#FF4757';
let isEraserMode = false;
let currentTool = 'paint'; // paint, pencil, arrow, circle, fill
let paintedElements = new Map();
let drawingElements = []; // Para armazenar elementos de desenho livre
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
            currentTool = isEraserMode ? 'eraser' : 'paint';
            document.body.classList.toggle('eraser-mode', isEraserMode);
            
            // Remove seleção de cores quando ativa borracha
            if (isEraserMode) {
                document.querySelectorAll('.color-option, .drawing-tool-btn').forEach(opt => 
                    opt.classList.remove('selected')
                );
                this.style.background = '#FF3B30';
                this.style.color = 'white';
            } else {
                this.style.background = '';
                this.style.color = '';
            }
            
            updateCursor();
            console.log('Modo borracha:', isEraserMode);
        });
    }
    
    // Botão limpar tudo
    const clearBtn = document.getElementById('clear-btn');
    if (clearBtn) {
        clearBtn.addEventListener('click', function() {
            if (confirm('Tem certeza que deseja limpar todas as pinturas?')) {
                clearAllPaintings();
                clearAllDrawings();
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
    
    // Inicializar ferramentas de desenho
    initializeDrawingTools();
}

// Inicializar ferramentas de desenho
function initializeDrawingTools() {
    const drawingButtons = document.querySelectorAll('.drawing-tool-btn');
    
    drawingButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove active de todos os botões
            document.querySelectorAll('.color-option, .drawing-tool-btn, .tool-btn').forEach(btn => {
                btn.classList.remove('selected');
            });
            
            // Adiciona active ao botão clicado
            this.classList.add('selected');
            
            // Atualiza ferramenta atual
            currentTool = this.dataset.tool;
            isEraserMode = false;
            
            // Atualiza cursor baseado na ferramenta
            updateCursor();
        });
    });
    
    // Inicializar ferramenta de lápis
    initializePencilTool();
}

// Atualizar cursor baseado na ferramenta
function updateCursor() {
    const svgDisplay = document.getElementById('svg-display');
    if (!svgDisplay) return;
    
    svgDisplay.style.cursor = 'default';
    
    switch(currentTool) {
        case 'paint':
            svgDisplay.style.cursor = 'pointer';
            break;
        case 'eraser':
            svgDisplay.style.cursor = 'crosshair';
            break;
        case 'pencil':
            svgDisplay.style.cursor = 'crosshair';
            break;
        case 'arrow':
            svgDisplay.style.cursor = 'crosshair';
            break;
        case 'circle':
            svgDisplay.style.cursor = 'crosshair';
            break;
        case 'fill':
            svgDisplay.style.cursor = 'pointer';
            break;
    }
}

// Implementar desenho livre (lápis)
function initializePencilTool() {
    const svgDisplay = document.getElementById('svg-display');
    if (!svgDisplay) return;
    
    let isDrawing = false;
    let currentPath = null;
    let pathData = '';
    
    function startDrawing(e) {
        if (currentTool !== 'pencil') return;
        
        isDrawing = true;
        const svg = svgDisplay.querySelector('svg');
        if (!svg) return;
        
        // Calcular coordenadas precisas do SVG
        const rect = svg.getBoundingClientRect();
        const scaleX = svg.viewBox.baseVal.width / rect.width;
        const scaleY = svg.viewBox.baseVal.height / rect.height;
        
        const x = (e.clientX - rect.left) * scaleX;
        const y = (e.clientY - rect.top) * scaleY;
        
        // Criar novo path
        currentPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        currentPath.setAttribute('stroke', currentColor);
        currentPath.setAttribute('stroke-width', '3');
        currentPath.setAttribute('fill', 'none');
        currentPath.setAttribute('stroke-linecap', 'round');
        currentPath.setAttribute('stroke-linejoin', 'round');
        currentPath.classList.add('drawing-element');
        
        pathData = `M ${x} ${y}`;
        currentPath.setAttribute('d', pathData);
        
        svg.appendChild(currentPath);
        drawingElements.push({
            element: currentPath,
            tab: currentTab,
            type: 'pencil',
            color: currentColor
        });
        
        e.preventDefault();
        e.stopPropagation();
    }
    
    function draw(e) {
        if (!isDrawing || currentTool !== 'pencil' || !currentPath) return;
        
        const svg = svgDisplay.querySelector('svg');
        if (!svg) return;
        
        // Calcular coordenadas precisas do SVG
        const rect = svg.getBoundingClientRect();
        const scaleX = svg.viewBox.baseVal.width / rect.width;
        const scaleY = svg.viewBox.baseVal.height / rect.height;
        
        const x = (e.clientX - rect.left) * scaleX;
        const y = (e.clientY - rect.top) * scaleY;
        
        pathData += ` L ${x} ${y}`;
        currentPath.setAttribute('d', pathData);
        
        e.preventDefault();
    }
    
    function stopDrawing() {
        if (isDrawing) {
            isDrawing = false;
            currentPath = null;
            pathData = '';
        }
    }
    
    // Adicionar event listeners
    svgDisplay.addEventListener('mousedown', startDrawing);
    svgDisplay.addEventListener('mousemove', draw);
    svgDisplay.addEventListener('mouseup', stopDrawing);
    svgDisplay.addEventListener('mouseleave', stopDrawing);
}

// Implementar ferramenta de seta
function addArrow(svg, x, y) {
    // Converter coordenadas do browser para coordenadas do SVG
    const rect = svg.getBoundingClientRect();
    const viewBox = svg.viewBox.baseVal;
    
    // Calcular as coordenadas precisas do SVG
    let svgX, svgY;
    
    if (viewBox.width > 0 && viewBox.height > 0) {
        // Se há viewBox, usar escala baseada nele
        const scaleX = viewBox.width / rect.width;
        const scaleY = viewBox.height / rect.height;
        svgX = viewBox.x + (x * scaleX);
        svgY = viewBox.y + (y * scaleY);
    } else {
        // Se não há viewBox, usar coordenadas diretas
        svgX = x;
        svgY = y;
    }
    
    const arrow = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    arrow.classList.add('drawing-element');
    
    // Linha principal da seta
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', svgX);
    line.setAttribute('y1', svgY);
    line.setAttribute('x2', svgX + 30);
    line.setAttribute('y2', svgY - 20);
    line.setAttribute('stroke', currentColor);
    line.setAttribute('stroke-width', '3');
    line.setAttribute('marker-end', 'url(#arrowhead)');
    
    // Criar marcador de seta se não existir
    let defs = svg.querySelector('defs');
    if (!defs) {
        defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
        svg.appendChild(defs);
    }
    
    if (!svg.querySelector('#arrowhead')) {
        const marker = document.createElementNS('http://www.w3.org/2000/svg', 'marker');
        marker.setAttribute('id', 'arrowhead');
        marker.setAttribute('markerWidth', '10');
        marker.setAttribute('markerHeight', '7');
        marker.setAttribute('refX', '9');
        marker.setAttribute('refY', '3.5');
        marker.setAttribute('orient', 'auto');
        
        const polygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
        polygon.setAttribute('points', '0 0, 10 3.5, 0 7');
        polygon.setAttribute('fill', currentColor);
        
        marker.appendChild(polygon);
        defs.appendChild(marker);
    }
    
    arrow.appendChild(line);
    svg.appendChild(arrow);
    
    drawingElements.push({
        element: arrow,
        tab: currentTab,
        type: 'arrow',
        color: currentColor
    });
}

// Implementar ferramenta de círculo
function addCircle(svg, x, y) {
    // Converter coordenadas do browser para coordenadas do SVG
    const rect = svg.getBoundingClientRect();
    const viewBox = svg.viewBox.baseVal;
    
    // Calcular as coordenadas precisas do SVG
    let svgX, svgY;
    
    if (viewBox.width > 0 && viewBox.height > 0) {
        // Se há viewBox, usar escala baseada nele
        const scaleX = viewBox.width / rect.width;
        const scaleY = viewBox.height / rect.height;
        svgX = viewBox.x + (x * scaleX);
        svgY = viewBox.y + (y * scaleY);
    } else {
        // Se não há viewBox, usar coordenadas diretas
        svgX = x;
        svgY = y;
    }
    
    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('cx', svgX);
    circle.setAttribute('cy', svgY);
    circle.setAttribute('r', '15');
    circle.setAttribute('stroke', currentColor);
    circle.setAttribute('stroke-width', '3');
    circle.setAttribute('fill', 'none');
    circle.classList.add('drawing-element');
    
    svg.appendChild(circle);
    drawingElements.push({
        element: circle,
        tab: currentTab,
        type: 'circle',
        color: currentColor
    });
}

// Implementar ferramenta de preenchimento
function fillArea(element) {
    if (element && element.tagName) {
        element.style.fill = currentColor;
        element.setAttribute('data-filled', 'true');
        element.setAttribute('data-fill-color', currentColor);
    }
}

// Limpar todos os desenhos
function clearAllDrawings() {
    drawingElements.forEach(drawingData => {
        if (drawingData.element && drawingData.element.parentNode) {
            drawingData.element.parentNode.removeChild(drawingData.element);
        }
    });
    drawingElements = [];
    
    // Limpar preenchimentos
    document.querySelectorAll('[data-filled="true"]').forEach(element => {
        element.style.fill = '';
        element.removeAttribute('data-filled');
        element.removeAttribute('data-fill-color');
    });
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
            switchTab(tabName);
            
            console.log('Aba selecionada:', tabName);
        });
    });
    
    // Carregar SVG inicial
    loadSVG('arcada-sup');
}

// Função para trocar de aba
function switchTab(tabName) {
    console.log(`Trocando para aba: ${tabName}`);
    
    // Salvar estado da aba atual
    saveTabState(currentTab);
    
    // Atualizar aba atual
    currentTab = tabName;
    
    // Atualizar interface
    updateTabButtons();
    loadSVG(tabName);
    
    // Restaurar estado da nova aba
    setTimeout(() => {
        restoreTabState(tabName);
        restoreDrawingsForTab(tabName);
    }, 100);
}

// Restaurar desenhos para uma aba específica
function restoreDrawingsForTab(tabName) {
    // Limpar desenhos atuais
    document.querySelectorAll('.drawing-element').forEach(el => {
        if (el.parentNode) {
            el.parentNode.removeChild(el);
        }
    });
    
    // Restaurar desenhos da aba
    const svg = document.querySelector('#svg-display svg');
    if (svg) {
        drawingElements.forEach(drawingData => {
            if (drawingData.tab === tabName) {
                // Recriar o elemento de desenho
                const newElement = drawingData.element.cloneNode(true);
                svg.appendChild(newElement);
                
                // Atualizar referência
                drawingData.element = newElement;
            }
        });
    }
}

// Salvar estado da aba (incluindo desenhos)
function saveTabState(tabName) {
    // Salvar pinturas
    const tabPaintings = new Map();
    paintedElements.forEach((data, elementId) => {
        if (data.tab === tabName) {
            tabPaintings.set(elementId, data);
        }
    });
    
    // Armazenar no localStorage ou variável global
    if (typeof(Storage) !== "undefined") {
        localStorage.setItem(`vettooth_tab_${tabName}`, JSON.stringify(Array.from(tabPaintings)));
    }
}

// Atualizar botões das abas
function updateTabButtons() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tab === currentTab);
    });
}

// Restaurar estado da aba
function restoreTabState(tabName) {
    if (typeof(Storage) !== "undefined") {
        const saved = localStorage.getItem(`vettooth_tab_${tabName}`);
        if (saved) {
            try {
                const tabPaintings = JSON.parse(saved);
                tabPaintings.forEach(([elementId, data]) => {
                    paintedElements.set(elementId, data);
                });
            } catch (error) {
                console.error('Erro ao restaurar estado da aba:', error);
            }
        }
    }
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
    
    // Adicionar listener para cliques diretos no SVG (para ferramentas de desenho)
    svg.addEventListener('click', function(e) {
        // Só processar se não clicou em um elemento específico
        if (e.target === svg || e.target.tagName === 'svg') {
            handleSVGDirectClick(e, svg);
        }
    });
    
    console.log(`${paintableCount} elementos pintáveis detectados`);
}

// Função para lidar com cliques diretos no SVG (área vazia)
function handleSVGDirectClick(event, svg) {
    const rect = svg.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    switch(currentTool) {
        case 'arrow':
            addArrow(svg, x, y);
            break;
        case 'circle':
            addCircle(svg, x, y);
            break;
        case 'pencil':
            // O lápis já é tratado pelos eventos de mouse
            break;
        case 'fill':
            // Fill só funciona em elementos específicos
            break;
    }
    
    event.preventDefault();
    event.stopPropagation();
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
        
        // Obter coordenadas do clique para ferramentas de desenho
        const svg = element.closest('svg');
        const rect = svg.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        switch(currentTool) {
            case 'paint':
            case 'eraser':
            case 'fill':
                paintElement(element);
                break;
                
            case 'arrow':
                addArrow(svg, x, y);
                break;
                
            case 'circle':
                addCircle(svg, x, y);
                break;
                
            case 'pencil':
                // O desenho livre é tratado pelos eventos de mouse
                break;
        }
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
    
    if (currentTool === 'eraser') {
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
    } else if (currentTool === 'paint') {
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
    } else if (currentTool === 'fill') {
        // Preencher área
        fillArea(element);
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
    
    // Restaurar desenhos para esta aba
    restoreDrawingsForTab(tabName);
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

// Função para capturar o SVG editado como imagem
function captureSVGAsImage() {
    return new Promise((resolve, reject) => {
        const svgDisplay = document.getElementById('svg-display');
        const svg = svgDisplay?.querySelector('svg');
        
        if (!svg) {
            resolve(null);
            return;
        }
        
        try {
            // Clonar o SVG para não afetar o original
            const svgClone = svg.cloneNode(true);
            
            // Garantir que o SVG tenha dimensões definidas
            const rect = svg.getBoundingClientRect();
            svgClone.setAttribute('width', rect.width);
            svgClone.setAttribute('height', rect.height);
            
            // Converter SVG para string
            const svgData = new XMLSerializer().serializeToString(svgClone);
            const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
            const svgUrl = URL.createObjectURL(svgBlob);
            
            // Criar canvas para converter para imagem
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const img = new Image();
            
            img.onload = function() {
                canvas.width = img.width;
                canvas.height = img.height;
                ctx.drawImage(img, 0, 0);
                
                // Converter para base64
                const imageData = canvas.toDataURL('image/png');
                URL.revokeObjectURL(svgUrl);
                resolve(imageData);
            };
            
            img.onerror = function() {
                URL.revokeObjectURL(svgUrl);
                reject(new Error('Erro ao carregar SVG como imagem'));
            };
            
            img.src = svgUrl;
            
        } catch (error) {
            reject(error);
        }
    });
}

async function generatePDF() {
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
        
        // Capturar e incluir o odontograma editado
        yPos += 15;
        pdf.setFontSize(14);
        pdf.setTextColor(44, 62, 80);
        pdf.text('Odontograma Editado', 20, yPos);
        
        try {
            const svgImage = await captureSVGAsImage();
            if (svgImage) {
                yPos += 10;
                // Adicionar a imagem do odontograma (ajustar tamanho conforme necessário)
                pdf.addImage(svgImage, 'PNG', 20, yPos, 170, 100);
                yPos += 110;
            }
        } catch (error) {
            console.warn('Não foi possível capturar o odontograma:', error);
            yPos += 10;
            pdf.setFontSize(10);
            pdf.setTextColor(200, 0, 0);
            pdf.text('Erro ao capturar imagem do odontograma', 20, yPos);
            yPos += 10;
        }
        
        // Diagnósticos encontrados
        yPos += 10;
        pdf.setFontSize(14);
        pdf.setTextColor(44, 62, 80);
        pdf.text('Diagnósticos Encontrados', 20, yPos);
        
        yPos += 10;
        pdf.setFontSize(10);
        pdf.setTextColor(0, 0, 0);
        
        if (paintedElements.size === 0 && drawingElements.length === 0) {
            pdf.text('Nenhum diagnóstico ou anotação registrada.', 20, yPos);
            yPos += 6;
        } else {
            // Diagnósticos por pintura
            if (paintedElements.size > 0) {
                const diagnoses = groupDiagnosesByType();
                Object.entries(diagnoses).forEach(([diagnosis, count]) => {
                    pdf.text(`• ${diagnosis}: ${count} dente(s)`, 20, yPos);
                    yPos += 6;
                });
            }
            
            // Anotações de desenho
            if (drawingElements.length > 0) {
                yPos += 5;
                pdf.text(`• Anotações de desenho: ${drawingElements.length} elemento(s)`, 20, yPos);
                yPos += 6;
            }
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
        
        console.log('PDF gerado com sucesso com odontograma editado!');
        
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
