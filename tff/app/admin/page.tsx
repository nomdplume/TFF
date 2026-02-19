'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

type Make = { id: number; name: string }
type Model = { id: number; name: string; make_id: number }
type Footprint = { id: number; name: string; description: string }

export default function AdminPage() {
  const [makes, setMakes] = useState<Make[]>([])
  const [models, setModels] = useState<Model[]>([])
  const [footprints, setFootprints] = useState<Footprint[]>([])
  const [activeTab, setActiveTab] = useState('makes')
  const [message, setMessage] = useState({ text: '', type: 'success' })

  const [newMake, setNewMake] = useState('')

  const [newModel, setNewModel] = useState({
    name: '', make_id: '', fit_type: 'single', notes: '',
    footprint_ids: [] as string[]
  })

  const [newFootprint, setNewFootprint] = useState({ name: '', description: '' })

  const [newOptic, setNewOptic] = useState({
    name: '', manufacturer: '', footprint_id: '', msrp: '', affiliate_url: '', notes: ''
  })

  const [newPlate, setNewPlate] = useState({
    make_id: '', model_id: '', name: '', footprint_id: '', purchase_url: '', notes: ''
  })

  const [plateModels, setPlateModels] = useState<Model[]>([])

  useEffect(() => {
    supabase.from('makes').select('*').order('name').then(({ data }) => { if (data) setMakes(data) })
    supabase.from('footprints').select('*').order('name').then(({ data }) => { if (data) setFootprints(data) })
    supabase.from('models').select('*').order('name').then(({ data }) => { if (data) setModels(data) })
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
    if (newModel.fit_type === 'single' && newModel.footprint_ids.length === 0) {
      showMessage('Please select a footprint', 'error'); return
    }
    if (newModel.fit_type === 'multi' && newModel.footprint_ids.length < 2) {
      showMessage('Please select at least 2 footprints for a multi-cut model', 'error'); return
    }

    // Insert the model first to get its ID
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

    const modelId = json.id

    // Link footprints if single or multi
    if (newModel.fit_type !== 'plate_based' && newModel.footprint_ids.length > 0) {
      for (const fid of newModel.footprint_ids) {
        await post('model_footprints', { model_id: modelId, footprint_id: Number(fid) })
      }
    }

    showMessage('Model added successfully')
    setNewModel({ name: '', make_id: '', fit_type: 'single', notes: '', footprint_ids: [] })
    supabase.from('models').select('*').order('name').then(({ data }) => { if (data) setModels(data) })
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
  }

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
  }

  const tabs = ['makes', 'models', 'footprints', 'optics', 'plates']
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

      {/* MAKES */}
      {activeTab === 'makes' && (
        <div className="grid gap-3">
          <h2 className="font-semibold">Add Manufacturer</h2>
          <input className={inputClass} placeholder="e.g. Walther" value={newMake} onChange={e => setNewMake(e.target.value)} />
          <button onClick={addMake} className={btnClass}>Add Make</button>
        </div>
      )}

      {/* MODELS */}
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
            <select className={selectClass} value={newModel.fit_type} onChange={e => setNewModel({ ...newModel, fit_type: e.target.value, footprint_ids: [] })}>
              <option value="single">Single — one footprint cut</option>
              <option value="multi">Multi — multiple cuts milled in</option>
              <option value="plate_based">Plate-based — ships with adapter plates</option>
            </select>
          </div>

          {newModel.fit_type === 'single' && (
            <div>
              <label className="block text-sm font-medium mb-1">Footprint</label>
              <div className="grid gap-1">
                {footprints.map(f => (
                  <label key={f.id} className={`flex items-center gap-2 p-2 border rounded cursor-pointer ${newModel.footprint_ids.includes(String(f.id)) ? 'border-black bg-gray-50' : ''}`}>
                    <input
                      type="radio"
                      name="single_footprint"
                      checked={newModel.footprint_ids.includes(String(f.id))}
                      onChange={() => toggleFootprint(String(f.id))}
                    />
                    {f.name}
                  </label>
                ))}
              </div>
            </div>
          )}

          {newModel.fit_type === 'multi' && (
            <div>
              <label className="block text-sm font-medium mb-1">Footprints (select all that apply)</label>
              <div className="grid gap-1">
                {footprints.map(f => (
                  <label key={f.id} className={`flex items-center gap-2 p-2 border rounded cursor-pointer ${newModel.footprint_ids.includes(String(f.id)) ? 'border-black bg-gray-50' : ''}`}>
                    <input
                      type="checkbox"
                      checked={newModel.footprint_ids.includes(String(f.id))}
                      onChange={() => toggleFootprint(String(f.id))}
                    />
                    {f.name}
                  </label>
                ))}
              </div>
            </div>
          )}

          {newModel.fit_type === 'plate_based' && (
            <p className="text-sm text-gray-500 bg-gray-50 rounded p-3">
              This model uses adapter plates. After saving, go to the <strong>Plates</strong> tab to add each plate and its footprint.
            </p>
          )}

          <input className={inputClass} placeholder="Notes (optional)" value={newModel.notes} onChange={e => setNewModel({ ...newModel, notes: e.target.value })} />
          <button onClick={addModel} className={btnClass}>Add Model</button>
        </div>
      )}

      {/* FOOTPRINTS */}
      {activeTab === 'footprints' && (
        <div className="grid gap-3">
          <h2 className="font-semibold">Add Footprint</h2>
          <input className={inputClass} placeholder="Footprint name e.g. RMR" value={newFootprint.name} onChange={e => setNewFootprint({ ...newFootprint, name: e.target.value })} />
          <input className={inputClass} placeholder="Description (optional)" value={newFootprint.description} onChange={e => setNewFootprint({ ...newFootprint, description: e.target.value })} />
          <button onClick={addFootprint} className={btnClass}>Add Footprint</button>
        </div>
      )}

      {/* OPTICS */}
      {activeTab === 'optics' && (
        <div className="grid gap-3">
          <h2 className="font-semibold">Add Optic</h2>
          <input className={inputClass} placeholder="Optic name e.g. RMR Type 2" value={newOptic.name} onChange={e => setNewOptic({ ...newOptic, name: e.target.value })} />
          <input className={inputClass} placeholder="Manufacturer" value={newOptic.manufacturer} onChange={e => setNewOptic({ ...newOptic, manufacturer: e.target.value })} />
          <div>
            <label className="block text-sm font-medium mb-1">Footprint</label>
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
      )}

      {/* PLATES */}
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