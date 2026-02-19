'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

type Make = { id: number; name: string }
type Model = { id: number; name: string; make_id: number }
type Footprint = { id: number; name: string; description: string }
type Optic = { id: number; name: string; manufacturer: string }

export default function AdminPage() {
  const [makes, setMakes] = useState<Make[]>([])
  const [models, setModels] = useState<Model[]>([])
  const [footprints, setFootprints] = useState<Footprint[]>([])
  const [optics, setOptics] = useState<Optic[]>([])
  const [activeTab, setActiveTab] = useState('makes')

  const [newMake, setNewMake] = useState('')
  const [newModel, setNewModel] = useState({ name: '', make_id: '', fit_type: 'single', notes: '' })
  const [newFootprint, setNewFootprint] = useState({ name: '', description: '' })
  const [newOptic, setNewOptic] = useState({ name: '', manufacturer: '', msrp: '', notes: '', affiliate_url: '' })
  const [newModelFootprint, setNewModelFootprint] = useState({ make_id: '', model_id: '', footprint_id: '' })
  const [newOpticFootprint, setNewOpticFootprint] = useState({ optic_id: '', footprint_id: '' })
  const [newPlate, setNewPlate] = useState({ make_id: '', model_id: '', name: '', footprint_id: '', purchase_url: '', notes: '' })
  const [filteredModels, setFilteredModels] = useState<Model[]>([])
  const [plateModels, setPlateModels] = useState<Model[]>([])
  const [message, setMessage] = useState({ text: '', type: 'success' })

  useEffect(() => {
    supabase.from('makes').select('*').order('name').then(({ data }) => { if (data) setMakes(data) })
    supabase.from('footprints').select('*').order('name').then(({ data }) => { if (data) setFootprints(data) })
    supabase.from('models').select('*').order('name').then(({ data }) => { if (data) setModels(data) })
    supabase.from('optics').select('id, name, manufacturer').order('name').then(({ data }) => { if (data) setOptics(data) })
  }, [])

  // Filter models for "link model" tab when make is selected
  useEffect(() => {
    if (!newModelFootprint.make_id) { setFilteredModels([]); return }
    setFilteredModels(models.filter(m => m.make_id === Number(newModelFootprint.make_id)))
  }, [newModelFootprint.make_id, models])

  // Filter models for "plates" tab when make is selected
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
    if (!res.ok) { showMessage('Error: ' + json.error, 'error'); return false }
    return true
  }

  const addMake = async () => {
    if (!newMake.trim()) return
    const ok = await post('makes', { name: newMake.trim() })
    if (!ok) return
    showMessage('Make added successfully')
    setNewMake('')
    supabase.from('makes').select('*').order('name').then(({ data }) => { if (data) setMakes(data) })
  }

  const addModel = async () => {
    if (!newModel.name.trim() || !newModel.make_id) return
    const ok = await post('models', {
      name: newModel.name.trim(),
      make_id: Number(newModel.make_id),
      fit_type: newModel.fit_type,
      notes: newModel.notes.trim() || null
    })
    if (!ok) return
    showMessage('Model added successfully')
    setNewModel({ name: '', make_id: '', fit_type: 'single', notes: '' })
    supabase.from('models').select('*').order('name').then(({ data }) => { if (data) setModels(data) })
  }

  const addFootprint = async () => {
    if (!newFootprint.name.trim()) return
    const ok = await post('footprints', {
      name: newFootprint.name.trim(),
      description: newFootprint.description.trim() || null
    })
    if (!ok) return
    showMessage('Footprint added successfully')
    setNewFootprint({ name: '', description: '' })
    supabase.from('footprints').select('*').order('name').then(({ data }) => { if (data) setFootprints(data) })
  }

  const addOptic = async () => {
    if (!newOptic.name.trim() || !newOptic.manufacturer.trim()) return
    const ok = await post('optics', {
      name: newOptic.name.trim(),
      manufacturer: newOptic.manufacturer.trim(),
      msrp: newOptic.msrp ? Number(newOptic.msrp) : null,
      notes: newOptic.notes.trim() || null,
      affiliate_url: newOptic.affiliate_url.trim() || null
    })
    if (!ok) return
    showMessage('Optic added successfully')
    setNewOptic({ name: '', manufacturer: '', msrp: '', notes: '', affiliate_url: '' })
    supabase.from('optics').select('id, name, manufacturer').order('name').then(({ data }) => { if (data) setOptics(data) })
  }

  const addModelFootprint = async () => {
    if (!newModelFootprint.model_id || !newModelFootprint.footprint_id) return
    const ok = await post('model_footprints', {
      model_id: Number(newModelFootprint.model_id),
      footprint_id: Number(newModelFootprint.footprint_id)
    })
    if (!ok) return
    showMessage('Model linked to footprint successfully')
    setNewModelFootprint({ make_id: '', model_id: '', footprint_id: '' })
  }

  const addOpticFootprint = async () => {
    if (!newOpticFootprint.optic_id || !newOpticFootprint.footprint_id) return
    const ok = await post('optic_footprints', {
      optic_id: Number(newOpticFootprint.optic_id),
      footprint_id: Number(newOpticFootprint.footprint_id)
    })
    if (!ok) return
    showMessage('Optic linked to footprint successfully')
    setNewOpticFootprint({ optic_id: '', footprint_id: '' })
  }

  const addPlate = async () => {
    if (!newPlate.model_id || !newPlate.name.trim() || !newPlate.footprint_id) return
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
  }

  const tabs = ['makes', 'models', 'footprints', 'optics', 'link model', 'link optic', 'plates']

  const inputClass = "border rounded p-2 w-full"
  const selectClass = "border rounded p-2 w-full bg-white"
  const btnClass = "bg-black text-white rounded p-2 w-full font-medium hover:bg-gray-800 transition-colors"

  return (
    <main className="max-w-2xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>

      {message.text && (
        <div className={`rounded p-3 mb-6 text-sm ${message.type === 'error' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
          {message.text}
        </div>
      )}

      <div className="flex gap-2 mb-6 flex-wrap">
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-3 py-1 rounded text-sm font-medium capitalize ${activeTab === tab ? 'bg-black text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'makes' && (
        <div className="grid gap-3">
          <h2 className="font-semibold">Add Manufacturer</h2>
          <input className={inputClass} placeholder="e.g. Walther" value={newMake} onChange={e => setNewMake(e.target.value)} />
          <button onClick={addMake} className={btnClass}>Add Make</button>
        </div>
      )}

      {activeTab === 'models' && (
        <div className="grid gap-3">
          <h2 className="font-semibold">Add Model</h2>
          <select className={selectClass} value={newModel.make_id} onChange={e => setNewModel({ ...newModel, make_id: e.target.value })}>
            <option value="" disabled>Select manufacturer...</option>
            {makes.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
          </select>
          <input className={inputClass} placeholder="Model name e.g. M&P 9 2.0" value={newModel.name} onChange={e => setNewModel({ ...newModel, name: e.target.value })} />
          <div>
            <label className="block text-sm font-medium mb-1">Fit Type</label>
            <select className={selectClass} value={newModel.fit_type} onChange={e => setNewModel({ ...newModel, fit_type: e.target.value })}>
              <option value="single">Single — one footprint cut</option>
              <option value="multi">Multi — multiple cuts milled in</option>
              <option value="plate_based">Plate-based — ships with adapter plates</option>
            </select>
          </div>
          <input className={inputClass} placeholder="Notes (optional)" value={newModel.notes} onChange={e => setNewModel({ ...newModel, notes: e.target.value })} />
          <button onClick={addModel} className={btnClass}>Add Model</button>
        </div>
      )}

      {activeTab === 'footprints' && (
        <div className="grid gap-3">
          <h2 className="font-semibold">Add Footprint</h2>
          <input className={inputClass} placeholder="Footprint name e.g. RMR" value={newFootprint.name} onChange={e => setNewFootprint({ ...newFootprint, name: e.target.value })} />
          <input className={inputClass} placeholder="Description (optional)" value={newFootprint.description} onChange={e => setNewFootprint({ ...newFootprint, description: e.target.value })} />
          <button onClick={addFootprint} className={btnClass}>Add Footprint</button>
        </div>
      )}

      {activeTab === 'optics' && (
        <div className="grid gap-3">
          <h2 className="font-semibold">Add Optic</h2>
          <input className={inputClass} placeholder="Optic name e.g. RMR Type 2" value={newOptic.name} onChange={e => setNewOptic({ ...newOptic, name: e.target.value })} />
          <input className={inputClass} placeholder="Manufacturer" value={newOptic.manufacturer} onChange={e => setNewOptic({ ...newOptic, manufacturer: e.target.value })} />
          <input className={inputClass} placeholder="MSRP (optional)" value={newOptic.msrp} onChange={e => setNewOptic({ ...newOptic, msrp: e.target.value })} />
          <input className={inputClass} placeholder="Affiliate URL (optional)" value={newOptic.affiliate_url} onChange={e => setNewOptic({ ...newOptic, affiliate_url: e.target.value })} />
          <input className={inputClass} placeholder="Notes (optional)" value={newOptic.notes} onChange={e => setNewOptic({ ...newOptic, notes: e.target.value })} />
          <button onClick={addOptic} className={btnClass}>Add Optic</button>
        </div>
      )}

      {activeTab === 'link model' && (
        <div className="grid gap-3">
          <h2 className="font-semibold">Link Model to Footprint</h2>
          <p className="text-sm text-gray-500">For Tier 1 (single) and Tier 2 (multi) guns only. Use the Plates tab for plate-based guns.</p>
          <select className={selectClass} value={newModelFootprint.make_id} onChange={e => setNewModelFootprint({ ...newModelFootprint, make_id: e.target.value, model_id: '' })}>
            <option value="" disabled>Select manufacturer...</option>
            {makes.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
          </select>
          <select className={selectClass} value={newModelFootprint.model_id} onChange={e => setNewModelFootprint({ ...newModelFootprint, model_id: e.target.value })} disabled={!newModelFootprint.make_id}>
            <option value="" disabled>Select model...</option>
            {filteredModels.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
          </select>
          <select className={selectClass} value={newModelFootprint.footprint_id} onChange={e => setNewModelFootprint({ ...newModelFootprint, footprint_id: e.target.value })}>
            <option value="" disabled>Select footprint...</option>
            {footprints.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
          </select>
          <button onClick={addModelFootprint} className={btnClass}>Link Model to Footprint</button>
        </div>
      )}

      {activeTab === 'link optic' && (
        <div className="grid gap-3">
          <h2 className="font-semibold">Link Optic to Footprint</h2>
          <select className={selectClass} value={newOpticFootprint.optic_id} onChange={e => setNewOpticFootprint({ ...newOpticFootprint, optic_id: e.target.value })}>
            <option value="" disabled>Select optic...</option>
            {optics.map(o => <option key={o.id} value={o.id}>{o.manufacturer} — {o.name}</option>)}
          </select>
          <select className={selectClass} value={newOpticFootprint.footprint_id} onChange={e => setNewOpticFootprint({ ...newOpticFootprint, footprint_id: e.target.value })}>
            <option value="" disabled>Select footprint...</option>
            {footprints.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
          </select>
          <button onClick={addOpticFootprint} className={btnClass}>Link Optic to Footprint</button>
        </div>
      )}

      {activeTab === 'plates' && (
        <div className="grid gap-3">
          <h2 className="font-semibold">Add Plate</h2>
          <p className="text-sm text-gray-500">For plate-based guns only. Each plate presents one footprint to the optic.</p>
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
      )}
    </main>
  )
}