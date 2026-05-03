import type { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { forgotPassword, login, registerPatient, resetPassword } from '../services/auth.service';

export const registerPatientController = asyncHandler(async (request: Request, response: Response) => {
  const result = await registerPatient(request.body);
  response.status(201).json(result);
});

export const loginController = asyncHandler(async (request: Request, response: Response) => {
  const result = await login(request.body.email, request.body.password);
  response.status(200).json(result);
});

export const forgotPasswordController = asyncHandler(async (request: Request, response: Response) => {
  await forgotPassword(request.body.email);
  response.status(200).json({
    status: "success",
    message: "If an account exists with this email, a password reset link has been sent.",
    data: null
  });
});

export const resetPasswordController = asyncHandler(async (request: Request, response: Response) => {
  const result = await resetPassword(request.body.token, request.body.password);
  response.status(200).json(result);
});