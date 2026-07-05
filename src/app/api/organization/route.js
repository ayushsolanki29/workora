import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET(request) {
  try {
    const session = await getSession();
    if (!session || !session.organizationId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const organization = await prisma.organization.findUnique({
      where: { id: session.organizationId }
    });

    if (!organization) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
    }

    return NextResponse.json({ organization });
  } catch (error) {
    console.error('Fetch organization error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request) {
  try {
    const session = await getSession();
    if (!session || !session.organizationId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, address, invoiceFooterNote, expenseFooterNote, masterCurrency } = body;
    const updateData = {};

    if (name !== undefined) {
      if (!name || name.trim().length === 0) {
        return NextResponse.json({ error: 'Name cannot be empty' }, { status: 400 });
      }
      updateData.name = name.trim();
    }
    
    if (address !== undefined) updateData.address = address?.trim() || null;
    if (invoiceFooterNote !== undefined) updateData.invoiceFooterNote = invoiceFooterNote?.trim() || null;
    if (expenseFooterNote !== undefined) updateData.expenseFooterNote = expenseFooterNote?.trim() || null;
    if (masterCurrency !== undefined) updateData.masterCurrency = masterCurrency;

    const organization = await prisma.organization.update({
      where: { id: session.organizationId },
      data: updateData
    });

    return NextResponse.json({ organization });
  } catch (error) {
    console.error('Update organization error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
