'use client'

import { useState, useEffect, useRef } from 'react'
import { supabase } from './lib/supabase'
import ComingSoon from './components/ComingSoon'
import Image from 'next/image'

type Make = { id: number; name: string }
type Model = { id: number; name: string; make_id: number; fit_type: string; notes: string }
type Optic = {
  id: number
  name: string
  optic_make_id: number | null
  optic_make?: { name: string }
  sku: string | null
  msrp: number | null
  reticle: string | null
  notes: string | null
  affiliate_url: string | null
  manufacturer_url: string | null
  battery_type: string | null
  solar: boolean
  mount_type: string
  image_url: string | null
}
type Footprint = { id: number; name: string; description: string }
type Plate = { id: number; name: string; footprint_id: number; purchase_url: string; notes: string }

export default function Home() {
  if (process.env.NEXT_PUBLIC_COMING_SOON === 'true') {
    return <ComingSoon />
  }

  const [makes, setMakes] = useState<Make[]>([])
  const [models, setModels] = useState<Model[]>([])
  const [selectedMake, setSelectedMake] = useState<number | null>(null)
  const [selectedModel, setSelectedModel] = useState<Model | null>(null)

  // Three result pools
  const [footprintOptics, setFootprintOptics] = useState<{ footprint: Footprint; optics: Optic[] }[]>([])
  const [plates, setPlates] = useState<(Plate & { footprint: Footprint; optics: Optic[] })[]>([])
  const [directOptics, setDirectOptics] = useState<Optic[]>([])

  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const abortRef = useRef<AbortController | null>(null)

  useEffect(() => {
    supabase.from('makes').select('*').order('name').then(({ data }) => {
      if (data) setMakes(data)
    })
  }, [])

  useEffect(() => {
    if (!selectedMake) return
    setSelectedModel(null); setFootprintOptics([]); setPlates([]); setDirectOptics([]); setSearched(false)
    supabase.from('models').select('*').eq('make_id', selectedMake).order('name').then(({ data }) => {
      if (data) setModels(data)
    })
  }, [selectedMake])

  useEffect(() => {
    if (!selectedModel) return
    setFootprintOptics([]); setPlates([]); setDirectOptics([]); setSearched(false)

    abortRef.current?.abort()
    abortRef.current = new AbortController()
    fetchResults(selectedModel, abortRef.current.signal)
  }, [selectedModel])

  const fetchResults = async (model: Model, signal: AbortSignal) => {
    setLoading(true)

    try {
      // ── Pool 1: Direct footprint matches (all models except pure plate_based) ──
      if (model.fit_type !== 'plate_based') {
        const { data: mfData } = await supabase
          .from('model_footprints').select('footprint_id').eq('model_id', model.id)
          .abortSignal(signal)

        if (signal.aborted) return

        if (mfData && mfData.length > 0) {
          const enriched = await Promise.all(mfData.map(async (mf) => {
            const { data: fpData } = await supabase
              .from('footprints').select('*').eq('id', mf.footprint_id).single()
              .abortSignal(signal)
            const { data: ofData } = await supabase
              .from('optic_footprints')
              .select('optics(*, optic_makes(name))')
              .eq('footprint_id', mf.footprint_id)
              .abortSignal(signal)
            const opticsList: Optic[] = ofData
              ? ofData
                  .map((r: any) => ({ ...r.optics, optic_make: r.optics?.optic_makes }))
                  .filter((o: Optic) => o.mount_type !== 'direct_mount')
              : []
            return { footprint: fpData as Footprint, optics: opticsList }
          }))
          if (signal.aborted) return
          setFootprintOptics(enriched.filter(g => g.optics.length > 0))
        }
      }

      // ── Pool 2: Plate-based matches (plate_based and mixed) ──
      if (model.fit_type === 'plate_based' || model.fit_type === 'mixed') {
        const { data: plateData } = await supabase
          .from('plates').select('*').eq('model_id', model.id)
          .abortSignal(signal)

        if (signal.aborted) return

        if (plateData && plateData.length > 0) {
          const enrichedPlates = await Promise.all(plateData.map(async (plate) => {
            const { data: fpData } = await supabase
              .from('footprints').select('*').eq('id', plate.footprint_id).single()
              .abortSignal(signal)
            const { data: ofData } = await supabase
              .from('optic_footprints')
              .select('optics(*, optic_makes(name))')
              .eq('footprint_id', plate.footprint_id)
              .abortSignal(signal)
            const opticsList: Optic[] = ofData
              ? ofData.map((r: any) => ({ ...r.optics, optic_make: r.optics?.optic_makes }))
              : []
            return { ...plate, footprint: fpData as Footprint, optics: opticsList }
          }))
          if (signal.aborted) return
          setPlates(enrichedPlates)
        }
      }

      // ── Pool 3: Direct-mount optics for this specific model ──
      const { data: compatData } = await supabase
        .from('optic_model_compatibility')
        .select('optics(*, optic_makes(name))')
        .eq('model_id', model.id)
        .abortSignal(signal)

      if (signal.aborted) return

      if (compatData && compatData.length > 0) {
        const directList: Optic[] = compatData.map((r: any) => ({
          ...r.optics,
          optic_make: r.optics?.optic_makes
        }))
        setDirectOptics(directList)
      }

    } catch (err: any) {
      if (err?.name === 'AbortError') return
      console.error('fetchResults error:', err)
    }

    setLoading(false)
    setSearched(true)
  }

  const handleModelSelect = (modelId: number) => {
    setSelectedModel(models.find(m => m.id === modelId) || null)
  }

  const getManufacturer = (optic: Optic) => optic.optic_make?.name || '—'

  const totalResults = footprintOptics.reduce((acc, g) => acc + g.optics.length, 0) + directOptics.length
  const hasResults = searched && (footprintOptics.length > 0 || plates.length > 0 || directOptics.length > 0)
  const noResults = searched && footprintOptics.length === 0 && plates.length === 0 && directOptics.length === 0

  const OpticCard = ({ optic, compact = false }: { optic: Optic; compact?: boolean }) => (
    <div className={`bg-[${compact ? '#0d1117' : '#161b22'}] border border-[${compact ? '#21262d' : '#30363d'}] rounded-xl p-${compact ? '3' : '4'} flex gap-${compact ? '3' : '4'} hover:border-[#484f58] transition-colors`}>
      <div className={`${compact ? 'w-14 h-14' : 'w-20 h-20'} shrink-0 bg-[#21262d] rounded-lg border border-[#30363d] flex items-center justify-center overflow-hidden`}>
        {optic.image_url ? (
          <Image
            src={optic.image_url}
            alt={optic.name}
            width={compact ? 56 : 80}
            height={compact ? 56 : 80}
            className="object-contain"
          />
        ) : (
          <span className="text-[#484f58] text-xs text-center px-1">No image</span>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <div className={`font-medium text-[#e6edf3] ${compact ? 'text-sm' : ''}`}>{optic.name}</div>
              {optic.mount_type === 'direct_mount' && (
                <span className="text-xs bg-[#388bfd]/20 text-[#58a6ff] border border-[#388bfd]/30 rounded-full px-2 py-0.5 shrink-0">Direct Mount</span>
              )}
              {optic.solar && (
                <span className="text-xs bg-[#3fb950]/20 text-[#3fb950] border border-[#3fb950]/30 rounded-full px-2 py-0.5 shrink-0">Solar Enabled</span>
              )}
            </div>
            <div className="text-sm text-[#8b949e] mt-0.5">{getManufacturer(optic)}</div>
          </div>
          {optic.msrp && (
            <div className="text-sm font-semibold text-[#e6edf3] shrink-0">${optic.msrp}</div>
          )}
        </div>
        <div className="flex flex-wrap gap-x-3 mt-1">
          {optic.sku && <span className="text-xs text-[#484f58]">SKU: {optic.sku}</span>}
          {optic.reticle && <span className="text-xs text-[#484f58]">{optic.reticle}</span>}
          {optic.battery_type && <span className="text-xs text-[#484f58]">🔋 {optic.battery_type}</span>}
        </div>
        {optic.notes && (
          <div className="text-sm text-[#484f58] mt-1">{optic.notes}</div>
        )}
        {(optic.affiliate_url || optic.manufacturer_url) && (
          <div className={`flex gap-2 flex-wrap ${compact ? 'mt-2' : 'mt-3'}`}>
            {optic.affiliate_url && (
              <a
                href={optic.affiliate_url}
                target="_blank"
                rel="noopener noreferrer"
                className={`inline-flex items-center gap-1.5 ${compact ? 'py-1' : 'py-1.5'} text-sm bg-[#238636] hover:bg-[#2ea043] text-white px-3 rounded-lg transition-colors font-medium`}
              >
                Buy Now →
              </a>
            )}
            {optic.manufacturer_url && (
              <a
                href={optic.manufacturer_url}
                target="_blank"
                rel="noopener noreferrer"
                className={`inline-flex items-center gap-1.5 ${compact ? 'py-1' : 'py-1.5'} text-sm bg-[#21262d] hover:bg-[#30363d] text-[#c9d1d9] border border-[#30363d] px-3 rounded-lg transition-colors font-medium`}
              >
                View Product
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  )

  const SectionHeader = ({ label, count, color = '#3fb950' }: { label: string; count: number; color?: string }) => (
    <div className="flex items-center gap-3 mb-3">
      <span className="text-xs font-semibold uppercase tracking-widest font-[family-name:var(--font-syne)]" style={{ color }}>
        {label}
      </span>
      <div className="flex-1 h-px bg-[#21262d]" />
      <span className="text-xs bg-[#21262d] text-[#8b949e] border border-[#30363d] rounded-full px-2 py-0.5">{count}</span>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#0d1117] text-[#e6edf3] font-[family-name:var(--font-dm-sans)]">

      {/* HEADER */}
      <header className="border-b border-[#21262d] bg-[#0d1117]">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#21262d] rounded flex items-center justify-center text-xs text-[#484f58]">
              TFF
            </div>
            <span className="font-[family-name:var(--font-syne)] font-bold text-[#e6edf3] text-lg tracking-tight">
              Tactical Fit Finder
            </span>
          </div>
          <nav className="flex items-center gap-6">
            <a href="#how-it-works" className="text-sm text-[#8b949e] hover:text-[#e6edf3] transition-colors">
              How It Works
            </a>
          </nav>
        </div>
      </header>

      {/* HERO */}
      <section className="border-b border-[#21262d] bg-[#0d1117]">
        <div className="max-w-5xl mx-auto px-6 py-16 text-center">
          <div className="inline-flex items-center gap-2 bg-[#161b22] border border-[#30363d] rounded-full px-4 py-1.5 mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-[#3fb950]" />
            <span className="text-sm text-[#8b949e]">Free compatibility tool</span>
          </div>
          <h1 className="font-[family-name:var(--font-syne)] text-4xl md:text-5xl font-bold text-[#e6edf3] mb-4 leading-tight">
            Find the Right Optic<br />for Your Handgun
          </h1>
          <p className="text-[#8b949e] text-lg max-w-xl mx-auto leading-relaxed">
            Every optics-ready pistol has a footprint — a mounting pattern that only fits certain optics.
            Select your handgun below to see exactly which optics are compatible.
          </p>
        </div>
      </section>

      {/* SEARCH */}
      <section className="max-w-3xl mx-auto px-6 py-12">
        <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-6 mb-8">
          <h2 className="font-[family-name:var(--font-syne)] font-semibold text-[#e6edf3] mb-5">
            Select Your Handgun
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-[#8b949e] mb-1.5">Manufacturer</label>
              <select
                className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg p-2.5 text-[#e6edf3] focus:outline-none focus:border-[#58a6ff] transition-colors"
                onChange={(e) => setSelectedMake(Number(e.target.value))}
                defaultValue=""
              >
                <option value="" disabled>Select manufacturer...</option>
                {makes.map((make) => (
                  <option key={make.id} value={make.id}>{make.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-[#8b949e] mb-1.5">Model</label>
              <select
                className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg p-2.5 text-[#e6edf3] focus:outline-none focus:border-[#58a6ff] transition-colors disabled:opacity-40"
                onChange={(e) => handleModelSelect(Number(e.target.value))}
                defaultValue=""
                disabled={!selectedMake}
              >
                <option value="" disabled>Select model...</option>
                {models.map((model) => (
                  <option key={model.id} value={model.id}>{model.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* LOADING */}
        {loading && (
          <div className="flex items-center gap-3 text-[#8b949e] text-sm py-4">
            <div className="w-4 h-4 border-2 border-[#30363d] border-t-[#3fb950] rounded-full animate-spin" />
            Finding compatible optics...
          </div>
        )}

        {/* NO RESULTS */}
        {noResults && (
          <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-6 text-center">
            <p className="text-[#8b949e]">No compatible optics found for this model yet.</p>
            <p className="text-[#484f58] text-sm mt-1">Check back soon as we're adding data regularly.</p>
          </div>
        )}

        {/* RESULTS */}
        {!loading && hasResults && (
          <div className="grid gap-10">

            {/* Results summary header */}
            <div className="flex items-center gap-3">
              <h2 className="font-[family-name:var(--font-syne)] font-semibold text-[#e6edf3]">Compatible Optics</h2>
              {totalResults > 0 && (
                <span className="text-xs bg-[#21262d] text-[#8b949e] border border-[#30363d] rounded-full px-2.5 py-0.5">
                  {totalResults} result{totalResults !== 1 ? 's' : ''}
                </span>
              )}
            </div>

            {/* ── Pool 1: Direct footprint matches ── */}
            {footprintOptics.length > 0 && (
              <div className="grid gap-8">
                {footprintOptics.map(({ footprint, optics: opticsList }) => (
                  <div key={footprint?.id}>
                    <SectionHeader label={`${footprint?.name} footprint`} count={opticsList.length} />
                    <div className="grid gap-3">
                      {opticsList.map((optic) => (
                        <OpticCard key={optic.id} optic={optic} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* ── Pool 3: Direct-mount optics ── */}
            {directOptics.length > 0 && (
              <div>
                <SectionHeader label="Direct Mount" count={directOptics.length} color="#58a6ff" />
                <p className="text-sm text-[#8b949e] mb-4">
                  These optics are designed to mount directly on this handgun without a footprint adapter.
                </p>
                <div className="grid gap-3">
                  {directOptics.map((optic) => (
                    <OpticCard key={optic.id} optic={optic} />
                  ))}
                </div>
              </div>
            )}

            {/* ── Pool 2: Plate-based ── */}
            {plates.length > 0 && (
              <div>
                <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-4 mb-5 flex gap-3">
                  <span className="text-[#3fb950] text-lg">⚙</span>
                  <div>
                    <div className="font-medium text-[#e6edf3] font-[family-name:var(--font-syne)]">Adapter Plate System</div>
                    <p className="text-sm text-[#8b949e] mt-0.5">
                      This handgun also accepts adapter plates. Compatible optics depend on which plate you install.
                    </p>
                  </div>
                </div>
                <div className="grid gap-5">
                  {plates.map((plate) => (
                    <div key={plate.id} className="bg-[#161b22] border border-[#30363d] rounded-xl overflow-hidden">
                      <div className="flex items-start justify-between gap-4 p-4 border-b border-[#21262d]">
                        <div>
                          <div className="font-semibold text-[#e6edf3] font-[family-name:var(--font-syne)]">{plate.name}</div>
                          <div className="text-sm text-[#8b949e] mt-0.5">
                            Presents <span className="text-[#3fb950] font-medium">{plate.footprint?.name}</span> footprint
                          </div>
                          {plate.notes && <div className="text-sm text-[#484f58] mt-1">{plate.notes}</div>}
                        </div>
                        {plate.purchase_url && (
                          <a
                            href={plate.purchase_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="shrink-0 text-sm bg-[#21262d] hover:bg-[#30363d] text-[#c9d1d9] border border-[#30363d] px-3 py-1.5 rounded-lg transition-colors"
                          >
                            Buy Plate →
                          </a>
                        )}
                      </div>
                      <div className="p-4">
                        {plate.optics.length === 0 ? (
                          <p className="text-sm text-[#484f58]">No compatible optics found for this plate yet.</p>
                        ) : (
                          <div className="grid gap-3">
                            {plate.optics.map((optic) => (
                              <OpticCard key={optic.id} optic={optic} compact />
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        )}
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="border-t border-[#21262d] bg-[#0d1117]">
        <div className="max-w-5xl mx-auto px-6 py-16">
          <h2 className="font-[family-name:var(--font-syne)] text-2xl font-bold text-[#e6edf3] text-center mb-12">
            How It Works
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: '01', title: 'Select Your Handgun', body: "Choose your pistol's manufacturer and model from our database of optics-ready handguns." },
              { step: '02', title: 'We Match the Footprint', body: "Every optics-ready slide has a mounting footprint — a specific pattern of holes and dimensions. We identify yours automatically." },
              { step: '03', title: 'See Compatible Optics', body: "Browse every optic that natively fits your footprint, with pricing and direct links to purchase." }
            ].map(({ step, title, body }) => (
              <div key={step} className="relative">
                <div className="text-4xl font-bold font-[family-name:var(--font-syne)] text-[#21262d] mb-3">{step}</div>
                <div className="font-semibold text-[#e6edf3] font-[family-name:var(--font-syne)] mb-2">{title}</div>
                <p className="text-sm text-[#8b949e] leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-[#21262d]">
        <div className="max-w-5xl mx-auto px-6 py-8 flex items-center justify-between">
          <span className="font-[family-name:var(--font-syne)] font-bold text-[#484f58] text-sm">Tactical Fit Finder</span>
          <div className="flex gap-6 text-xs text-[#484f58]">
            <a href="/terms" className="hover:text-[#8b949e] transition-colors">Terms of Use</a>
            <a href="/privacy" className="hover:text-[#8b949e] transition-colors">Privacy Policy</a>
            <span>© {new Date().getFullYear()} tacticalfitfinder.com</span>
          </div>
        </div>
      </footer>

    </div>
  )
}