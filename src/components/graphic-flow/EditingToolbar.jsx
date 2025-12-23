import React, { useState, useRef } from 'react'
import { Button } from '../ui/Button'
import { Pencil, Eraser, PaintBucket, Move, Zap, RotateCcw, Calendar, FileText, Paperclip, LogOut } from 'lucide-react'

const IconTriangle = ({ className }) => (
    <svg width="16" height="16" viewBox="0 0 16 16" className={className}>
        <polygon points="8,3 14,13 2,13" fill="currentColor" />
    </svg>
)

const IconHooks = ({ className }) => (
    <svg width="16" height="16" viewBox="0 0 16 16" className={className}>
        <path d="M12 4 Q6 8 12 12" stroke="currentColor" strokeWidth="2" fill="none" />
    </svg>
)

const IconRamps = ({ className }) => (
    <svg width="16" height="16" viewBox="0 0 16 16" className={className}>
        <polygon points="3,12 13,12 8,5" fill="currentColor" />
    </svg>
)

const IconProtuberant = ({ className }) => (
    <svg width="16" height="16" viewBox="0 0 16 16" className={className}>
        <rect x="3" y="6" width="10" height="4" fill="currentColor" />
    </svg>
)

const IconWaves = ({ className }) => (
    <svg width="16" height="16" viewBox="0 0 16 16" className={className}>
        <path d="M2 8 Q6 4 10 8 Q14 12 18 8" stroke="currentColor" strokeWidth="2" fill="none" />
    </svg>
)

const IconATR = ({ className }) => (
    <svg width="16" height="16" viewBox="0 0 16 16" className={className}>
        <path d="M2 12 H14 L12 6 H4 Z" fill="currentColor" />
    </svg>
)

const IconSmile = ({ className }) => (
    <svg width="16" height="16" viewBox="0 0 16 16" className={className}>
        <path d="M3 8 Q8 12 13 8" stroke="currentColor" strokeWidth="2" fill="none" />
    </svg>
)

const IconDiastema = ({ className }) => (
    <svg width="16" height="16" viewBox="0 0 16 16" className={className}>
        <line x1="8" y1="3" x2="8" y2="13" stroke="currentColor" strokeWidth="2" />
        <line x1="5" y1="3" x2="11" y2="3" stroke="currentColor" strokeWidth="2" />
        <line x1="5" y1="13" x2="11" y2="13" stroke="currentColor" strokeWidth="2" />
    </svg>
)

const IconCircleText = ({ text, className }) => (
    <svg width="16" height="16" viewBox="0 0 16 16" className={className}>
        <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="2" fill="none" />
        <text x="8" y="10" textAnchor="middle" fontSize="9" fill="currentColor" fontWeight="bold">{text}</text>
    </svg>
)

const COLORS = ['#000000', '#FF0000', '#0066CC', '#00A86B', '#FF9500', '#8E44AD', '#FFFFFF']

