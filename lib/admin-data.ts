import { MOCK_ORDERS, type Order } from "./orders"
import type { User } from "./auth"

// Extended mock users for admin
export const ALL_USERS: (User & { totalOrders: number; totalSpent: number })[] = [
  {
    id: "1",
    email: "admin@fabnest3d.com",
    name: "Admin User",
    role: "admin",
    createdAt: "2023-01-01T00:00:00.000Z",
    totalOrders: 0,
    totalSpent: 0,
  },
  {
    id: "2",
    email: "user@example.com",
    name: "John Doe",
    role: "user",
    createdAt: "2023-06-15T00:00:00.000Z",
    totalOrders: 3,
    totalSpent: 164.96,
  },
  {
    id: "3",
    email: "jane.smith@example.com",
    name: "Jane Smith",
    role: "user",
    createdAt: "2023-09-20T00:00:00.000Z",
    totalOrders: 5,
    totalSpent: 349.95,
  },
  {
    id: "4",
    email: "bob.wilson@example.com",
    name: "Bob Wilson",
    role: "user",
    createdAt: "2024-01-10T00:00:00.000Z",
    totalOrders: 2,
    totalSpent: 89.98,
  },
]

export function getAllOrders(): Order[] {
  return MOCK_ORDERS
}

export function getAllUsers() {
  return ALL_USERS
}

export function getAdminStats() {
  const orders = getAllOrders()
  const users = getAllUsers()

  const totalRevenue = orders.reduce((sum, order) => sum + order.price, 0)
  const activeOrders = orders.filter((o) => !["delivered", "cancelled"].includes(o.status)).length
  const totalUsers = users.filter((u) => u.role === "user").length

  return {
    totalRevenue,
    activeOrders,
    totalOrders: orders.length,
    totalUsers,
  }
}
