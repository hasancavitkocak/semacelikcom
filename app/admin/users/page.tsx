'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase'

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error

      setUsers(data || [])
    } catch (error) {
      console.error('Load users error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      const { error } = await supabase
        .from('users')
        .update({ role: newRole })
        .eq('id', userId)

      if (error) throw error

      alert('Rol güncellendi!')
      loadUsers()
    } catch (error) {
      console.error('Update role error:', error)
      alert('Rol güncellenirken hata oluştu!')
    }
  }

  return (
    <div>
      <h1 className="text-4xl font-bold mb-8">Kullanıcı Yönetimi</h1>

      <Card>
        <CardHeader>
          <CardTitle>Tüm Kullanıcılar ({users.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p>Yükleniyor...</p>
          ) : users.length === 0 ? (
            <p className="text-gray-600">Henüz kullanıcı bulunmuyor.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ad Soyad</TableHead>
                  <TableHead>E-posta</TableHead>
                  <TableHead>Telefon</TableHead>
                  <TableHead>Rol</TableHead>
                  <TableHead>İşlemler</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.full_name || '-'}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.phone || '-'}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded text-sm ${
                        user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {user.role === 'admin' ? 'Admin' : 'Müşteri'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {user.role === 'customer' ? (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleRoleChange(user.id, 'admin')}
                          >
                            Admin Yap
                          </Button>
                        ) : (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleRoleChange(user.id, 'customer')}
                          >
                            Müşteri Yap
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
