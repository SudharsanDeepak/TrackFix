import { useState, useEffect } from 'react'
import {
  Package,
  Plus,
  Search,
  Filter,
  Download,
  AlertTriangle,
  Edit,
  Trash2,
  X,
  TrendingDown,
  TrendingUp,
  RefreshCw,
} from 'lucide-react'
import Button from '../../components/atoms/Button'
import Input from '../../components/atoms/Input'
import Select from '../../components/atoms/Select'
import LoadingSpinner from '../../components/atoms/LoadingSpinner'
import DataTable from '../../components/organisms/DataTable'

const InventoryPage = () => {
  const [inventory, setInventory] = useState([])
  const [filteredInventory, setFilteredInventory] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [stockFilter, setStockFilter] = useState('all')
  const [showModal, setShowModal] = useState(false)
  const [modalMode, setModalMode] = useState('add') // 'add' or 'edit'
  const [selectedItem, setSelectedItem] = useState(null)
  const [saving, setSaving] = useState(false)
  const [showReorderModal, setShowReorderModal] = useState(false)
  const [reorderItem, setReorderItem] = useState(null)

  const [itemForm, setItemForm] = useState({
    name: '',
    category: '',
    sku: '',
    quantity: '0',
    minStock: '10',
    maxStock: '100',
    unit: '',
    location: '',
    supplier: '',
    unitPrice: '',
  })

  const [reorderForm, setReorderForm] = useState({
    quantity: '',
    notes: '',
  })

  const categoryOptions = [
    { value: 'all', label: 'All Categories' },
    { value: 'track_materials', label: 'Track Materials' },
    { value: 'electrical', label: 'Electrical' },
    { value: 'safety_equipment', label: 'Safety Equipment' },
    { value: 'tools', label: 'Tools' },
    { value: 'spare_parts', label: 'Spare Parts' },
    { value: 'consumables', label: 'Consumables' },
  ]

  const stockOptions = [
    { value: 'all', label: 'All Stock Levels' },
    { value: 'low', label: 'Low Stock' },
    { value: 'normal', label: 'Normal Stock' },
    { value: 'high', label: 'High Stock' },
    { value: 'out', label: 'Out of Stock' },
  ]

  const categoryFormOptions = [
    { value: '', label: 'Select Category' },
    { value: 'track_materials', label: 'Track Materials' },
    { value: 'electrical', label: 'Electrical' },
    { value: 'safety_equipment', label: 'Safety Equipment' },
    { value: 'tools', label: 'Tools' },
    { value: 'spare_parts', label: 'Spare Parts' },
    { value: 'consumables', label: 'Consumables' },
  ]

  const unitOptions = [
    { value: '', label: 'Select Unit' },
    { value: 'pcs', label: 'Pieces' },
    { value: 'kg', label: 'Kilograms' },
    { value: 'ltr', label: 'Liters' },
    { value: 'mtr', label: 'Meters' },
    { value: 'box', label: 'Boxes' },
    { value: 'set', label: 'Sets' },
  ]

  // Fetch inventory items
  useEffect(() => {
    const fetchInventory = async () => {
      setLoading(true)
      try {
        // TODO: Replace with actual API call
        // const data = await inventoryService.getInventory()

        // Mock data
        const mockData = [
          {
            id: 'INV-001',
            name: 'Rail Fasteners',
            category: 'track_materials',
            sku: 'TRK-FAST-001',
            quantity: 450,
            minStock: 200,
            maxStock: 1000,
            unit: 'pcs',
            location: 'Warehouse A, Shelf 12',
            supplier: 'Railway Supplies Co.',
            unitPrice: 15.5,
            lastRestocked: '2024-01-15T10:00:00',
          },
          {
            id: 'INV-002',
            name: 'Signal Lamps',
            category: 'electrical',
            sku: 'ELC-LAMP-045',
            quantity: 25,
            minStock: 30,
            maxStock: 100,
            unit: 'pcs',
            location: 'Warehouse B, Section 3',
            supplier: 'ElectroTech Ltd.',
            unitPrice: 85.0,
            lastRestocked: '2024-01-10T14:30:00',
          },
          {
            id: 'INV-003',
            name: 'Safety Helmets',
            category: 'safety_equipment',
            sku: 'SAF-HLM-012',
            quantity: 120,
            minStock: 50,
            maxStock: 200,
            unit: 'pcs',
            location: 'Safety Storage, Rack 5',
            supplier: 'SafetyFirst Inc.',
            unitPrice: 25.0,
            lastRestocked: '2024-01-18T09:15:00',
          },
          {
            id: 'INV-004',
            name: 'Hydraulic Oil',
            category: 'consumables',
            sku: 'CON-OIL-078',
            quantity: 0,
            minStock: 50,
            maxStock: 200,
            unit: 'ltr',
            location: 'Chemical Storage, Tank 2',
            supplier: 'Industrial Fluids Co.',
            unitPrice: 12.5,
            lastRestocked: '2024-01-05T11:20:00',
          },
          {
            id: 'INV-005',
            name: 'Track Inspection Tools',
            category: 'tools',
            sku: 'TLS-INSP-023',
            quantity: 35,
            minStock: 20,
            maxStock: 50,
            unit: 'set',
            location: 'Tool Room, Cabinet 7',
            supplier: 'Professional Tools Ltd.',
            unitPrice: 450.0,
            lastRestocked: '2024-01-12T16:45:00',
          },
          {
            id: 'INV-006',
            name: 'Brake Pads',
            category: 'spare_parts',
            sku: 'SPR-BRK-089',
            quantity: 8,
            minStock: 15,
            maxStock: 60,
            unit: 'set',
            location: 'Spare Parts, Bin 14',
            supplier: 'Railway Parts Direct',
            unitPrice: 180.0,
            lastRestocked: '2024-01-08T13:00:00',
          },
        ]

        setInventory(mockData)
        setFilteredInventory(mockData)
      } catch (error) {
        console.error('Failed to fetch inventory:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchInventory()
  }, [])

  // Filter inventory
  useEffect(() => {
    let filtered = inventory

    // Filter by category
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(item => item.category === categoryFilter)
    }

    // Filter by stock level
    if (stockFilter !== 'all') {
      filtered = filtered.filter(item => {
        const stockLevel = getStockLevel(item)
        return stockLevel === stockFilter
      })
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        item =>
          item.name.toLowerCase().includes(query) ||
          item.sku.toLowerCase().includes(query) ||
          item.location.toLowerCase().includes(query) ||
          item.supplier.toLowerCase().includes(query)
      )
    }

    setFilteredInventory(filtered)
  }, [searchQuery, categoryFilter, stockFilter, inventory])

  // Get stock level
  const getStockLevel = item => {
    if (item.quantity === 0) return 'out'
    if (item.quantity < item.minStock) return 'low'
    if (item.quantity > item.maxStock) return 'high'
    return 'normal'
  }

  // Get stock badge
  const getStockBadge = item => {
    const level = getStockLevel(item)
    const config = {
      out: 'bg-red-100 text-red-800',
      low: 'bg-orange-100 text-orange-800',
      normal: 'bg-green-100 text-green-800',
      high: 'bg-blue-100 text-blue-800',
    }
    const labels = {
      out: 'Out of Stock',
      low: 'Low Stock',
      normal: 'Normal',
      high: 'High Stock',
    }
    return { className: config[level], label: labels[level] }
  }

  // Handle add item
  const handleAddItem = () => {
    setModalMode('add')
    setItemForm({
      name: '',
      category: '',
      sku: '',
      quantity: '0',
      minStock: '10',
      maxStock: '100',
      unit: '',
      location: '',
      supplier: '',
      unitPrice: '',
    })
    setShowModal(true)
  }

  // Handle edit item
  const handleEditItem = item => {
    setModalMode('edit')
    setSelectedItem(item)
    setItemForm({
      name: item.name,
      category: item.category,
      sku: item.sku,
      quantity: item.quantity.toString(),
      minStock: item.minStock.toString(),
      maxStock: item.maxStock.toString(),
      unit: item.unit,
      location: item.location,
      supplier: item.supplier,
      unitPrice: item.unitPrice.toString(),
    })
    setShowModal(true)
  }

  // Handle delete item
  const handleDeleteItem = async item => {
    if (!confirm(`Are you sure you want to delete "${item.name}"?`)) return

    try {
      // TODO: Replace with actual API call
      // await inventoryService.deleteItem(item.id)

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500))

      // Update local state
      setInventory(prev => prev.filter(i => i.id !== item.id))
    } catch (error) {
      console.error('Failed to delete item:', error)
      alert('Failed to delete item. Please try again.')
    }
  }

  // Handle form change
  const handleFormChange = e => {
    const { name, value } = e.target
    setItemForm({ ...itemForm, [name]: value })
  }

  // Handle form submit
  const handleFormSubmit = async e => {
    e.preventDefault()
    setSaving(true)

    try {
      const itemData = {
        ...itemForm,
        quantity: parseInt(itemForm.quantity),
        minStock: parseInt(itemForm.minStock),
        maxStock: parseInt(itemForm.maxStock),
        unitPrice: parseFloat(itemForm.unitPrice),
      }

      if (modalMode === 'add') {
        // TODO: Replace with actual API call
        // const newItem = await inventoryService.createItem(itemData)

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000))

        const newItem = {
          id: `INV-${String(inventory.length + 1).padStart(3, '0')}`,
          ...itemData,
          lastRestocked: new Date().toISOString(),
        }

        setInventory(prev => [...prev, newItem])
      } else {
        // TODO: Replace with actual API call
        // await inventoryService.updateItem(selectedItem.id, itemData)

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000))

        setInventory(prev =>
          prev.map(item => (item.id === selectedItem.id ? { ...item, ...itemData } : item))
        )
      }

      setShowModal(false)
      setSelectedItem(null)
    } catch (error) {
      console.error('Failed to save item:', error)
      alert('Failed to save item. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  // Handle reorder
  const handleShowReorder = item => {
    setReorderItem(item)
    setReorderForm({
      quantity: (item.maxStock - item.quantity).toString(),
      notes: '',
    })
    setShowReorderModal(true)
  }

  // Handle reorder form change
  const handleReorderChange = e => {
    const { name, value } = e.target
    setReorderForm({ ...reorderForm, [name]: value })
  }

  // Handle reorder submit
  const handleReorderSubmit = async e => {
    e.preventDefault()
    if (!reorderItem) return

    setSaving(true)
    try {
      // TODO: Replace with actual API call
      // await inventoryService.createReorderRequest(reorderItem.id, reorderForm)

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))

      alert(`Reorder request created for ${reorderItem.name}`)

      setShowReorderModal(false)
      setReorderItem(null)
      setReorderForm({ quantity: '', notes: '' })
    } catch (error) {
      console.error('Failed to create reorder request:', error)
      alert('Failed to create reorder request. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  // Handle export
  const handleExport = () => {
    // TODO: Implement export functionality
    console.log('Exporting inventory:', filteredInventory)
    alert('Export functionality will download inventory as PDF/CSV')
  }

  // Format date
  const formatDate = dateString => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(date)
  }

  // Format currency
  const formatCurrency = amount => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }

  // Table columns
  const columns = [
    {
      key: 'sku',
      label: 'SKU',
      sortable: true,
      render: value => <span className="font-mono font-semibold text-sm">{value}</span>,
    },
    {
      key: 'name',
      label: 'Item Name',
      sortable: true,
      render: value => <span className="font-medium">{value}</span>,
    },
    {
      key: 'category',
      label: 'Category',
      sortable: true,
      render: value => <span className="capitalize text-sm">{value.replace('_', ' ')}</span>,
    },
    {
      key: 'quantity',
      label: 'Stock',
      sortable: true,
      render: (value, row) => {
        const badge = getStockBadge(row)
        return (
          <div className="flex flex-col gap-1">
            <span className="font-semibold">
              {value} {row.unit}
            </span>
            <span
              className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${badge.className} w-fit`}
            >
              {badge.label}
            </span>
          </div>
        )
      },
    },
    {
      key: 'minStock',
      label: 'Min/Max',
      sortable: true,
      render: (value, row) => (
        <span className="text-sm text-gray-600">
          {value} / {row.maxStock} {row.unit}
        </span>
      ),
    },
    {
      key: 'location',
      label: 'Location',
      sortable: true,
      render: value => <span className="text-sm">{value}</span>,
    },
    {
      key: 'unitPrice',
      label: 'Unit Price',
      sortable: true,
      render: value => <span className="font-medium">{formatCurrency(value)}</span>,
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => {
        const stockLevel = getStockLevel(row)
        return (
          <div className="flex items-center gap-2">
            {(stockLevel === 'low' || stockLevel === 'out') && (
              <Button
                onClick={() => handleShowReorder(row)}
                className="flex items-center gap-1 text-sm bg-orange-600 hover:bg-orange-700 text-white px-3 py-1"
              >
                <RefreshCw className="h-4 w-4" />
                Reorder
              </Button>
            )}
            <Button
              onClick={() => handleEditItem(row)}
              className="flex items-center gap-1 text-sm bg-green-600 hover:bg-green-700 text-white px-3 py-1"
            >
              <Edit className="h-4 w-4" />
              Edit
            </Button>
            <Button
              onClick={() => handleDeleteItem(row)}
              className="flex items-center gap-1 text-sm bg-red-600 hover:bg-red-700 text-white px-3 py-1"
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
          </div>
        )
      },
    },
  ]

  // Calculate stats
  const totalItems = inventory.length
  const lowStockItems = inventory.filter(item => getStockLevel(item) === 'low').length
  const outOfStockItems = inventory.filter(item => getStockLevel(item) === 'out').length
  const totalValue = inventory.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0)

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inventory Management</h1>
          <p className="text-sm text-gray-600 mt-1">
            Track and manage depot inventory with stock alerts
          </p>
        </div>
        <Button onClick={handleAddItem} className="flex items-center gap-2">
          <Plus className="h-5 w-5" />
          Add Item
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Items</p>
              <p className="text-2xl font-bold text-gray-900">{totalItems}</p>
            </div>
            <Package className="h-10 w-10 text-gray-400" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Low Stock Alerts</p>
              <p className="text-2xl font-bold text-orange-600">{lowStockItems}</p>
            </div>
            <TrendingDown className="h-10 w-10 text-orange-400" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Out of Stock</p>
              <p className="text-2xl font-bold text-red-600">{outOfStockItems}</p>
            </div>
            <AlertTriangle className="h-10 w-10 text-red-400" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Value</p>
              <p className="text-2xl font-bold text-green-600">{formatCurrency(totalValue)}</p>
            </div>
            <TrendingUp className="h-10 w-10 text-green-400" />
          </div>
        </div>
      </div>

      {/* Low Stock Alerts */}
      {(lowStockItems > 0 || outOfStockItems > 0) && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-orange-900">Stock Alerts</h3>
              <p className="text-sm text-orange-700 mt-1">
                {outOfStockItems > 0 && `${outOfStockItems} item(s) out of stock. `}
                {lowStockItems > 0 && `${lowStockItems} item(s) running low. `}
                Review and reorder items to maintain optimal stock levels.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="md:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Search by name, SKU, location, or supplier..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-10 w-full"
              />
            </div>
          </div>

          {/* Category Filter */}
          <div>
            <Select
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value)}
              options={categoryOptions}
              className="w-full"
            />
          </div>

          {/* Stock Filter */}
          <div>
            <Select
              value={stockFilter}
              onChange={e => setStockFilter(e.target.value)}
              options={stockOptions}
              className="w-full"
            />
          </div>
        </div>

        <div className="flex items-center justify-between mt-4">
          <p className="text-sm text-gray-600">
            Showing {filteredInventory.length} of {inventory.length} items
          </p>
          <Button
            onClick={handleExport}
            className="flex items-center gap-2 bg-gray-200 text-gray-700 hover:bg-gray-300"
          >
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-lg shadow">
        <DataTable
          columns={columns}
          data={filteredInventory}
          emptyMessage="No inventory items found"
        />
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                {modalMode === 'add' ? 'Add Inventory Item' : 'Edit Inventory Item'}
              </h2>
              <button
                onClick={() => {
                  setShowModal(false)
                  setSelectedItem(null)
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="p-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Item Name */}
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    Item Name *
                  </label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    value={itemForm.name}
                    onChange={handleFormChange}
                    placeholder="e.g., Rail Fasteners"
                    className="w-full"
                    required
                  />
                </div>

                {/* SKU */}
                <div>
                  <label htmlFor="sku" className="block text-sm font-medium text-gray-700 mb-2">
                    SKU *
                  </label>
                  <Input
                    id="sku"
                    name="sku"
                    type="text"
                    value={itemForm.sku}
                    onChange={handleFormChange}
                    placeholder="e.g., TRK-FAST-001"
                    className="w-full"
                    required
                  />
                </div>

                {/* Category */}
                <div>
                  <label
                    htmlFor="category"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Category *
                  </label>
                  <Select
                    id="category"
                    name="category"
                    value={itemForm.category}
                    onChange={handleFormChange}
                    options={categoryFormOptions}
                    className="w-full"
                    required
                  />
                </div>

                {/* Unit */}
                <div>
                  <label htmlFor="unit" className="block text-sm font-medium text-gray-700 mb-2">
                    Unit *
                  </label>
                  <Select
                    id="unit"
                    name="unit"
                    value={itemForm.unit}
                    onChange={handleFormChange}
                    options={unitOptions}
                    className="w-full"
                    required
                  />
                </div>

                {/* Quantity */}
                <div>
                  <label
                    htmlFor="quantity"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Current Quantity *
                  </label>
                  <Input
                    id="quantity"
                    name="quantity"
                    type="number"
                    value={itemForm.quantity}
                    onChange={handleFormChange}
                    min="0"
                    className="w-full"
                    required
                  />
                </div>

                {/* Min Stock */}
                <div>
                  <label
                    htmlFor="minStock"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Minimum Stock *
                  </label>
                  <Input
                    id="minStock"
                    name="minStock"
                    type="number"
                    value={itemForm.minStock}
                    onChange={handleFormChange}
                    min="0"
                    className="w-full"
                    required
                  />
                </div>

                {/* Max Stock */}
                <div>
                  <label
                    htmlFor="maxStock"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Maximum Stock *
                  </label>
                  <Input
                    id="maxStock"
                    name="maxStock"
                    type="number"
                    value={itemForm.maxStock}
                    onChange={handleFormChange}
                    min="0"
                    className="w-full"
                    required
                  />
                </div>

                {/* Unit Price */}
                <div>
                  <label
                    htmlFor="unitPrice"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Unit Price ($) *
                  </label>
                  <Input
                    id="unitPrice"
                    name="unitPrice"
                    type="number"
                    step="0.01"
                    value={itemForm.unitPrice}
                    onChange={handleFormChange}
                    min="0"
                    className="w-full"
                    required
                  />
                </div>
              </div>

              {/* Location */}
              <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                  Storage Location *
                </label>
                <Input
                  id="location"
                  name="location"
                  type="text"
                  value={itemForm.location}
                  onChange={handleFormChange}
                  placeholder="e.g., Warehouse A, Shelf 12"
                  className="w-full"
                  required
                />
              </div>

              {/* Supplier */}
              <div>
                <label htmlFor="supplier" className="block text-sm font-medium text-gray-700 mb-2">
                  Supplier *
                </label>
                <Input
                  id="supplier"
                  name="supplier"
                  type="text"
                  value={itemForm.supplier}
                  onChange={handleFormChange}
                  placeholder="e.g., Railway Supplies Co."
                  className="w-full"
                  required
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  onClick={() => {
                    setShowModal(false)
                    setSelectedItem(null)
                  }}
                  className="flex-1 bg-gray-200 text-gray-700 hover:bg-gray-300"
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={saving} className="flex-1">
                  {saving ? 'Saving...' : modalMode === 'add' ? 'Add Item' : 'Update Item'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reorder Modal */}
      {showReorderModal && reorderItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Create Reorder Request</h2>
              <button
                onClick={() => {
                  setShowReorderModal(false)
                  setReorderItem(null)
                  setReorderForm({ quantity: '', notes: '' })
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleReorderSubmit} className="p-4 space-y-4">
              {/* Item Info */}
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm font-medium text-gray-900">{reorderItem.name}</p>
                <p className="text-xs text-gray-600 mt-1">
                  SKU: {reorderItem.sku} | Current Stock: {reorderItem.quantity} {reorderItem.unit}
                </p>
                <p className="text-xs text-gray-600">
                  Min: {reorderItem.minStock} | Max: {reorderItem.maxStock} {reorderItem.unit}
                </p>
              </div>

              {/* Quantity */}
              <div>
                <label
                  htmlFor="reorderQuantity"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Reorder Quantity ({reorderItem.unit}) *
                </label>
                <Input
                  id="reorderQuantity"
                  name="quantity"
                  type="number"
                  value={reorderForm.quantity}
                  onChange={handleReorderChange}
                  min="1"
                  className="w-full"
                  required
                />
                <p className="mt-1 text-xs text-gray-500">
                  Suggested: {reorderItem.maxStock - reorderItem.quantity} {reorderItem.unit} to
                  reach maximum stock
                </p>
              </div>

              {/* Notes */}
              <div>
                <label
                  htmlFor="reorderNotes"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Notes
                </label>
                <textarea
                  id="reorderNotes"
                  name="notes"
                  value={reorderForm.notes}
                  onChange={handleReorderChange}
                  placeholder="Add any special instructions or notes..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              {/* Supplier Info */}
              <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                <p className="text-sm font-medium text-blue-900">Supplier Information</p>
                <p className="text-sm text-blue-700 mt-1">{reorderItem.supplier}</p>
                <p className="text-xs text-blue-600 mt-1">
                  Unit Price: {formatCurrency(reorderItem.unitPrice)} | Estimated Total:{' '}
                  {formatCurrency(reorderItem.unitPrice * parseInt(reorderForm.quantity || 0))}
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  onClick={() => {
                    setShowReorderModal(false)
                    setReorderItem(null)
                    setReorderForm({ quantity: '', notes: '' })
                  }}
                  className="flex-1 bg-gray-200 text-gray-700 hover:bg-gray-300"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={saving}
                  className="flex-1 bg-orange-600 hover:bg-orange-700 text-white"
                >
                  {saving ? 'Creating...' : 'Create Request'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default InventoryPage
