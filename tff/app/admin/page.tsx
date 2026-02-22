'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../lib/supabase'
import Image from 'next/image'

type Make = { id: number; name: string }
type Model = { id: number; name: string; make_id: number; fit_type: string; notes: string }
type Footprint = { id: number; name: string; description: string }
type OpticMake = { id: number; name: string }
type Optic = {
  id: number
  name: string
  optic_make_id: number | null
  sku: string | null
  msrp: number | null
  reticle: string | null
  image_url: string | null
  affiliate_url: string | null
  manufacturer_url: string | null
  battery_type: string | null
  solar: boolean
  mount_type: string
  notes: string | null
}
type Plate = { id: number; model_id: number; name: string; footprint_id: number; purchase_url: string; notes: string }

const ALL_EXPORT_TABLES = ['makes', 'models', 'footprints', 'optic_makes', 'optics', 'plates', 'model_footprints', 'optic_footprints', 'optic_model_compatibility']

export default function AdminPage() {
  const router = useRouter()

  const [makes, setMakes] = useState<Make[]>([])
  const [models, setModels] = useState<Model[]>([])
  const [footprints, setFootprints] = useState<Footprint[]>([])
  const [opticMakes, setOpticMakes] = useState<OpticMake[]>([])
  const [optics, setOptics] = useState<Optic[]>([])
  const [plates, setPlates] = useState<Plate[]>([])
  const [activeTab, setActiveTab] = useState('makes')
  const [message, setMessage] = useState({ text: '', type: 'success' })

  // --- Form state ---
  const [newMake, setNewMake] = useState('')
  const [newModel, setNewModel] = useState({ name: '', make_id: '', fit_type: 'single', notes: '', footprint_ids: [] as string[] })
  const [newFootprint, setNewFootprint] = useState({ name: '', description: '' })
  const [newOpticMake, setNewOpticMake] = useState('')
  const [newOptic, setNewOptic] = useState({
    name: '', optic_make_id: '', footprint_id: '', sku: '', msrp: '', reticle: '',
    affiliate_url: '', manufacturer_url: '', battery_type: '', solar: false,
    mount_type: 'standard', notes: '', image_url: '',
    compatible_model_ids: [] as string[]
  })
  const [newPlate, setNewPlate] = useState({ make_id: '', model_id: '', name: '', footprint_id: '', purchase_url: '', notes: '' })

  // --- Edit state ---
  const [editingMake, setEditingMake] = useState<{ id: number; name: string } | null>(null)
  const [editingModel, setEditingModel] = useState<{ id: number; name: string; make_id: number; fit_type: string; notes: string } | null>(null)
  const [editingFootprint, setEditingFootprint] = useState<{ id: number; name: string; description: string } | null>(null)
  const [editingOpticMake, setEditingOpticMake] = useState<{ id: number; name: string } | null>(null)
  const [editingOptic, setEditingOptic] = useState<{
    id: number; name: string; optic_make_id: number | null; sku: string; msrp: string
    reticle: string; affiliate_url: string; manufacturer_url: string; battery_type: string
    solar: boolean; mount_type: string; notes: string; image_url: string
    compatible_model_ids: string[]
  } | null>(null)
  const [editingPlate, setEditingPlate] = useState<{ id: number; model_id: number; name: string; footprint_id: number; purchase_url: string; notes: string } | null>(null)

  // --- Direct-mount model selector state ---
  const [dmNewMakeFilter, setDmNewMakeFilter] = useState('')
  const [dmEditMakeFilter, setDmEditMakeFilter] = useState('')

  // --- Image upload state ---
  const [uploadingNew, setUploadingNew] = useState(false)
  const [uploadingEdit, setUploadingEdit] = useState(false)
  const newImageRef = useRef<HTMLInputElement>(null)
  const editImageRef = useRef<HTMLInputElement>(null)

  // --- Other state ---
  const [plateModels, setPlateModels] = useState<Model[]>([])
  const [exportTables, setExportTables] = useState<string[]>([])
  const [exporting, setExporting] = useState(false)

  // --- CSV Import state ---
  const [importTable, setImportTable] = useState('')
  const [importRows, setImportRows] = useState<Record<string, string>[]>([])
  const [importFileName, setImportFileName] = useState('')
  const [importing, setImporting] = useState(false)
  const [importResult, setImportResult] = useState<{ inserted: number; updated: number; skipped: string[] } | null>(null)
  const importFileRef = useRef<HTMLInputElement>(null)

  // --- Refresh helpers ---
  const refreshMakes = () => supabase.from('makes').select('*').order('name').then(({ data }) => { if (data) setMakes(data) })
  const refreshModels = () => supabase.from('models').select('*').order('name').then(({ data }) => { if (data) setModels(data) })
  const refreshFootprints = () => supabase.from('footprints').select('*').order('name').then(({ data }) => { if (data) setFootprints(data) })
  const refreshOpticMakes = () => supabase.from('optic_makes').select('*').order('name').then(({ data }) => { if (data) setOpticMakes(data) })
  const refreshOptics = () => supabase.from('optics').select('*').order('name').then(({ data }) => { if (data) setOptics(data) })
  const refreshPlates = () => supabase.from('plates').select('*').order('name').then(({ data }) => { if (data) setPlates(data) })

  useEffect(() => {
    refreshMakes(); refreshModels(); refreshFootprints()
    refreshOpticMakes(); refreshOptics(); refreshPlates()
  }, [])

  useEffect(() => {
    if (!newPlate.make_id) { setPlateModels([]); return }
    setPlateModels(models.filter(m => m.make_id === Number(newPlate.make_id)))
  }, [newPlate.make_id, models])

  const showMessage = (text: string, type = 'success') => {
    setMessage({ text, type })
    setTimeout(() => setMessage({ text: '', type: 'success' }), 4000)
  }

  const post = async (table: string, data: object) => {
    const res = await fetch('/api/admin/data', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ table, data })
    })
    const json = await res.json()
    if (!res.ok) { showMessage('Error: ' + json.error, 'error'); return null }
    return json
  }

  const patch = async (table: string, id: number, data: object) => {
    const res = await fetch('/api/admin/data', {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ table, id, data })
    })
    if (!res.ok) { showMessage('Error updating record', 'error'); return false }
    return true
  }

  const destroy = async (table: string, id: number, warning?: string) => {
    if (!confirm(warning || 'Delete this record?')) return false
    const res = await fetch('/api/admin/data', {
      method: 'DELETE', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ table, id })
    })
    if (!res.ok) { showMessage('Error deleting record', 'error'); return false }
    return true
  }

  // --- Image upload ---
  const uploadImage = async (file: File, onSuccess: (url: string) => void, setUploading: (v: boolean) => void) => {
    setUploading(true)
    const fd = new FormData(); fd.append('file', file)
    const res = await fetch('/api/admin/upload', { method: 'POST', body: fd })
    const json = await res.json()
    setUploading(false)
    if (!res.ok) { showMessage('Upload failed: ' + json.error, 'error'); return }
    onSuccess(json.url)
    showMessage('Image uploaded successfully')
  }

  const logout = async () => {
    await fetch('/api/admin/login', { method: 'DELETE' })
    router.push('/admin/login')
  }

  // --- Direct-mount helpers ---
  const toggleCompatibleModel = (id: string, isEditing: boolean) => {
    if (isEditing) {
      setEditingOptic(prev => {
        if (!prev) return prev
        const already = prev.compatible_model_ids.includes(id)
        return { ...prev, compatible_model_ids: already ? prev.compatible_model_ids.filter(m => m !== id) : [...prev.compatible_model_ids, id] }
      })
    } else {
      setNewOptic(prev => {
        const already = prev.compatible_model_ids.includes(id)
        return { ...prev, compatible_model_ids: already ? prev.compatible_model_ids.filter(m => m !== id) : [...prev.compatible_model_ids, id] }
      })
    }
  }

  const saveCompatibleModels = async (opticId: number, modelIds: string[]) => {
    // Delete existing links then re-insert
    const { data: existing } = await supabase.from('optic_model_compatibility').select('id').eq('optic_id', opticId)
    if (existing) {
      for (const row of existing) {
        await fetch('/api/admin/data', {
          method: 'DELETE', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ table: 'optic_model_compatibility', id: row.id })
        })
      }
    }
    for (const modelId of modelIds) {
      await post('optic_model_compatibility', { optic_id: opticId, model_id: Number(modelId) })
    }
  }

  const toggleExportTable = (table: string) => {
    setExportTables(prev => prev.includes(table) ? prev.filter(t => t !== table) : [...prev, table])
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
        return str.includes(',') || str.includes('"') || str.includes('\n') ? `"${str.replace(/"/g, '""')}"` : str
      }).join(','))
      const csv = [headers.join(','), ...rows].join('\n')
      const blob = new Blob([csv], { type: 'text/csv' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a'); a.href = url; a.download = `${table}.csv`; a.click()
      URL.revokeObjectURL(url)
    }
    setExporting(false)
    showMessage(`Exported ${exportTables.length} table${exportTables.length > 1 ? 's' : ''}`)
  }

  // ================================================================
  // CSV IMPORT
  // ================================================================
  const CSV_TEMPLATES: Record<string, string> = {
    makes: 'name',
    optic_makes: 'name',
    footprints: 'name,description',
    models: 'make,name,fit_type,notes',
    optics: 'optic_make,name,sku,footprint,msrp,reticle,mount_type,battery_type,solar,affiliate_url,manufacturer_url,notes',
    plates: 'make,model,name,footprint,purchase_url,notes',
  }

  const parseCSV = (text: string): Record<string, string>[] => {
    const lines = text.trim().split(/\r?\n/)
    if (lines.length < 2) return []
    const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''))
    return lines.slice(1).map(line => {
      const values: string[] = []
      let current = ''; let inQuotes = false
      for (let i = 0; i < line.length; i++) {
        if (line[i] === '"') { inQuotes = !inQuotes }
        else if (line[i] === ',' && !inQuotes) { values.push(current.trim()); current = '' }
        else { current += line[i] }
      }
      values.push(current.trim())
      const row: Record<string, string> = {}
      headers.forEach((h, i) => { row[h] = (values[i] || '').replace(/^"|"$/g, '') })
      return row
    }).filter(row => Object.values(row).some(v => v !== ''))
  }

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImportFileName(file.name); setImportResult(null)
    const reader = new FileReader()
    reader.onload = (ev) => { setImportRows(parseCSV(ev.target?.result as string)) }
    reader.readAsText(file)
  }

  const runImport = async () => {
    if (!importTable || importRows.length === 0) return
    setImporting(true); setImportResult(null)
    let inserted = 0; let updated = 0; const skipped: string[] = []
    const makeMap = Object.fromEntries(makes.map(m => [m.name.toLowerCase(), m.id]))
    const footprintMap = Object.fromEntries(footprints.map(f => [f.name.toLowerCase(), f.id]))
    const opticMakeMap = Object.fromEntries(opticMakes.map(m => [m.name.toLowerCase(), m.id]))
    const modelMap = Object.fromEntries(models.map(m => [m.name.toLowerCase(), m.id]))

    for (const row of importRows) {
      try {
        let data: Record<string, any> = {}
        let matchField = 'name'; let matchValue = row.name?.trim()

        if (importTable === 'makes' || importTable === 'optic_makes') {
          if (!row.name?.trim()) { skipped.push('Empty name row'); continue }
          data = { name: row.name.trim() }
        } else if (importTable === 'footprints') {
          if (!row.name?.trim()) { skipped.push('Empty name row'); continue }
          data = { name: row.name.trim(), description: row.description?.trim() || null }
        } else if (importTable === 'models') {
          if (!row.name?.trim() || !row.make?.trim()) { skipped.push(`Row missing name or make: ${row.name}`); continue }
          const make_id = makeMap[row.make.trim().toLowerCase()]
          if (!make_id) { skipped.push(`Unknown make "${row.make}" for model "${row.name}"`); continue }
          const fit_type = row.fit_type?.trim() || 'single'
          if (!['single', 'multi', 'plate_based', 'mixed'].includes(fit_type)) {
            skipped.push(`Invalid fit_type "${fit_type}" for model "${row.name}"`); continue
          }
          data = { name: row.name.trim(), make_id, fit_type, notes: row.notes?.trim() || null }
        } else if (importTable === 'optics') {
          if (!row.name?.trim() || !row.optic_make?.trim()) { skipped.push(`Row missing name or optic_make: ${row.name}`); continue }
          const optic_make_id = opticMakeMap[row.optic_make.trim().toLowerCase()]
          if (!optic_make_id) { skipped.push(`Unknown optic make "${row.optic_make}" for optic "${row.name}"`); continue }
          const footprint_id = row.footprint?.trim() ? footprintMap[row.footprint.trim().toLowerCase()] : null
          if (row.footprint?.trim() && !footprint_id) { skipped.push(`Unknown footprint "${row.footprint}" for optic "${row.name}"`); continue }
          const mount_type = row.mount_type?.trim() || 'standard'
          if (!['standard', 'direct_mount'].includes(mount_type)) { skipped.push(`Invalid mount_type "${mount_type}" for optic "${row.name}"`); continue }
          data = {
            name: row.name.trim(), optic_make_id,
            sku: row.sku?.trim() || null,
            msrp: row.msrp?.trim() ? Number(row.msrp.trim()) : null,
            reticle: row.reticle?.trim() || null,
            mount_type,
            battery_type: row.battery_type?.trim() || null,
            solar: row.solar?.trim().toLowerCase() === 'true' || row.solar?.trim() === '1',
            affiliate_url: row.affiliate_url?.trim() || null,
            manufacturer_url: row.manufacturer_url?.trim() || null,
            notes: row.notes?.trim() || null,
            _footprint_id: footprint_id,
          }
        } else if (importTable === 'plates') {
          if (!row.name?.trim() || !row.model?.trim()) { skipped.push(`Row missing name or model: ${row.name}`); continue }
          const model_id = modelMap[row.model.trim().toLowerCase()]
          if (!model_id) { skipped.push(`Unknown model "${row.model}" for plate "${row.name}"`); continue }
          const footprint_id = row.footprint?.trim() ? footprintMap[row.footprint.trim().toLowerCase()] : null
          if (!footprint_id) { skipped.push(`Unknown footprint "${row.footprint}" for plate "${row.name}"`); continue }
          data = { name: row.name.trim(), model_id, footprint_id, purchase_url: row.purchase_url?.trim() || null, notes: row.notes?.trim() || null }
        }

        let existingQuery = supabase.from(importTable).select('id').eq(matchField, matchValue)
        if (importTable === 'models' && data.make_id) existingQuery = existingQuery.eq('make_id', data.make_id)
        if (importTable === 'optics' && data.optic_make_id) existingQuery = existingQuery.eq('optic_make_id', data.optic_make_id)
        const { data: existing } = await existingQuery.maybeSingle()

        const footprintIdForJunction = data._footprint_id
        delete data._footprint_id

        if (existing) {
          await fetch('/api/admin/data', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ table: importTable, id: existing.id, data }) })
          updated++
        } else {
          const res = await fetch('/api/admin/data', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ table: importTable, data, returning: true }) })
          const json = await res.json()
          if (!res.ok) { skipped.push(`Insert failed for "${matchValue}": ${json.error}`); continue }
          if (importTable === 'optics' && footprintIdForJunction && json.id) {
            const { data: existingJunction } = await supabase.from('optic_footprints').select('id').eq('optic_id', json.id).eq('footprint_id', footprintIdForJunction).maybeSingle()
            if (!existingJunction) {
              await fetch('/api/admin/data', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ table: 'optic_footprints', data: { optic_id: json.id, footprint_id: footprintIdForJunction } }) })
            }
          }
          inserted++
        }
      } catch (err: any) { skipped.push(`Error on row "${row.name}": ${err.message}`) }
    }

    setImportResult({ inserted, updated, skipped })
    setImporting(false)
    refreshMakes(); refreshModels(); refreshFootprints(); refreshOpticMakes(); refreshOptics(); refreshPlates()
    if (importFileRef.current) importFileRef.current.value = ''
    setImportRows([]); setImportFileName('')
  }

  const downloadTemplate = (table: string) => {
    const csv = CSV_TEMPLATES[table] + '\n'
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = `${table}-template.csv`; a.click()
    URL.revokeObjectURL(url)
  }

  // ================================================================
  // MAKES
  // ================================================================
  const addMake = async () => {
    if (!newMake.trim()) return
    const ok = await post('makes', { name: newMake.trim() })
    if (!ok) return
    showMessage('Make added'); setNewMake(''); refreshMakes()
  }
  const saveMake = async () => {
    if (!editingMake?.name.trim()) return
    const ok = await patch('makes', editingMake.id, { name: editingMake.name.trim() })
    if (!ok) return
    showMessage('Make updated'); setEditingMake(null); refreshMakes()
  }
  const deleteMake = async (id: number) => {
    const ok = await destroy('makes', id, 'Delete this manufacturer? This will affect all linked models.')
    if (!ok) return
    showMessage('Make deleted'); refreshMakes()
  }

  // ================================================================
  // MODELS
  // ================================================================
  const addModel = async () => {
    if (!newModel.name.trim() || !newModel.make_id) return
    if (newModel.fit_type === 'single' && newModel.footprint_ids.length === 0) {
      showMessage('Please select a footprint', 'error'); return
    }
    if (newModel.fit_type === 'multi' && newModel.footprint_ids.length < 2) {
      showMessage('Please select at least 2 footprints for a multi-cut model', 'error'); return
    }
    const res = await fetch('/api/admin/data', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        table: 'models',
        data: { name: newModel.name.trim(), make_id: Number(newModel.make_id), fit_type: newModel.fit_type, notes: newModel.notes.trim() || null },
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
    showMessage('Model added')
    setNewModel({ name: '', make_id: '', fit_type: 'single', notes: '', footprint_ids: [] })
    refreshModels()
  }
  const saveModel = async () => {
    if (!editingModel?.name.trim()) return
    const ok = await patch('models', editingModel.id, {
      name: editingModel.name.trim(), make_id: editingModel.make_id,
      fit_type: editingModel.fit_type, notes: editingModel.notes.trim() || null
    })
    if (!ok) return
    showMessage('Model updated'); setEditingModel(null); refreshModels()
  }
  const deleteModel = async (id: number) => {
    const ok = await destroy('models', id, 'Delete this model? This will affect all linked footprints and plates.')
    if (!ok) return
    showMessage('Model deleted'); refreshModels()
  }
  const toggleFootprint = (id: string) => {
    setNewModel(prev => {
      const already = prev.footprint_ids.includes(id)
      if (prev.fit_type === 'single') return { ...prev, footprint_ids: already ? [] : [id] }
      return { ...prev, footprint_ids: already ? prev.footprint_ids.filter(f => f !== id) : [...prev.footprint_ids, id] }
    })
  }

  // ================================================================
  // FOOTPRINTS
  // ================================================================
  const addFootprint = async () => {
    if (!newFootprint.name.trim()) return
    const ok = await post('footprints', { name: newFootprint.name.trim(), description: newFootprint.description.trim() || null })
    if (!ok) return
    showMessage('Footprint added'); setNewFootprint({ name: '', description: '' }); refreshFootprints()
  }
  const saveFootprint = async () => {
    if (!editingFootprint?.name.trim()) return
    const ok = await patch('footprints', editingFootprint.id, { name: editingFootprint.name.trim(), description: editingFootprint.description.trim() || null })
    if (!ok) return
    showMessage('Footprint updated'); setEditingFootprint(null); refreshFootprints()
  }
  const deleteFootprint = async (id: number) => {
    const ok = await destroy('footprints', id, 'Delete this footprint? This may affect linked models and optics.')
    if (!ok) return
    showMessage('Footprint deleted'); refreshFootprints()
  }

  // ================================================================
  // OPTIC MAKES
  // ================================================================
  const addOpticMake = async () => {
    if (!newOpticMake.trim()) return
    const ok = await post('optic_makes', { name: newOpticMake.trim() })
    if (!ok) return
    showMessage('Optic manufacturer added'); setNewOpticMake(''); refreshOpticMakes()
  }
  const saveOpticMake = async () => {
    if (!editingOpticMake?.name.trim()) return
    const ok = await patch('optic_makes', editingOpticMake.id, { name: editingOpticMake.name.trim() })
    if (!ok) return
    showMessage('Optic manufacturer updated'); setEditingOpticMake(null); refreshOpticMakes()
  }
  const deleteOpticMake = async (id: number) => {
    const ok = await destroy('optic_makes', id, 'Delete this optic manufacturer? This will affect all linked optic models.')
    if (!ok) return
    showMessage('Optic manufacturer deleted'); refreshOpticMakes()
  }

  // ================================================================
  // OPTIC MODELS
  // ================================================================
  const addOptic = async () => {
    if (!newOptic.name.trim() || !newOptic.optic_make_id) {
      showMessage('Name and manufacturer are required', 'error'); return
    }
    if (newOptic.mount_type === 'standard' && !newOptic.footprint_id) {
      showMessage('Footprint is required for standard mount optics', 'error'); return
    }
    if (newOptic.mount_type === 'direct_mount' && newOptic.compatible_model_ids.length === 0) {
      showMessage('Select at least one compatible firearm for direct-mount optics', 'error'); return
    }

    const res = await fetch('/api/admin/data', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        table: 'optics',
        data: {
          name: newOptic.name.trim(),
          optic_make_id: Number(newOptic.optic_make_id),
          sku: newOptic.sku.trim() || null,
          msrp: newOptic.msrp ? Number(newOptic.msrp) : null,
          reticle: newOptic.reticle.trim() || null,
          mount_type: newOptic.mount_type,
          battery_type: newOptic.battery_type.trim() || null,
          solar: newOptic.solar,
          affiliate_url: newOptic.affiliate_url.trim() || null,
          manufacturer_url: newOptic.manufacturer_url.trim() || null,
          notes: newOptic.notes.trim() || null,
          image_url: newOptic.image_url || null
        },
        returning: true
      })
    })
    const json = await res.json()
    if (!res.ok) { showMessage('Error: ' + json.error, 'error'); return }

    if (newOptic.mount_type === 'standard' && newOptic.footprint_id) {
      await post('optic_footprints', { optic_id: json.id, footprint_id: Number(newOptic.footprint_id) })
    }
    if (newOptic.mount_type === 'direct_mount' && newOptic.compatible_model_ids.length > 0) {
      await saveCompatibleModels(json.id, newOptic.compatible_model_ids)
    }

    showMessage('Optic added')
    setNewOptic({ name: '', optic_make_id: '', footprint_id: '', sku: '', msrp: '', reticle: '', affiliate_url: '', manufacturer_url: '', battery_type: '', solar: false, mount_type: 'standard', notes: '', image_url: '', compatible_model_ids: [] })
    setDmNewMakeFilter('')
    if (newImageRef.current) newImageRef.current.value = ''
    refreshOptics()
  }

  const saveOptic = async () => {
    if (!editingOptic?.name.trim()) return
    const ok = await patch('optics', editingOptic.id, {
      name: editingOptic.name.trim(),
      optic_make_id: editingOptic.optic_make_id,
      sku: editingOptic.sku.trim() || null,
      msrp: editingOptic.msrp ? Number(editingOptic.msrp) : null,
      reticle: editingOptic.reticle.trim() || null,
      mount_type: editingOptic.mount_type,
      battery_type: editingOptic.battery_type.trim() || null,
      solar: editingOptic.solar,
      affiliate_url: editingOptic.affiliate_url.trim() || null,
      manufacturer_url: editingOptic.manufacturer_url.trim() || null,
      notes: editingOptic.notes.trim() || null,
      image_url: editingOptic.image_url || null
    })
    if (!ok) return
    if (editingOptic.mount_type === 'direct_mount') {
      await saveCompatibleModels(editingOptic.id, editingOptic.compatible_model_ids)
    }
    showMessage('Optic updated'); setEditingOptic(null); refreshOptics()
  }

  const deleteOptic = async (id: number) => {
    const ok = await destroy('optics', id, 'Delete this optic? This will remove all its footprint and compatibility links.')
    if (!ok) return
    showMessage('Optic deleted'); refreshOptics()
  }

  const startEditOptic = async (o: Optic) => {
    // Load existing compatible model IDs
    const { data: compat } = await supabase.from('optic_model_compatibility').select('model_id').eq('optic_id', o.id)
    const compatIds = compat ? compat.map((r: any) => String(r.model_id)) : []
    setEditingOptic({
      id: o.id, name: o.name, optic_make_id: o.optic_make_id, sku: o.sku || '',
      msrp: o.msrp ? String(o.msrp) : '', reticle: o.reticle || '',
      affiliate_url: o.affiliate_url || '', manufacturer_url: o.manufacturer_url || '',
      battery_type: o.battery_type || '', solar: o.solar, mount_type: o.mount_type,
      notes: o.notes || '', image_url: o.image_url || '', compatible_model_ids: compatIds
    })
    setDmEditMakeFilter('')
  }

  // ================================================================
  // PLATES
  // ================================================================
  const addPlate = async () => {
    if (!newPlate.model_id || !newPlate.name.trim() || !newPlate.footprint_id) {
      showMessage('Model, plate name and footprint are required', 'error'); return
    }
    const ok = await post('plates', {
      model_id: Number(newPlate.model_id), name: newPlate.name.trim(),
      footprint_id: Number(newPlate.footprint_id),
      purchase_url: newPlate.purchase_url.trim() || null,
      notes: newPlate.notes.trim() || null
    })
    if (!ok) return
    showMessage('Plate added')
    setNewPlate({ make_id: '', model_id: '', name: '', footprint_id: '', purchase_url: '', notes: '' })
    refreshPlates()
  }
  const savePlate = async () => {
    if (!editingPlate?.name.trim()) return
    const ok = await patch('plates', editingPlate.id, {
      name: editingPlate.name.trim(), model_id: editingPlate.model_id,
      footprint_id: editingPlate.footprint_id,
      purchase_url: editingPlate.purchase_url.trim() || null,
      notes: editingPlate.notes.trim() || null
    })
    if (!ok) return
    showMessage('Plate updated'); setEditingPlate(null); refreshPlates()
  }
  const deletePlate = async (id: number) => {
    const ok = await destroy('plates', id, 'Delete this plate?')
    if (!ok) return
    showMessage('Plate deleted'); refreshPlates()
  }

  // --- Lookups ---
  const getMakeName = (id: number) => makes.find(m => m.id === id)?.name || '—'
  const getFootprintName = (id: number) => footprints.find(f => f.id === id)?.name || '—'
  const getModelName = (id: number) => models.find(m => m.id === id)?.name || '—'
  const getOpticMakeName = (id: number | null) => id ? opticMakes.find(m => m.id === id)?.name || '—' : '—'

  const tabs = ['makes', 'models', 'footprints', 'optic makes', 'optic models', 'plates']

  const inputClass = "bg-[#1c2128] border border-[#30363d] rounded p-2 w-full text-[#e6edf3] placeholder-[#484f58] focus:outline-none focus:border-[#58a6ff] transition-colors"
  const selectClass = "bg-[#1c2128] border border-[#30363d] rounded p-2 w-full text-[#e6edf3] focus:outline-none focus:border-[#58a6ff] transition-colors"
  const btnClass = "bg-[#238636] text-white rounded p-2 w-full font-medium hover:bg-[#2ea043] transition-colors font-[family-name:var(--font-syne)]"
  const editBtnClass = "text-sm px-3 py-1 rounded bg-[#21262d] text-[#c9d1d9] hover:bg-[#30363d] border border-[#30363d] transition-colors"
  const deleteBtnClass = "text-sm px-3 py-1 rounded bg-transparent text-[#f85149] hover:bg-[#21262d] border border-[#f85149]/30 transition-colors"
  const cardClass = "border border-[#30363d] rounded p-3 bg-[#161b22]"

  // Toggle pill for mount type and solar
  const TogglePill = ({ value, onChange, labelA, labelB }: { value: boolean; onChange: (v: boolean) => void; labelA: string; labelB: string }) => (
    <div className="flex rounded overflow-hidden border border-[#30363d]">
      <button type="button" onClick={() => onChange(false)} className={`flex-1 text-sm py-2 transition-colors ${!value ? 'bg-[#58a6ff] text-white font-medium' : 'bg-[#1c2128] text-[#8b949e] hover:text-[#e6edf3]'}`}>{labelA}</button>
      <button type="button" onClick={() => onChange(true)} className={`flex-1 text-sm py-2 transition-colors ${value ? 'bg-[#58a6ff] text-white font-medium' : 'bg-[#1c2128] text-[#8b949e] hover:text-[#e6edf3]'}`}>{labelB}</button>
    </div>
  )

  // Firearm model multi-selector for direct-mount optics
  const DirectMountSelector = ({ selectedIds, onToggle, makeFilter, onMakeFilterChange }: {
    selectedIds: string[]; onToggle: (id: string) => void
    makeFilter: string; onMakeFilterChange: (v: string) => void
  }) => {
    const filteredModels = makeFilter ? models.filter(m => m.make_id === Number(makeFilter)) : models
    return (
      <div className="grid gap-2">
        <select className={selectClass} value={makeFilter} onChange={e => onMakeFilterChange(e.target.value)}>
          <option value="">All manufacturers</option>
          {makes.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
        </select>
        <div className="max-h-48 overflow-y-auto grid gap-1 border border-[#30363d] rounded p-2 bg-[#0d1117]">
          {filteredModels.length === 0 ? (
            <p className="text-xs text-[#484f58] p-1">No models found</p>
          ) : filteredModels.map(m => (
            <label key={m.id} className={`flex items-center gap-2 p-1.5 rounded cursor-pointer transition-colors ${selectedIds.includes(String(m.id)) ? 'bg-[#1c2128] border border-[#58a6ff]' : 'hover:bg-[#1c2128] border border-transparent'}`}>
              <input type="checkbox" checked={selectedIds.includes(String(m.id))} onChange={() => onToggle(String(m.id))} className="accent-[#58a6ff]" />
              <span className="text-sm text-[#e6edf3]">{getMakeName(m.make_id)} {m.name}</span>
            </label>
          ))}
        </div>
        {selectedIds.length > 0 && (
          <p className="text-xs text-[#3fb950]">{selectedIds.length} firearm{selectedIds.length > 1 ? 's' : ''} selected</p>
        )}
      </div>
    )
  }

  // Image upload field
  const ImageUploadField = ({ currentUrl, uploading, inputRef, onFileChange, onClear, label = 'Product Image' }: {
    currentUrl: string; uploading: boolean; inputRef: React.RefObject<HTMLInputElement | null>
    onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void; onClear: () => void; label?: string
  }) => (
    <div>
      <label className="block text-sm font-medium mb-1 text-[#8b949e]">{label}</label>
      {currentUrl ? (
        <div className="flex items-center gap-3 p-2 bg-[#1c2128] border border-[#30363d] rounded">
          <Image src={currentUrl} alt="Optic preview" width={56} height={56} className="object-contain rounded border border-[#30363d] bg-[#0d1117]" />
          <div className="flex-1 min-w-0">
            <p className="text-xs text-[#3fb950] truncate">Image uploaded</p>
            <p className="text-xs text-[#484f58] truncate mt-0.5">{currentUrl.split('/').pop()}</p>
          </div>
          <button type="button" onClick={onClear} className="text-xs text-[#f85149] hover:text-[#ff7b72] px-2 py-1 rounded hover:bg-[#21262d] transition-colors shrink-0">Remove</button>
        </div>
      ) : (
        <div onClick={() => inputRef.current?.click()} className="flex items-center gap-3 p-3 bg-[#1c2128] border border-dashed border-[#30363d] rounded cursor-pointer hover:border-[#58a6ff] transition-colors">
          {uploading ? <div className="w-4 h-4 border-2 border-[#30363d] border-t-[#3fb950] rounded-full animate-spin" /> : (
            <svg className="w-4 h-4 text-[#484f58]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          )}
          <span className="text-sm text-[#8b949e]">{uploading ? 'Uploading...' : 'Click to upload image (JPEG, PNG, WebP — max 2MB)'}</span>
        </div>
      )}
      <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="hidden" onChange={onFileChange} />
    </div>
  )

  return (
    <div className="min-h-screen flex bg-[#0d1117] text-[#e6edf3] font-[family-name:var(--font-dm-sans)]">

      {/* SIDEBAR */}
      <aside className="w-56 shrink-0 border-r border-[#21262d] bg-[#0d1117] p-6 flex flex-col gap-8">
        <div>
          <div className="text-xs font-semibold uppercase tracking-widest text-[#484f58] mb-4 font-[family-name:var(--font-syne)]">TFF Admin</div>
          <button onClick={logout} className="w-full text-left text-sm px-3 py-2 rounded hover:bg-[#21262d] transition-colors text-[#f85149] font-medium">Log out</button>
        </div>

        {/* EXPORT CSV */}
        <div>
          <div className="text-xs font-semibold uppercase tracking-widest text-[#484f58] mb-3 font-[family-name:var(--font-syne)]">Export CSV</div>
          <div className="grid gap-1 mb-3">
            <label className="flex items-center gap-2 text-sm cursor-pointer py-1 text-[#8b949e] hover:text-[#e6edf3] transition-colors">
              <input type="checkbox" checked={exportTables.length === ALL_EXPORT_TABLES.length} onChange={toggleAllExport} className="rounded accent-[#58a6ff]" />
              <span className="font-medium text-[#c9d1d9]">All tables</span>
            </label>
            <div className="border-t border-[#21262d] my-1" />
            {ALL_EXPORT_TABLES.map(table => (
              <label key={table} className="flex items-center gap-2 text-sm cursor-pointer py-1 text-[#8b949e] hover:text-[#e6edf3] transition-colors">
                <input type="checkbox" checked={exportTables.includes(table)} onChange={() => toggleExportTable(table)} className="rounded accent-[#58a6ff]" />
                {table}
              </label>
            ))}
          </div>
          <button onClick={exportCSV} disabled={exporting || exportTables.length === 0} className="w-full text-sm bg-[#21262d] text-[#c9d1d9] border border-[#30363d] rounded p-2 font-medium hover:bg-[#30363d] transition-colors disabled:opacity-40">
            {exporting ? 'Exporting...' : 'Export'}
          </button>
        </div>

        {/* IMPORT CSV */}
        <div>
          <div className="text-xs font-semibold uppercase tracking-widest text-[#484f58] mb-3 font-[family-name:var(--font-syne)]">Import CSV</div>
          <div className="grid gap-2">
            <select className="bg-[#1c2128] border border-[#30363d] rounded p-2 w-full text-[#e6edf3] text-sm focus:outline-none focus:border-[#58a6ff] transition-colors" value={importTable} onChange={e => { setImportTable(e.target.value); setImportRows([]); setImportFileName(''); setImportResult(null) }}>
              <option value="" disabled>Select table...</option>
              {['makes', 'optic_makes', 'footprints', 'models', 'optics', 'plates'].map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            {importTable && (
              <button onClick={() => downloadTemplate(importTable)} className="w-full text-xs bg-transparent text-[#58a6ff] border border-[#58a6ff]/30 rounded p-1.5 hover:bg-[#58a6ff]/10 transition-colors">
                Download template CSV
              </button>
            )}
            <div onClick={() => importTable && importFileRef.current?.click()} className={`flex items-center gap-2 p-2.5 border border-dashed rounded transition-colors text-sm ${importTable ? 'border-[#30363d] hover:border-[#58a6ff] cursor-pointer text-[#8b949e]' : 'border-[#21262d] text-[#484f58] cursor-not-allowed'}`}>
              <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              <span className="truncate">{importFileName || 'Choose CSV file...'}</span>
            </div>
            <input ref={importFileRef} type="file" accept=".csv" className="hidden" onChange={handleImportFile} />
            {importRows.length > 0 && (
              <div className="bg-[#161b22] border border-[#30363d] rounded p-2 text-xs text-[#8b949e]">
                <span className="text-[#3fb950] font-medium">{importRows.length} rows</span> ready
                <div className="mt-1 text-[#484f58] truncate">Preview: {Object.values(importRows[0]).slice(0, 3).join(', ')}…</div>
              </div>
            )}
            {importResult && (
              <div className="bg-[#161b22] border border-[#30363d] rounded p-2 text-xs grid gap-1">
                <div className="text-[#3fb950]">✓ {importResult.inserted} inserted, {importResult.updated} updated</div>
                {importResult.skipped.length > 0 && (
                  <div className="text-[#f85149]">✗ {importResult.skipped.length} skipped:
                    <ul className="mt-1 grid gap-0.5">{importResult.skipped.map((s, i) => <li key={i} className="text-[#484f58] leading-snug">{s}</li>)}</ul>
                  </div>
                )}
              </div>
            )}
            <button onClick={runImport} disabled={importing || importRows.length === 0 || !importTable} className="w-full text-sm bg-[#21262d] text-[#c9d1d9] border border-[#30363d] rounded p-2 font-medium hover:bg-[#30363d] transition-colors disabled:opacity-40">
              {importing ? 'Importing...' : 'Import'}
            </button>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 p-8 max-w-2xl">
        <h1 className="text-2xl font-bold mb-6 font-[family-name:var(--font-syne)] text-[#e6edf3]">Admin Dashboard</h1>

        {message.text && (
          <div className={`rounded p-3 mb-6 text-sm border ${message.type === 'error' ? 'bg-[#ff000015] text-[#f85149] border-[#f85149]/30' : 'bg-[#23863615] text-[#3fb950] border-[#238636]/30'}`}>
            {message.text}
          </div>
        )}

        <div className="flex gap-2 mb-6 flex-wrap">
          {tabs.map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`px-3 py-1 rounded text-sm font-medium capitalize transition-colors font-[family-name:var(--font-syne)] ${activeTab === tab ? 'bg-[#21262d] text-[#e6edf3] border border-[#58a6ff]' : 'bg-[#161b22] text-[#8b949e] border border-[#30363d] hover:text-[#e6edf3] hover:border-[#484f58]'}`}>
              {tab}
            </button>
          ))}
        </div>

        {/* ============================================================ */}
        {/* MAKES */}
        {/* ============================================================ */}
        {activeTab === 'makes' && (
          <div className="grid gap-6">
            <div className="grid gap-3">
              <h2 className="font-semibold font-[family-name:var(--font-syne)] text-[#e6edf3]">Add Firearm Manufacturer</h2>
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

        {/* ============================================================ */}
        {/* MODELS */}
        {/* ============================================================ */}
        {activeTab === 'models' && (
          <div className="grid gap-6">
            <div className="grid gap-3">
              <h2 className="font-semibold font-[family-name:var(--font-syne)] text-[#e6edf3]">Add Firearm Model</h2>
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
                  <option value="mixed">Mixed — footprint cut + adapter plates</option>
                </select>
              </div>
              {(newModel.fit_type === 'single' || newModel.fit_type === 'mixed') && (
                <div>
                  <label className="block text-sm font-medium mb-1 text-[#8b949e]">
                    {newModel.fit_type === 'mixed' ? 'Direct-cut footprint(s)' : 'Footprint'}
                  </label>
                  <div className="grid gap-1">
                    {footprints.map(f => (
                      <label key={f.id} className={`flex items-center gap-2 p-2 border rounded cursor-pointer transition-colors ${newModel.footprint_ids.includes(String(f.id)) ? 'border-[#58a6ff] bg-[#1c2128]' : 'border-[#30363d] hover:border-[#484f58]'}`}>
                        <input
                          type={newModel.fit_type === 'single' ? 'radio' : 'checkbox'}
                          name="single_footprint"
                          checked={newModel.footprint_ids.includes(String(f.id))}
                          onChange={() => toggleFootprint(String(f.id))}
                          className="accent-[#58a6ff]"
                        />
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
              {(newModel.fit_type === 'plate_based' || newModel.fit_type === 'mixed') && (
                <p className="text-sm text-[#8b949e] bg-[#161b22] border border-[#30363d] rounded p-3">
                  {newModel.fit_type === 'mixed'
                    ? 'This model also accepts adapter plates. After saving, go to the Plates tab to add each plate.'
                    : 'This model uses adapter plates. After saving, go to the Plates tab to add each plate and its footprint.'}
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
                            <option value="mixed">Mixed</option>
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

        {/* ============================================================ */}
        {/* FOOTPRINTS */}
        {/* ============================================================ */}
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

        {/* ============================================================ */}
        {/* OPTIC MAKES */}
        {/* ============================================================ */}
        {activeTab === 'optic makes' && (
          <div className="grid gap-6">
            <div className="grid gap-3">
              <h2 className="font-semibold font-[family-name:var(--font-syne)] text-[#e6edf3]">Add Optic Manufacturer</h2>
              <input className={inputClass} placeholder="e.g. Trijicon" value={newOpticMake} onChange={e => setNewOpticMake(e.target.value)} onKeyDown={e => e.key === 'Enter' && addOpticMake()} />
              <button onClick={addOpticMake} className={btnClass}>Add Optic Manufacturer</button>
            </div>
            <div>
              <h2 className="font-semibold mb-3 font-[family-name:var(--font-syne)] text-[#e6edf3]">Existing Optic Manufacturers</h2>
              {opticMakes.length === 0 ? <p className="text-sm text-[#484f58]">No optic manufacturers added yet.</p> : (
                <div className="grid gap-2">
                  {opticMakes.map(m => (
                    <div key={m.id} className={cardClass}>
                      {editingOpticMake?.id === m.id ? (
                        <div className="grid gap-2">
                          <input className={inputClass} value={editingOpticMake.name} onChange={e => setEditingOpticMake({ ...editingOpticMake, name: e.target.value })} />
                          <div className="flex gap-2">
                            <button onClick={saveOpticMake} className="flex-1 bg-[#238636] text-white rounded p-2 text-sm hover:bg-[#2ea043] transition-colors">Save</button>
                            <button onClick={() => setEditingOpticMake(null)} className="flex-1 bg-[#21262d] text-[#c9d1d9] rounded p-2 text-sm hover:bg-[#30363d] transition-colors">Cancel</button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between gap-4">
                          <div className="font-medium text-[#e6edf3]">{m.name}</div>
                          <div className="flex gap-2 shrink-0">
                            <button onClick={() => setEditingOpticMake({ id: m.id, name: m.name })} className={editBtnClass}>Edit</button>
                            <button onClick={() => deleteOpticMake(m.id)} className={deleteBtnClass}>Delete</button>
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

        {/* ============================================================ */}
        {/* OPTIC MODELS */}
        {/* ============================================================ */}
        {activeTab === 'optic models' && (
          <div className="grid gap-6">
            <div className="grid gap-3">
              <h2 className="font-semibold font-[family-name:var(--font-syne)] text-[#e6edf3]">Add Optic Model</h2>

              <div>
                <label className="block text-sm font-medium mb-1 text-[#8b949e]">Manufacturer <span className="text-[#f85149]">*</span></label>
                <select className={selectClass} value={newOptic.optic_make_id} onChange={e => setNewOptic({ ...newOptic, optic_make_id: e.target.value })}>
                  <option value="" disabled>Select optic manufacturer...</option>
                  {opticMakes.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-[#8b949e]">Model Name <span className="text-[#f85149]">*</span></label>
                <input className={inputClass} placeholder="e.g. RMR Type 2" value={newOptic.name} onChange={e => setNewOptic({ ...newOptic, name: e.target.value })} />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-[#8b949e]">SKU</label>
                <input className={inputClass} placeholder="e.g. RMR06" value={newOptic.sku} onChange={e => setNewOptic({ ...newOptic, sku: e.target.value })} />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-[#8b949e]">Mount Type <span className="text-[#f85149]">*</span></label>
                <TogglePill
                  value={newOptic.mount_type === 'direct_mount'}
                  onChange={v => setNewOptic({ ...newOptic, mount_type: v ? 'direct_mount' : 'standard', footprint_id: '', compatible_model_ids: [] })}
                  labelA="Standard Footprint"
                  labelB="Direct Mount"
                />
              </div>

              {newOptic.mount_type === 'standard' && (
                <div>
                  <label className="block text-sm font-medium mb-1 text-[#8b949e]">Footprint <span className="text-[#f85149]">*</span></label>
                  <select className={selectClass} value={newOptic.footprint_id} onChange={e => setNewOptic({ ...newOptic, footprint_id: e.target.value })}>
                    <option value="" disabled>Select footprint...</option>
                    {footprints.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                  </select>
                </div>
              )}

              {newOptic.mount_type === 'direct_mount' && (
                <div>
                  <label className="block text-sm font-medium mb-1 text-[#8b949e]">Compatible Firearms <span className="text-[#f85149]">*</span></label>
                  <DirectMountSelector
                    selectedIds={newOptic.compatible_model_ids}
                    onToggle={id => toggleCompatibleModel(id, false)}
                    makeFilter={dmNewMakeFilter}
                    onMakeFilterChange={setDmNewMakeFilter}
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1 text-[#8b949e]">MSRP ($)</label>
                  <input className={inputClass} placeholder="e.g. 699" type="number" min="0" step="0.01" value={newOptic.msrp} onChange={e => setNewOptic({ ...newOptic, msrp: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-[#8b949e]">Reticle / MOA</label>
                  <input className={inputClass} placeholder="e.g. 3.25 MOA Dot" value={newOptic.reticle} onChange={e => setNewOptic({ ...newOptic, reticle: e.target.value })} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1 text-[#8b949e]">Battery Type</label>
                  <input className={inputClass} placeholder="e.g. CR2032" value={newOptic.battery_type} onChange={e => setNewOptic({ ...newOptic, battery_type: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-[#8b949e]">Solar</label>
                  <TogglePill value={newOptic.solar} onChange={v => setNewOptic({ ...newOptic, solar: v })} labelA="No" labelB="Solar Enabled" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-[#8b949e]">Purchase / Affiliate URL</label>
                <input className={inputClass} placeholder="https://..." value={newOptic.affiliate_url} onChange={e => setNewOptic({ ...newOptic, affiliate_url: e.target.value })} />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-[#8b949e]">Manufacturer URL</label>
                <input className={inputClass} placeholder="https://manufacturer.com/product" value={newOptic.manufacturer_url} onChange={e => setNewOptic({ ...newOptic, manufacturer_url: e.target.value })} />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-[#8b949e]">Notes</label>
                <input className={inputClass} placeholder="Optional notes" value={newOptic.notes} onChange={e => setNewOptic({ ...newOptic, notes: e.target.value })} />
              </div>

              <ImageUploadField
                currentUrl={newOptic.image_url}
                uploading={uploadingNew}
                inputRef={newImageRef}
                onFileChange={e => { const file = e.target.files?.[0]; if (file) uploadImage(file, url => setNewOptic(prev => ({ ...prev, image_url: url })), setUploadingNew) }}
                onClear={() => { setNewOptic(prev => ({ ...prev, image_url: '' })); if (newImageRef.current) newImageRef.current.value = '' }}
              />

              <button onClick={addOptic} className={btnClass} disabled={uploadingNew}>
                {uploadingNew ? 'Uploading image...' : 'Add Optic Model'}
              </button>
            </div>

            {/* Existing optics list */}
            <div>
              <h2 className="font-semibold mb-3 font-[family-name:var(--font-syne)] text-[#e6edf3]">Existing Optic Models</h2>
              {optics.length === 0 ? <p className="text-sm text-[#484f58]">No optic models added yet.</p> : (
                <div className="grid gap-2">
                  {optics.map(o => (
                    <div key={o.id} className={cardClass}>
                      {editingOptic?.id === o.id ? (
                        <div className="grid gap-2">
                          <select className={selectClass} value={editingOptic.optic_make_id ?? ''} onChange={e => setEditingOptic({ ...editingOptic, optic_make_id: Number(e.target.value) })}>
                            <option value="" disabled>Select manufacturer...</option>
                            {opticMakes.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                          </select>
                          <input className={inputClass} placeholder="Model name" value={editingOptic.name} onChange={e => setEditingOptic({ ...editingOptic, name: e.target.value })} />
                          <input className={inputClass} placeholder="SKU" value={editingOptic.sku} onChange={e => setEditingOptic({ ...editingOptic, sku: e.target.value })} />
                          <div>
                            <label className="block text-sm font-medium mb-2 text-[#8b949e]">Mount Type</label>
                            <TogglePill
                              value={editingOptic.mount_type === 'direct_mount'}
                              onChange={v => setEditingOptic({ ...editingOptic, mount_type: v ? 'direct_mount' : 'standard' })}
                              labelA="Standard Footprint"
                              labelB="Direct Mount"
                            />
                          </div>
                          {editingOptic.mount_type === 'direct_mount' && (
                            <div>
                              <label className="block text-sm font-medium mb-1 text-[#8b949e]">Compatible Firearms</label>
                              <DirectMountSelector
                                selectedIds={editingOptic.compatible_model_ids}
                                onToggle={id => toggleCompatibleModel(id, true)}
                                makeFilter={dmEditMakeFilter}
                                onMakeFilterChange={setDmEditMakeFilter}
                              />
                            </div>
                          )}
                          <div className="grid grid-cols-2 gap-2">
                            <input className={inputClass} placeholder="MSRP" type="number" min="0" step="0.01" value={editingOptic.msrp} onChange={e => setEditingOptic({ ...editingOptic, msrp: e.target.value })} />
                            <input className={inputClass} placeholder="Reticle / MOA" value={editingOptic.reticle} onChange={e => setEditingOptic({ ...editingOptic, reticle: e.target.value })} />
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <input className={inputClass} placeholder="Battery type e.g. CR2032" value={editingOptic.battery_type} onChange={e => setEditingOptic({ ...editingOptic, battery_type: e.target.value })} />
                            <div>
                              <TogglePill value={editingOptic.solar} onChange={v => setEditingOptic({ ...editingOptic, solar: v })} labelA="No Solar" labelB="Solar Enabled" />
                            </div>
                          </div>
                          <input className={inputClass} placeholder="Purchase / Affiliate URL" value={editingOptic.affiliate_url} onChange={e => setEditingOptic({ ...editingOptic, affiliate_url: e.target.value })} />
                          <input className={inputClass} placeholder="Manufacturer URL" value={editingOptic.manufacturer_url} onChange={e => setEditingOptic({ ...editingOptic, manufacturer_url: e.target.value })} />
                          <input className={inputClass} placeholder="Notes" value={editingOptic.notes} onChange={e => setEditingOptic({ ...editingOptic, notes: e.target.value })} />
                          <ImageUploadField
                            currentUrl={editingOptic.image_url}
                            uploading={uploadingEdit}
                            inputRef={editImageRef}
                            onFileChange={e => { const file = e.target.files?.[0]; if (file) uploadImage(file, url => setEditingOptic(prev => prev ? { ...prev, image_url: url } : prev), setUploadingEdit) }}
                            onClear={() => { setEditingOptic(prev => prev ? { ...prev, image_url: '' } : prev); if (editImageRef.current) editImageRef.current.value = '' }}
                          />
                          <div className="flex gap-2">
                            <button onClick={saveOptic} disabled={uploadingEdit} className="flex-1 bg-[#238636] text-white rounded p-2 text-sm hover:bg-[#2ea043] transition-colors disabled:opacity-50">Save</button>
                            <button onClick={() => setEditingOptic(null)} className="flex-1 bg-[#21262d] text-[#c9d1d9] rounded p-2 text-sm hover:bg-[#30363d] transition-colors">Cancel</button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex gap-3 items-start">
                            {o.image_url ? (
                              <Image src={o.image_url} alt={o.name} width={48} height={48} className="rounded border border-[#30363d] object-contain bg-[#0d1117] shrink-0" />
                            ) : (
                              <div className="w-12 h-12 rounded border border-[#30363d] bg-[#0d1117] flex items-center justify-center shrink-0">
                                <span className="text-[#484f58] text-xs">—</span>
                              </div>
                            )}
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <div className="font-medium text-[#e6edf3]">{o.name}</div>
                                {o.mount_type === 'direct_mount' && (
                                  <span className="text-xs bg-[#388bfd]/20 text-[#58a6ff] border border-[#388bfd]/30 rounded-full px-2 py-0.5">Direct Mount</span>
                                )}
                                {o.solar && (
                                  <span className="text-xs bg-[#3fb950]/20 text-[#3fb950] border border-[#3fb950]/30 rounded-full px-2 py-0.5">Solar Enabled</span>
                                )}
                              </div>
                              <div className="text-sm text-[#8b949e] mt-0.5">{getOpticMakeName(o.optic_make_id)}</div>
                              <div className="flex gap-3 mt-0.5 flex-wrap">
                                {o.sku && <span className="text-xs text-[#484f58]">SKU: {o.sku}</span>}
                                {o.msrp && <span className="text-xs text-[#484f58]">${o.msrp}</span>}
                                {o.reticle && <span className="text-xs text-[#484f58]">{o.reticle}</span>}
                                {o.battery_type && <span className="text-xs text-[#484f58]">{o.battery_type}</span>}
                              </div>
                              {o.notes && <div className="text-xs text-[#484f58] mt-0.5">{o.notes}</div>}
                            </div>
                          </div>
                          <div className="flex gap-2 shrink-0">
                            <button onClick={() => startEditOptic(o)} className={editBtnClass}>Edit</button>
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

        {/* ============================================================ */}
        {/* PLATES */}
        {/* ============================================================ */}
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