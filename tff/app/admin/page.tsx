'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../lib/supabase'

type Make = { id: number; name: string }
type Model = { id: number; name: string; make_id: number; fit_type: string; notes: string }
type Footprint = { id: number; name: string; description: string }
type Optic = { id: number; name: string; manufacturer: string; msrp: number; affiliate_url: string; notes: string }
type Plate = { id: number; model_id: number; name: string; footprint_id: number; purchase_url: string; notes: string }

const ALL_EXPORT_TABLES = ['makes', 'models', 'footprints', 'optics', 'plates', 'model_footprints', 'optic_footprints']

export default function AdminPage() {
  const router = useRouter()

  const [makes, setMakes] = useState<Make[]>([])
  const [models, setModels] = useState<Model[]>([])
  const [footprints, setFootprints] = useState<Footprint[]>([])
  const [optics, setOptics] = useState<Optic[]>([])
  const [plates, setPlates] = useState<Plate[]>([])
  const [activeTab, setActiveTab] = useState('makes')
  const [message, setMessage] = useState({ text: '', type: 'success' })

  const [newMake, setNewMake] = useState('')
  const [newModel, setNewModel] = useState({ name: '', make_id: '', fit_type: 'single', notes: '', footprint_ids: [] as string[] })
  const [newFootprint, setNewFootprint] = useState({ name: '', description: '' })
  const [newOptic, setNewOptic] = useState({ name: '', manufacturer: '', footprint_id: '', msrp: '', affiliate_url: '', notes: '' })
  const [newPlate, setNewPlate] = useState({ make_id: '', model_id: '', name: '', footprint_id: '', purchase_url: '', notes: '' })

  const [editingMake, setEditingMake] = useState<{ id: number; name: string } | null>(null)
  const [editingModel, setEditingModel] = useState<{ id: number; name: string; make_id: number; fit_type: string; notes: string } | null>(null)
  const [editingFootprint, setEditingFootprint] = useState<{ id: number; name: string; description: string } | null>(null)
  const [editingOptic, setEditingOptic] = useState<{ id: number; name: string; manufacturer: string; msrp: string; affiliate_url: string; notes: string } | null>(null)
  const [editingPlate, setEditingPlate] = useState<{ id: number; model_id: number; name: string; footprint_id: number; purchase_url: string; notes: string } | null>(null)

  const [plateModels, setPlateModels] = useState<Model[]>([])
  const [exportTables, setExportTables] = useState<string[]>([])
  const [exporting, setExporting] = useState(false)

  const refreshMakes = () => supabase.from('makes').select('*').order('name').then(({ data }) => { if (data) setMakes(data) })
  const refreshModels = () => supabase.from('models').select('*').order('name').then(({ data }) => { if (data) setModels(data) })
  const refreshFootprints = () => supabase.from('footprints').select('*').order('name').then(({ data }) => { if (data) setFootprints(data) })
  const refreshOptics = () => supabase.from('optics').select('*').order('name').then(({ data }) => { if (data) setOptics(data) })
  const refreshPlates = () => supabase.from('plates').select('*').order('name').then(({ data }) => { if (data) setPlates(data) })

  useEffect(() => {
    refreshMakes(); refreshModels(); refreshFootprints(); refreshOptics(); refreshPlates()
  }, [])

  useEffect(() => {
    if (!newPlate.make_id) { setPlateModels([]); return }
    setPlateModels(models.filter(m => m.make_id === Number(newPlate.make_id)))
  }, [newPlate.make_id, models])

  const showMessage = (text: string, type = 'success') => {
    setMessage({ text, type })
    setTimeout(() => setMessage({ text: '', type: 'success' }), 3000)
  }

  const post = async (table: string, data: object) => {
    const res = await fetch('/api/admin/data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ table, data })
    })
    const json = await res.json()
    if (!res.ok) { showMessage('Error: ' + json.error, 'error'); return null }
    return json
  }

  const patch = async (table: string, id: number, data: object) => {
    const res = await fetch('/api/admin/data', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ table, id, data })
    })
    if (!res.ok) { showMessage('Error updating record', 'error'); return false }
    return true
  }

  const destroy = async (table: string, id: number, warning?: string) => {
    if (!confirm(warning || 'Delete this record?')) return false
    const res = await fetch('/api/admin/data', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ table, id })
    })
    if (!res.ok) { showMessage('Error deleting record', 'error'); return false }
    return true
  }

  const logout = async () => {
    await fetch('/api/admin/login', { method: 'DELETE' })
    router.push('/admin/login')
  }

  const toggleExportTable = (table: string) => {
    setExportTables(prev =>
      prev.includes(table) ? prev.filter(t => t !== table) : [...prev, table]
    )
  }

  const toggleAllExport = () => {
    setExportTables(prev => prev.length === ALL_EXPORT_TABLES.length ? [] : [...ALL_EXPORT_TABLES])
  }

  const exportCSV = async () => {
    if (exportTables.length === 0) { showMessage('Select at least one table to export', 'error'); return }
    setExporting(true)
    for (const table of exportTables) {
      const { data } = await supabase.from(table).select('*')
      if (!data || data.length === 0) continue
      const headers = Object.keys(data[0])
      const rows = data.map(row => headers.map(h => {
        const val = row[h]
        if (val === null || val === undefined) return ''
        const str = String(val)
        return str.includes(',') || str.includes('"') || str.includes('\n')
          ? `"${str.replace(/"/g, '""')}"` : str
      }).join(','))
      const csv = [headers.join(','), ...rows].join('\n')
      const blob = new Blob([csv], { type: 'text/csv' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${table}.csv`
      a.click()
      URL.revokeObjectURL(url)
    }
    setExporting(false)
    showMessage(`Exported ${exportTables.length} table${exportTables.length > 1 ? 's' : ''}`)
  }

  // --- MAKES ---
  const addMake = async () => {
    if (!newMake.trim()) return
    const ok = await post('makes', { name: newMake.trim() })
    if (!ok) return
    showMessage('Make added successfully')
    setNewMake('')
    refreshMakes()
  }

  const saveMake = async () => {
    if (!editingMake || !editingMake.name.trim()) return
    const ok = await patch('makes', editingMake.id, { name: editingMake.name.trim() })
    if (!ok) return
    showMessage('Make updated')
    setEditingMake(null)
    refreshMakes()
  }

  const deleteMake = async (id: number) => {
    const ok = await destroy('makes', id, 'Delete this manufacturer? This will affect all linked models.')
    if (!ok) return
    showMessage('Make deleted')
    refreshMakes()
  }

  // --- MODELS ---
  const addModel = async () => {
    if (!newModel.name.trim() || !newModel.make_id) return
    if (newModel.fit_type === 'single' && newModel.footprint_ids.length === 0) {
      showMessage('Please select a footprint', 'error'); return
    }
    if (newModel.fit_type === 'multi' && newModel.footprint_ids.length < 2) {
      showMessage('Please select at least 2 footprints for a multi-cut model', 'error'); return
    }

    const res = await fetch('/api/admin/data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        table: 'models',
        data: {
          name: newModel.name.trim(),
          make_id: Number(newModel.make_id),
          fit_type: newModel.fit_type,
          notes: newModel.notes.trim() || null
        },
        returning: true
      })
    })

    const json = await res.json()
    if (!res.ok) { showMessage('Error: ' + json.error, 'error'); return }

    if (newModel.fit_type !== 'plate_based' && newModel.footprint_ids.length > 0) {
      for (const fid of newModel.footprint_ids) {
        await post('model_footprints', { model_id: json.id, footprint_id: Number(fid) })
      }
    }

    showMessage('Model added successfully')
    setNewModel({ name: '', make_id: '', fit_type: 'single', notes: '', footprint_ids: [] })
    refreshModels()
  }

  const saveModel = async () => {
    if (!editingModel || !editingModel.name.trim()) return
    const ok = await patch('models', editingModel.id, {
      name: editingModel.name.trim(),
      make_id: editingModel.make_id,
      fit_type: editingModel.fit_type,
      notes: editingModel.notes.trim() || null
    })
    if (!ok) return
    showMessage('Model updated')
    setEditingModel(null)
    refreshModels()
  }

  const deleteModel = async (id: number) => {
    const ok = await destroy('models', id, 'Delete this model? This will affect all linked footprints and plates.')
    if (!ok) return
    showMessage('Model deleted')
    refreshModels()
  }

  const toggleFootprint = (id: string) => {
    setNewModel(prev => {
      const already = prev.footprint_ids.includes(id)
      if (prev.fit_type === 'single') {
        return { ...prev, footprint_ids: already ? [] : [id] }
      }
      return {
        ...prev,
        footprint_ids: already
          ? prev.footprint_ids.filter(f => f !== id)
          : [...prev.footprint_ids, id]
      }
    })
  }

  // --- FOOTPRINTS ---
  const addFootprint = async () => {
    if (!newFootprint.name.trim()) return
    const ok = await post('footprints', {
      name: newFootprint.name.trim(),
      description: newFootprint.description.trim() || null
    })
    if (!ok) return
    showMessage('Footprint added successfully')
    setNewFootprint({ name: '', description: '' })
    refreshFootprints()
  }

  const saveFootprint = async () => {
    if (!editingFootprint || !editingFootprint.name.trim()) return
    const ok = await patch('footprints', editingFootprint.id, {
      name: editingFootprint.name.trim(),
      description: editingFootprint.description.trim() || null
    })
    if (!ok) return
    showMessage('Footprint updated')
    setEditingFootprint(null)
    refreshFootprints()
  }

  const deleteFootprint = async (id: number) => {
    const ok = await destroy('footprints', id, 'Delete this footprint? This may affect linked models and optics.')
    if (!ok) return
    showMessage('Footprint deleted')
    refreshFootprints()
  }

  // --- OPTICS ---
  const addOptic = async () => {
    if (!newOptic.name.trim() || !newOptic.manufacturer.trim() || !newOptic.footprint_id) {
      showMessage('Name, manufacturer and footprint are required', 'error'); return
    }

    const res = await fetch('/api/admin/data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        table: 'optics',
        data: {
          name: newOptic.name.trim(),
          manufacturer: newOptic.manufacturer.trim(),
          msrp: newOptic.msrp ? Number(newOptic.msrp) : null,
          notes: newOptic.notes.trim() || null,
          affiliate_url: newOptic.affiliate_url.trim() || null
        },
        returning: true
      })
    })

    const json = await res.json()
    if (!res.ok) { showMessage('Error: ' + json.error, 'error'); return }

    await post('optic_footprints', {
      optic_id: json.id,
      footprint_id: Number(newOptic.footprint_id)
    })

    showMessage('Optic added successfully')
    setNewOptic({ name: '', manufacturer: '', footprint_id: '', msrp: '', affiliate_url: '', notes: '' })
    refreshOptics()
  }

  const saveOptic = async () => {
    if (!editingOptic || !editingOptic.name.trim() || !editingOptic.manufacturer.trim()) return
    const ok = await patch('optics', editingOptic.id, {
      name: editingOptic.name.trim(),
      manufacturer: editingOptic.manufacturer.trim(),
      msrp: editingOptic.msrp ? Number(editingOptic.msrp) : null,
      affiliate_url: editingOptic.affiliate_url.trim() || null,
      notes: editingOptic.notes.trim() || null
    })
    if (!ok) return
    showMessage('Optic updated')
    setEditingOptic(null)
    refreshOptics()
  }

  const deleteOptic = async (id: number) => {
    const ok = await destroy('optics', id, 'Delete this optic? This will remove all its footprint links too.')
    if (!ok) return
    showMessage('Optic deleted')
    refreshOptics()
  }

  // --- PLATES ---
  const addPlate = async () => {
    if (!newPlate.model_id || !newPlate.name.trim() || !newPlate.footprint_id) {
      showMessage('Model, plate name and footprint are required', 'error'); return
    }
    const ok = await post('plates', {
      model_id: Number(newPlate.model_id),
      name: newPlate.name.trim(),
      footprint_id: Number(newPlate.footprint_id),
      purchase_url: newPlate.purchase_url.trim() || null,
      notes: newPlate.notes.trim() || null
    })
    if (!ok) return
    showMessage('Plate added successfully')
    setNewPlate({ make_id: '', model_id: '', name: '', footprint_id: '', purchase_url: '', notes: '' })
    refreshPlates()
  }

  const savePlate = async () => {
    if (!editingPlate || !editingPlate.name.trim()) return
    const ok = await patch('plates', editingPlate.id, {
      name: editingPlate.name.trim(),
      model_id: editingPlate.model_id,
      footprint_id: editingPlate.footprint_id,
      purchase_url: editingPlate.purchase_url.trim() || null,
      notes: editingPlate.notes.trim() || null
    })
    if (!ok) return
    showMessage('Plate updated')
    setEditingPlate(null)
    refreshPlates()
  }

  const deletePlate = async (id: number) => {
    const ok = await destroy('plates', id, 'Delete this plate?')
    if (!ok) return
    showMessage('Plate deleted')
    refreshPlates()
  }

  const getMakeName = (id: number) => makes.find(m => m.id === id)?.name || '—'
  const getFootprintName = (id: number) => footprints.find(f => f.id === id)?.name || '—'
  const getModelName = (id: number) => models.find(m => m.id === id)?.name || '—'

  const tabs = ['makes', 'models', 'footprints', 'optics', 'plates']

  // Dark theme classes
  const inputClass = "bg-[#1c2128] border border-[#30363d] rounded p-2 w-full text-[#e6edf3] placeholder-[#484f58] focus:outline-none focus:border-[#58a6ff] transition-colors"
  const selectClass = "bg-[#1c2128] border border-[#30363d] rounded p-2 w-full text-[#e6edf3] focus:outline-none focus:border-[#58a6ff] transition-colors"
  const btnClass = "bg-[#238636] text-white rounded p-2 w-full font-medium hover:bg-[#2ea043] transition-colors font-[family-name:var(--font-syne)]"
  const editBtnClass = "text-sm px-3 py-1 rounded bg-[#21262d] text-[#c9d1d9] hover:bg-[#30363d] border border-[#30363d] transition-colors"
  const deleteBtnClass = "text-sm px-3 py-1 rounded bg-transparent text-[#f85149] hover:bg-[#21262d] border border-[#f85149]/30 transition-colors"
  const cardClass = "border border-[#30363d] rounded p-3 bg-[#161b22]"

  return (
    <div className="min-h-screen flex bg-[#0d1117] text-[#e6edf3] font-[family-name:var(--font-dm-sans)]">

      {/* SIDEBAR */}
      <aside className="w-56 shrink-0 border-r border-[#21262d] bg-[#0d1117] p-6 flex flex-col gap-8">
        <div>
          <div className="text-xs font-semibold uppercase tracking-widest text-[#484f58] mb-4 font-[family-name:var(--font-syne)]">
            TFF Admin
          </div>
          <button
            onClick={logout}
            className="w-full text-left text-sm px-3 py-2 rounded hover:bg-[#21262d] transition-colors text-[#f85149] font-medium"
          >
            Log out
          </button>
        </div>

        <div>
          <div className="text-xs font-semibold uppercase tracking-widest text-[#484f58] mb-3 font-[family-name:var(--font-syne)]">
            Export CSV
          </div>
          <div className="grid gap-1 mb-3">
            <label className="flex items-center gap-2 text-sm cursor-pointer py-1 text-[#8b949e] hover:text-[#e6edf3] transition-colors">
              <input
                type="checkbox"
                checked={exportTables.length === ALL_EXPORT_TABLES.length}
                onChange={toggleAllExport}
                className="rounded accent-[#58a6ff]"
              />
              <span className="font-medium text-[#c9d1d9]">All tables</span>
            </label>
            <div className="border-t border-[#21262d] my-1" />
            {ALL_EXPORT_TABLES.map(table => (
              <label key={table} className="flex items-center gap-2 text-sm cursor-pointer py-1 text-[#8b949e] hover:text-[#e6edf3] transition-colors">
                <input
                  type="checkbox"
                  checked={exportTables.includes(table)}
                  onChange={() => toggleExportTable(table)}
                  className="rounded accent-[#58a6ff]"
                />
                {table}
              </label>
            ))}
          </div>
          <button
            onClick={exportCSV}
            disabled={exporting || exportTables.length === 0}
            className="w-full text-sm bg-[#21262d] text-[#c9d1d9] border border-[#30363d] rounded p-2 font-medium hover:bg-[#30363d] transition-colors disabled:opacity-40"
          >
            {exporting ? 'Exporting...' : 'Export'}
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 p-8 max-w-2xl">
        <h1 className="text-2xl font-bold mb-6 font-[family-name:var(--font-syne)] text-[#e6edf3]">
          Admin Dashboard
        </h1>

        {message.text && (
          <div className={`rounded p-3 mb-6 text-sm border ${message.type === 'error'
            ? 'bg-[#ff000015] text-[#f85149] border-[#f85149]/30'
            : 'bg-[#23863615] text-[#3fb950] border-[#238636]/30'}`}>
            {message.text}
          </div>
        )}

        <div className="flex gap-2 mb-6 flex-wrap">
          {tabs.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1 rounded text-sm font-medium capitalize transition-colors font-[family-name:var(--font-syne)] ${activeTab === tab
                ? 'bg-[#21262d] text-[#e6edf3] border border-[#58a6ff]'
                : 'bg-[#161b22] text-[#8b949e] border border-[#30363d] hover:text-[#e6edf3] hover:border-[#484f58]'}`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* MAKES */}
        {activeTab === 'makes' && (
          <div className="grid gap-6">
            <div className="grid gap-3">
              <h2 className="font-semibold font-[family-name:var(--font-syne)] text-[#e6edf3]">Add Manufacturer</h2>
              <input className={inputClass} placeholder="e.g. Walther" value={newMake} onChange={e => setNewMake(e.target.value)} />
              <button onClick={addMake} className={btnClass}>Add Make</button>
            </div>
            <div>
              <h2 className="font-semibold mb-3 font-[family-name:var(--font-syne)] text-[#e6edf3]">Existing Manufacturers</h2>
              {makes.length === 0 ? <p className="text-sm text-[#484f58]">No manufacturers added yet.</p> : (
                <div className="grid gap-2">
                  {makes.map(m => (
                    <div key={m.id} className={cardClass}>
                      {editingMake?.id === m.id ? (
                        <div className="grid gap-2">
                          <input className={inputClass} value={editingMake.name} onChange={e => setEditingMake({ ...editingMake, name: e.target.value })} />
                          <div className="flex gap-2">
                            <button onClick={saveMake} className="flex-1 bg-[#238636] text-white rounded p-2 text-sm hover:bg-[#2ea043] transition-colors">Save</button>
                            <button onClick={() => setEditingMake(null)} className="flex-1 bg-[#21262d] text-[#c9d1d9] rounded p-2 text-sm hover:bg-[#30363d] transition-colors">Cancel</button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between gap-4">
                          <div className="font-medium text-[#e6edf3]">{m.name}</div>
                          <div className="flex gap-2 shrink-0">
                            <button onClick={() => setEditingMake({ id: m.id, name: m.name })} className={editBtnClass}>Edit</button>
                            <button onClick={() => deleteMake(m.id)} className={deleteBtnClass}>Delete</button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* MODELS */}
        {activeTab === 'models' && (
          <div className="grid gap-6">
            <div className="grid gap-3">
              <h2 className="font-semibold font-[family-name:var(--font-syne)] text-[#e6edf3]">Add Model</h2>
              <select className={selectClass} value={newModel.make_id} onChange={e => setNewModel({ ...newModel, make_id: e.target.value })}>
                <option value="" disabled>Select manufacturer...</option>
                {makes.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
              </select>
              <input className={inputClass} placeholder="Model name e.g. M&P 9 2.0" value={newModel.name} onChange={e => setNewModel({ ...newModel, name: e.target.value })} />
              <div>
                <label className="block text-sm font-medium mb-1 text-[#8b949e]">Fit Type</label>
                <select className={selectClass} value={newModel.fit_type} onChange={e => setNewModel({ ...newModel, fit_type: e.target.value, footprint_ids: [] })}>
                  <option value="single">Single — one footprint cut</option>
                  <option value="multi">Multi — multiple cuts milled in</option>
                  <option value="plate_based">Plate-based — ships with adapter plates</option>
                </select>
              </div>
              {newModel.fit_type === 'single' && (
                <div>
                  <label className="block text-sm font-medium mb-1 text-[#8b949e]">Footprint</label>
                  <div className="grid gap-1">
                    {footprints.map(f => (
                      <label key={f.id} className={`flex items-center gap-2 p-2 border rounded cursor-pointer transition-colors ${newModel.footprint_ids.includes(String(f.id)) ? 'border-[#58a6ff] bg-[#1c2128]' : 'border-[#30363d] hover:border-[#484f58]'}`}>
                        <input type="radio" name="single_footprint" checked={newModel.footprint_ids.includes(String(f.id))} onChange={() => toggleFootprint(String(f.id))} className="accent-[#58a6ff]" />
                        <span className="text-[#e6edf3]">{f.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
              {newModel.fit_type === 'multi' && (
                <div>
                  <label className="block text-sm font-medium mb-1 text-[#8b949e]">Footprints (select all that apply)</label>
                  <div className="grid gap-1">
                    {footprints.map(f => (
                      <label key={f.id} className={`flex items-center gap-2 p-2 border rounded cursor-pointer transition-colors ${newModel.footprint_ids.includes(String(f.id)) ? 'border-[#58a6ff] bg-[#1c2128]' : 'border-[#30363d] hover:border-[#484f58]'}`}>
                        <input type="checkbox" checked={newModel.footprint_ids.includes(String(f.id))} onChange={() => toggleFootprint(String(f.id))} className="accent-[#58a6ff]" />
                        <span className="text-[#e6edf3]">{f.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
              {newModel.fit_type === 'plate_based' && (
                <p className="text-sm text-[#8b949e] bg-[#161b22] border border-[#30363d] rounded p-3">
                  This model uses adapter plates. After saving, go to the <strong className="text-[#e6edf3]">Plates</strong> tab to add each plate and its footprint.
                </p>
              )}
              <input className={inputClass} placeholder="Notes (optional)" value={newModel.notes} onChange={e => setNewModel({ ...newModel, notes: e.target.value })} />
              <button onClick={addModel} className={btnClass}>Add Model</button>
            </div>
            <div>
              <h2 className="font-semibold mb-3 font-[family-name:var(--font-syne)] text-[#e6edf3]">Existing Models</h2>
              {models.length === 0 ? <p className="text-sm text-[#484f58]">No models added yet.</p> : (
                <div className="grid gap-2">
                  {models.map(m => (
                    <div key={m.id} className={cardClass}>
                      {editingModel?.id === m.id ? (
                        <div className="grid gap-2">
                          <select className={selectClass} value={editingModel.make_id} onChange={e => setEditingModel({ ...editingModel, make_id: Number(e.target.value) })}>
                            {makes.map(mk => <option key={mk.id} value={mk.id}>{mk.name}</option>)}
                          </select>
                          <input className={inputClass} value={editingModel.name} onChange={e => setEditingModel({ ...editingModel, name: e.target.value })} />
                          <select className={selectClass} value={editingModel.fit_type} onChange={e => setEditingModel({ ...editingModel, fit_type: e.target.value })}>
                            <option value="single">Single</option>
                            <option value="multi">Multi</option>
                            <option value="plate_based">Plate-based</option>
                          </select>
                          <input className={inputClass} placeholder="Notes (optional)" value={editingModel.notes || ''} onChange={e => setEditingModel({ ...editingModel, notes: e.target.value })} />
                          <div className="flex gap-2">
                            <button onClick={saveModel} className="flex-1 bg-[#238636] text-white rounded p-2 text-sm hover:bg-[#2ea043] transition-colors">Save</button>
                            <button onClick={() => setEditingModel(null)} className="flex-1 bg-[#21262d] text-[#c9d1d9] rounded p-2 text-sm hover:bg-[#30363d] transition-colors">Cancel</button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <div className="font-medium text-[#e6edf3]">{getMakeName(m.make_id)} {m.name}</div>
                            <div className="text-sm text-[#484f58] mt-0.5 capitalize">{m.fit_type.replace('_', ' ')}</div>
                            {m.notes && <div className="text-sm text-[#484f58] mt-0.5">{m.notes}</div>}
                          </div>
                          <div className="flex gap-2 shrink-0">
                            <button onClick={() => setEditingModel({ id: m.id, name: m.name, make_id: m.make_id, fit_type: m.fit_type, notes: m.notes || '' })} className={editBtnClass}>Edit</button>
                            <button onClick={() => deleteModel(m.id)} className={deleteBtnClass}>Delete</button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* FOOTPRINTS */}
        {activeTab === 'footprints' && (
          <div className="grid gap-6">
            <div className="grid gap-3">
              <h2 className="font-semibold font-[family-name:var(--font-syne)] text-[#e6edf3]">Add Footprint</h2>
              <input className={inputClass} placeholder="Footprint name e.g. RMR" value={newFootprint.name} onChange={e => setNewFootprint({ ...newFootprint, name: e.target.value })} />
              <input className={inputClass} placeholder="Description (optional)" value={newFootprint.description} onChange={e => setNewFootprint({ ...newFootprint, description: e.target.value })} />
              <button onClick={addFootprint} className={btnClass}>Add Footprint</button>
            </div>
            <div>
              <h2 className="font-semibold mb-3 font-[family-name:var(--font-syne)] text-[#e6edf3]">Existing Footprints</h2>
              {footprints.length === 0 ? <p className="text-sm text-[#484f58]">No footprints added yet.</p> : (
                <div className="grid gap-2">
                  {footprints.map(f => (
                    <div key={f.id} className={cardClass}>
                      {editingFootprint?.id === f.id ? (
                        <div className="grid gap-2">
                          <input className={inputClass} value={editingFootprint.name} onChange={e => setEditingFootprint({ ...editingFootprint, name: e.target.value })} />
                          <input className={inputClass} value={editingFootprint.description} onChange={e => setEditingFootprint({ ...editingFootprint, description: e.target.value })} />
                          <div className="flex gap-2">
                            <button onClick={saveFootprint} className="flex-1 bg-[#238636] text-white rounded p-2 text-sm hover:bg-[#2ea043] transition-colors">Save</button>
                            <button onClick={() => setEditingFootprint(null)} className="flex-1 bg-[#21262d] text-[#c9d1d9] rounded p-2 text-sm hover:bg-[#30363d] transition-colors">Cancel</button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <div className="font-medium text-[#e6edf3]">{f.name}</div>
                            {f.description && <div className="text-sm text-[#8b949e] mt-0.5">{f.description}</div>}
                          </div>
                          <div className="flex gap-2 shrink-0">
                            <button onClick={() => setEditingFootprint({ id: f.id, name: f.name, description: f.description || '' })} className={editBtnClass}>Edit</button>
                            <button onClick={() => deleteFootprint(f.id)} className={deleteBtnClass}>Delete</button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* OPTICS */}
        {activeTab === 'optics' && (
          <div className="grid gap-6">
            <div className="grid gap-3">
              <h2 className="font-semibold font-[family-name:var(--font-syne)] text-[#e6edf3]">Add Optic</h2>
              <input className={inputClass} placeholder="Optic name e.g. RMR Type 2" value={newOptic.name} onChange={e => setNewOptic({ ...newOptic, name: e.target.value })} />
              <input className={inputClass} placeholder="Manufacturer" value={newOptic.manufacturer} onChange={e => setNewOptic({ ...newOptic, manufacturer: e.target.value })} />
              <div>
                <label className="block text-sm font-medium mb-1 text-[#8b949e]">Footprint</label>
                <select className={selectClass} value={newOptic.footprint_id} onChange={e => setNewOptic({ ...newOptic, footprint_id: e.target.value })}>
                  <option value="" disabled>Select footprint...</option>
                  {footprints.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                </select>
              </div>
              <input className={inputClass} placeholder="MSRP (optional)" value={newOptic.msrp} onChange={e => setNewOptic({ ...newOptic, msrp: e.target.value })} />
              <input className={inputClass} placeholder="Affiliate URL (optional)" value={newOptic.affiliate_url} onChange={e => setNewOptic({ ...newOptic, affiliate_url: e.target.value })} />
              <input className={inputClass} placeholder="Notes (optional)" value={newOptic.notes} onChange={e => setNewOptic({ ...newOptic, notes: e.target.value })} />
              <button onClick={addOptic} className={btnClass}>Add Optic</button>
            </div>
            <div>
              <h2 className="font-semibold mb-3 font-[family-name:var(--font-syne)] text-[#e6edf3]">Existing Optics</h2>
              {optics.length === 0 ? <p className="text-sm text-[#484f58]">No optics added yet.</p> : (
                <div className="grid gap-2">
                  {optics.map(o => (
                    <div key={o.id} className={cardClass}>
                      {editingOptic?.id === o.id ? (
                        <div className="grid gap-2">
                          <input className={inputClass} value={editingOptic.name} onChange={e => setEditingOptic({ ...editingOptic, name: e.target.value })} />
                          <input className={inputClass} value={editingOptic.manufacturer} onChange={e => setEditingOptic({ ...editingOptic, manufacturer: e.target.value })} />
                          <input className={inputClass} placeholder="MSRP" value={editingOptic.msrp} onChange={e => setEditingOptic({ ...editingOptic, msrp: e.target.value })} />
                          <input className={inputClass} placeholder="Affiliate URL" value={editingOptic.affiliate_url} onChange={e => setEditingOptic({ ...editingOptic, affiliate_url: e.target.value })} />
                          <input className={inputClass} placeholder="Notes" value={editingOptic.notes} onChange={e => setEditingOptic({ ...editingOptic, notes: e.target.value })} />
                          <div className="flex gap-2">
                            <button onClick={saveOptic} className="flex-1 bg-[#238636] text-white rounded p-2 text-sm hover:bg-[#2ea043] transition-colors">Save</button>
                            <button onClick={() => setEditingOptic(null)} className="flex-1 bg-[#21262d] text-[#c9d1d9] rounded p-2 text-sm hover:bg-[#30363d] transition-colors">Cancel</button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <div className="font-medium text-[#e6edf3]">{o.name}</div>
                            <div className="text-sm text-[#8b949e] mt-0.5">{o.manufacturer}</div>
                            {o.msrp && <div className="text-sm text-[#484f58] mt-0.5">${o.msrp}</div>}
                            {o.notes && <div className="text-sm text-[#484f58] mt-0.5">{o.notes}</div>}
                          </div>
                          <div className="flex gap-2 shrink-0">
                            <button onClick={() => setEditingOptic({ id: o.id, name: o.name, manufacturer: o.manufacturer, msrp: o.msrp ? String(o.msrp) : '', affiliate_url: o.affiliate_url || '', notes: o.notes || '' })} className={editBtnClass}>Edit</button>
                            <button onClick={() => deleteOptic(o.id)} className={deleteBtnClass}>Delete</button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* PLATES */}
        {activeTab === 'plates' && (
          <div className="grid gap-6">
            <div className="grid gap-3">
              <h2 className="font-semibold font-[family-name:var(--font-syne)] text-[#e6edf3]">Add Plate</h2>
              <p className="text-sm text-[#8b949e]">For plate-based guns only. Each plate presents one footprint to the optic.</p>
              <select className={selectClass} value={newPlate.make_id} onChange={e => setNewPlate({ ...newPlate, make_id: e.target.value, model_id: '' })}>
                <option value="" disabled>Select manufacturer...</option>
                {makes.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
              </select>
              <select className={selectClass} value={newPlate.model_id} onChange={e => setNewPlate({ ...newPlate, model_id: e.target.value })} disabled={!newPlate.make_id}>
                <option value="" disabled>Select model...</option>
                {plateModels.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
              </select>
              <input className={inputClass} placeholder="Plate name e.g. Plate 1 — RMR" value={newPlate.name} onChange={e => setNewPlate({ ...newPlate, name: e.target.value })} />
              <select className={selectClass} value={newPlate.footprint_id} onChange={e => setNewPlate({ ...newPlate, footprint_id: e.target.value })}>
                <option value="" disabled>Select footprint this plate presents...</option>
                {footprints.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
              </select>
              <input className={inputClass} placeholder="Purchase URL (optional)" value={newPlate.purchase_url} onChange={e => setNewPlate({ ...newPlate, purchase_url: e.target.value })} />
              <input className={inputClass} placeholder="Notes (optional)" value={newPlate.notes} onChange={e => setNewPlate({ ...newPlate, notes: e.target.value })} />
              <button onClick={addPlate} className={btnClass}>Add Plate</button>
            </div>
            <div>
              <h2 className="font-semibold mb-3 font-[family-name:var(--font-syne)] text-[#e6edf3]">Existing Plates</h2>
              {plates.length === 0 ? <p className="text-sm text-[#484f58]">No plates added yet.</p> : (
                <div className="grid gap-2">
                  {plates.map(p => (
                    <div key={p.id} className={cardClass}>
                      {editingPlate?.id === p.id ? (
                        <div className="grid gap-2">
                          <input className={inputClass} value={editingPlate.name} onChange={e => setEditingPlate({ ...editingPlate, name: e.target.value })} />
                          <select className={selectClass} value={editingPlate.footprint_id} onChange={e => setEditingPlate({ ...editingPlate, footprint_id: Number(e.target.value) })}>
                            {footprints.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                          </select>
                          <input className={inputClass} placeholder="Purchase URL" value={editingPlate.purchase_url || ''} onChange={e => setEditingPlate({ ...editingPlate, purchase_url: e.target.value })} />
                          <input className={inputClass} placeholder="Notes" value={editingPlate.notes || ''} onChange={e => setEditingPlate({ ...editingPlate, notes: e.target.value })} />
                          <div className="flex gap-2">
                            <button onClick={savePlate} className="flex-1 bg-[#238636] text-white rounded p-2 text-sm hover:bg-[#2ea043] transition-colors">Save</button>
                            <button onClick={() => setEditingPlate(null)} className="flex-1 bg-[#21262d] text-[#c9d1d9] rounded p-2 text-sm hover:bg-[#30363d] transition-colors">Cancel</button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <div className="font-medium text-[#e6edf3]">{p.name}</div>
                            <div className="text-sm text-[#8b949e] mt-0.5">{getModelName(p.model_id)} — {getFootprintName(p.footprint_id)}</div>
                            {p.notes && <div className="text-sm text-[#484f58] mt-0.5">{p.notes}</div>}
                          </div>
                          <div className="flex gap-2 shrink-0">
                            <button onClick={() => setEditingPlate({ id: p.id, model_id: p.model_id, name: p.name, footprint_id: p.footprint_id, purchase_url: p.purchase_url || '', notes: p.notes || '' })} className={editBtnClass}>Edit</button>
                            <button onClick={() => deletePlate(p.id)} className={deleteBtnClass}>Delete</button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}