'use client'

import { useState, useEffect } from 'react'
import { supabaseAdmin as supabase } from '../lib/supabase-admin'
console.log('key:', process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY)

type Make = { id: number; name: string }
type Footprint = { id: number; name: string; description: string }

export default function AdminPage() {
  const [makes, setMakes] = useState<Make[]>([])
  const [footprints, setFootprints] = useState<Footprint[]>([])
  const [activeTab, setActiveTab] = useState('makes')

  const [newMake, setNewMake] = useState('')
  const [newModel, setNewModel] = useState({ name: '', make_id: '', notes: '' })
  const [newFootprint, setNewFootprint] = useState({ name: '', description: '' })
  const [newOptic, setNewOptic] = useState({ name: '', manufacturer: '', msrp: '', notes: '', affiliate_url: '' })
  const [newModelFootprint, setNewModelFootprint] = useState({ model_id: '', footprint_id: '' })
  const [newOpticFootprint, setNewOpticFootprint] = useState({ optic_id: '', footprint_id: '' })
  const [message, setMessage] = useState('')

  useEffect(() => {
    supabase.from('makes').select('*').order('name').then(({ data }) => {
      if (data) setMakes(data)
    })
    supabase.from('footprints').select('*').order('name').then(({ data }) => {
      if (data) setFootprints(data)
    })
  }, [])

  const showMessage = (msg: string) => {
    setMessage(msg)
    setTimeout(() => setMessage(''), 3000)
  }

  const addMake = async () => {
    if (!newMake.trim()) return
    const { error } = await supabase.from('makes').insert({ name: newMake.trim() })
    if (error) {
      showMessage('Error: ' + error.message)
      return
    }
    showMessage('Make added successfully')
    setNewMake('')
    supabase.from('makes').select('*').order('name').then(({ data }) => {
      if (data) setMakes(data)
    })
  }

  const addModel = async () => {
    if (!newModel.name.trim() || !newModel.make_id) return
    const { error } = await supabase.from('models').insert({
      name: newModel.name.trim(),
      make_id: Number(newModel.make_id),
      notes: newModel.notes.trim() || null
    })
    if (error) {
      showMessage('Error: ' + error.message)
      return
    }
    showMessage('Model added successfully')
    setNewModel({ name: '', make_id: '', notes: '' })
  }

  const addFootprint = async () => {
    if (!newFootprint.name.trim()) return
    const { error } = await supabase.from('footprints').insert({
      name: newFootprint.name.trim(),
      description: newFootprint.description.trim() || null
    })
    if (error) {
      showMessage('Error: ' + error.message)
      return
    }
    showMessage('Footprint added successfully')
    setNewFootprint({ name: '', description: '' })
    supabase.from('footprints').select('*').order('name').then(({ data }) => {
      if (data) setFootprints(data)
    })
  }

  const addOptic = async () => {
    if (!newOptic.name.trim() || !newOptic.manufacturer.trim()) return
    const { error } = await supabase.from('optics').insert({
      name: newOptic.name.trim(),
      manufacturer: newOptic.manufacturer.trim(),
      msrp: newOptic.msrp ? Number(newOptic.msrp) : null,
      notes: newOptic.notes.trim() || null,
      affiliate_url: newOptic.affiliate_url.trim() || null
    })
    if (error) {
      showMessage('Error: ' + error.message)
      return
    }
    showMessage('Optic added successfully')
    setNewOptic({ name: '', manufacturer: '', msrp: '', notes: '', affiliate_url: '' })
  }

  const addModelFootprint = async () => {
    if (!newModelFootprint.model_id || !newModelFootprint.footprint_id) return
    const { error } = await supabase.from('model_footprints').insert({
      model_id: Number(newModelFootprint.model_id),
      footprint_id: Number(newModelFootprint.footprint_id)
    })
    if (error) {
      showMessage('Error: ' + error.message)
      return
    }
    showMessage('Model footprint linked successfully')
    setNewModelFootprint({ model_id: '', footprint_id: '' })
  }

  const addOpticFootprint = async () => {
    if (!newOpticFootprint.optic_id || !newOpticFootprint.footprint_id) return
    const { error } = await supabase.from('optic_footprints').insert({
      optic_id: Number(newOpticFootprint.optic_id),
      footprint_id: Number(newOpticFootprint.footprint_id)
    })
    if (error) {
      showMessage('Error: ' + error.message)
      return
    }
    showMessage('Optic footprint linked successfully')
    setNewOpticFootprint({ optic_id: '', footprint_id: '' })
  }

  const tabs = ['makes', 'models', 'footprints', 'optics', 'link model', 'link optic']

  return (
    <main className="max-w-2xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>

      {message && (
        <div className="bg-green-100 text-green-800 rounded p-3 mb-6 text-sm">{message}</div>
      )}

      <div className="flex gap-2 mb-6 flex-wrap">
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-3 py-1 rounded text-sm font-medium capitalize ${activeTab === tab ? 'bg-black text-white' : 'bg-gray-100'}`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'makes' && (
        <div className="grid gap-3">
          <h2 className="font-semibold">Add Manufacturer</h2>
          <input
            className="border rounded p-2"
            placeholder="e.g. Walther"
            value={newMake}
            onChange={e => setNewMake(e.target.value)}
          />
          <button onClick={addMake} className="bg-black text-white rounded p-2">Add Make</button>
        </div>
      )}

      {activeTab === 'models' && (
        <div className="grid gap-3">
          <h2 className="font-semibold">Add Model</h2>
          <select
            className="border rounded p-2"
            value={newModel.make_id}
            onChange={e => setNewModel({ ...newModel, make_id: e.target.value })}
          >
            <option value="" disabled>Select manufacturer...</option>
            {makes.map(m => (
              <option key={m.id} value={m.id}>{m.name}</option>
            ))}
          </select>
          <input
            className="border rounded p-2"
            placeholder="Model name e.g. G43X"
            value={newModel.name}
            onChange={e => setNewModel({ ...newModel, name: e.target.value })}
          />
          <input
            className="border rounded p-2"
            placeholder="Notes (optional)"
            value={newModel.notes}
            onChange={e => setNewModel({ ...newModel, notes: e.target.value })}
          />
          <button onClick={addModel} className="bg-black text-white rounded p-2">Add Model</button>
        </div>
      )}

      {activeTab === 'footprints' && (
        <div className="grid gap-3">
          <h2 className="font-semibold">Add Footprint</h2>
          <input
            className="border rounded p-2"
            placeholder="Footprint name e.g. RMR"
            value={newFootprint.name}
            onChange={e => setNewFootprint({ ...newFootprint, name: e.target.value })}
          />
          <input
            className="border rounded p-2"
            placeholder="Description (optional)"
            value={newFootprint.description}
            onChange={e => setNewFootprint({ ...newFootprint, description: e.target.value })}
          />
          <button onClick={addFootprint} className="bg-black text-white rounded p-2">Add Footprint</button>
        </div>
      )}

      {activeTab === 'optics' && (
        <div className="grid gap-3">
          <h2 className="font-semibold">Add Optic</h2>
          <input
            className="border rounded p-2"
            placeholder="Optic name e.g. RMR Type 2"
            value={newOptic.name}
            onChange={e => setNewOptic({ ...newOptic, name: e.target.value })}
          />
          <input
            className="border rounded p-2"
            placeholder="Manufacturer"
            value={newOptic.manufacturer}
            onChange={e => setNewOptic({ ...newOptic, manufacturer: e.target.value })}
          />
          <input
            className="border rounded p-2"
            placeholder="MSRP (optional)"
            value={newOptic.msrp}
            onChange={e => setNewOptic({ ...newOptic, msrp: e.target.value })}
          />
          <input
            className="border rounded p-2"
            placeholder="Affiliate URL (optional)"
            value={newOptic.affiliate_url}
            onChange={e => setNewOptic({ ...newOptic, affiliate_url: e.target.value })}
          />
          <input
            className="border rounded p-2"
            placeholder="Notes (optional)"
            value={newOptic.notes}
            onChange={e => setNewOptic({ ...newOptic, notes: e.target.value })}
          />
          <button onClick={addOptic} className="bg-black text-white rounded p-2">Add Optic</button>
        </div>
      )}

      {activeTab === 'link model' && (
        <div className="grid gap-3">
          <h2 className="font-semibold">Link Model to Footprint</h2>
          <input
            className="border rounded p-2"
            placeholder="Model ID (find in Supabase table editor)"
            value={newModelFootprint.model_id}
            onChange={e => setNewModelFootprint({ ...newModelFootprint, model_id: e.target.value })}
          />
          <select
            className="border rounded p-2"
            value={newModelFootprint.footprint_id}
            onChange={e => setNewModelFootprint({ ...newModelFootprint, footprint_id: e.target.value })}
          >
            <option value="" disabled>Select footprint...</option>
            {footprints.map(f => (
              <option key={f.id} value={f.id}>{f.name}</option>
            ))}
          </select>
          <button onClick={addModelFootprint} className="bg-black text-white rounded p-2">Link Model to Footprint</button>
        </div>
      )}

      {activeTab === 'link optic' && (
        <div className="grid gap-3">
          <h2 className="font-semibold">Link Optic to Footprint</h2>
          <input
            className="border rounded p-2"
            placeholder="Optic ID (find in Supabase table editor)"
            value={newOpticFootprint.optic_id}
            onChange={e => setNewOpticFootprint({ ...newOpticFootprint, optic_id: e.target.value })}
          />
          <select
            className="border rounded p-2"
            value={newOpticFootprint.footprint_id}
            onChange={e => setNewOpticFootprint({ ...newOpticFootprint, footprint_id: e.target.value })}
          >
            <option value="" disabled>Select footprint...</option>
            {footprints.map(f => (
              <option key={f.id} value={f.id}>{f.name}</option>
            ))}
          </select>
          <button onClick={addOpticFootprint} className="bg-black text-white rounded p-2">Link Optic to Footprint</button>
        </div>
      )}
    </main>
  )
}