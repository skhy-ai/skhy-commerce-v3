/**
 * Centralized Error Handler
 * Categorizes errors and provides user-friendly messages
 */

export enum ErrorCategory {
    DATABASE = 'database',
    NETWORK = 'network',
    VALIDATION = 'validation',
    AUTHENTICATION = 'authentication',
    UNKNOWN = 'unknown'
}

export interface ErrorInfo {
    category: ErrorCategory;
    title: string;
    message: string;
    suggestion: string;
    canRetry: boolean;
    shouldShowChatbot: boolean;
    technicalDetails?: string;
}

/**
 * Analyzes an error and returns structured error information
 */
export function handleError(error: any, context: string): ErrorInfo {
    console.error(`Error in ${context}:`, error);

    // Database/Supabase errors
    if (error?.code || error?.message?.includes('database')) {
        return handleDatabaseError(error, context);
    }

    // Network errors
    if (error?.message?.includes('fetch') || error?.message?.includes('network')) {
        return {
            category: ErrorCategory.NETWORK,
            title: 'Network Connection Issue',
            message: 'Unable to connect to the server. Please check your internet connection.',
            suggestion: 'Try again in a moment or contact support if the issue persists.',
            canRetry: true,
            shouldShowChatbot: true,
            technicalDetails: error?.message
        };
    }

    // Authentication errors
    if (error?.message?.includes('auth') || error?.message?.includes('unauthorized')) {
        return {
            category: ErrorCategory.AUTHENTICATION,
            title: 'Authentication Error',
            message: 'Your session may have expired. Please log in again.',
            suggestion: 'Sign out and sign back in to continue.',
            canRetry: false,
            shouldShowChatbot: false,
            technicalDetails: error?.message
        };
    }

    // Validation errors
    if (error?.message?.includes('invalid') || error?.message?.includes('required')) {
        return {
            category: ErrorCategory.VALIDATION,
            title: 'Validation Error',
            message: 'Some required information is missing or invalid.',
            suggestion: 'Please check all fields and try again.',
            canRetry: true,
            shouldShowChatbot: false,
            technicalDetails: error?.message
        };
    }

    // Unknown errors
    return {
        category: ErrorCategory.UNKNOWN,
        title: 'Something Went Wrong',
        message: 'An unexpected error occurred.',
        suggestion: 'Please try again or contact support if the problem continues.',
        canRetry: true,
        shouldShowChatbot: true,
        technicalDetails: error?.message || String(error)
    };
}

/**
 * Handles database-specific errors
 */
function handleDatabaseError(error: any, context: string): ErrorInfo {
    const errorCode = error?.code;
    const errorMessage = error?.message || '';

    // Specific Supabase/PostgreSQL error codes
    switch (errorCode) {
        case '23505': // unique_violation
            return {
                category: ErrorCategory.DATABASE,
                title: 'Duplicate Entry',
                message: 'This item already exists in the database.',
                suggestion: 'Try updating the existing item instead of creating a new one.',
                canRetry: false,
                shouldShowChatbot: true,
                technicalDetails: errorMessage
            };

        case '23503': // foreign_key_violation
            return {
                category: ErrorCategory.DATABASE,
                title: 'Reference Error',
                message: 'This item references data that no longer exists.',
                suggestion: 'Please refresh the page and try again.',
                canRetry: true,
                shouldShowChatbot: true,
                technicalDetails: errorMessage
            };

        case '42P17': // infinite recursion in RLS
            return {
                category: ErrorCategory.DATABASE,
                title: 'Database Configuration Issue',
                message: 'There is a configuration issue with the database.',
                suggestion: 'Please contact support. We apologize for the inconvenience.',
                canRetry: false,
                shouldShowChatbot: true,
                technicalDetails: 'RLS recursion error - admin action required'
            };

        case 'PGRST116': // no rows returned
            return {
                category: ErrorCategory.DATABASE,
                title: 'Item Not Found',
                message: 'The requested item could not be found.',
                suggestion: 'The item may have been deleted. Please refresh the page.',
                canRetry: false,
                shouldShowChatbot: false,
                technicalDetails: errorMessage
            };

        default:
            // Generic database error
            if (context.includes('save') || context.includes('update') || context.includes('create')) {
                return {
                    category: ErrorCategory.DATABASE,
                    title: 'Unable to Save Changes',
                    message: `Your ${getContextType(context)} could not be saved at this time.`,
                    suggestion: 'We apologize for the inconvenience. You can share the details with us so we can process your request manually.',
                    canRetry: true,
                    shouldShowChatbot: true,
                    technicalDetails: errorMessage
                };
            }

            if (context.includes('load') || context.includes('fetch')) {
                return {
                    category: ErrorCategory.DATABASE,
                    title: 'Unable to Load Data',
                    message: `Your ${getContextType(context)} could not be loaded.`,
                    suggestion: 'Please refresh the page. If the issue persists, contact support.',
                    canRetry: true,
                    shouldShowChatbot: true,
                    technicalDetails: errorMessage
                };
            }

            if (context.includes('delete')) {
                return {
                    category: ErrorCategory.DATABASE,
                    title: 'Unable to Delete',
                    message: `The ${getContextType(context)} could not be deleted.`,
                    suggestion: 'Please try again. If the issue persists, contact support.',
                    canRetry: true,
                    shouldShowChatbot: true,
                    technicalDetails: errorMessage
                };
            }

            return {
                category: ErrorCategory.DATABASE,
                title: 'Database Error',
                message: 'We are experiencing technical difficulties with the database.',
                suggestion: 'Please try again later or contact support for assistance.',
                canRetry: true,
                shouldShowChatbot: true,
                technicalDetails: errorMessage
            };
    }
}

/**
 * Extracts the context type from the context string
 */
function getContextType(context: string): string {
    if (context.includes('product')) return 'product';
    if (context.includes('profile')) return 'profile';
    if (context.includes('order')) return 'order';
    if (context.includes('shipping')) return 'shipping configuration';
    if (context.includes('user')) return 'information';
    return 'data';
}

/**
 * Context-specific error handlers
 */
export const ErrorContexts = {
    PROFILE_SAVE: 'save_profile',
    PROFILE_LOAD: 'load_profile',
    PRODUCT_CREATE: 'create_product',
    PRODUCT_UPDATE: 'update_product',
    PRODUCT_DELETE: 'delete_product',
    PRODUCT_LOAD: 'load_products',
    ORDER_UPDATE: 'update_order',
    ORDER_LOAD: 'load_orders',
    SHIPPING_SAVE: 'save_shipping',
    PAYMENT_PROCESSING: 'payment_processing',
    DATA_FETCH: 'data_fetch'
} as const;
