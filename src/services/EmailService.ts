// Mock Email Service for Phase 5
// In production, this would use an API like SendGrid, Resend, or AWS SES via Supabase Functions

interface EmailOptions {
    to: string;
    subject: string;
    body: string; // HTML or Text
}

export const sendEmail = async (options: EmailOptions): Promise<boolean> => {
    console.group('📧 [Mock Email Service] Sending Email...');
    console.log(`To: ${options.to}`);
    console.log(`Subject: ${options.subject}`);
    console.log(`Body (Preview): ${options.body.substring(0, 100)}...`);
    console.groupEnd();

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));

    return true;
};

export const sendOrderConfirmationEmail = async (order: any, userEmail: string) => {
    const subject = `Order Confirmation #${order.order_number}`;
    const body = `
        <h1>Thank you for your order!</h1>
        <p>Order #${order.order_number} has been received.</p>
        <p>Total: $${order.total_amount}</p>
        <p>We will notify you when it ships.</p>
    `;
    return sendEmail({ to: userEmail, subject, body });
};