export default function EditingToolbar({ currentTool, currentColor, onSelectTool, onSelectColor, onUndo, onClear, onToggleIncisorView, incisorViewOpen, onSelectIncisorsMode }) {
    const [paletteFor, setPaletteFor] = useState(null)
    const timerRef = useRef(null)

    const handlePress = (tool) => {
        clearTimeout(timerRef.current)
        timerRef.current = setTimeout(() => {
            setPaletteFor(tool)
        }, 500)
    }

    const handleRelease = (tool) => {
        if (timerRef.current) {
            clearTimeout(timerRef.current)
            timerRef.current = null
            if (paletteFor !== tool) {
                onSelectTool(tool)
            }
        }
    }

    const ToolButton = ({ tool, icon, label, active, hasOptions, activeColor }) => (
        <div className="relative group flex flex-col items-center">
            <Button
                variant="ghost"
                size="icon"
                className={`h-12 w-12 rounded-xl transition-colors ${active 
                    ? 'bg-white/90 text-black ring-2 ring-blue-500 shadow-lg' 
                    : 'bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white'}`
                }
                onMouseDown={() => hasOptions && handlePress(tool)}
                onMouseUp={() => hasOptions && handleRelease(tool)}
                onMouseLeave={() => setPaletteFor(null)}
                onTouchStart={() => hasOptions && handlePress(tool)}
                onTouchEnd={() => hasOptions && handleRelease(tool)}
                onClick={() => !hasOptions && onSelectTool(tool)}
                title={label}
            >
                {icon}
            </Button>
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-black/80 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 sm:block hidden">
                {label}
            </div>
            <div className="mt-1 text-[10px] leading-none text-white/70 text-center sm:hidden">
                {label}
            </div>
            {active && activeColor && (
                <div
                    className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full border border-white/70 shadow"
                    style={{ backgroundColor: activeColor }}
                />
            )}
            {paletteFor === tool && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 p-2 rounded-2xl border border-white/10 bg-neutral-900/95 backdrop-blur-xl shadow-2xl z-50">
                    {tool === 'incisors' ? (
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" className="text-xs h-7" onClick={() => { onSelectIncisorsMode('smile'); setPaletteFor(null) }}>Sorriso</Button>
                            <Button variant="outline" size="sm" className="text-xs h-7" onClick={() => { onSelectIncisorsMode('frown'); setPaletteFor(null) }}>Franzir</Button>
                        </div>
                    ) : tool === 'sharp_edges' ? (
                        <div className="flex gap-1">
                            {['#000000', '#FF0000'].map(c => (
                                <button
                                    key={c}
                                    onClick={() => { onSelectColor(c); setPaletteFor(null) }}
                                    className="w-6 h-6 rounded border border-white/20 hover:scale-110 transition-transform"
                                    style={{ backgroundColor: c }}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-7 gap-1">
                            {COLORS.map(c => (
                                <button
                                    key={c}
                                    onClick={() => { onSelectColor(c); setPaletteFor(null) }}
                                    className="w-6 h-6 rounded border border-white/20 hover:scale-110 transition-transform"
                                    style={{ backgroundColor: c }}
                                />
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    )

    const Divider = () => <div className="w-px h-10 bg-white/10 mx-2" />

    return (
        <div className="w-full flex justify-center py-4">
            <div className="flex flex-wrap items-center gap-2 p-4 rounded-3xl bg-gradient-to-br from-neutral-900/90 to-neutral-800/90 backdrop-blur-xl ring-1 ring-white/10 shadow-2xl overflow-x-auto max-w-full min-w-0">

                {/* Group 1: Drawing Tools */}
                <div className="flex items-center gap-2">
                    <ToolButton tool="pencil" active={currentTool === 'pencil'} icon={<Pencil className="h-5 w-5" />} label="Lápis" hasOptions activeColor={currentColor} />
                    <ToolButton tool="eraser" active={currentTool === 'eraser'} icon={<Eraser className="h-5 w-5" />} label="Borracha" activeColor={currentColor} />
                    <ToolButton tool="fill" active={currentTool === 'fill'} icon={<PaintBucket className="h-5 w-5" />} label="Preencher" hasOptions activeColor={currentColor} />
                </div>

                <Divider />

                {/* Group 2: Tooth Specific Tools */}
                <div className="flex items-center gap-2">
                    <ToolButton tool="atr_etr" active={currentTool === 'atr_etr'} icon={<IconATR className="h-5 w-5" />} label="ATR/ETR" activeColor={currentColor} />
                    <ToolButton tool="sharp_edges" active={currentTool === 'sharp_edges'} icon={<IconTriangle className="h-5 w-5" />} label="Bordas Afiadas" hasOptions activeColor={currentColor} />
                    <ToolButton tool="ramps" active={currentTool === 'ramps'} icon={<IconRamps className="h-5 w-5" />} label="Rampas" activeColor={currentColor} />
                    <ToolButton tool="hooks" active={currentTool === 'hooks'} icon={<IconHooks className="h-5 w-5" />} label="Ganchos" activeColor={currentColor} />
                    <ToolButton tool="protuberant" active={currentTool === 'protuberant'} icon={<IconProtuberant className="h-5 w-5" />} label="Protuberante" activeColor={currentColor} />
                    <ToolButton tool="waves" active={currentTool === 'waves'} icon={<IconWaves className="h-5 w-5" />} label="Ondas" activeColor={currentColor} />
                    <ToolButton tool="incisors" active={currentTool === 'incisors'} icon={<IconSmile className="h-5 w-5" />} label="Incisivos" hasOptions activeColor={currentColor} />
                    <ToolButton tool="move" active={currentTool === 'move'} icon={<Move className="h-5 w-5" />} label="Mover" activeColor={currentColor} />
                    <ToolButton tool="fracture" active={currentTool === 'fracture'} icon={<Zap className="h-5 w-5" />} label="Fratura" activeColor={currentColor} />
                    {incisorViewOpen && (
                        <ToolButton tool="rotate" active={currentTool === 'rotate'} icon={<RotateCcw className="h-5 w-5" />} label="Girar" activeColor={currentColor} />
                    )}
                </div>

                <Divider />

                {/* Group 3: Drop Icons */}
                <div className="flex items-center gap-2">
                    <ToolButton tool="diastema" active={currentTool === 'diastema'} icon={<IconDiastema className="h-5 w-5" />} label="Diastema" activeColor={currentColor} />
                    <ToolButton tool="wolf_tooth" active={currentTool === 'wolf_tooth'} icon={<IconCircleText text="V" className="h-5 w-5" />} label="Wolf tooth" activeColor={currentColor} />
                    <ToolButton tool="caps" active={currentTool === 'caps'} icon={<IconCircleText text="C" className="h-5 w-5" />} label="Caps" activeColor={currentColor} />
                    <ToolButton tool="ulceration" active={currentTool === 'ulceration'} icon={<IconCircleText text="U" className="h-5 w-5" />} label="Ulceration" activeColor={currentColor} />
                    <ToolButton tool="tartar" active={currentTool === 'tartar'} icon={<IconCircleText text="T" className="h-5 w-5" />} label="Tartar" activeColor={currentColor} />
                </div>

                <Divider />

                {/* Group 4: Options */}
                <div className="flex items-center gap-2">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-12 w-12 rounded-xl bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white"
                        onClick={onToggleIncisorView}
                        title={incisorViewOpen ? "Fechar Incisivos" : "Abrir Incisivos"}
                    >
                        <IconSmile className="h-5 w-5" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-12 w-12 rounded-xl bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white"
                        onClick={onClear}
                        title="Limpar Gráfico"
                    >
                        <Eraser className="h-5 w-5" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-12 w-12 rounded-xl bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white"
                        onClick={onUndo}
                        title="Desfazer"
                    >
                        <RotateCcw className="h-5 w-5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-12 w-12 rounded-xl bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white" title="Data">
                        <Calendar className="h-5 w-5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-12 w-12 rounded-xl bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white" title="Gráficos Anteriores">
                        <FileText className="h-5 w-5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-12 w-12 rounded-xl bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white" title="Adicionar Anexo">
                        <Paperclip className="h-5 w-5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-12 w-12 rounded-xl bg-white/5 text-gray-300 hover:text-red-400 hover:bg-red-900/20" title="Fechar">
                        <LogOut className="h-5 w-5" />
                    </Button>
                </div>

            </div>
        </div>
    )
}
