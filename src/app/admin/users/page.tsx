'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus, Edit, Trash2, Users, Lock } from 'lucide-react'
import toast from 'react-hot-toast'
import { Navigation } from '@/components/ui/navigation'

interface User {
  id: string
  email: string
  name: string
  role: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [showPasswordForm, setShowPasswordForm] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'USER'
  })
  const [passwordData, setPasswordData] = useState({
    newPassword: '',
    confirmPassword: ''
  })

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users')
      if (response.ok) {
        const data = await response.json()
        setUsers(data)
      } else {
        toast.error('Error al cargar usuarios')
      }
    } catch (error) {
      toast.error('Error al cargar usuarios')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const url = editingUser 
        ? `/api/users/${editingUser.id}`
        : '/api/users'
      
      const method = editingUser ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        toast.success(editingUser ? 'Usuario actualizado' : 'Usuario creado')
        setShowForm(false)
        setEditingUser(null)
        resetForm()
        fetchUsers()
      } else {
        const errorData = await response.json()
        toast.error(errorData.error || 'Error al guardar usuario')
      }
    } catch (error) {
      toast.error('Error al guardar usuario')
    }
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Las contraseñas no coinciden')
      return
    }

    if (passwordData.newPassword.length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres')
      return
    }

    try {
      const response = await fetch(`/api/users/${selectedUser?.id}/password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          newPassword: passwordData.newPassword
        }),
      })

      if (response.ok) {
        toast.success('Contraseña actualizada correctamente')
        setShowPasswordForm(false)
        setSelectedUser(null)
        setPasswordData({ newPassword: '', confirmPassword: '' })
      } else {
        const errorData = await response.json()
        toast.error(errorData.error || 'Error al cambiar contraseña')
      }
    } catch (error) {
      toast.error('Error al cambiar contraseña')
    }
  }

  const handleEdit = (user: User) => {
    setEditingUser(user)
    setFormData({
      name: user.name,
      email: user.email,
      password: '',
      role: user.role
    })
    setShowForm(true)
  }

  const handleChangePassword = (user: User) => {
    setSelectedUser(user)
    setPasswordData({ newPassword: '', confirmPassword: '' })
    setShowPasswordForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este usuario?')) return
    
    try {
      const response = await fetch(`/api/users/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        toast.success('Usuario eliminado')
        fetchUsers()
      } else {
        toast.error('Error al eliminar usuario')
      }
    } catch (error) {
      toast.error('Error al eliminar usuario')
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      role: 'USER'
    })
  }

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'ADMIN': return 'Administrador'
      case 'MANAGER': return 'Gerente'
      case 'USER': return 'Usuario'
      default: return role
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">Cargando usuarios...</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      <Navigation 
        title="Administración de Usuarios" 
        breadcrumbs={[
          { label: 'Administración', href: '/admin' },
          { label: 'Usuarios' }
        ]}
      />
      <div className="flex justify-end mb-6">
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Agregar Usuario
        </Button>
      </div>

      {showForm && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>
              {editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Nombre</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    required
                  />
                </div>
                {!editingUser && (
                  <div>
                    <Label htmlFor="password">Contraseña</Label>
                    <Input
                      id="password"
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({...formData, password: e.target.value})}
                      required={!editingUser}
                    />
                  </div>
                )}
                <div>
                  <Label htmlFor="role">Rol</Label>
                  <select
                    id="role"
                    value={formData.role}
                    onChange={(e) => setFormData({...formData, role: e.target.value})}
                    className="w-full p-2 border rounded"
                  >
                    <option value="USER">Usuario</option>
                    <option value="MANAGER">Gerente</option>
                    <option value="ADMIN">Administrador</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-2">
                <Button type="submit">
                  {editingUser ? 'Actualizar' : 'Crear'} Usuario
                </Button>
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => {
                    setShowForm(false)
                    setEditingUser(null)
                    resetForm()
                  }}
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {showPasswordForm && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>
              Cambiar Contraseña - {selectedUser?.name}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="newPassword">Nueva Contraseña</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="confirmPassword">Confirmar Contraseña</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                    required
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button type="submit">
                  Cambiar Contraseña
                </Button>
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => {
                    setShowPasswordForm(false)
                    setSelectedUser(null)
                    setPasswordData({ newPassword: '', confirmPassword: '' })
                  }}
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {users.map((user) => (
          <Card key={user.id}>
            <CardHeader>
              <CardTitle className="flex justify-between items-start">
                <span>{user.name}</span>
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(user)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleChangePassword(user)}
                  >
                    <Lock className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDelete(user.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p><strong>Email:</strong> {user.email}</p>
                <p><strong>Rol:</strong> {getRoleLabel(user.role)}</p>
                <p><strong>Estado:</strong> {user.isActive ? 'Activo' : 'Inactivo'}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {users.length === 0 && !loading && (
        <div className="text-center py-8">
          <p className="text-gray-500">No hay usuarios registrados</p>
        </div>
      )}
    </div>
  )
} 