import { GoogleGenAI } from '@google/genai';
import { db } from '../database/connection';
import * as parcelService from './parcelService';
import { logger } from '../utils/logger';

interface AssistantContext {
  currentView?: string;
  activeTab?: string;
  userRole?: string;
  userName?: string;
  userId?: string;
  currentLanguage?: string;
  trackingNumber?: string;
}

interface AssistantResponse {
  reply: string;
  action?: {
    type: 'navigate' | 'track' | 'open_modal' | 'speak_only' | 'explain_field' | 'quick_fill';
    payload?: any;
  };
  suggestions?: string[];
  trackingData?: any;
  detectedIntent?: string;
}

// Lazy initialization of Gemini API client
let genAI: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!process.env.GEMINI_API_KEY) {
    return null;
  }
  if (!genAI) {
    genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return genAI;
}

/**
 * Intelligent Rule-Based Logistics Brain
 * Handles tracking, navigation, role verification, and parcel management FAQs
 */
function handleLogisticsIntent(query: string, context: AssistantContext): AssistantResponse | null {
  const lower = query.toLowerCase().trim();

  // 1. TRACKING EXTRACTION (e.g. "track SR-2026CA-892104" or "where is parcel SR-2026NY-419082")
  const trackingRegex = /\b(SR-[A-Z0-9-]+|SWIFT-[A-Z0-9-]+|TRK[0-9A-Z]+)\b/i;
  const match = query.match(trackingRegex);
  
  if (match || (lower.includes('track') && (lower.includes('my parcel') || lower.includes('shipment') || lower.includes('where is')))) {
    let trkNum = match ? match[1].toUpperCase() : null;
    
    // If no tracking number provided in query, attempt to find user's most recent parcel
    if (!trkNum && context.userId) {
      const userParcels = db.getTable('parcels').filter(p => p.sender_id === context.userId || p.assigned_agent_id === context.userId);
      if (userParcels.length > 0) {
        // pick latest
        trkNum = userParcels[0].tracking_number;
      }
    }

    if (trkNum) {
      const trackingInfo = parcelService.getParcelByTrackingNumber(trkNum);
      if (trackingInfo) {
        const { parcel, tracking } = trackingInfo;
        const latestCheckpoint = tracking[0]?.description || 'In active transit';
        const formattedStatus = parcel.status.replace(/_/g, ' ').toUpperCase();
        
        return {
          reply: `Consignment ${parcel.tracking_number} is currently ${formattedStatus}. Location: ${parcel.delivery_address}. Latest checkpoint: "${latestCheckpoint}". Expected delivery: ${new Date(parcel.estimated_delivery).toLocaleDateString()}.`,
          action: {
            type: 'track',
            payload: {
              trackingNumber: parcel.tracking_number,
              parcel,
              history: tracking,
            },
          },
          trackingData: trackingInfo,
          suggestions: ['View full tracking history', 'Download invoice for this parcel', 'Back to dashboard'],
          detectedIntent: 'TRACK_PARCEL_SUCCESS',
        };
      } else {
        return {
          reply: `I searched for tracking number ${trkNum}, but it was not found in our live telemetry hub. Please verify the consignment code (e.g., SR-2026CA-892104) and try again.`,
          action: {
            type: 'speak_only',
          },
          suggestions: ['Track SR-2026CA-892104', 'View my parcels', 'Help me book a parcel'],
          detectedIntent: 'TRACK_PARCEL_NOT_FOUND',
        };
      }
    } else {
      // Prompt user for tracking number
      return {
        reply: "To track your consignment, please speak or type your tracking number (for example, SR-2026CA-892104), or say 'Show my parcels' to view your recent shipments.",
        action: {
          type: 'speak_only',
        },
        suggestions: ['Track SR-2026CA-892104', 'Show my parcels', 'Go to dashboard'],
        detectedIntent: 'PROMPT_TRACKING_NUMBER',
      };
    }
  }

  // 2. SMART NAVIGATION INTENTS
  // Booking navigation
  if (lower.includes('book') || lower.includes('create shipment') || lower.includes('send a parcel') || lower.includes('new consignment')) {
    if (!context.userRole) {
      return {
        reply: "To book a parcel, please sign in or register an account. Navigating you to the authentication portal.",
        action: {
          type: 'navigate',
          payload: { view: 'auth', mode: 'login' },
        },
        suggestions: ['Sign in as Customer', 'Create new account', 'Back to home'],
        detectedIntent: 'NAVIGATE_AUTH_BOOKING',
      };
    }
    if (context.userRole === 'customer' || context.userRole === 'admin') {
      return {
        reply: "Navigating you to the Parcel Booking station. Here you can specify recipient details, parcel dimensions, freight class, and generate an instant waybill.",
        action: {
          type: 'navigate',
          payload: { view: 'dashboard', tab: 'book' },
        },
        suggestions: ['Explain parcel types', 'What are the shipping rates?', 'Show my bookings'],
        detectedIntent: 'NAVIGATE_BOOKING',
      };
    } else {
      return {
        reply: "Parcel booking is reserved for Customer and Commercial Shipper accounts. As a delivery agent, your primary station is the Field Manifest.",
        action: {
          type: 'speak_only',
        },
        suggestions: ['View assigned deliveries', 'Open manifest', 'Update delivery status'],
        detectedIntent: 'AGENT_BOOKING_RESTRICTION',
      };
    }
  }

  // Dashboard navigation
  if (lower.includes('go to dashboard') || lower.includes('take me to dashboard') || lower.includes('open dashboard') || lower === 'dashboard') {
    if (!context.userRole) {
      return {
        reply: "Please log in first to access your secure logistics workspace.",
        action: { type: 'navigate', payload: { view: 'auth', mode: 'login' } },
        suggestions: ['Sign in as Admin', 'Sign in as Courier', 'Sign in as Customer'],
        detectedIntent: 'NAVIGATE_AUTH',
      };
    }
    return {
      reply: `Opening your ${context.userRole.toUpperCase()} logistics workspace.`,
      action: { type: 'navigate', payload: { view: 'dashboard', tab: 'parcels' } },
      suggestions: ['View active parcels', 'Check system status', 'Help'],
      detectedIntent: 'NAVIGATE_DASHBOARD',
    };
  }

  // Invoices & Payments navigation
  if (lower.includes('invoice') || lower.includes('payment') || lower.includes('billing') || lower.includes('receipt')) {
    if (context.userRole === 'customer') {
      return {
        reply: "Taking you to Payments and Invoices. Here you can view settled transactions, download PDF tax invoices, and pay pending freight charges.",
        action: { type: 'navigate', payload: { view: 'dashboard', tab: 'payments' } },
        suggestions: ['How to pay an invoice?', 'View paid receipts', 'Book a new parcel'],
        detectedIntent: 'NAVIGATE_PAYMENTS',
      };
    } else if (context.userRole === 'admin') {
      return {
        reply: "Opening Financial & Operational Reports in the Admin Center.",
        action: { type: 'navigate', payload: { view: 'dashboard', tab: 'analytics' } },
        suggestions: ['Show revenue report', 'View system settings', 'Audit logs'],
        detectedIntent: 'NAVIGATE_ADMIN_REPORTS',
      };
    }
  }

  // Settings / Profile navigation
  if (lower.includes('settings') || lower.includes('system setting') || lower.includes('configuration')) {
    if (context.userRole === 'admin') {
      return {
        reply: "Navigating to System Settings. Here administrators can adjust pricing multipliers, tax tariffs, operational hours, and maintenance modes.",
        action: { type: 'navigate', payload: { view: 'dashboard', tab: 'settings' } },
        suggestions: ['Update base rates', 'View audit logs', 'Back to parcels'],
        detectedIntent: 'NAVIGATE_SETTINGS',
      };
    } else {
      return {
        reply: "Opening your Profile & Account Settings.",
        action: { type: 'navigate', payload: { view: 'dashboard', tab: 'profile' } },
        suggestions: ['Update phone number', 'Change default pickup address'],
        detectedIntent: 'NAVIGATE_PROFILE',
      };
    }
  }

  // Reports & Analytics navigation
  if (lower.includes('report') || lower.includes('analytics') || lower.includes('statistics') || lower.includes('revenue')) {
    if (context.userRole === 'admin') {
      return {
        reply: "Navigating to Analytics & Financial Reports. You can inspect delivery success rates, fleet efficiency, and revenue breakdowns.",
        action: { type: 'navigate', payload: { view: 'dashboard', tab: 'analytics' } },
        suggestions: ['Export delivery report', 'View active agents', 'System settings'],
        detectedIntent: 'NAVIGATE_ANALYTICS',
      };
    } else {
      return {
        reply: "Executive analytics and system reports are restricted to System Administrators. You can view your personal consignment history in your dashboard.",
        action: { type: 'speak_only' },
        suggestions: ['Show my parcel history', 'Track a shipment', 'Help me book'],
        detectedIntent: 'RESTRICTED_ANALYTICS',
      };
    }
  }

  // Agent Specific Commands
  if (context.userRole === 'agent' || lower.includes('delivery agent') || lower.includes('manifest') || lower.includes('deliveries')) {
    if (lower.includes('assigned') || lower.includes('my runs') || lower.includes('manifest') || lower.includes('active delivery')) {
      return {
        reply: "Displaying your active delivery runs and assigned parcels for today's route.",
        action: { type: 'navigate', payload: { view: 'dashboard', filter: 'active' } },
        suggestions: ['How to mark delivered?', 'How to upload e-POD?', 'Show delivery history'],
        detectedIntent: 'AGENT_ACTIVE_RUNS',
      };
    }
    if (lower.includes('mark delivered') || lower.includes('proof') || lower.includes('pod') || lower.includes('signature')) {
      return {
        reply: "To complete a delivery: Find the parcel in your Active Runs list, click 'Deliver & POD', capture the recipient's electronic signature and photo proof, then submit. This immediately updates the shipper's tracking timeline.",
        action: { type: 'speak_only' },
        suggestions: ['Show my active runs', 'Update status to In Transit', 'Report delivery issue'],
        detectedIntent: 'AGENT_POD_GUIDE',
      };
    }
    if (lower.includes('update status') || lower.includes('checkpoint')) {
      return {
        reply: "To record a milestone scan, select any assigned parcel, click 'Update Status', select the new phase (e.g. Picked Up, In Transit, or Out for Delivery), and input your current checkpoint facility.",
        action: { type: 'speak_only' },
        suggestions: ['View active runs', 'Mark as Delivered', 'Back to home'],
        detectedIntent: 'AGENT_STATUS_GUIDE',
      };
    }
  }

  // 3. CONTEXT-AWARE ASSISTANCE (Current Page Explanations)
  if (lower.includes('where am i') || lower.includes('explain this page') || lower.includes('what can i do here') || lower.includes('help with this page')) {
    const view = context.currentView || 'home';
    const tab = context.activeTab || 'parcels';

    if (view === 'home') {
      return {
        reply: "You are on the SwiftRoute public portal. Here you can track any parcel instantly using its waybill number, calculate shipping rates, or log in to your account.",
        action: { type: 'speak_only' },
        suggestions: ['Track parcel SR-2026CA-892104', 'Calculate shipping rate', 'Log in to dashboard'],
        detectedIntent: 'PAGE_EXPLAIN_HOME',
      };
    }

    if (view === 'auth') {
      return {
        reply: "You are on the Authentication Gateway. You can sign in using one of the pre-configured 1-click test roles (Admin, Agent, Customer) or register a new commercial shipper account.",
        action: { type: 'speak_only' },
        suggestions: ['Sign in as Customer', 'Sign in as Admin', 'Sign in as Agent'],
        detectedIntent: 'PAGE_EXPLAIN_AUTH',
      };
    }

    if (view === 'dashboard') {
      if (tab === 'book') {
        return {
          reply: "You are on the Parcel Booking station. Fill in the recipient's contact details, destination address, and package dimensions. Choose between Standard, Priority Express, or Fragile freight.",
          action: { type: 'speak_only' },
          suggestions: ['Explain Standard vs Express', 'What is the fragile surcharge?', 'Show my booked parcels'],
          detectedIntent: 'PAGE_EXPLAIN_BOOKING',
        };
      }
      if (tab === 'payments') {
        return {
          reply: "This is your Billing & Invoicing hub. You can inspect itemized invoices, view payment receipts, and settle outstanding balances via credit card or digital wallet.",
          action: { type: 'speak_only' },
          suggestions: ['Download latest invoice', 'Book a new parcel', 'Return to overview'],
          detectedIntent: 'PAGE_EXPLAIN_PAYMENTS',
        };
      }
      if (tab === 'analytics') {
        return {
          reply: "This is the Executive Analytics hub. You have real-time charts on revenue, delivery SLAs, courier performance, and volume throughput.",
          action: { type: 'speak_only' },
          suggestions: ['Export report', 'View system settings', 'Audit logs'],
          detectedIntent: 'PAGE_EXPLAIN_ANALYTICS',
        };
      }
    }
  }

  // 4. ONBOARDING & TUTORIAL
  if (lower.includes('tutorial') || lower.includes('onboarding') || lower.includes('how does this work') || lower.includes('guide me')) {
    return {
      reply: "Welcome to SwiftRoute Logistics! 1. To send cargo, head to 'Book Parcel', input dimensions and delivery address. 2. Your consignment gets a live tracking number (e.g. SR-2026CA-892104). 3. Couriers scan packages at every hub. 4. You receive real-time e-POD with signatures upon delivery.",
      action: { type: 'speak_only' },
      suggestions: ['Help me book a parcel', 'Track a demo parcel', 'Take me to dashboard'],
      detectedIntent: 'ONBOARDING_TUTORIAL',
    };
  }

  // 5. FREIGHT & PRICING FAQ
  if (lower.includes('price') || lower.includes('rate') || lower.includes('cost') || lower.includes('how much')) {
    return {
      reply: "Our standard freight starts at $5.50 per kg with an 8.5% logistics tax. Express Next-Day air transit includes an $18 surcharge, and Fragile handling with air-cushioned shock protection adds $12.",
      action: { type: 'speak_only' },
      suggestions: ['Open parcel booking', 'Track parcel', 'Go to dashboard'],
      detectedIntent: 'PRICING_FAQ',
    };
  }

  // 6. CONTACT SUPPORT
  if (lower.includes('support') || lower.includes('contact') || lower.includes('help desk') || lower.includes('agent support')) {
    return {
      reply: "SwiftRoute Enterprise Support is available 24/7. You can reach our dispatch desk at support@swiftroute.com or toll-free at +1 (800) 555-SWIFT. Would you like me to guide you to any specific feature?",
      action: { type: 'speak_only' },
      suggestions: ['Track my parcel', 'Book a parcel', 'Back to dashboard'],
      detectedIntent: 'SUPPORT_CONTACT',
    };
  }

  return null;
}

