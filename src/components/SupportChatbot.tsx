import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Send, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import {
    submitProductIssue,
    submitProfileIssue,
    submitOrderIssue,
    submitGeneralIssue
} from '../services/web3formsService';

type ConversationStep =
    | 'greeting'
    | 'category_selection'
    | 'product_issue_type'
    | 'product_details'
    | 'profile_action'
    | 'profile_details'
    | 'order_details'
    | 'general_details'
    | 'submitting'
    | 'success'
    | 'error'
    | 'search_products_query';

interface Message {
    id: string;
    text: string;
    sender: 'bot' | 'user';
    timestamp: Date;
    options?: string[];
}

interface ChatbotData {
    category?: string;
    issueType?: string;
    productName?: string;
    orderNumber?: string;
    attemptedAction?: string;
    description?: string;
    errorDetails?: string;
}

interface SupportChatbotProps {
    isOpen?: boolean;
    onClose?: () => void;
    initialCategory?: string;
    initialErrorDetails?: string;
}

export const SupportChatbot: React.FC<SupportChatbotProps> = ({
    isOpen: controlledIsOpen,
    onClose: controlledOnClose,
    initialCategory,
    initialErrorDetails
}) => {
    const { user } = useAuth();
    const [isOpen, setIsOpen] = useState(controlledIsOpen ?? false);
    const [step, setStep] = useState<ConversationStep>('greeting');
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [chatbotData, setChatbotData] = useState<ChatbotData>({
        errorDetails: initialErrorDetails
    });
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Use controlled state if provided
    useEffect(() => {
        if (controlledIsOpen !== undefined) {
            setIsOpen(controlledIsOpen);
        }
    }, [controlledIsOpen]);

    // Start conversation when opened
    useEffect(() => {
        if (isOpen && messages.length === 0) {
            if (initialCategory) {
                setChatbotData(prev => ({ ...prev, category: initialCategory }));
                startConversation(initialCategory);
            } else {
                startConversation();
            }
        }
    }, [isOpen, initialCategory]);

    // Auto-scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const addMessage = (text: string, sender: 'bot' | 'user', options?: string[]) => {
        setMessages(prev => [...prev, {
            id: Date.now().toString(),
            text,
            sender,
            timestamp: new Date(),
            options
        }]);
    };

    const startConversation = (presetCategory?: string) => {
        if (presetCategory) {
            addMessage(
                `I see you're having trouble with ${presetCategory}. Let me help you with that.`,
                'bot'
            );
            handleCategorySelection(presetCategory);
        } else {
            addMessage(
                `Hi${user?.email ? ` ${user.email.split('@')[0]}` : ''}! 👋 I'm here to help you. What can I assist you with today?`,
                'bot',
                ['Browse Products', 'Product issues', 'Profile/Account', 'Orders', 'Other']
            );
            setStep('category_selection');
        }
    };

    const handleCategorySelection = (category: string) => {
        const categoryMap: Record<string, string> = {
            'Browse Products': 'browse_products',
            'Product issues': 'products',
            'Profile/Account': 'profile',
            'Orders': 'orders',
            'Other': 'general'
        };

        const mappedCategory = categoryMap[category] || category;
        setChatbotData(prev => ({ ...prev, category: mappedCategory }));

        switch (mappedCategory) {
            case 'browse_products':
                addMessage(
                    'I can help you find products. What are you looking for?',
                    'bot'
                );
                setStep('search_products_query');
                break;
            case 'products':
                addMessage(
                    'What kind of product issue are you experiencing?',
                    'bot',
                    ['Cannot add product', 'Cannot update product', 'Cannot delete product', 'Other']
                );
                setStep('product_issue_type');
                break;

            case 'profile':
                addMessage(
                    'What were you trying to do with your profile?',
                    'bot',
                    ['Update company info', 'Change settings', 'Upload documents', 'Other']
                );
                setStep('profile_action');
                break;

            case 'orders':
                addMessage(
                    'Please provide the order number you need help with, or type "none" if you don\'t have one.',
                    'bot'
                );
                setStep('order_details');
                break;

            case 'general':
                addMessage(
                    'Please describe your issue or question in detail.',
                    'bot'
                );
                setStep('general_details');
                break;
        }
    };

    const handleProductIssueType = (issueType: string) => {
        setChatbotData(prev => ({ ...prev, issueType }));
        addMessage(
            'What is the name of the product? (Type "none" if not applicable)',
            'bot'
        );
        setStep('product_details');
    };

    const handleProfileAction = (action: string) => {
        setChatbotData(prev => ({ ...prev, attemptedAction: action }));
        addMessage(
            'Please describe what happened and any error messages you saw.',
            'bot'
        );
        setStep('profile_details');
    };

    const handleProductSearch = async (query: string) => {
        setIsLoading(true);
        addMessage(`Searching for "${query}"...`, 'bot');

        try {
            const { data, error } = await supabase
                .from('products')
                .select('name, description, base_price, currency, type')
                .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
                .eq('is_active', true)
                .limit(5);

            if (error) throw error;

            if (data && data.length > 0) {
                const productList = data.map((p: any) =>
                    `• ${p.name} (${p.type}): ${p.description?.substring(0, 100)}... - ${p.currency} ${p.base_price}`
                ).join('\n\n');

                addMessage(
                    `Here are some products I found matching "${query}":\n\n${productList}\n\nCan I help you with anything else?`,
                    'bot',
                    ['Browse Products', 'Product issues', 'Profile/Account', 'Orders', 'Other']
                );
            } else {
                addMessage(
                    `I couldn't find any products matching "${query}". Try a different keyword?`,
                    'bot',
                    ['Browse Products', 'Other']
                );
            }
            // Reset to allow category selection again
            setStep('category_selection');
        } catch (error: any) {
            console.error('Search error:', error);
            addMessage(
                "Sorry, I encountered an error searching for products.",
                'bot'
            );
            setStep('category_selection');
        } finally {
            setIsLoading(false);
        }
    };

    const handleTextInput = async (text: string) => {
        const trimmedText = text.trim();
        if (!trimmedText) return;

        addMessage(trimmedText, 'user');
        setInputValue('');

        switch (step) {
            case 'product_details':
                setChatbotData(prev => ({
                    ...prev,
                    productName: trimmedText !== 'none' ? trimmedText : undefined
                }));
                addMessage(
                    'Please provide more details about the issue you\'re experiencing.',
                    'bot'
                );
                setStep('submitting');
                break;

            case 'profile_details':
                await submitProfile(trimmedText);
                break;

            case 'order_details':
                setChatbotData(prev => ({
                    ...prev,
                    orderNumber: trimmedText !== 'none' ? trimmedText : undefined
                }));
                addMessage(
                    'Please describe the issue with this order.',
                    'bot'
                );
                setStep('submitting');
                break;

            case 'general_details':
                await submitGeneral(trimmedText);
                break;

            case 'submitting':
                // This is the final description
                if (chatbotData.category === 'products') {
                    await submitProduct(trimmedText);
                } else if (chatbotData.category === 'orders') {
                    await submitOrder(trimmedText);
                }
                break;

            case 'search_products_query':
                await handleProductSearch(trimmedText);
                break;
        }
    };

    const submitProduct = async (description: string) => {
        setIsLoading(true);
        addMessage(
            'Submitting your request...',
            'bot'
        );

        try {
            const result = await submitProductIssue({
                userName: user?.email?.split('@')[0] || 'User',
                userEmail: user?.email || '',
                productName: chatbotData.productName,
                issueType: chatbotData.issueType || 'Unknown',
                description,
                errorDetails: chatbotData.errorDetails
            });

            if (result.success) {
                addMessage(
                    '✅ Thank you! Your request has been submitted successfully. Our team will review your product information and get back to you via email shortly.',
                    'bot'
                );
                setStep('success');
            } else {
                throw new Error(result.message);
            }
        } catch (error: any) {
            addMessage(
                `❌ Sorry, there was an issue submitting your request: ${error.message}. Please email us directly at support@skhy.ai`,
                'bot'
            );
            setStep('error');
        } finally {
            setIsLoading(false);
        }
    };

    const submitProfile = async (description: string) => {
        setIsLoading(true);
        addMessage(
            'Submitting your request...',
            'bot'
        );

        try {
            const result = await submitProfileIssue({
                userName: user?.email?.split('@')[0] || 'User',
                userEmail: user?.email || '',
                attemptedAction: chatbotData.attemptedAction || 'Unknown',
                description,
                errorDetails: chatbotData.errorDetails
            });

            if (result.success) {
                addMessage(
                    '✅ Thank you! We\'ve received your profile issue. Our team will process your request and contact you via email soon.',
                    'bot'
                );
                setStep('success');
            } else {
                throw new Error(result.message);
            }
        } catch (error: any) {
            addMessage(
                `❌ Sorry, there was an issue submitting your request: ${error.message}. Please email us directly at support@skhy.ai`,
                'bot'
            );
            setStep('error');
        } finally {
            setIsLoading(false);
        }
    };

    const submitOrder = async (description: string) => {
        setIsLoading(true);
        addMessage(
            'Submitting your request...',
            'bot'
        );

        try {
            const result = await submitOrderIssue({
                userName: user?.email?.split('@')[0] || 'User',
                userEmail: user?.email || '',
                orderNumber: chatbotData.orderNumber,
                issueType: 'Order assistance',
                description
            });

            if (result.success) {
                addMessage(
                    '✅ Your order inquiry has been received. We\'ll look into this and respond via email as soon as possible.',
                    'bot'
                );
                setStep('success');
            } else {
                throw new Error(result.message);
            }
        } catch (error: any) {
            addMessage(
                `❌ Sorry, there was an issue submitting your request: ${error.message}. Please email us directly at support@skhy.ai`,
                'bot'
            );
            setStep('error');
        } finally {
            setIsLoading(false);
        }
    };

    const submitGeneral = async (description: string) => {
        setIsLoading(true);
        addMessage(
            'Submitting your request...',
            'bot'
        );

        try {
            const result = await submitGeneralIssue({
                userName: user?.email?.split('@')[0] || 'User',
                userEmail: user?.email || '',
                category: 'General Support',
                description
            });

            if (result.success) {
                addMessage(
                    '✅ Thank you! We\'ve received your message. Our team will get back to you via email soon.',
                    'bot'
                );
                setStep('success');
            } else {
                throw new Error(result.message);
            }
        } catch (error: any) {
            addMessage(
                `❌ Sorry, there was an issue submitting your request: ${error.message}. Please email us directly at support@skhy.ai`,
                'bot'
            );
            setStep('error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleOptionClick = (option: string) => {
        addMessage(option, 'user');

        switch (step) {
            case 'category_selection':
                handleCategorySelection(option);
                break;
            case 'product_issue_type':
                handleProductIssueType(option);
                break;
            case 'profile_action':
                handleProfileAction(option);
                break;
        }
    };

    const handleClose = () => {
        if (controlledOnClose) {
            controlledOnClose();
        } else {
            setIsOpen(false);
        }
        // Reset after animation
        setTimeout(() => {
            setMessages([]);
            setStep('greeting');
            setChatbotData({ errorDetails: initialErrorDetails });
        }, 300);
    };

    const handleToggle = () => {
        if (controlledIsOpen !== undefined) {
            // Controlled mode
            if (controlledOnClose) controlledOnClose();
        } else {
            // Uncontrolled mode
            setIsOpen(!isOpen);
        }
    };

    return (
        <>
            {/* Floating Button */}
            {!isOpen && (
                <button
                    onClick={handleToggle}
                    className="fixed bottom-6 right-6 z-40 p-4 bg-gradient-to-r from-sky-600 to-blue-600 text-white rounded-full shadow-2xl hover:shadow-sky-500/50 hover:scale-110 transition-all duration-300"
                    aria-label="Open support chat"
                >
                    <MessageSquare className="w-6 h-6" />
                </button>
            )}

            {/* Chatbot Window */}
            {isOpen && (
                <div className="fixed bottom-6 right-6 z-50 w-96 max-w-[calc(100vw-3rem)] shadow-2xl">
                    <div className="bg-gradient-to-br from-navy-800 to-navy-900 rounded-2xl border border-navy-600 overflow-hidden">
                        {/* Header */}
                        <div className="bg-gradient-to-r from-sky-600 to-blue-600 p-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-white/20 rounded-full">
                                    <MessageSquare className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-white">Skhy Support</h3>
                                    <p className="text-xs text-sky-100">We're here to help</p>
                                </div>
                            </div>
                            <button
                                onClick={handleClose}
                                className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Messages */}
                        <div className="h-96 overflow-y-auto p-4 space-y-4 bg-navy-950/50">
                            {messages.map((message) => (
                                <div
                                    key={message.id}
                                    className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div
                                        className={`max-w-[80%] rounded-2xl px-4 py-2 ${message.sender === 'user'
                                            ? 'bg-sky-600 text-white'
                                            : 'bg-navy-700 text-gray-100'
                                            }`}
                                    >
                                        <p className="text-sm whitespace-pre-wrap">{message.text}</p>

                                        {/* Option Buttons */}
                                        {message.options && message.sender === 'bot' && (
                                            <div className="mt-3 space-y-2">
                                                {message.options.map((option, idx) => (
                                                    <button
                                                        key={idx}
                                                        onClick={() => handleOptionClick(option)}
                                                        disabled={isLoading}
                                                        className="w-full text-left px-3 py-2 bg-navy-600 hover:bg-navy-500 text-white text-sm rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                    >
                                                        {option}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}

                            {isLoading && (
                                <div className="flex justify-start">
                                    <div className="bg-navy-700 rounded-2xl px-4 py-2">
                                        <Loader2 className="w-5 h-5 text-sky-400 animate-spin" />
                                    </div>
                                </div>
                            )}

                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input */}
                        {step !== 'success' && step !== 'error' && (
                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    handleTextInput(inputValue);
                                }}
                                className="p-4 border-t border-navy-600 bg-navy-800"
                            >
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={inputValue}
                                        onChange={(e) => setInputValue(e.target.value)}
                                        placeholder="Type your message..."
                                        disabled={isLoading || step === 'category_selection' || step === 'product_issue_type' || step === 'profile_action'}
                                        className="flex-1 px-4 py-2 bg-navy-700 border border-navy-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-sky-400 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                                    />
                                    <button
                                        type="submit"
                                        disabled={!inputValue.trim() || isLoading}
                                        className="p-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <Send className="w-5 h-5" />
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            )}
        </>
    );
};
