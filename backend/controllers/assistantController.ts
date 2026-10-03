import { Request, Response } from 'express';
import { sendSuccess, sendError } from '../utils/apiResponse';
import * as assistantService from '../services/assistantService';

export const handleAssistantChat = async (req: Request, res: Response) => {
  try {
    const { message, context = {}, history = [] } = req.body;

    if (!message || typeof message !== 'string') {
      return sendError(res, 'Message text is required', 400);
    }

    // Attach authenticated user information if token was provided in header
    const tokenUser = (req as any).user;
    if (tokenUser) {
      context.userId = tokenUser.id;
      context.userRole = tokenUser.role;
      context.userName = tokenUser.full_name;
    }

    const result = await assistantService.processAssistantQuery(message, context, history);

    return sendSuccess(res, result, 'Assistant processed successfully');
  } catch (err: any) {
    return sendError(res, err.message || 'Failed to process voice query', 500);
  }
};

export const getAssistantSuggestions = async (req: Request, res: Response) => {
  try {
    const { currentView = 'home', userRole = 'visitor', activeTab = '' } = req.query;

    let suggestions: string[] = [
      'Track parcel SR-2026CA-892104',
      'Where is my parcel?',
      'Help me book a parcel',
      'Explain shipping rates',
    ];

    if (userRole === 'admin') {
      suggestions = [
        'Open reports',
        'Go to settings',
        'Monitor parcel activities',
        'Show active agents',
      ];
    } else if (userRole === 'agent') {
      suggestions = [
        'Show my assigned runs',
        'How to mark delivered?',
        'How to upload e-POD?',
        'Update status to In Transit',
      ];
    } else if (currentView === 'dashboard' && activeTab === 'book') {
      suggestions = [
        'Explain parcel types',
        'What are the weight limits?',
        'How is shipping cost calculated?',
        'Show my bookings',
      ];
    }

    return sendSuccess(res, { suggestions }, 'Suggestions loaded');
  } catch (err: any) {
    return sendError(res, err.message || 'Failed to get suggestions', 500);
  }
};