/**
 * Main AI Assistant processor
 * Combines Gemini Generative AI with Logistics Knowledge Graph & Safety Guardrails
 */
export async function processAssistantQuery(
  query: string,
  context: AssistantContext,
  history: Array<{ role: 'user' | 'assistant'; content: string }> = []
): Promise<AssistantResponse> {
  // First, check high-precision rule-based logistics engine
  const ruleResult = handleLogisticsIntent(query, context);
  if (ruleResult) {
    return ruleResult;
  }

  // Check if Gemini API client is available
  const client = getGeminiClient();

  if (client) {
    try {
      const systemInstruction = `You are "SwiftRoute AI", an advanced, courteous, and efficient enterprise logistics voice assistant for SwiftRoute Parcel Management.
Current Context:
- User: ${context.userName || 'Guest'} (${context.userRole || 'Visitor'})
- Current Screen/View: ${context.currentView || 'home'} (Tab: ${context.activeTab || 'overview'})
- Language: ${context.currentLanguage || 'en-US'}

Your Capabilities:
1. Explain courier and parcel workflows (Booking, Tracking, e-POD signatures, Invoicing, Fleet management).
2. Guide users step-by-step through forms and features.
3. Suggest navigation actions when requested.

Rules:
- Keep answers concise, clear, and natural when spoken aloud (2-3 sentences max).
- Do not use markdown bullet spam or overly verbose lists.
- If user requests navigation to a page, end with an action command formatted as: [ACTION:{"type":"navigate","payload":{"view":"...","tab":"..."}}].
- If user asks for parcel tracking with a number, format as: [ACTION:{"type":"track","payload":{"trackingNumber":"..."}}].
- Allowed views: 'home', 'auth', 'dashboard'.
- Allowed tabs: 'parcels', 'book', 'payments', 'profile', 'analytics', 'settings'.`;

      const contents = [
        ...history.slice(-4).map(m => ({
          role: m.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: m.content }],
        })),
        {
          role: 'user',
          parts: [{ text: query }],
        },
      ];

      const response = await client.models.generateContent({
        model: 'gemini-3.8-flash',
        contents,
        config: {
          systemInstruction,
          temperature: 0.4,
          maxOutputTokens: 250,
        },
      });

      const rawText = response.text?.trim() || 'I am ready to assist with your parcel and delivery logistics.';
      
      // Parse any embedded action tags
      let action: AssistantResponse['action'];
      let cleanReply = rawText;
      const actionMatch = rawText.match(/\[ACTION:(.*?)\]/s);
      if (actionMatch) {
        try {
          action = JSON.parse(actionMatch[1]);
          cleanReply = rawText.replace(/\[ACTION:.*?\]/s, '').trim();
        } catch (e) {
          logger.warn('Failed to parse Gemini action JSON', e);
        }
      }

      return {
        reply: cleanReply,
        action: action || { type: 'speak_only' },
        suggestions: [
          'Track a parcel',
          'Book new consignment',
          'Explain shipping rates',
        ],
        detectedIntent: 'GEMINI_CONVERSATION',
      };
    } catch (geminiError: any) {
      logger.error('Gemini API call failed, falling back to local engine', geminiError);
    }
  }

  // Graceful Fallback
  return {
    reply: `I am your SwiftRoute Logistics Assistant. I can help you track consignments (like SR-2026CA-892104), book shipments, review invoices, or navigate your ${context.userRole || 'customer'} dashboard. How may I assist your delivery today?`,
    action: { type: 'speak_only' },
    suggestions: ['Track parcel SR-2026CA-892104', 'Open parcel booking', 'Go to dashboard', 'Explain rates'],
    detectedIntent: 'DEFAULT_FALLBACK',
  };
}
