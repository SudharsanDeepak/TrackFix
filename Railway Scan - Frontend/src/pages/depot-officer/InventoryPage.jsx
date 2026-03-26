import { useState, useEffect, useCallback } from 'react'
import { Package, Plus, Search, Download, AlertTriangle, Edit, Trash2, X, TrendingDown, TrendingUp, RefreshCw } from 'lucide-react'
import Button from '../../components/atoms/Button'
import Input from '../../components/atoms/Input'
import Select from '../../components/atoms/Select'
import LoadingSpinner from '../../components/atoms/LoadingSpinner'
import DataTable from '../../components/organisms/DataTable'
import depotOfficerService from '../../services/depotOfficerService'
import toast from 'react-hot-toast'

const InventoryPage = () => {
  const [inventory, setInventory] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [stockFilter, setStockFilter] = useState('all')
  const [showModal, setShowModal] = useState(false)
  const [modalMode, setModalMode] = useState('add')
  const [selectedItem, setSelectedItem] = useState(null)
  const [saving, setSaving] = useState(false)

  const [itemForm, setItemForm] = useState({
    fittingType: '', quantity: '0', minThreshold: '10', maxThreshold: '100', location: '',
  })

  const stockOptions = [
    { value: 'all', label: 'All Stock Levels' },
    { value: 'low', label: 'Low Stock' },
    { value: 'normal', label: 'Normal Stock' },
    { value: 'out', label: 'Out of Stock' },
  ]

  const fittingTypeOptions = [
    { value: '', label: 'Select Fitting Type' },
    { value: 'RAIL_JOINT', label: 'Rail Joint' },
    { value: 'FISH_PLATE', label: 'Fish Plate' },
    { value: 'BOLT', label: 'Bolt' },
    { value: 'NUT', label: 'Nut' },
    { value: 'SPRING_WASHER', label: 'Spring Washer' },
    { value: 'FLAT_WASHER', label: 'Flat Washer' },
    { value: 'RAIL_CLIP', label: 'Rail Clip' },
    { value: 'SLEEPER', label: 'Sleeper' },
    { value: 'BALLAST', label: 'Ballast' },
    { value: 'OTHER', label: 'Other' },
  ]

  const fetchInventory = useCallback(async () => {
    setLoading(true)
    try {
      const res = await depotOfficerService.getInventoryStatus()
      const items = Array.isArray(res) ? res : res?.data || res?.inventory || []
      setInventory(items)
    } catch (err) {
      toast.error('Failed to load inventory')
      setInventory([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchInventory() }, [fetchInventory])

  const getStockLevel = item => {
    if (item.quantity === 0) return 'out'
    if (item.quantity < item.minThreshold) return 'low'
    return 'normal'
  }

  const getStockBadge = item => {
    const level = getStockLevel(item)
    return {
      out: { className: 'bg-red-100 text-red-800', label: 'Out of Stock' },
      low: { className: 'bg-orange-100 text-orange-800', label: 'Low Stock' },
      normal: { className: 'bg-green-100 text-green-800', label: 'Normal' },
    }[level]
  }

  const filtered = inventory.filter(item => {
    const q = searchQuery.toLowerCase()
    const matchSearch = !q || (item.fittingType || '').toLowerCase().includes(q) || (item.location || '').toLowerCase().includes(q) || (item.itemId || '').toLowerCase().includes(q)
    const matchStock = stockFilter === 'all' || getStockLevel(item) === stockFilter
    return matchSearch && matchStock
  })

  const handleSave = async e => {
    e.preventDefault()
    setSaving(true)
    try {
      const data = { ...itemForm, quantity: parseInt(itemForm.quantity), minThreshold: parseInt(itemForm.minThreshold), maxThreshold: parseInt(itemForm.maxThreshold) }
      if (modalMode === 'add') {
        await depotOfficerService.getInventoryStatus() // placeholder — use createInventoryItem when available
        // POST /depot-officer/inventory
        const apiClient = (await import('../../api/client')).default
        await apiClient.post('/depot-officer/inventory', data)
        toast.success('Item added successfully')
      } else {
        await depotOfficerService.updateInventoryItem(selectedItem._id || selectedItem.id, data)
        toast.success('Item updated successfully')
      }
      setShowModal(false)
      fetchInventory()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save item')
    } finally { setSaving(false) }
  }

  const handleDelete = async item => {
    if (!confirm(`Delete "${item.fittingType}"?`)) return
    try {
      const apiClient = (await import('../../api/client')).default
      await apiClient.delete(`/depot-officer/inventory/${item._id || item.id}`)
      toast.success('Item deleted')
      fetchInventory()
    } catch (err) {
      toast.error('Failed to delete item')
    }
  }

  const openEdit = item => {
    setModalMode('edit')
    setSelectedItem(item)
    setItemForm({ fittingType: item.fittingType || '', quantity: String(item.quantity || 0), minThreshold: String(item.minThreshold || 10), maxThreshold: String(item.maxThreshold || 100), location: item.location || '' })
    setShowModal(true)
  }

  const openAdd = () => {
    setModalMode('add')
    setSelectedItem(null)
    setItemForm({ fittingType: '', quantity: '0', minThreshold: '10', maxThreshold: '100', location: '' })
    setShowModal(true)
  }

  const lowStock = inventory.filter(i => getStockLevel(i) === 'low').length
  const outStock = inventory.filter(i => getStockLevel(i) === 'out').length

  const columns = [
    { key: 'itemId', label: 'Item ID', render: v => <span className="font-mono text-xs">{v || '—'}</span> },
    { key: 'fittingType', label: 'Fitting Type', render: v => <span className="font-medium capitalize">{(v || '').replace(/_/g, ' ')}</span> },
    {
      key: 'quantity', label: 'Stock',
      render: (v, row) => {
        const badge = getStockBadge(row)
        return (
          <div className="flex flex-col gap-1">
            <span className="font-semibold">{v}</span>
            <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium w-fit ${badge.className}`}>{badge.label}</span>
          </div>
        )
      }
    },
    { key: 'minThreshold', label: 'Min/Max', render: (v, row) => <span className="text-sm text-gray-600">{v} / {row.maxThreshold}</span> },
    { key: 'location', label: 'Location', render: v => v || '—' },
    { key: 'lastRestocked', label: 'Last Restocked', render: v => v ? new Date(v).toLocaleDateString() : '—' },
    {
      key: 'actions', label: 'Actions',
      render: (_, row) => (
        <div className="flex gap-2">
          <Button onClick={() => openEdit(row)} className="text-sm bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 flex items-center gap-1"><Edit className="h-4 w-4" /> Edit</Button>
          <Button onClick={() => handleDelete(row)} className="text-sm bg-red-600 hover:bg-red-700 text-white px-3 py-1 flex items-center gap-1"><Trash2 className="h-4 w-4" /> Delete</Button>
        </div>
      )
    },
  ]

  if (loading) return <div className="flex items-center justify-center min-h-[400px]"><LoadingSpinner /></div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inventory Management</h1>
          <p className="text-sm text-gray-600 mt-1">Track and manage depot inventory</p>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchInventory} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"><RefreshCw className="h-5 w-5" /></button>
          <Button onClick={openAdd} className="flex items-center gap-2"><Plus className="h-5 w-5" /> Add Item</Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow flex items-center justify-between">
          <div><p className="text-sm text-gray-600">Total Items</p><p className="text-2xl font-bold text-gray-900">{inventory.length}</p></div>
          <Package className="h-10 w-10 text-gray-300" />
        </div>
        <div className="bg-white p-4 rounded-lg shadow flex items-center justify-between">
          <div><p className="text-sm text-gray-600">Low Stock</p><p className="text-2xl font-bold text-orange-600">{lowStock}</p></div>
          <TrendingDown className="h-10 w-10 text-orange-300" />
        </div>
        <div className="bg-white p-4 rounded-lg shadow flex items-center justify-between">
          <div><p className="text-sm text-gray-600">Out of Stock</p><p className="text-2xl font-bold text-red-600">{outStock}</p></div>
          <AlertTriangle className="h-10 w-10 text-red-300" />
        </div>
        <div className="bg-white p-4 rounded-lg shadow flex items-center justify-between">
          <div><p className="text-sm text-gray-600">Normal Stock</p><p className="text-2xl font-bold text-green-600">{inventory.length - lowStock - outStock}</p></div>
          <TrendingUp className="h-10 w-10 text-green-300" />
        </div>
      </div>

      {(lowStock > 0 || outStock > 0) && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5" />
          <p className="text-sm text-orange-700">
            {outStock > 0 && `${outStock} item(s) out of stock. `}
            {lowStock > 0 && `${lowStock} item(s) running low. `}
            Review and reorder to maintain optimal levels.
          </p>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input type="text" placeholder="Search by fitting type, location..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-10 w-full" />
          </div>
          <Select value={stockFilter} onChange={e => setStockFilter(e.target.value)} options={stockOptions} className="w-full" />
        </div>
        <p className="text-sm text-gray-600 mt-3">Showing {filtered.length} of {inventory.length} items</p>
      </div>

      <div className="bg-white rounded-lg shadow">
        <DataTable columns={columns} data={filtered} emptyMessage="No inventory items found" />
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">{modalMode === 'add' ? 'Add Inventory Item' : 'Edit Inventory Item'}</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600"><X className="h-5 w-5" /></button>
            </div>
            <form onSubmit={handleSave} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fitting Type *</label>
                <Select value={itemForm.fittingType} onChange={e => setItemForm(f => ({ ...f, fittingType: e.target.value }))} options={fittingTypeOptions} className="w-full" required />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Quantity *</label>
                  <Input type="number" value={itemForm.quantity} onChange={e => setItemForm(f => ({ ...f, quantity: e.target.value }))} min="0" className="w-full" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Min *</label>
                  <Input type="number" value={itemForm.minThreshold} onChange={e => setItemForm(f => ({ ...f, minThreshold: e.target.value }))} min="0" className="w-full" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Max *</label>
                  <Input type="number" value={itemForm.maxThreshold} onChange={e => setItemForm(f => ({ ...f, maxThreshold: e.target.value }))} min="0" className="w-full" required />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location *</label>
                <Input type="text" value={itemForm.location} onChange={e => setItemForm(f => ({ ...f, location: e.target.value }))} placeholder="e.g., Warehouse A, Shelf 3" className="w-full" required />
              </div>
              <div className="flex gap-3 pt-2">
                <Button type="button" onClick={() => setShowModal(false)} className="flex-1 bg-gray-200 text-gray-700 hover:bg-gray-300">Cancel</Button>
                <Button type="submit" disabled={saving} className="flex-1">{saving ? 'Saving...' : modalMode === 'add' ? 'Add Item' : 'Update Item'}</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default InventoryPage
