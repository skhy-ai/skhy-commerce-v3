import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { supabase } from '../lib/supabase';

// Define the interface for item data used in the invoice
interface InvoiceItem {
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
}

interface InvoiceOrder {
    id: string;
    order_number: string;
    created_at: string;
    buyer: {
        email: string;
    };
    shipping_address: any;
    total_amount: number;
}

export const generateInvoicePDF = async (orderId: string): Promise<Blob> => {
    // 1. Fetch Order Details
    const { data: order, error } = await supabase
        .from('orders')
        .select(`
            *,
            buyer:users!buyer_id(email, company_name),
            order_items (
                quantity,
                unit_price,
                product:products(name)
            )
        `)
        .eq('id', orderId)
        .single();

    if (error || !order) throw new Error('Order not found');

    const doc = new jsPDF();

    // 2. Add Branding
    doc.setFontSize(20);
    doc.text('INVOICE', 14, 20);

    doc.setFontSize(10);
    doc.text('Skhy AI Platform', 14, 30);
    doc.text('123 Tech Blvd', 14, 35);
    doc.text('San Francisco, CA 94105', 14, 40);

    // 3. Order Info
    doc.text(`Invoice #: INV-${order.order_number}`, 140, 30);
    doc.text(`Date: ${new Date(order.created_at).toLocaleDateString()}`, 140, 35);
    doc.text(`Order #: ${order.order_number}`, 140, 40);

    // 4. Billed To
    doc.text('Bill To:', 14, 55);
    doc.setFont('helvetica', 'bold');

    const address = order.shipping_address as any;
    const billName = address?.name || order.buyer?.company_name || order.buyer?.email || 'Valued Customer';

    doc.text(billName, 14, 60);
    doc.setFont('helvetica', 'normal');

    if (address) {
        doc.text(`${address.line1} ${address.line2 || ''}`, 14, 65);
        doc.text(`${address.city}, ${address.state} ${address.postal_code}`, 14, 70);
        doc.text(address.country, 14, 75);
    }

    // 5. Items Table
    const items = order.order_items.map((item: any) => [
        item.product?.name || 'Item',
        item.quantity,
        `$${item.unit_price}`,
        `$${(item.quantity * item.unit_price).toFixed(2)}`
    ]);

    autoTable(doc, {
        startY: 85,
        head: [['Description', 'Quantity', 'Unit Price', 'Total']],
        body: items,
        theme: 'striped',
        headStyles: { fillColor: [66, 66, 66] }
    });

    // 6. Totals
    const finalY = (doc as any).lastAutoTable.finalY + 10;

    doc.text(`Subtotal:`, 140, finalY);
    doc.text(`$${order.total_amount.toFixed(2)}`, 170, finalY, { align: 'right' });

    doc.text(`Tax:`, 140, finalY + 5);
    doc.text(`$0.00`, 170, finalY + 5, { align: 'right' });

    doc.setFont('helvetica', 'bold');
    doc.text(`Total:`, 140, finalY + 12);
    doc.text(`$${order.total_amount.toFixed(2)}`, 170, finalY + 12, { align: 'right' });

    // Return blob
    return doc.output('blob');
};
