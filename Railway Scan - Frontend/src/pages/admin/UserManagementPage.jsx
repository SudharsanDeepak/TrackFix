import { useState, useEffect } from 'react'
import {
  Users,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Shield,
  Mail,
  Phone,
  MapPin,
  X,
  Check,
} from 'lucide-react'
import Button from '../../components/atoms/Button'
import Input from '../../components/atoms/Input'
import Select from '../../components/atoms/Select'
import LoadingSpinner from '../../components/atoms/LoadingSpinner'
import DataTable from '../../components/organisms/DataTable'

const UserManagementPage = () => {
  const [users, setUsers] = useState([])
  const [filteredUsers, setFilteredUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [modalMode, setModalMode] = useState('create') // 'create' or 'edit'
  const [selectedUser, setSelectedUser] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [saving, setSaving] = useState(false)

  const [userForm, setUserForm] = useState({
    name: '',
    email: '',
    phone: '',
    role: '',
    depotId: '',
    zoneId: '',
    status: 'active',
  })

  const roleOptions = [
    { value: 'all', label: 'All Roles' },
    { value: 'INSPECTOR', label: 'Inspector' },
    { value: 'DEPOT_OFFICER', label: 'Depot Officer' },
    { value: 'ZONAL_MANAGER', label: 'Zonal Manager' },
    { value: 'ADMIN', label: 'Administrator' },
  ]

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
  ]

  const roleSelectOptions = [
    { value: '', label: 'Select Role' },
    { value: 'INSPECTOR', label: 'Inspector' },
    { value: 'DEPOT_OFFICER', label: 'Depot Officer' },
    { value: 'ZONAL_MANAGER', label: 'Zonal Manager' },
    { value: 'ADMIN', label: 'Administrator' },
  ]

  const statusSelectOptions = [
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
  ]

  // Fetch users
  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true)
      try {
        // TODO: Replace with actual API call
        // const data = await userService.getUsers()

        // Mock data
        const mockData = [
          {
            id: 'USR-001',
            name: 'John Inspector',
            email: 'john.inspector@railway.com',
            phone: '+1-555-0101',
            role: 'INSPECTOR',
            depotId: 'Depot A',
            zoneId: 'Zone 1',
            status: 'active',
            lastLogin: '2024-01-20T10:30:00',
            createdAt: '2023-12-01T09:00:00',
          },
          {
            id: 'USR-002',
            name: 'Sarah Officer',
            email: 'sarah.officer@railway.com',
            phone: '+1-555-0102',
            role: 'DEPOT_OFFICER',
            depotId: 'Depot B',
            zoneId: 'Zone 1',
            status: 'active',
            lastLogin: '2024-01-20T14:15:00',
            createdAt: '2023-11-15T10:30:00',
          },
          {
            id: 'USR-003',
            name: 'Mike Manager',
            email: 'mike.manager@railway.com',
            phone: '+1-555-0103',
            role: 'ZONAL_MANAGER',
            depotId: null,
            zoneId: 'Zone 2',
            status: 'active',
            lastLogin: '2024-01-20T16:45:00',
            createdAt: '2023-10-20T11:00:00',
          },
          {
            id: 'USR-004',
            name: 'Admin User',
            email: 'admin@railway.com',
            phone: '+1-555-0104',
            role: 'ADMIN',
            depotId: null,
            zoneId: null,
            status: 'active',
            lastLogin: '2024-01-20T18:00:00',
            createdAt: '2023-09-01T08:00:00',
          },
          {
            id: 'USR-005',
            name: 'Jane Inspector',
            email: 'jane.inspector@railway.com',
            phone: '+1-555-0105',
            role: 'INSPECTOR',
            depotId: 'Depot C',
            zoneId: 'Zone 2',
            status: 'inactive',
            lastLogin: '2024-01-10T12:00:00',
            createdAt: '2023-11-01T09:30:00',
          },
        ]

        setUsers(mockData)
        setFilteredUsers(mockData)
      } catch (error) {
        console.error('Failed to fetch users:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchUsers()
  }, [])

  // Filter users
  useEffect(() => {
    let filtered = users

    // Filter by role
    if (roleFilter !== 'all') {
      filtered = filtered.filter(user => user.role === roleFilter)
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(user => user.status === statusFilter)
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        user =>
          user.name.toLowerCase().includes(query) ||
          user.email.toLowerCase().includes(query) ||
          user.phone.includes(query) ||
          (user.depotId && user.depotId.toLowerCase().includes(query)) ||
          (user.zoneId && user.zoneId.toLowerCase().includes(query))
      )
    }

    setFilteredUsers(filtered)
  }, [searchQuery, roleFilter, statusFilter, users])

  // Handle form change
  const handleFormChange = e => {
    const { name, value } = e.target
    setUserForm({ ...userForm, [name]: value })
  }

  // Open create modal
  const handleCreate = () => {
    setModalMode('create')
    setUserForm({
      name: '',
      email: '',
      phone: '',
      role: '',
      depotId: '',
      zoneId: '',
      status: 'active',
    })
    setShowModal(true)
  }

  // Open edit modal
  const handleEdit = user => {
    setModalMode('edit')
    setSelectedUser(user)
    setUserForm({
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      depotId: user.depotId || '',
      zoneId: user.zoneId || '',
      status: user.status,
    })
    setShowModal(true)
  }

  // Handle save (create or update)
  const handleSave = async e => {
    e.preventDefault()
    setSaving(true)

    try {
      // TODO: Replace with actual API call
      if (modalMode === 'create') {
        // await userService.createUser(userForm)
        console.log('Creating user:', userForm)
      } else {
        // await userService.updateUser(selectedUser.id, userForm)
        console.log('Updating user:', selectedUser.id, userForm)
      }

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))

      setShowModal(false)
      // Refresh list
      // fetchUsers()
    } catch (error) {
      console.error('Failed to save user:', error)
    } finally {
      setSaving(false)
    }
  }

  // Handle delete
  const handleDelete = async user => {
    if (!confirm(`Are you sure you want to delete user "${user.name}"?`)) {
      return
    }

    try {
      // TODO: Replace with actual API call
      // await userService.deleteUser(user.id)
      console.log('Deleting user:', user.id)

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500))

      // Refresh list
      // fetchUsers()
    } catch (error) {
      console.error('Failed to delete user:', error)
    }
  }

  // Get role badge color
  const getRoleBadge = role => {
    const config = {
      INSPECTOR: 'bg-blue-100 text-blue-800',
      DEPOT_OFFICER: 'bg-green-100 text-green-800',
      ZONAL_MANAGER: 'bg-purple-100 text-purple-800',
      ADMIN: 'bg-red-100 text-red-800',
    }
    return config[role] || 'bg-gray-100 text-gray-800'
  }

  // Get role display name
  const getRoleDisplayName = role => {
    const names = {
      INSPECTOR: 'Inspector',
      DEPOT_OFFICER: 'Depot Officer',
      ZONAL_MANAGER: 'Zonal Manager',
      ADMIN: 'Administrator',
    }
    return names[role] || role
  }

  // Format date
  const formatDate = dateString => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date)
  }

  // Table columns
  const columns = [
    {
      key: 'name',
      label: 'Name',
      sortable: true,
      render: (value, row) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
            <span className="text-red-700 font-semibold text-sm">{value.charAt(0)}</span>
          </div>
          <div>
            <p className="font-medium text-gray-900">{value}</p>
            <p className="text-sm text-gray-500">{row.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'role',
      label: 'Role',
      sortable: true,
      render: value => (
        <span
          className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getRoleBadge(
            value
          )}`}
        >
          {getRoleDisplayName(value)}
        </span>
      ),
    },
    {
      key: 'depotId',
      label: 'Depot',
      sortable: true,
      render: value => value || <span className="text-gray-400">N/A</span>,
    },
    {
      key: 'zoneId',
      label: 'Zone',
      sortable: true,
      render: value => value || <span className="text-gray-400">N/A</span>,
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: value => (
        <span
          className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
            value === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
          }`}
        >
          {value.charAt(0).toUpperCase() + value.slice(1)}
        </span>
      ),
    },
    {
      key: 'lastLogin',
      label: 'Last Login',
      sortable: true,
      render: value => <span className="text-sm text-gray-600">{formatDate(value)}</span>,
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleEdit(row)}
            className="p-1 text-blue-600 hover:bg-blue-50 rounded"
            aria-label="Edit user"
          >
            <Edit className="h-4 w-4" />
          </button>
          <button
            onClick={() => handleDelete(row)}
            className="p-1 text-red-600 hover:bg-red-50 rounded"
            aria-label="Delete user"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ]

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
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <p className="text-sm text-gray-600 mt-1">Manage users, roles, and permissions</p>
        </div>
        <Button onClick={handleCreate} className="flex items-center gap-2">
          <Plus className="h-5 w-5" />
          Add User
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm text-gray-600">Total Users</p>
          <p className="text-2xl font-bold text-gray-900">{users.length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm text-gray-600">Active Users</p>
          <p className="text-2xl font-bold text-green-600">
            {users.filter(u => u.status === 'active').length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm text-gray-600">Inspectors</p>
          <p className="text-2xl font-bold text-blue-600">
            {users.filter(u => u.role === 'INSPECTOR').length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm text-gray-600">Administrators</p>
          <p className="text-2xl font-bold text-red-600">
            {users.filter(u => u.role === 'ADMIN').length}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Search users..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-10 w-full"
              />
            </div>
          </div>

          {/* Role Filter */}
          <div>
            <Select
              value={roleFilter}
              onChange={e => setRoleFilter(e.target.value)}
              options={roleOptions}
              className="w-full"
            />
          </div>

          {/* Status Filter */}
          <div>
            <Select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              options={statusOptions}
              className="w-full"
            />
          </div>
        </div>

        <div className="mt-4">
          <p className="text-sm text-gray-600">
            Showing {filteredUsers.length} of {users.length} users
          </p>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow">
        <DataTable columns={columns} data={filteredUsers} emptyMessage="No users found" />
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                {modalMode === 'create' ? 'Add New User' : 'Edit User'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-4 space-y-4">
              {/* Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  value={userForm.name}
                  onChange={handleFormChange}
                  placeholder="John Doe"
                  className="w-full"
                  required
                />
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email *
                </label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={userForm.email}
                  onChange={handleFormChange}
                  placeholder="john.doe@railway.com"
                  className="w-full"
                  required
                />
              </div>

              {/* Phone */}
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                  Phone
                </label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={userForm.phone}
                  onChange={handleFormChange}
                  placeholder="+1-555-0100"
                  className="w-full"
                />
              </div>

              {/* Role */}
              <div>
                <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">
                  Role *
                </label>
                <Select
                  id="role"
                  name="role"
                  value={userForm.role}
                  onChange={handleFormChange}
                  options={roleSelectOptions}
                  className="w-full"
                  required
                />
              </div>

              {/* Depot ID (for Inspector and Depot Officer) */}
              {(userForm.role === 'INSPECTOR' || userForm.role === 'DEPOT_OFFICER') && (
                <div>
                  <label htmlFor="depotId" className="block text-sm font-medium text-gray-700 mb-2">
                    Depot
                  </label>
                  <Input
                    id="depotId"
                    name="depotId"
                    type="text"
                    value={userForm.depotId}
                    onChange={handleFormChange}
                    placeholder="Depot A"
                    className="w-full"
                  />
                </div>
              )}

              {/* Zone ID (for all except Admin) */}
              {userForm.role && userForm.role !== 'ADMIN' && (
                <div>
                  <label htmlFor="zoneId" className="block text-sm font-medium text-gray-700 mb-2">
                    Zone
                  </label>
                  <Input
                    id="zoneId"
                    name="zoneId"
                    type="text"
                    value={userForm.zoneId}
                    onChange={handleFormChange}
                    placeholder="Zone 1"
                    className="w-full"
                  />
                </div>
              )}

              {/* Status */}
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                  Status *
                </label>
                <Select
                  id="status"
                  name="status"
                  value={userForm.status}
                  onChange={handleFormChange}
                  options={statusSelectOptions}
                  className="w-full"
                  required
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-gray-200 text-gray-700 hover:bg-gray-300"
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={saving} className="flex-1">
                  {saving ? 'Saving...' : modalMode === 'create' ? 'Create User' : 'Update User'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default UserManagementPage
