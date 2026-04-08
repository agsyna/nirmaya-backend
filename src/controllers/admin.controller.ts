import type { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { registerDoctor } from '../services/auth.service';

export const registerDoctorController = asyncHandler(async (request: Request, response: Response) => {
  const result = await registerDoctor(request.body);
  response.status(201).json(result);
});