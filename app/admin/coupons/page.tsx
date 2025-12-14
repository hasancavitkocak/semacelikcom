'use client'

import { Button } from '@/components/ui/button'
import { Ticket, Plus, Edit, Trash2 } from 'lucide-react'
import AdminHeader, { AdminHeaderButton } from '@/components/admin-header'

export default function AdminCouponsPage() {
  const coupons = [
    { id: '1', code: 'YENIYIL25', discount: 25, type: 'percentage', active: true },
    { id: '2', code: 'KARGO50', discount: 50, type: 'fixed', active: true },
    { id: '3', code: 'ILKALIS', discount: 15, type: 'percentage', active: false }
  ]

  return (
    <div className="space-y-6">
      <AdminHeader
        title="Kupon Yönetimi"
        description={`${coupons.length} kupon tanımlı`}
        actions={
          <AdminHeaderButton href="/admin/coupons/new" icon={Plus}>
            Yeni Kupon
          </AdminHeaderButton>
        }
      />

      {coupons.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <Ticket size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Henüz kupon yok</h3>
          <p className="text-gray-600 mb-6">İlk kuponunuzu oluşturarak başlayın</p>
          <AdminHeaderButton href="/admin/coupons/new" icon={Plus}>
            İlk Kuponu Oluştur
          </AdminHeaderButton>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Kupon Kodu</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">İndirim</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Tip</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Durum</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-900">İşlemler</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {coupons.map((coupon) => (
                  <tr key={coupon.id} className="hover:bg-gray-50">
                    <td className="py-4 px-4">
                      <span className="font-mono font-bold text-gray-900">{coupon.code}</span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-gray-900">
                        {coupon.discount}{coupon.type === 'percentage' ? '%' : '₺'}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-gray-900">
                        {coupon.type === 'percentage' ? 'Yüzde' : 'Sabit'}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        coupon.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {coupon.active ? 'Aktif' : 'Pasif'}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center justify-center gap-2">
                        <button className="text-gray-600 hover:text-gray-900 transition">
                          <Edit size={16} />
                        </button>
                        <button className="text-red-600 hover:text-red-900 transition">
                          <Trash2 size={16} />
                        </button>
                      </div>
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
