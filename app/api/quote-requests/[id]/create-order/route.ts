import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth-server'
import { validateFloat } from '@/lib/validation'

// POST /api/quote-requests/[id]/create-order - Create order from quote request
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = requireAuth(request)
    const { id } = await params
    const body = await request.json()
    
    const { shipping = 0, tax = 0 } = body

    // Get the quote request
    const quoteRequest = await prisma.quoteRequest.findUnique({
      where: { id },
      include: {
        user: { select: { id: true } },
        customFile: {
          select: {
            id: true,
            orderItemId: true,
            material: true,
            file: { select: { id: true, filename: true } }
          }
        }
      }
    })

    if (!quoteRequest) {
      return NextResponse.json(
        { error: 'Quote request not found' },
        { status: 404 }
      )
    }

    // Verify the quote request belongs to the user
    if (quoteRequest.userId !== user.userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    // Verify the quote request has been quoted
    if (quoteRequest.status !== 'quoted' || !quoteRequest.requestedPrice) {
      return NextResponse.json(
        { error: 'Quote request must be quoted with a price before creating an order' },
        { status: 400 }
      )
    }

    // Prevent creating multiple orders from the same quote request
    // Check if the custom file is already linked to an order item
    if (quoteRequest.customFile.orderItemId) {
      return NextResponse.json(
        { error: 'An order has already been created for this quote request' },
        { status: 400 }
      )
    }

    // Validate shipping and tax
    const shippingValidation = validateFloat(shipping, 'shipping')
    if (!shippingValidation.valid) {
      return NextResponse.json({ error: shippingValidation.error }, { status: 400 })
    }

    const taxValidation = validateFloat(tax, 'tax')
    if (!taxValidation.valid) {
      return NextResponse.json({ error: taxValidation.error }, { status: 400 })
    }

    // Calculate totals
    const subtotal = quoteRequest.requestedPrice
    const total = subtotal + shippingValidation.value! + taxValidation.value!

    // Create order with the custom file
    const order = await prisma.$transaction(async (tx) => {
      // Create the order
      const newOrder = await tx.order.create({
        data: {
          userId: user.userId,
          subtotal: subtotal,
          shipping: shippingValidation.value!,
          tax: taxValidation.value!,
          total: total,
          status: 'pending',
          items: {
            create: {
              productId: null, // Custom order, no product
              productName: quoteRequest.customFile.file.filename,
              material: quoteRequest.customFile.material,
              color: null,
              size: 'custom',
              quantity: 1,
              unitPrice: subtotal,
              totalPrice: subtotal,
              isCustom: true,
              customFile: {
                connect: { id: quoteRequest.customFileId }
              }
            }
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

      // Update quote request status to accepted
      await tx.quoteRequest.update({
        where: { id },
        data: { status: 'accepted' }
      })

      return newOrder
    })

    return NextResponse.json({
      success: true,
      order
    }, { status: 201 })
  } catch (error: any) {
    console.error('Create order from quote request error:', error)
    
    if (error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to create order from quote request' },
      { status: 500 }
    )
  }
}

