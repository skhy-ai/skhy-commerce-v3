/**
 * Web3Forms Service
 * Handles submission of support requests via web3forms API
 */
import { NDA_TEXT } from '../data/ndaText';

interface Web3FormsSubmission {
    name: string;
    email: string;
    subject: string;
    message: string;
    [key: string]: any; // Additional fields
}

interface Web3FormsResponse {
    success: boolean;
    message?: string;
}

const WEB3FORMS_API_URL = 'https://api.web3forms.com/submit';

/**
 * Get the web3forms access key from environment variables
 */
function getAccessKey(): string | null {
    const key = import.meta.env.VITE_WEB3FORMS_ACCESS_KEY;

    if (!key) {
        // SEC-19: No hardcoded fallback — fail explicitly so misconfiguration is caught early
        console.error('Web3Forms access key (VITE_WEB3FORMS_ACCESS_KEY) is not configured.');
        return null;
    }

    return key;
}


/**
 * Submit a support request via web3forms
 */
export async function submitSupportRequest(
    data: Web3FormsSubmission,
    retries = 2
): Promise<Web3FormsResponse> {
    try {
        const accessKey = getAccessKey();

        if (!accessKey) {
            return { success: false, message: 'Form submission service is not configured.' };
        }

        const formData = {
            access_key: accessKey,
            ...data,
            from_name: 'Skhy AI Platform',
            subject: data.subject.startsWith('[') ? data.subject : `[Support] ${data.subject}`,
            // Add timestamp
            submitted_at: new Date().toISOString()
        };

        const response = await fetch(WEB3FORMS_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || 'Failed to submit support request');
        }

        return {
            success: true,
            message: result.message
        };

    } catch (error: any) {
        console.error('Error submitting support request:', error);

        // Retry logic
        if (retries > 0) {
            console.log(`Retrying... (${retries} attempts left)`);
            await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
            return submitSupportRequest(data, retries - 1);
        }

        return {
            success: false,
            message: error.message || 'Failed to submit support request'
        };
    }
}

/**
 * Helper: Submit product-related support request
 */
export async function submitProductIssue(params: {
    userName: string;
    userEmail: string;
    productName?: string;
    issueType: string;
    description: string;
    errorDetails?: string;
}) {
    return submitSupportRequest({
        name: params.userName,
        email: params.userEmail,
        subject: `Product Issue: ${params.issueType}`,
        message: `
Issue Type: ${params.issueType}
${params.productName ? `Product Name: ${params.productName}` : ''}

Description:
${params.description}

${params.errorDetails ? `\nTechnical Details:\n${params.errorDetails}` : ''}
        `.trim(),
        issue_category: 'product',
        issue_type: params.issueType
    });
}

/**
 * Helper: Submit profile-related support request
 */
export async function submitProfileIssue(params: {
    userName: string;
    userEmail: string;
    companyName?: string;
    attemptedAction: string;
    description: string;
    errorDetails?: string;
}) {
    return submitSupportRequest({
        name: params.userName,
        email: params.userEmail,
        subject: `Profile Issue: ${params.attemptedAction}`,
        message: `
Attempted Action: ${params.attemptedAction}
${params.companyName ? `Company: ${params.companyName}` : ''}

Description:
${params.description}

${params.errorDetails ? `\nTechnical Details:\n${params.errorDetails}` : ''}
        `.trim(),
        issue_category: 'profile',
        attempted_action: params.attemptedAction
    });
}

/**
 * Helper: Submit order-related support request
 */
export async function submitOrderIssue(params: {
    userName: string;
    userEmail: string;
    orderNumber?: string;
    issueType: string;
    description: string;
}) {
    return submitSupportRequest({
        name: params.userName,
        email: params.userEmail,
        subject: `Order Issue: ${params.issueType}`,
        message: `
Issue Type: ${params.issueType}
${params.orderNumber ? `Order Number: ${params.orderNumber}` : ''}

Description:
${params.description}
        `.trim(),
        issue_category: 'order',
        order_number: params.orderNumber || 'N/A'
    });
}

/**
 * Helper: Submit general support request
 */
export async function submitGeneralIssue(params: {
    userName: string;
    userEmail: string;
    category: string;
    description: string;
}) {
    return submitSupportRequest({
        name: params.userName,
        email: params.userEmail,
        subject: `General Support: ${params.category}`,
        message: `
Category: ${params.category}

Description:
${params.description}
        `.trim(),
        issue_category: 'general'
    });
}

/**
 * Helper: Submit NDA signing notification
 */
export async function submitNDANotification(params: {
    companyName: string;
    signatoryName: string;
    signatoryEmail: string;
    storagePath: string;
}) {
    return submitSupportRequest({
        name: params.signatoryName,
        email: params.signatoryEmail,
        subject: `NDA Signed: ${params.companyName}`,
        message: `
A new Mutual NDA has been signed.

Company: ${params.companyName}
Signatory: ${params.signatoryName}
Email: ${params.signatoryEmail}

Storage Path: ${params.storagePath}

You can view the document in the Supabase Compliance bucket under 'ndas/'.
        `.trim(),
        to: 'nikki@skhy.systems', // Notify Nikki
        document_type: 'NDA',
        company_name: params.companyName
    });
}

/**
 * Helper: Submit NDA confirmation to the signatory's business email via Netlify backend handler
 */
