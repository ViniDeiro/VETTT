import React, { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card'
import { Button } from '../ui/Button'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import EditingToolbar from './EditingToolbar'

// Hook to load SVG content inline
const useSvgContent = (svgPath) => {
  const [svgContent, setSvgContent] = useState('')

  useEffect(() => {
    fetch(svgPath)
      .then(response => response.text())
      .then(content => setSvgContent(content))
      .catch(error => console.error('Error loading SVG:', error))
  }, [svgPath])

  return svgContent
}

// Import SVG files
import esquerdaSvg from '../../assets/Esquerda/esquerda.svg'
import centroSvg from '../../assets/Esquerda/centro.svg'
import direitaSvg from '../../assets/Esquerda/direita.svg'

 

export default function Odontogram({ data, onUpdate }) {
  const [selectedTool, setSelectedTool] = useState('')
  const [markedTeeth, setMarkedTeeth] = useState(data.odontogram?.markedTeeth || {})
  const [paintedTeeth, setPaintedTeeth] = useState(data.odontogram?.paintedTeeth || {})
  const [currentView, setCurrentView] = useState('centro') // 'esquerda', 'centro', 'direita'
  const [currentColor, setCurrentColor] = useState('#000000')
  const [overlays, setOverlays] = useState([])
  const [history, setHistory] = useState([])
  const [incisorViewOpen, setIncisorViewOpen] = useState(false)
  const [incisorsMode, setIncisorsMode] = useState('smile')
  const svgRef = useRef(null)
  const drawingRef = useRef({ isDrawing: false, path: null, pathData: '' })
  const panRef = useRef({ dragging: false, lastX: 0, lastY: 0 })
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const groupRef = useRef(null)

  // SVG mapping
  const svgMap = {
    esquerda: esquerdaSvg,
    centro: centroSvg,
    direita: direitaSvg
  }

  // Load SVG content for current view
  const svgContent = useSvgContent(svgMap[currentView])

  // Dental tools palette
  const tools = [
    { id: 'caries', name: 'Cárie', color: '#FF0000', description: 'Lesão cariosa' },
    { id: 'restoration', name: 'Restauração', color: '#0066CC', description: 'Restauração existente' },
    { id: 'extraction', name: 'Extração', color: '#000000', description: 'Dente extraído' },
    { id: 'fracture', name: 'Fratura', color: '#FF6600', description: 'Fratura dental' },
    { id: 'crown', name: 'Coroa', color: '#FFD700', description: 'Coroa protética' },
    { id: 'implant', name: 'Implante', color: '#808080', description: 'Implante dental' },
    { id: 'cleaning', name: 'Limpeza', color: '#00FF00', description: 'Limpeza realizada' },
    { id: 'observation', name: 'Observação', color: '#9966CC', description: 'Ponto de observação' }
  ]

  // View navigation
  const views = ['esquerda', 'centro', 'direita']
  const viewLabels = {
    esquerda: 'Esquerda',
    centro: 'Centro',
    direita: 'Direita'
  }

  // Navigation functions
  const navigateView = (direction) => {
    const currentIndex = views.indexOf(currentView)
    if (direction === 'prev' && currentIndex > 0) {
      setCurrentView(views[currentIndex - 1])
    } else if (direction === 'next' && currentIndex < views.length - 1) {
      setCurrentView(views[currentIndex + 1])
    }
  }

  const setView = (view) => {
    setCurrentView(view)
  }

  // Handle SVG path click for painting teeth
  const handlePathClick = (event, pathId) => {
    if (!selectedTool) return

    const paintTools = new Set(['fill', ...tools.map(t => t.id)])

    if (selectedTool === 'eraser') {
      event.stopPropagation()
      const key = `${currentView}_${pathId}`
      if (paintedTeeth[key]) {
        const next = { ...paintedTeeth }
        delete next[key]
        setPaintedTeeth(next)
        onUpdate({ odontogram: { markedTeeth, paintedTeeth: next, currentView } })
        setHistory(prev => [...prev, { type: 'paint_erase', view: currentView, pathId }])
      }
      return
    }

    if (!paintTools.has(selectedTool)) {
      // Non-paint tools should interact with the SVG-level handlers
      return
    }

    event.stopPropagation()
    const selectedColor = currentColor || tools.find(t => t.id === selectedTool)?.color || '#FF0000'
    const updatedPaintedTeeth = {
      ...paintedTeeth,
      [`${currentView}_${pathId}`]: {
        pathId,
        tool: selectedTool,
        color: selectedColor,
        view: currentView,
        timestamp: Date.now()
      }
    }
    setPaintedTeeth(updatedPaintedTeeth)
    onUpdate({ odontogram: { markedTeeth, paintedTeeth: updatedPaintedTeeth, currentView } })
    setHistory(prev => [...prev, { type: 'paint', view: currentView, pathId, color: selectedColor }])
  }

  const clearOdontogram = () => {
    setMarkedTeeth({})
    setPaintedTeeth({})
    setOverlays([])
    setHistory(prev => [...prev, { type: 'clear' }])
    onUpdate({ odontogram: { markedTeeth: {}, paintedTeeth: {}, currentView } })
  }

  const getConditionSummary = () => {
    const summary = {}

    // Count marked teeth (dots)
    Object.values(markedTeeth).forEach(mark => {
      if (mark.tool) {
        summary[mark.tool] = (summary[mark.tool] || 0) + 1
      }
    })

    // Count painted teeth (filled areas)
    Object.values(paintedTeeth).forEach(tooth => {
      if (tooth.tool) {
        summary[tooth.tool] = (summary[tooth.tool] || 0) + 1
      }
    })

    return summary
  }

 

  // Render SVG with clickable paths
  const renderInteractiveSvg = () => {
    if (!svgContent) return null

    // Parse SVG content and make paths interactive
    const parser = new DOMParser()
    const svgDoc = parser.parseFromString(svgContent, 'image/svg+xml')
    const svgElement = svgDoc.querySelector('svg')

    if (!svgElement) return null

    // Get all path elements
    const paths = svgElement.querySelectorAll('path')

    // Convert to React elements with clickable areas
    const pathElements = []

    Array.from(paths).forEach((path, index) => {
      const pathId = `path_${index}`
      const paintedTooth = paintedTeeth[`${currentView}_${pathId}`]
      const pathData = path.getAttribute('d')

      // Clickable invisible area (larger stroke width for better click detection)
      const paintToolsSet = new Set(['fill', ...tools.map(t => t.id), 'eraser'])
      pathElements.push(
        <path
          key={`${pathId}_clickable`}
          d={pathData}
          stroke="transparent"
          strokeWidth="15"
          fill={paintedTooth ? paintedTooth.color : 'transparent'}
          style={{ cursor: paintToolsSet.has(selectedTool) ? 'pointer' : 'default' }}
          onClick={(e) => handlePathClick(e, pathId)}
        />
      )

      // Visible outline (always on top)
      pathElements.push(
        <path
          key={`${pathId}_outline`}
          d={pathData}
          stroke={path.getAttribute('stroke') || '#000'}
          strokeWidth={path.getAttribute('stroke-width') || '1'}
          fill={paintedTooth ? paintedTooth.color : 'none'}
          pointerEvents="none"
        />
      )
    })

    const overlayEls = overlays.filter(o => o.view === currentView).map(o => {
      if (o.type === 'arrow') {
        return (
          <g key={o.id} onMouseDown={(e) => handleOverlayMouseDown(e, o.id)}>
            <line x1={o.x} y1={o.y} x2={o.x + 30} y2={o.y - 20} stroke={o.color} strokeWidth={3} markerEnd="url(#arrowhead)" />
          </g>
        )
      }
      if (o.type === 'circle') {
        return (<circle key={o.id} cx={o.x} cy={o.y} r={15} stroke={o.color} strokeWidth={3} fill="none" onMouseDown={(e) => handleOverlayMouseDown(e, o.id)} />)
      }
      if (o.type === 'line') {
        return (<line key={o.id} x1={o.x} y1={o.y} x2={o.x + 35} y2={o.y} stroke={o.color} strokeWidth={3} onMouseDown={(e) => handleOverlayMouseDown(e, o.id)} />)
      }
      if (o.type === 'pencil' || o.type === 'pencil_temp') {
        return (<path key={o.id} d={o.d} stroke={o.color} strokeWidth={3} fill="none" strokeLinecap="round" strokeLinejoin="round" />)
      }
      if (o.type === 'incisors_smile') {
        return (<path key={o.id} d={`M ${o.x - 30} ${o.y} q 30 20 60 0`} stroke={o.color} strokeWidth={4} fill="none" transform={o.rotate ? `rotate(${o.rotate}, ${o.x}, ${o.y})` : undefined} onMouseDown={(e) => handleOverlayMouseDown(e, o.id)} />)
      }
      if (o.type === 'incisors_frown') {
        return (<path key={o.id} d={`M ${o.x - 30} ${o.y} q 30 -20 60 0`} stroke={o.color} strokeWidth={4} fill="none" transform={o.rotate ? `rotate(${o.rotate}, ${o.x}, ${o.y})` : undefined} onMouseDown={(e) => handleOverlayMouseDown(e, o.id)} />)
      }
      if (['atr_etr', 'sharp_edges', 'ramps', 'hooks', 'protuberant', 'waves', 'fracture', 'diastema', 'wolf_tooth', 'caps', 'ulceration', 'tartar'].includes(o.type)) {
        if (o.type === 'diastema') {
          return (<line key={o.id} x1={o.x} y1={o.y - 12} x2={o.x} y2={o.y + 12} stroke={o.color} strokeWidth={3} onMouseDown={(e) => handleOverlayMouseDown(e, o.id)} />)
        }
        if (o.type === 'caps') {
          return (<text key={o.id} x={o.x} y={o.y} fill={o.color} fontSize={14} fontWeight="bold" textAnchor="middle" dominantBaseline="middle" onMouseDown={(e) => handleOverlayMouseDown(e, o.id)}>C</text>)
        }
        if (o.type === 'ulceration') {
          return (<text key={o.id} x={o.x} y={o.y} fill={o.color} fontSize={14} fontWeight="bold" textAnchor="middle" dominantBaseline="middle" onMouseDown={(e) => handleOverlayMouseDown(e, o.id)}>U</text>)
        }
        if (o.type === 'tartar') {
          return (<text key={o.id} x={o.x} y={o.y} fill={o.color} fontSize={14} fontWeight="bold" textAnchor="middle" dominantBaseline="middle" onMouseDown={(e) => handleOverlayMouseDown(e, o.id)}>T</text>)
        }
        if (o.type === 'wolf_tooth') {
          return (<polygon key={o.id} points={`${o.x},${o.y - 14} ${o.x + 10},${o.y + 8} ${o.x - 10},${o.y + 8}`} fill={o.color} onMouseDown={(e) => handleOverlayMouseDown(e, o.id)} />)
        }
        if (o.type === 'fracture') {
          return (<polyline key={o.id} points={`${o.x - 10},${o.y - 14} ${o.x},${o.y} ${o.x + 10},${o.y - 8}`} stroke={o.color} strokeWidth={3} fill="none" onMouseDown={(e) => handleOverlayMouseDown(e, o.id)} />)
        }
        if (o.type === 'waves') {
          return (<path key={o.id} d={`M ${o.x - 20} ${o.y} q 10 -10 20 0 q 10 10 20 0`} stroke={o.color} strokeWidth={3} fill="none" onMouseDown={(e) => handleOverlayMouseDown(e, o.id)} />)
        }
        if (o.type === 'protuberant') {
          return (<rect key={o.id} x={o.x - 12} y={o.y - 6} width={24} height={12} fill={o.color} onMouseDown={(e) => handleOverlayMouseDown(e, o.id)} />)
        }
        if (o.type === 'sharp_edges') {
          return (<polygon key={o.id} points={`${o.x - 12},${o.y + 8} ${o.x - 4},${o.y - 8} ${o.x + 4},${o.y + 8} ${o.x + 12},${o.y - 8}`} fill={o.color} onMouseDown={(e) => handleOverlayMouseDown(e, o.id)} />)
        }
        if (o.type === 'hooks') {
          return (<path key={o.id} d={`M ${o.x} ${o.y - 10} q -10 10 0 20`} stroke={o.color} strokeWidth={3} fill="none" onMouseDown={(e) => handleOverlayMouseDown(e, o.id)} />)
        }
        if (o.type === 'ramps') {
          return (<polygon key={o.id} points={`${o.x - 14},${o.y + 10} ${o.x + 14},${o.y + 10} ${o.x},${o.y - 10}`} fill={o.color} onMouseDown={(e) => handleOverlayMouseDown(e, o.id)} />)
        }
        if (o.type === 'atr_etr') {
          return (<rect key={o.id} x={o.x - 10} y={o.y - 10} width={20} height={20} stroke={o.color} strokeWidth={3} fill="none" onMouseDown={(e) => handleOverlayMouseDown(e, o.id)} />)
        }
      }
      return null
    })

    return (
      <svg
        ref={svgRef}
        width="100%"
        height="auto"
        viewBox={svgElement.getAttribute('viewBox')}
        style={{ maxHeight: '420px' }}
        className="border border-gray-300 bg-white rounded"
        onMouseDown={handleSvgMouseDown}
        onMouseMove={handleSvgMouseMove}
        onMouseUp={handleSvgMouseUp}
        onClick={handleSvgClick}
        onWheel={handleSvgWheel}
      >
        <defs>
          <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="10" refY="3.5" orient="auto">
            <polygon points="0 0, 10 3.5, 0 7" fill={currentColor} />
          </marker>
        </defs>
        <g ref={groupRef} transform={`translate(${pan.x} ${pan.y}) scale(${zoom})`}>
          {pathElements}
          {overlayEls}
        </g>
      </svg>
    )
  }

  const conditionCounts = getConditionSummary()

  const addOverlay = (type, x, y) => {
    const id = `${type}_${Date.now()}`
    const obj = { id, type, x, y, color: currentColor, view: currentView }
    setOverlays(prev => [...prev, obj])
    setHistory(prev => [...prev, { type: 'add_overlay', payload: obj }])
  }

  const removeNearestOverlay = (type, x, y) => {
    const items = overlays.filter(o => o.view === currentView && o.type === type)
    if (!items.length) return
    let nearest = items[0]
    let dist = (nearest.x - x) ** 2 + (nearest.y - y) ** 2
    items.slice(1).forEach(o => {
      const d = (o.x - x) ** 2 + (o.y - y) ** 2
      if (d < dist) { nearest = o; dist = d }
    })
    setOverlays(prev => prev.filter(o => o.id !== nearest.id))
    setHistory(prev => [...prev, { type: 'remove_overlay', payload: nearest }])
  }

  const svgCoords = (e) => {
    const svg = svgRef.current
    const group = groupRef.current
    if (!svg) return { x: 0, y: 0 }
    const pt = svg.createSVGPoint()
    pt.x = e.clientX
    pt.y = e.clientY
    const ctm = (group || svg).getScreenCTM()
    if (!ctm) return { x: 0, y: 0 }
    const inv = ctm.inverse()
    const p = pt.matrixTransform(inv)
    return { x: p.x, y: p.y }
  }

  const handleSvgClick = (e) => {
    if (!selectedTool) return
    if (selectedTool === 'incisors') {
      setIncisorViewOpen(true)
      const { x, y } = svgCoords(e)
      const type = incisorsMode === 'smile' ? 'incisors_smile' : 'incisors_frown'
      addOverlay(type, x, y)
      return
    }
    if (selectedTool === 'rotate' && incisorViewOpen) {
      const start = svgCoords(e)
      const overlay = overlays.filter(o => o.view === currentView && (o.type === 'incisors_smile' || o.type === 'incisors_frown')).slice(-1)[0]
      if (!overlay) return
      const startX = start.x
      const id = overlay.id
      const moveHandler = (ev) => {
        const p = svgCoords(ev)
        const delta = p.x - startX
        setOverlays(prev => prev.map(o => o.id === id ? { ...o, rotate: (o.rotate || 0) + delta * 0.5 } : o))
      }
      const upHandler = () => {
        window.removeEventListener('mousemove', moveHandler)
        window.removeEventListener('mouseup', upHandler)
      }
      window.addEventListener('mousemove', moveHandler)
      window.addEventListener('mouseup', upHandler)
      return
    }
    if (['arrow', 'circle', 'line', 'atr_etr', 'sharp_edges', 'ramps', 'hooks', 'protuberant', 'waves', 'fracture', 'diastema', 'wolf_tooth', 'caps', 'ulceration', 'tartar'].includes(selectedTool)) {
      const { x, y } = svgCoords(e)
      const existingNear = overlays.some(o => o.type === selectedTool && o.view === currentView && Math.hypot(o.x - x, o.y - y) < 10)
      if (existingNear) {
        removeNearestOverlay(selectedTool, x, y)
      } else {
        addOverlay(selectedTool, x, y)
      }
    }
  }

  const handleSvgMouseDown = (e) => {
    if (!selectedTool) {
      panRef.current.dragging = true
      panRef.current.lastX = e.clientX
      panRef.current.lastY = e.clientY
      return
    }
    if (selectedTool !== 'pencil') return
    const { x, y } = svgCoords(e)
    drawingRef.current.isDrawing = true
    drawingRef.current.pathData = `M ${x} ${y}`
  }

  const handleSvgMouseMove = (e) => {
    if (panRef.current.dragging && !selectedTool) {
      const dx = e.clientX - panRef.current.lastX
      const dy = e.clientY - panRef.current.lastY
      panRef.current.lastX = e.clientX
      panRef.current.lastY = e.clientY
      setPan(prev => ({ x: prev.x + dx, y: prev.y + dy }))
      return
    }
    if (!drawingRef.current.isDrawing || selectedTool !== 'pencil') return
    const { x, y } = svgCoords(e)
    drawingRef.current.pathData += ` L ${x} ${y}`
    setOverlays(prev => {
      const last = prev[prev.length - 1]
      if (!last || last.type !== 'pencil_temp') {
        const id = `pencil_${Date.now()}`
        return [...prev, { id, type: 'pencil_temp', d: drawingRef.current.pathData, color: currentColor, view: currentView }]
      }
      const arr = [...prev]
      arr[arr.length - 1] = { ...last, d: drawingRef.current.pathData }
      return arr
    })
  }

  const handleSvgMouseUp = () => {
    if (panRef.current.dragging && !selectedTool) {
      panRef.current.dragging = false
      return
    }
    if (!drawingRef.current.isDrawing || selectedTool !== 'pencil') return
    drawingRef.current.isDrawing = false
    setOverlays(prev => {
      const last = prev[prev.length - 1]
      if (!last || last.type !== 'pencil_temp') return prev
      const final = { ...last, type: 'pencil', id: `pencil_${Date.now()}` }
      const arr = [...prev]
      arr[arr.length - 1] = final
      return arr
    })
    setHistory(prev => [...prev, { type: 'draw_path', color: currentColor, view: currentView }])
  }

  const handleSvgWheel = (e) => {
    e.preventDefault()
    const delta = e.deltaY
    setZoom(prev => {
      const next = delta > 0 ? prev * 0.9 : prev * 1.1
      return Math.max(0.5, Math.min(3, next))
    })
  }

  const handleOverlayMouseDown = (e, id) => {
    if (selectedTool !== 'move') return
    const start = svgCoords(e)
    const target = overlays.find(o => o.id === id)
    if (!target) return
    const moveHandler = (ev) => {
      const p = svgCoords(ev)
      const dx = p.x - start.x
      const dy = p.y - start.y
      start.x = p.x
      start.y = p.y
      setOverlays(prev => prev.map(o => o.id === id ? { ...o, x: o.x + dx, y: o.y + dy } : o))
    }
    const upHandler = () => {
      window.removeEventListener('mousemove', moveHandler)
      window.removeEventListener('mouseup', upHandler)
      setHistory(prev => [...prev, { type: 'move_overlay', id }])
    }
    window.addEventListener('mousemove', moveHandler)
    window.addEventListener('mouseup', upHandler)
  }

  const undo = () => {
    const last = history[history.length - 1]
    if (!last) return
    const rest = history.slice(0, -1)
    setHistory(rest)
    if (last.type === 'add_overlay') {
      setOverlays(prev => prev.filter(o => o.id !== last.payload.id))
    } else if (last.type === 'remove_overlay') {
      setOverlays(prev => [...prev, last.payload])
    } else if (last.type === 'draw_path') {
      const idx = overlays.findIndex(o => o.type === 'pencil')
      if (idx !== -1) setOverlays(prev => prev.slice(0, idx).concat(prev.slice(idx + 1)))
    } else if (last.type === 'paint') {
      const key = `${last.view}_${last.pathId}`
      setPaintedTeeth(prev => {
        const n = { ...prev }
        delete n[key]
        return n
      })
    } else if (last.type === 'clear') {
      setOverlays([])
      setPaintedTeeth({})
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Odontograma Interativo
        </h3>
        <p className="text-gray-600">
          Clique nos dentes para marcar condições dentais usando as ferramentas abaixo
        </p>
      </div>

      {/* Odontogram Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Carta Dental</span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateView('prev')}
                disabled={currentView === 'esquerda'}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm font-medium capitalize">
                {viewLabels[currentView]}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateView('next')}
                disabled={currentView === 'direita'}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Navigation Buttons */}
          <div className="flex justify-center mb-4 space-x-2">
            <Button
              variant={currentView === 'esquerda' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setView('esquerda')}
            >
              Esquerda
            </Button>
            <Button
              variant={currentView === 'centro' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setView('centro')}
            >
              Centro
            </Button>
            <Button
              variant={currentView === 'direita' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setView('direita')}
            >
              Direita
            </Button>
          </div>

          {/* SVG Display */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <div className="relative">
              {svgContent ? (
                renderInteractiveSvg()
              ) : (
                <div className="flex items-center justify-center h-64 border border-gray-300 bg-white rounded">
                  <p className="text-gray-500">Carregando odontograma...</p>
                </div>
              )}
            </div>
          </div>

          {/* Instructions */}
          <div className="mt-4 text-sm text-gray-600">
            <p>Selecione uma ferramenta e clique nos dentes para pintá-los completamente</p>
            <p className="text-xs mt-1">
              Visualização atual: <span className="font-medium capitalize">{viewLabels[currentView]}</span>
            </p>
            <p className="text-xs mt-1 text-blue-600">
              💡 Clique diretamente no dente para preenchê-lo com a cor da ferramenta selecionada
            </p>
          </div>
        </CardContent>
      </Card>

      <EditingToolbar
        currentTool={selectedTool}
        currentColor={currentColor}
        onSelectTool={setSelectedTool}
        onSelectColor={setCurrentColor}
        onUndo={undo}
        onClear={clearOdontogram}
        incisorViewOpen={incisorViewOpen}
        onToggleIncisorView={() => setIncisorViewOpen(v => !v)}
        onSelectIncisorsMode={setIncisorsMode}
      />

      {/* Summary */}
      {(Object.keys(markedTeeth).length > 0 || Object.keys(paintedTeeth).length > 0) && (
        <Card>
          <CardHeader>
            <CardTitle>Resumo das Condições</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(conditionCounts).map(([condition, count]) => {
                const tool = tools.find(t => t.id === condition)
                return (
                  <div key={condition} className="flex items-center gap-2">
                    <div
                      className="w-4 h-4 rounded border border-gray-400"
                      style={{ backgroundColor: tool?.color }}
                    />
                    <span className="text-sm">
                      {tool?.name}: <span className="font-medium">{count}</span>
                    </span>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Completion Status */}
      {(Object.keys(markedTeeth).length > 0 || Object.keys(paintedTeeth).length > 0) && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 bg-green-500 text-white rounded-full">
                ✓
              </div>
              <div>
                <h4 className="font-semibold text-green-900">Odontograma Preenchido</h4>
                <p className="text-green-700">
                  {Object.keys(markedTeeth).length + Object.keys(paintedTeeth).length} dente(s) avaliado(s)
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
