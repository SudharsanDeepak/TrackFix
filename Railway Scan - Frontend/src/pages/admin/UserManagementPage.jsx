import { useState, useEffect, useCallback } from 'react'
import { Users, Plus, Search, Edit, Trash2, Shield, X, RefreshCw } from 'lucide-react'
import Button from '../../components/atoms/Button'
import Input from '../../components/atoms/Input'
import Select from '../../components/atoms/Select'
import LoadingSpinner from '../../components/atoms/LoadingSpinner'
import DataTable from '../../components/organisms/DataTable'
import adminService from '../../services/adminService'
import toast from 'react-hot-toast'

const roleOptions = [
  { value: 'all', label: 'All Roles' },
  { value: 'INSPECTOR', label: 'Inspector' },
  { value: 'DEPOT_OFFICER', label: 'Depot Officer' },
  { value: 'ZONAL_MANAGER', label: 'Zonal Manager' },
  { value: 'ADMIN', label: 'Administrator' },
]

const roleSelectOptions = [
  { value: '', label: 'Select Role' },
  { value: 'INSPECTOR', label: 'Inspector' },
  { value: 'DEPOT_OFFICER', label: 'Depot Officer' },
  { value: 'ZONAL_MANAGER', label: 'Zonal Manager' },
  { value: 'ADMIN', label: 'Administrator' },
]

const roleBadge = {
  INSPECTOR: 'bg-blue-100 text-blue-800',
  DEPOT_OFFICER: 'bg-green-100 text-green-800',
  ZONAL_MANAGER: 'bg-purple-100 text-purple-800',
  ADMIN: 'bg-red-100 text-red-800',
}

const formatDate = d => d ? new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(d)) : 'N/A'

