import { Response } from 'express';
import { ApiResponse } from '../../shared/types';

export const sendSuccess = <T>(
  res: Response,
  data?: T,
  message: string = 'Operation successful',
  statusCode: number = 200,
  meta?: any
) => {
  const payload: ApiResponse<T> = {
    success: true,
    message,
    data,
    meta,
  };
  return res.status(statusCode).json(payload);
};

export const sendError = (
  res: Response,
  error: string = 'An error occurred',
  statusCode: number = 400,
  details?: any
) => {
  const payload: ApiResponse = {
    success: false,
    error,
    message: error,
    data: details,
  };
  return res.status(statusCode).json(payload);
};
