'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

export default function AdminCouponsPage() {
  const coupons = [
    { id: '1', code: 'YENIYIL25', discount: 25, type: 'percentage', active: true },
    { id: '2', code: 'KARGO50', discount: 50, type: 'fixed', active: true },
    { id: '3', code: 'ILKALIS', discount: 15, type: 'percentage', active: false }
  ]

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">Kupon Yönetimi</h1>
        <Button>+ Yeni Kupon</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Kuponlar</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Kupon Kodu</TableHead>
                <TableHead>İndirim</TableHead>
                <TableHead>Tip</TableHead>
                <TableHead>Durum</TableHead>
                <TableHead>İşlemler</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {coupons.map((coupon) => (
                <TableRow key={coupon.id}>
                  <TableCell className="font-mono font-bold">{coupon.code}</TableCell>
                  <TableCell>
                    {coupon.discount}{coupon.type === 'percentage' ? '%' : '₺'}
                  </TableCell>
                  <TableCell>
                    {coupon.type === 'percentage' ? 'Yüzde' : 'Sabit'}
                  </TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded text-sm ${
                      coupon.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {coupon.active ? 'Aktif' : 'Pasif'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">Düzenle</Button>
                      <Button variant="destructive" size="sm">Sil</Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
