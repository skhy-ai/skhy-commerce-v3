export const EmailTemplates = {
    /**
     * Base wrapper for all emails with Header and Footer
     */
    wrapHtml: (content: string, unsubscribeLink?: string): string => {
        const year = new Date().getFullYear();
        return `
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<style>
    body { margin: 0; padding: 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #020617; color: #e2e8f0; }
    .container { max-width: 600px; margin: 0 auto; background-color: #0f172a; border-radius: 12px; overflow: hidden; border: 1px solid #1e293b; }
    .header { background-color: #0f172a; padding: 30px; text-align: center; border-bottom: 1px solid #1e293b; }
    .logo { height: 50px; width: auto; }
    .content { padding: 40px 30px; line-height: 1.6; color: #e2e8f0; font-size: 16px; }
    .footer { background-color: #020617; padding: 30px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #1e293b; }
    .button { display: inline-block; padding: 12px 24px; background-color: #2dd4bf; color: #0f172a; text-decoration: none; border-radius: 6px; font-weight: bold; margin-top: 20px; }
    .link { color: #2dd4bf; text-decoration: none; }
    h1, h2, h3 { color: #f8fafc; margin-top: 0; }
    p { margin-bottom: 1.5em; }
    .divider { height: 1px; background-color: #1e293b; margin: 20px 0; }
</style>
</head>
<body>
    <div style="background-color: #020617; padding: 20px;">
        <div class="container">
            <div class="header">
                <img src="${(typeof import.meta !== 'undefined' && import.meta?.env?.VITE_SUPABASE_URL) || (typeof process !== 'undefined' && process?.env?.SUPABASE_URL) || ''}/storage/v1/object/public/product-assets/skhy_logo_text.png" alt="Skhy AI" class="logo" style="max-height: 50px;">
            </div>
            <div class="content">
                ${content}
            </div>
            <div class="footer">
                <p>&copy; ${year} Skhy AI. All rights reserved.</p>
                <p>Advanced AI Solutions for Sovereignty and Defense.</p>
                <p>
                    <a href="https://skhy.ai" class="link">Website</a> | 
                    <a href="https://linkedin.com/company/skhytech" class="link">LinkedIn</a>
                </p>
                ${unsubscribeLink ? `
                <div class="divider"></div>
                <p>
                    You received this email because you are subscribed to our updates.<br>
                    <a href="${unsubscribeLink}" class="link" style="color: #94a3b8; text-decoration: underline;">Unsubscribe</a>
                </p>
                ` : ''}
            </div>
        </div>
    </div>
</body>
</html>
        `;
    },

    /**
     * Template for Newsletter / Blog Posts
     */
    newsletter: (title: string, content: string, link?: string, linkText: string = "Read More", unsubscribeLink?: string): string => {
        const body = `
            <h1 style="color: #2dd4bf; margin-bottom: 20px;">${title}</h1>
            <div style="color: #cbd5e1;">
                ${content.replace(/\n/g, '<br>')}
            </div>
            ${link ? `<div style="text-align: center;"><a href="${link}" class="button">${linkText}</a></div>` : ''}
        `;
        return EmailTemplates.wrapHtml(body, unsubscribeLink);
    },

    /**
     * Template for Product Outreach
     */
    productOutreach: (recipientName: string, messageBody: string, ctaLink: string, ctaText: string = "View Solutions", productsList: string = ""): string => {
        const body = `
            <p>Dear ${recipientName},</p>
            ${messageBody.replace(/\n/g, '<br>')}
            ${productsList ? `<div style="background: #1e293b; padding: 15px; border-radius: 8px; margin: 20px 0; border: 1px solid #334155;"><strong>Featured:</strong> ${productsList}</div>` : ''}
            <div style="text-align: center;">
                <a href="${ctaLink}" class="button">${ctaText}</a>
            </div>
        `;
        return EmailTemplates.wrapHtml(body); // No unsubscribe for direct outreach usually, but can add if needed
    }
};
