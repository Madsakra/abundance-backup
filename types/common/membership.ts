import { Timestamp } from "@react-native-firebase/firestore";

export type MembershipTier = { 
    id: string; 
    description: string; 
    unit_amount: number; 
    currency: string; 
    interval: string;
    management?:boolean; 
    selectedTierID?:string;
    fetchData?:()=>void;
  }; 




  export interface StripeSubscription {
    id: string; // Stripe subscription ID
    customer: string; // Stripe customer ID
    items: {
      price: string; // Stripe price ID
      quantity: number;
    }[];
    status: 'active' | 'canceled' | 'incomplete' | 'incomplete_expired' | 'past_due' | 'trialing' | 'unpaid';
    cancel_at_period_end: boolean;
    created: Timestamp // Unix timestamp
    current_period_start: Timestamp; // Unix timestamp
    current_period_end: Timestamp; // Unix timestamp
    trial_start?: number; // Unix timestamp (if applicable)
    trial_end?: number; // Unix timestamp (if applicable)
    ended_at?: number; // Unix timestamp (if applicable)
    canceled_at?: Timestamp; // Unix timestamp (if applicable)
    metadata?: Record<string, any>; // Custom metadata from Stripe
  };
  