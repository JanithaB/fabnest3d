import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth, requireAdmin } from '@/lib/auth-server'
import { validateFloat, validateInt, validateStringLength } from '@/lib/validation'

// GET /api/orders - Get user's orders (or all orders if admin)
export async function GET(request: NextRequest) {
  try {
    const user = requireAuth(request)
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const limit = Math.min(Math.max(parseInt(searchParams.get('limit') || '50'), 1), 100) // Between 1 and 100
    const offset = Math.max(parseInt(searchParams.get('offset') || '0'), 0) // Minimum 0

    const where: any = {}
    
    // Regular users can only see their own orders
    if (user.role !== 'admin') {
      where.userId = user.userId
    }
    
    if (status) {
      where.status = status
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            }
          },
          items: {
            include: {
              product: {
                include: {
                  images: {
                    where: { isPrimary: true },
                    include: {
                      file: {
                        select: {
                          url: true,
                        }
                      }
                    },
                    take: 1,
                  }
                }
              },
              customFile: {
                include: {
                  file: {
                    select: {
                      id: true,
                      url: true,
                      filename: true,
                      size: true,
                    }
                  }
                }
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.order.count({ where })
    ])

    // Transform orders to include product images and file download info for admins
    const ordersWithImages = orders.map(order => ({
      ...order,
      items: order.items.map(item => ({
        ...item,
        productImage: item.product?.images[0]?.file.url || null,
        customFileUrl: item.customFile?.file.url || null,
        // Add file download info for admins
        customFile: item.customFile ? {
          ...item.customFile,
          file: {
            ...item.customFile.file,
            downloadUrl: user.role === 'admin' 
              ? `/api/admin/files/${item.customFile.file.id}/download`
              : undefined,
          }
        } : null,
      }))
    }))

    return NextResponse.json({
      orders: ordersWithImages,
      total,
      limit,
      offset,
    })
  } catch (error: any) {
    console.error('Get orders error:', error)
    
    if (error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    )
  }
}

// POST /api/orders - Create order
export async function POST(request: NextRequest) {
  try {
    const user = requireAuth(request)
    const body = await request.json()
    
    const { items, subtotal, shipping, tax, total, customFileId } = body

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'Order must contain at least one item' },
        { status: 400 }
      )
    }

    // Validate numeric totals
    const subtotalValidation = validateFloat(subtotal, 'subtotal')
    if (!subtotalValidation.valid) {
      return NextResponse.json({ error: subtotalValidation.error }, { status: 400 })
    }

    const shippingValidation = validateFloat(shipping, 'shipping')
    if (!shippingValidation.valid) {
      return NextResponse.json({ error: shippingValidation.error }, { status: 400 })
    }

    const taxValidation = validateFloat(tax, 'tax')
    if (!taxValidation.valid) {
      return NextResponse.json({ error: taxValidation.error }, { status: 400 })
    }

    const totalValidation = validateFloat(total, 'total')
    if (!totalValidation.valid) {
      return NextResponse.json({ error: totalValidation.error }, { status: 400 })
    }

    // Validate items and check product existence
    for (let i = 0; i < items.length; i++) {
      const item = items[i]
      
      // Validate required fields
      if (!item.productName || !item.material || !item.size) {
        return NextResponse.json(
          { error: `Item ${i + 1}: productName, material, and size are required` },
          { status: 400 }
        )
      }

      // Validate productName length
      const nameValidation = validateStringLength(item.productName, `Item ${i + 1} productName`, 255)
      if (!nameValidation.valid) {
        return NextResponse.json({ error: nameValidation.error }, { status: 400 })
      }

      // Validate material length
      const materialValidation = validateStringLength(item.material, `Item ${i + 1} material`, 50)
      if (!materialValidation.valid) {
        return NextResponse.json({ error: materialValidation.error }, { status: 400 })
      }

      // Validate size length
      const sizeValidation = validateStringLength(item.size, `Item ${i + 1} size`, 50)
      if (!sizeValidation.valid) {
        return NextResponse.json({ error: sizeValidation.error }, { status: 400 })
      }

      // Validate numeric fields
      const quantityValidation = validateInt(item.quantity, `Item ${i + 1} quantity`, 1)
      if (!quantityValidation.valid) {
        return NextResponse.json({ error: quantityValidation.error }, { status: 400 })
      }

      const unitPriceValidation = validateFloat(item.unitPrice, `Item ${i + 1} unitPrice`)
      if (!unitPriceValidation.valid) {
        return NextResponse.json({ error: unitPriceValidation.error }, { status: 400 })
      }

      const totalPriceValidation = validateFloat(item.totalPrice, `Item ${i + 1} totalPrice`)
      if (!totalPriceValidation.valid) {
        return NextResponse.json({ error: totalPriceValidation.error }, { status: 400 })
      }

      // Validate product exists if productId is provided
      if (item.productId) {
        const product = await prisma.product.findUnique({
          where: { id: item.productId }
        })
        if (!product) {
          return NextResponse.json(
            { error: `Item ${i + 1}: Product with ID ${item.productId} not found` },
            { status: 400 }
          )
        }
      }

      // Validate custom file ownership if customFileId is provided
      if (item.customFileId) {
        const customFile = await prisma.customOrderFile.findUnique({
          where: { id: item.customFileId },
          include: { user: { select: { id: true } } }
        })
        
        if (!customFile) {
          return NextResponse.json(
            { error: `Item ${i + 1}: Custom file not found` },
            { status: 404 }
          )
        }

        // Verify file belongs to user (unless admin)
        if (customFile.userId !== user.userId && user.role !== 'admin') {
          return NextResponse.json(
            { error: `Item ${i + 1}: Unauthorized to use this custom file` },
            { status: 403 }
          )
        }
      }
    }

    // Create order with items using transaction for atomicity
    const order = await prisma.$transaction(async (tx) => {
      return tx.order.create({
        data: {
          userId: user.userId,
          subtotal: subtotalValidation.value!,
          shipping: shippingValidation.value!,
          tax: taxValidation.value!,
          total: totalValidation.value!,
          status: 'pending',
          items: {
            create: items.map((item: any, index: number) => {
              // Re-validate to ensure we use validated values
              const qty = validateInt(item.quantity, 'quantity', 1).value!
              const unitPrice = validateFloat(item.unitPrice, 'unitPrice').value!
              const totalPrice = validateFloat(item.totalPrice, 'totalPrice').value!

              return {
                productId: item.productId || null,
                productName: item.productName.trim(),
                material: item.material.trim(),
                color: item.color?.trim() || null,
                size: item.size.trim(),
                quantity: qty,
                unitPrice: unitPrice,
                totalPrice: totalPrice,
                isCustom: item.isCustom || false,
                customFile: item.customFileId ? {
                  connect: { id: item.customFileId }
                } : undefined,
              }
            })
          }
        },
        include: {
          items: {
            include: {
              product: true,
              customFile: {
                include: {
                  file: true
                }
              }
            }
          }
        }
      })
    })

    return NextResponse.json({
      order
    }, { status: 201 })
  } catch (error: any) {
    console.error('Create order error:', error)
    
    if (error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    )
  }
}

