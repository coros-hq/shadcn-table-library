import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { columns } from "./columns";
import { DataTable } from "./data-table";
import type { Payment } from '#/components/basic/columns'

const data: Payment[] = [
  { id: "728ed52f", amount: 100, status: "pending", email: "m@example.com" },
  { id: "489e1d42", amount: 125, status: "processing", email: "example@gmail.com" },
  { id: "5c8f0e93", amount: 450, status: "success", email: "sarah.jones@example.com" },
  { id: "a1b2c3d4", amount: 75, status: "failed", email: "oliver.k@example.com" },
  { id: "e5f6g7h8", amount: 320, status: "success", email: "priya.n@example.com" },
  { id: "i9j0k1l2", amount: 89, status: "pending", email: "tom.walsh@example.com" },
  { id: "m3n4o5p6", amount: 610, status: "success", email: "j.chen@example.com" },
  { id: "q7r8s9t0", amount: 42, status: "failed", email: "amina.b@example.com" },
  { id: "u1v2w3x4", amount: 275, status: "processing", email: "lucas.moreau@example.com" },
  { id: "y5z6a7b8", amount: 150, status: "pending", email: "hannah.k@example.com" },
  { id: "c9d0e1f2", amount: 980, status: "success", email: "d.almeida@example.com" },
  { id: "g3h4i5j6", amount: 55, status: "failed", email: "noah.b@example.com" },
  { id: "k7l8m9n0", amount: 340, status: "processing", email: "elif.y@example.com" },
  { id: "o1p2q3r4", amount: 120, status: "success", email: "marco.r@example.com" },
  { id: "s5t6u7v8", amount: 95, status: "pending", email: "grace.l@example.com" },
  { id: "w9x0y1z2", amount: 410, status: "success", email: "kenji.t@example.com" },
  { id: "a3b4c5d6", amount: 60, status: "failed", email: "zainab.o@example.com" },
  { id: "e7f8g9h0", amount: 730, status: "success", email: "ivan.p@example.com" },
  { id: "i1j2k3l4", amount: 205, status: "processing", email: "clara.f@example.com" },
  { id: "m5n6o7p8", amount: 175, status: "pending", email: "yusuf.a@example.com" },
]

export function BasicTableUsage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Basic Table Usage</CardTitle>
      </CardHeader>
      <CardContent>
        <DataTable columns={columns} data={data}/>
      </CardContent>
    </Card>
  )
}
