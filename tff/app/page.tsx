'use client'

import { useState, useEffect } from 'react'
import { supabase } from './lib/supabase'

type Make = { id: number; name: string }
type Model = { id: number; name: string; make_id: number; fit_type: string; notes: string }
type Optic = { id: number; name: string; manufacturer: string; msrp: number; notes: string; affiliate_url: string }
type Footprint = { id: number; name: string; description: string }
type Plate = { id: number; name: string; footprint_id: number; purchase_url: string; notes: string }

export default function Home() {
  const [makes, setMakes] = useState<Make[]>([])
  const [models, setModels] = useState<Model[]>([])
  const [selectedMake, setSelectedMake] = useState<number | null>(null)
  const [selectedModel, setSelectedModel] = useState<Model | null>(null)

  // Tier 1 & 2 results
  const [optics, setOptics] = useState<{ footprint: Footprint; optics: Optic[] }[]>([])

  // Tier 3 results
  const [plates, setPlates] = useState<(Plate & { footprint: Footprint; optics: Optic[] })[]>([])

  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)

  useEffect(() => {
    supabase.from('makes').select('*').order('name').then(({ data }) => {
      if (data) setMakes(data)
    })
  }, [])

  useEffect(() => {
    if (!selectedMake) return
    setSelectedModel(null)
    setOptics([])
    setPlates([])
    setSearched(false)
    supabase.from('models').select('*').eq('make_id', selectedMake).order('name').then(({ data }) => {
      if (data) setModels(data)
    })
  }, [selectedMake])

  useEffect(() => {
    if (!selectedModel) return
    setOptics([])
    setPlates([])
    setSearched(false)
    fetchResults(selectedModel)
  }, [selectedModel])

  const fetchResults = async (model: Model) => {
    setLoading(true)

    if (model.fit_type === 'plate_based') {
      // Fetch all plates for this model
      const { data: plateData } = await supabase
        .from('plates')
        .select('*')
        .eq('model_id', model.id)

      if (!plateData || plateData.length === 0) {
        setPlates([])
        setLoading(false)
        setSearched(true)
        return
      }

      // For each plate, fetch its footprint and compatible optics
      const enrichedPlates = await Promise.all(plateData.map(async (plate) => {
        const { data: fpData } = await supabase
          .from('footprints')
          .select('*')
          .eq('id', plate.footprint_id)
          .single()

        const { data: ofData } = await supabase
          .from('optic_footprints')
          .select('optics(*)')
          .eq('footprint_id', plate.footprint_id)

        const opticsList = ofData ? ofData.map((r: any) => r.optics) : []

        return {
          ...plate,
          footprint: fpData,
          optics: opticsList
        }
      }))

      setPlates(enrichedPlates)

    } else {
      // Tier 1 & 2 — fetch footprints for this model
      const { data: mfData } = await supabase
        .from('model_footprints')
        .select('footprint_id')
        .eq('model_id', model.id)

      if (!mfData || mfData.length === 0) {
        setOptics([])
        setLoading(false)
        setSearched(true)
        return
      }

      // For each footprint, fetch its details and compatible optics
      const enrichedFootprints = await Promise.all(mfData.map(async (mf) => {
        const { data: fpData } = await supabase
          .from('footprints')
          .select('*')
          .eq('id', mf.footprint_id)
          .single()

        const { data: ofData } = await supabase
          .from('optic_footprints')
          .select('optics(*)')
          .eq('footprint_id', mf.footprint_id)

        const opticsList = ofData ? ofData.map((r: any) => r.optics) : []

        return {
          footprint: fpData,
          optics: opticsList
        }
      }))

      setOptics(enrichedFootprints)
    }

    setLoading(false)
    setSearched(true)
  }

  const handleModelSelect = (modelId: number) => {
    const model = models.find(m => m.id === modelId) || null
    setSelectedModel(model)
  }

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
            onChange={(e) => handleModelSelect(Number(e.target.value))}
            defaultValue=""
          >
            <option value="" disabled>Select a model...</option>
            {models.map((model) => (
              <option key={model.id} value={model.id}>{model.name}</option>
            ))}
          </select>
        </div>
      )}

      {loading && (
        <p className="text-gray-400 text-sm">Loading...</p>
      )}

      {/* TIER 1 & 2 — direct footprint results */}
      {!loading && searched && selectedModel?.fit_type !== 'plate_based' && (
        <div>
          {optics.length === 0 ? (
            <p className="text-gray-400 text-sm">No compatible optics found for this model yet.</p>
          ) : (
            <div className="grid gap-8">
              {optics.map(({ footprint, optics: opticsList }) => (
                <div key={footprint?.id}>
                  {optics.length > 1 && (
                    <div className="mb-3">
                      <span className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                        {footprint?.name} footprint
                      </span>
                      {footprint?.description && (
                        <p className="text-sm text-gray-400 mt-0.5">{footprint.description}</p>
                      )}
                    </div>
                  )}
                  <div className="grid gap-3">
                    {opticsList.map((optic) => (
                      <div key={optic.id} className="border rounded p-4">
                        <div className="font-medium">{optic.name}</div>
                        <div className="text-sm text-gray-500">{optic.manufacturer}</div>
                        {optic.msrp && <div className="text-sm mt-1">${optic.msrp}</div>}
                        {optic.notes && <div className="text-sm text-gray-400 mt-1">{optic.notes}</div>}
                        {optic.affiliate_url && (
                          <a href={optic.affiliate_url} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline mt-2 inline-block">
                            View →
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TIER 3 — plate-based results */}
      {!loading && searched && selectedModel?.fit_type === 'plate_based' && (
        <div>
          <h2 className="text-xl font-semibold mb-2">Adapter Plate System</h2>
          <p className="text-gray-500 text-sm mb-6">
            This handgun ships with an adapter plate system. The compatible optics depend on which plate you install. Select a plate below to see which optics fit.
          </p>
          {plates.length === 0 ? (
            <p className="text-gray-400 text-sm">No plate information available for this model yet.</p>
          ) : (
            <div className="grid gap-6">
              {plates.map((plate) => (
                <div key={plate.id} className="border rounded p-4">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div>
                      <div className="font-semibold">{plate.name}</div>
                      <div className="text-sm text-gray-500 mt-0.5">
                        Presents <span className="font-medium text-gray-700">{plate.footprint?.name}</span> footprint
                      </div>
                      {plate.footprint?.description && (
                        <div className="text-sm text-gray-400 mt-0.5">{plate.footprint.description}</div>
                      )}
                    </div>
                    {plate.purchase_url && (
                      <a href={plate.purchase_url} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline shrink-0">
                        Buy plate →
                      </a>
                    )}
                  </div>
                  {plate.notes && (
                    <p className="text-sm text-gray-400 mb-3">{plate.notes}</p>
                  )}
                  {plate.optics.length === 0 ? (
                    <p className="text-sm text-gray-400">No compatible optics found for this plate yet.</p>
                  ) : (
                    <div className="grid gap-2">
                      {plate.optics.map((optic) => (
                        <div key={optic.id} className="bg-gray-50 rounded p-3">
                          <div className="font-medium text-sm">{optic.name}</div>
                          <div className="text-sm text-gray-500">{optic.manufacturer}</div>
                          {optic.msrp && <div className="text-sm mt-0.5">${optic.msrp}</div>}
                          {optic.notes && <div className="text-sm text-gray-400 mt-0.5">{optic.notes}</div>}
                          {optic.affiliate_url && (
                            <a href={optic.affiliate_url} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline mt-1 inline-block">
                              View →
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </main>
  )
}