'use client'

import { useState, useEffect } from 'react'
import { supabase } from './lib/supabase'

type Make = { id: number; name: string }
type Model = { id: number; name: string; make_id: number }
type Optic = { id: number; name: string; manufacturer: string; msrp: number; notes: string }

export default function Home() {
  const [makes, setMakes] = useState<Make[]>([])
  const [models, setModels] = useState<Model[]>([])
  const [optics, setOptics] = useState<Optic[]>([])
  const [selectedMake, setSelectedMake] = useState<number | null>(null)
  const [selectedModel, setSelectedModel] = useState<number | null>(null)

  useEffect(() => {
    supabase.from('makes').select('*').order('name').then(({ data }) => {
      if (data) setMakes(data)
    })
  }, [])

  useEffect(() => {
    if (!selectedMake) return
    setSelectedModel(null)
    setOptics([])
    supabase.from('models').select('*').eq('make_id', selectedMake).order('name').then(({ data }) => {
      if (data) setModels(data)
    })
  }, [selectedMake])

  useEffect(() => {
    if (!selectedModel) return

    const fetchOptics = async () => {
      const { data: mfData } = await supabase
        .from('model_footprints')
        .select('footprint_id')
        .eq('model_id', selectedModel)

      if (!mfData || mfData.length === 0) return

      const footprintIds = mfData.map((r) => r.footprint_id)

      const { data: ofData } = await supabase
        .from('optic_footprints')
        .select('optics(*)')
        .in('footprint_id', footprintIds)

      if (ofData) {
        const compatibleOptics = ofData.map((r: any) => r.optics)
        setOptics(compatibleOptics)
      }
    }

    fetchOptics()
  }, [selectedModel])

  return (
    <main className="max-w-2xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-2">Handgun Optics Finder</h1>
      <p className="text-gray-500 mb-8">Select your handgun to see compatible optics</p>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Manufacturer</label>
        <select
          className="w-full border rounded p-2"
          onChange={(e) => setSelectedMake(Number(e.target.value))}
          defaultValue=""
        >
          <option value="" disabled>Select a manufacturer...</option>
          {makes.map((make) => (
            <option key={make.id} value={make.id}>{make.name}</option>
          ))}
        </select>
      </div>

      {selectedMake && (
        <div className="mb-8">
          <label className="block text-sm font-medium mb-1">Model</label>
          <select
            className="w-full border rounded p-2"
            onChange={(e) => setSelectedModel(Number(e.target.value))}
            defaultValue=""
          >
            <option value="" disabled>Select a model...</option>
            {models.map((model) => (
              <option key={model.id} value={model.id}>{model.name}</option>
            ))}
          </select>
        </div>
      )}

      {optics.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Compatible Optics</h2>
          <div className="grid gap-4">
            {optics.map((optic) => (
              <div key={optic.id} className="border rounded p-4">
                <div className="font-medium">{optic.name}</div>
                <div className="text-sm text-gray-500">{optic.manufacturer}</div>
                {optic.msrp && <div className="text-sm mt-1">${optic.msrp}</div>}
                {optic.notes && <div className="text-sm text-gray-400 mt-1">{optic.notes}</div>}
              </div>
            ))}
          </div>
        </div>
      )}
    </main>
  )
}