export async function submitNDASignatoryConfirmation(params: {
    companyName: string;
    signatoryName: string;
    signatoryEmail: string;
    storagePath: string;
}) {
    // Attempt sending via specialized Netlify transactional backend endpoint
    try {
        const response = await fetch('/.netlify/functions/send-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: params.signatoryEmail,
                name: params.signatoryName,
                subject: `Your Executed Mutual NDA with SKHY AI SOLUTIONS`,
                message: `
Dear ${params.signatoryName},

Thank you for executing the Mutual Non-Disclosure Agreement with SKHY AI SOLUTIONS.

Your executed document has been securely stored. You can access your copy of the signed agreement using the reference path below:
Storage Reference: ${params.storagePath}

Company: ${params.companyName}
Timestamp: ${new Date().toUTCString()}

Best regards,
SKHY AI Solutions Compliance Team
                `.trim()
            })
        });

        if (response.ok) {
            return await response.json();
        }
    } catch (err) {
        console.warn('Netlify direct routing unavailable, falling back to Web3Forms channel:', err);
    }

    // Fallback notification pipeline
    return submitSupportRequest({
        name: params.signatoryName,
        email: params.signatoryEmail,
        subject: `Your Executed Mutual NDA with SKHY AI SOLUTIONS`,
        message: `Executed document storage path: ${params.storagePath}`,
        to: params.signatoryEmail, // Send directly to signatory
        cc: params.signatoryEmail, // Also CC to ensure delivery
        replyto: 'compliance@skhy.systems',
        document_type: 'NDA_Confirmation',
        company_name: params.companyName
    });
}

/**
 * Helper: Submit NDA signing link email to the counterparty via Netlify backend handler
 */
export async function submitNDASigningLinkEmail(params: {
    companyName: string;
    signatoryName: string;
    signatoryEmail: string;
    signingUrl: string;
}) {
    // Dispatch via specialized Netlify transactional backend endpoint for external direct routing
    try {
        const response = await fetch('/.netlify/functions/send-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: params.signatoryEmail,
                name: params.signatoryName,
                subject: `Action Required: Execute Your Mutual NDA with SKHY AI SOLUTIONS`,
                message: `
Dear ${params.signatoryName},

Please click the unique secure link below to access your session and finalize the execution of the Mutual Non-Disclosure Agreement between ${params.companyName} and SKHY AI SOLUTIONS:

${params.signingUrl}

This link encodes your verified parameters to ensure enterprise authenticity.

---
AGREEMENT PREVIEW:

${NDA_TEXT}

---

Best regards,
SKHY AI Solutions Compliance Portal
                `.trim()
            })
        });

        if (response.ok) {
            return await response.json();
        }
    } catch (err) {
        console.warn('Netlify direct routing unavailable, falling back to Web3Forms channel:', err);
    }

    // Fallback notification pipeline
    return submitSupportRequest({
        name: params.signatoryName,
        email: params.signatoryEmail,
        subject: `Action Required: Execute Your Mutual NDA with SKHY AI SOLUTIONS`,
        message: `
Dear ${params.signatoryName},

Please click the signing link below to execute the NDA:
${params.signingUrl}

---
NDA TEXT:
${NDA_TEXT}
        `.trim(),
        to: params.signatoryEmail, // Send directly to signatory's email
        cc: params.signatoryEmail, // Also CC to ensure delivery
        replyto: 'compliance@skhy.systems',
        document_type: 'NDA_Signing_Link',
        company_name: params.companyName
    });
}

/**
 * Helper: Submit order/quote confirmation to Web3Forms
 */
export async function submitOrderConfirmation(params: {
    orderNumber: string;
    customerEmail: string;
    customerName: string;
    orderType: 'cuas_network' | 'bulk_procurement';
    details: string;
}) {
    return submitSupportRequest({
        name: params.customerName,
        email: params.customerEmail,
        subject: `[Order Confirmation] ${params.orderNumber} - ${params.orderType === 'cuas_network' ? 'C-UAS Network Design' : 'Bulk Drone Procurement'}`,
        message: `
Dear ${params.customerName},

Your order has been successfully created in the SKHY AI Solutions system.

Order Number: ${params.orderNumber}
Order Type: ${params.orderType === 'cuas_network' ? 'C-UAS Network Design' : 'Bulk Drone Procurement'}
Customer Email: ${params.customerEmail}

Order Details:
─────────────────────────────────────
${params.details}
─────────────────────────────────────

Best regards,
SKHY AI Solutions Procurement Team
        `.trim(),
        order_number: params.orderNumber,
        order_type: params.orderType
    });
}

/**
 * Helper: Submit resource download / access request to Web3Forms
 */
export async function submitResourceDownloadRequest(params: {
    resourceName: string;
    userEmail: string;
    userName: string;
    organization?: string;
    downloadUrl?: string;
}) {
    return submitSupportRequest({
        name: params.userName,
        email: params.userEmail,
        subject: `[Resource Access] ${params.resourceName} - ${params.userEmail}`,
        message: `
Resource Access Request Details:
--------------------------------
Resource Name: ${params.resourceName}
User Name: ${params.userName}
Work/Official Email: ${params.userEmail}
Organization: ${params.organization || 'Not specified'}
Target Download/Link: ${params.downloadUrl || 'N/A'}
Timestamp: ${new Date().toISOString()}

Requested from Skhy AI Resources Portal.
        `.trim(),
        resource_name: params.resourceName,
        organization: params.organization || 'N/A',
        download_url: params.downloadUrl || 'N/A'
    });
}