const UserManagementPage = () => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [modalMode, setModalMode] = useState('create')
  const [selectedUser, setSelectedUser] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [saving, setSaving] = useState(false)

  const [userForm, setUserForm] = useState({
    name: '', email: '', password: '', role: '', depotId: '', zoneId: '', isActive: true,
  })

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    try {
      const params = {}
      if (roleFilter !== 'all') params.role = roleFilter
      if (searchQuery.trim()) params.search = searchQuery
      const res = await adminService.getUsers(params)
      const items = Array.isArray(res) ? res : res?.data || res?.users || []
      setUsers(items)
    } catch (err) {
      toast.error('Failed to load users')
      setUsers([])
    } finally {
      setLoading(false)
    }
  }, [roleFilter, searchQuery])

  useEffect(() => { fetchUsers() }, [fetchUsers])

  const filtered = users.filter(u => {
    const q = searchQuery.toLowerCase()
    return !q || (u.name || '').toLowerCase().includes(q) || (u.email || '').toLowerCase().includes(q)
  })

  const handleCreate = () => {
    setModalMode('create')
    setSelectedUser(null)
    setUserForm({ name: '', email: '', password: '', role: '', depotId: '', zoneId: '', isActive: true })
    setShowModal(true)
  }

  const handleEdit = user => {
    setModalMode('edit')
    setSelectedUser(user)
    setUserForm({ name: user.name || '', email: user.email || '', password: '', role: user.role || '', depotId: user.depotId || '', zoneId: user.zoneId || '', isActive: user.isActive !== false })
    setShowModal(true)
  }

  const handleSave = async e => {
    e.preventDefault()
    setSaving(true)
    try {
      if (modalMode === 'create') {
        await adminService.createUser(userForm)
        toast.success('User created successfully')
      } else {
        const updateData = { ...userForm }
        if (!updateData.password) delete updateData.password
        await adminService.updateUser(selectedUser._id || selectedUser.id, updateData)
        toast.success('User updated successfully')
      }
      setShowModal(false)
      fetchUsers()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save user')
    } finally { setSaving(false) }
  }

  const handleDelete = async user => {
    if (!confirm(`Delete user "${user.name}"? This cannot be undone.`)) return
    try {
      await adminService.deleteUser(user._id || user.id)
      toast.success('User deleted')
      fetchUsers()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete user')
    }
  }

  const handleRoleChange = async (user, newRole) => {
    try {
      await adminService.assignRole(user._id || user.id, { role: newRole })
      toast.success(`Role updated to ${newRole}`)
      fetchUsers()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update role')
    }
  }

  const columns = [
    {
      key: 'name', label: 'Name',
      render: (v, row) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-red-700 font-semibold text-sm">{(v || '?').charAt(0).toUpperCase()}</span>
          </div>
          <div>
            <p className="font-medium text-gray-900">{v || '—'}</p>
            <p className="text-xs text-gray-500">{row.email}</p>
          </div>
        </div>
      )
    },
    {
      key: 'role', label: 'Role',
      render: v => <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${roleBadge[v] || 'bg-gray-100 text-gray-700'}`}>{v?.replace(/_/g, ' ') || '—'}</span>
    },
    { key: 'depotId', label: 'Depot', render: v => v || <span className="text-gray-400">N/A</span> },
    { key: 'zoneId', label: 'Zone', render: v => v || <span className="text-gray-400">N/A</span> },
    {
      key: 'isActive', label: 'Status',
      render: v => <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${v !== false ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-700'}`}>{v !== false ? 'Active' : 'Inactive'}</span>
    },
    { key: 'lastLogin', label: 'Last Login', render: v => <span className="text-sm text-gray-600">{formatDate(v)}</span> },
    {
      key: 'actions', label: 'Actions',
      render: (_, row) => (
        <div className="flex items-center gap-2">
          <button onClick={() => handleEdit(row)} className="p-1 text-blue-600 hover:bg-blue-50 rounded" title="Edit"><Edit className="h-4 w-4" /></button>
          <button onClick={() => handleDelete(row)} className="p-1 text-red-600 hover:bg-red-50 rounded" title="Delete"><Trash2 className="h-4 w-4" /></button>
        </div>
      )
    },
  ]

  if (loading) return <div className="flex items-center justify-center min-h-[400px]"><LoadingSpinner /></div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <p className="text-sm text-gray-600 mt-1">Manage users, roles, and permissions</p>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchUsers} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"><RefreshCw className="h-5 w-5" /></button>
          <Button onClick={handleCreate} className="flex items-center gap-2"><Plus className="h-5 w-5" /> Add User</Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Users', value: users.length, color: 'text-gray-900' },
          { label: 'Active', value: users.filter(u => u.isActive !== false).length, color: 'text-green-600' },
          { label: 'Inspectors', value: users.filter(u => u.role === 'INSPECTOR').length, color: 'text-blue-600' },
          { label: 'Admins', value: users.filter(u => u.role === 'ADMIN').length, color: 'text-red-600' },
        ].map(s => (
          <div key={s.label} className="bg-white p-4 rounded-lg shadow">
            <p className="text-sm text-gray-600">{s.label}</p>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input type="text" placeholder="Search by name or email..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-10 w-full" />
          </div>
          <Select value={roleFilter} onChange={e => setRoleFilter(e.target.value)} options={roleOptions} className="w-full" />
        </div>
        <p className="text-sm text-gray-600 mt-3">Showing {filtered.length} of {users.length} users</p>
      </div>

      <div className="bg-white rounded-lg shadow">
        <DataTable columns={columns} data={filtered} emptyMessage="No users found" />
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">{modalMode === 'create' ? 'Add New User' : 'Edit User'}</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600"><X className="h-5 w-5" /></button>
            </div>
            <form onSubmit={handleSave} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                <Input value={userForm.name} onChange={e => setUserForm(f => ({ ...f, name: e.target.value }))} placeholder="John Doe" className="w-full" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <Input type="email" value={userForm.email} onChange={e => setUserForm(f => ({ ...f, email: e.target.value }))} placeholder="john@railway.com" className="w-full" required />
              </div>
              {modalMode === 'create' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
                  <Input type="password" value={userForm.password} onChange={e => setUserForm(f => ({ ...f, password: e.target.value }))} placeholder="Min 8 characters" className="w-full" required />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role *</label>
                <Select value={userForm.role} onChange={e => setUserForm(f => ({ ...f, role: e.target.value }))} options={roleSelectOptions} className="w-full" required />
              </div>
              {(userForm.role === 'INSPECTOR' || userForm.role === 'DEPOT_OFFICER') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Depot ID</label>
                  <Input value={userForm.depotId} onChange={e => setUserForm(f => ({ ...f, depotId: e.target.value }))} placeholder="e.g., DEPOT-001" className="w-full" />
                </div>
              )}
              {userForm.role && userForm.role !== 'ADMIN' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Zone ID</label>
                  <Input value={userForm.zoneId} onChange={e => setUserForm(f => ({ ...f, zoneId: e.target.value }))} placeholder="e.g., ZONE-001" className="w-full" />
                </div>
              )}
              <div className="flex gap-3 pt-2">
                <Button type="button" onClick={() => setShowModal(false)} className="flex-1 bg-gray-200 text-gray-700 hover:bg-gray-300">Cancel</Button>
                <Button type="submit" disabled={saving} className="flex-1">{saving ? 'Saving...' : modalMode === 'create' ? 'Create User' : 'Update User'}</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default UserManagementPage
