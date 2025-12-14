'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase'
import { Users } from 'lucide-react'
import AdminHeader from '@/components/admin-header'

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
    <div className="space-y-6">
      <AdminHeader
        title="Kullanıcı Yönetimi"
        description={`Toplam ${users.length} kullanıcı`}
      />

      {loading ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-200 border-t-gray-900"></div>
            <span className="ml-3 text-gray-600">Kullanıcılar yükleniyor...</span>
          </div>
        </div>
      ) : users.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <Users size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Henüz kullanıcı yok</h3>
          <p className="text-gray-600">Kullanıcılar kayıt oldukça burada görünecek</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Ad Soyad</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">E-posta</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Telefon</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Rol</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-900">İşlemler</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="py-4 px-4">
                      <div className="font-medium text-gray-900">{user.full_name || '-'}</div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="text-gray-900">{user.email}</div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="text-gray-900">{user.phone || '-'}</div>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {user.role === 'admin' ? 'Admin' : 'Müşteri'}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-center">
                      {user.role === 'customer' ? (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleRoleChange(user.id, 'admin')}
                          className="border-gray-300 hover:bg-gray-50"
                        >
                          Admin Yap
                        </Button>
                      ) : (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleRoleChange(user.id, 'customer')}
                          className="border-gray-300 hover:bg-gray-50"
                        >
                          Müşteri Yap
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
