"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAuth } from "@/lib/auth"
import { Search, MoreVertical, Loader2, Trash2, Edit, UserCog, Shield, ShieldOff } from "lucide-react"

export default function AdminUsersPage() {
  const { token, user } = useAuth()
  const [searchTerm, setSearchTerm] = useState("")
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [editingUser, setEditingUser] = useState<any | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editFormData, setEditFormData] = useState({
    name: "",
    email: "",
    password: "",
  })
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    fetchUsers()
  }, [token])

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/admin/users', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      if (response.ok) {
        const data = await response.json()
        setUsers(data.users || [])
      }
    } catch (error) {
      console.error('Failed to fetch users:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleEdit = (user: any) => {
    setEditingUser(user)
    setEditFormData({
      name: user.name || "",
      email: user.email || "",
      password: "", // Don't pre-fill password
    })
    setIsEditDialogOpen(true)
  }

  const handleUpdateUser = async () => {
    if (!editingUser) return

    setUpdating(true)
    try {
      const currentToken = useAuth.getState().token
      if (!currentToken) {
        alert('Authentication required')
        return
      }

      const updateData: any = {
        name: editFormData.name,
        email: editFormData.email,
      }

      // Only include password if it's been changed
      if (editFormData.password && editFormData.password.trim() !== "") {
        updateData.password = editFormData.password
      }

      const response = await fetch(`/api/admin/users/${editingUser.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentToken}`
        },
        body: JSON.stringify(updateData)
      })

      if (response.ok) {
        await fetchUsers()
        setIsEditDialogOpen(false)
        setEditingUser(null)
        setEditFormData({ name: "", email: "", password: "" })
        alert('User updated successfully!')
      } else {
        const data = await response.json()
        alert(data.error || 'Failed to update user')
      }
    } catch (error) {
      console.error('Update user error:', error)
      alert('Failed to update user')
    } finally {
      setUpdating(false)
    }
  }

  const handleToggleRole = async (targetUser: any) => {
    const newRole = targetUser.role === "admin" ? "user" : "admin"
    const action = newRole === "admin" ? "make an admin" : "remove admin privileges from"
    
    if (!confirm(`Are you sure you want to ${action} "${targetUser.name}"?`)) {
      return
    }

    setUpdating(true)
    try {
      const currentToken = useAuth.getState().token
      if (!currentToken) {
        alert('Authentication required')
        return
      }

      const response = await fetch(`/api/admin/users/${targetUser.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentToken}`
        },
        body: JSON.stringify({ role: newRole })
      })

      if (response.ok) {
        await fetchUsers()
        alert(`User role updated successfully!`)
      } else {
        const data = await response.json()
        alert(data.error || 'Failed to update user role')
      }
    } catch (error) {
      console.error('Toggle role error:', error)
      alert('Failed to update user role')
    } finally {
      setUpdating(false)
    }
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete user "${name}"? This action cannot be undone and will delete all associated orders and files.`)) {
      return
    }

    setDeleting(id)
    try {
      const currentToken = useAuth.getState().token
      if (!currentToken) {
        alert('Authentication required')
        return
      }

      const response = await fetch(`/api/admin/users/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${currentToken}`
        }
      })

      if (response.ok) {
        await fetchUsers()
        alert('User deleted successfully!')
      } else {
        const data = await response.json()
        alert(data.error || 'Failed to delete user')
      }
    } catch (error) {
      console.error('Delete user error:', error)
      alert('Failed to delete user')
    } finally {
      setDeleting(null)
    }
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">User Management</h1>
        <p className="text-muted-foreground">Manage customer accounts</p>
      </div>

      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Users ({filteredUsers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No users found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredUsers.map((targetUser) => {
                const initials = targetUser.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()
                  .slice(0, 2)
                return (
                  <div key={targetUser.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4 flex-1">
                      <Avatar className="h-12 w-12">
                        <AvatarFallback>{initials}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-semibold">{targetUser.name}</p>
                          <Badge variant={targetUser.role === "admin" ? "default" : "secondary"}>{targetUser.role}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{targetUser.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground mb-1">Member Since</p>
                        <p className="font-semibold">{new Date(targetUser.createdAt).toLocaleDateString()}</p>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="icon"
                            disabled={deleting === targetUser.id || updating}
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEdit(targetUser)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit User
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleToggleRole(targetUser)}>
                            {targetUser.role === "admin" ? (
                              <>
                                <ShieldOff className="mr-2 h-4 w-4" />
                                Remove Admin
                              </>
                            ) : (
                              <>
                                <Shield className="mr-2 h-4 w-4" />
                                Make Admin
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => handleDelete(targetUser.id, targetUser.name)}
                            className="text-destructive focus:text-destructive"
                            disabled={deleting === targetUser.id}
                          >
                            {deleting === targetUser.id ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Deleting...
                              </>
                            ) : (
                              <>
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete User
                              </>
                            )}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Update user information. Leave password empty to keep the current password.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Name</Label>
              <Input
                id="edit-name"
                value={editFormData.name}
                onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                placeholder="User name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-email">Email</Label>
              <Input
                id="edit-email"
                type="email"
                value={editFormData.email}
                onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                placeholder="user@example.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-password">New Password (optional)</Label>
              <Input
                id="edit-password"
                type="password"
                value={editFormData.password}
                onChange={(e) => setEditFormData({ ...editFormData, password: e.target.value })}
                placeholder="Leave empty to keep current password"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateUser} disabled={updating}>
              {updating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                'Update User'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
