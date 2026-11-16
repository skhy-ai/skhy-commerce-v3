// src/types/payment.ts

export type SupportedCryptoChain = 'ethereum' | 'polygon' | 'arbitrum' | 'solana';
export type SupportedCryptoToken = 'USDC' | 'USDT' | 'ETH' | 'SOL';

export interface CryptoWalletConfig {
  enabled: boolean;
  merchantEvmAddress: string;
  merchantSolanaAddress: string;
  supportedChains: SupportedCryptoChain[];
  supportedTokens: SupportedCryptoToken[];
  coinbaseApiKey?: string;
  coinbaseWebhookSecret?: string;
  nowpaymentsApiKey?: string;
  acceptedStablecoinsOnly: boolean;
}

export interface StripePaymentConfig {
  enabled: boolean;
  publishableKey: string;
  secretKey: string;
  webhookSecret?: string;
  mode: 'test' | 'live';
}

export interface PayPalPaymentConfig {
  enabled: boolean;
  clientId: string;
  secretKey: string;
  mode: 'sandbox' | 'live';
}

export interface BankWireConfig {
  enabled: boolean;
  beneficiaryName: string;
  bankName: string;
  swiftCode: string;
  accountNumber: string;
  iban?: string;
  country: string;
  instructions?: string;
}

export interface AllPaymentGatewaysConfig {
  stripe: StripePaymentConfig;
  paypal: PayPalPaymentConfig;
  crypto: CryptoWalletConfig;
  bankWire: BankWireConfig;
}

export const DEFAULT_PAYMENT_GATEWAYS: AllPaymentGatewaysConfig = {
  stripe: {
    enabled: true,
    publishableKey: '',
    secretKey: '',
    mode: 'test',
  },
  paypal: {
    enabled: true,
    clientId: '',
    secretKey: '',
    mode: 'sandbox',
  },
  crypto: {
    enabled: true,
    merchantEvmAddress: '0x1A2b3c4D5e6F7890123456789ABCDEF012345678',
    merchantSolanaAddress: 'Skhy9XWqZq8YhWbVvQpLtJ1vF4wGmBn2Kx3T8yU6oP1',
    supportedChains: ['ethereum', 'polygon', 'arbitrum', 'solana'],
    supportedTokens: ['USDC', 'USDT', 'ETH', 'SOL'],
    acceptedStablecoinsOnly: false,
  },
  bankWire: {
    enabled: true,
    beneficiaryName: 'SKHY AI SYSTEMS SDN BHD',
    bankName: 'Maybank Islamic Berhad',
    swiftCode: 'MBBEMYKL',
    accountNumber: '514012345678',
    iban: '',
    country: 'Malaysia',
    instructions: 'Please include your Order ID or Quote Reference in the transfer description field.',
  },
};
