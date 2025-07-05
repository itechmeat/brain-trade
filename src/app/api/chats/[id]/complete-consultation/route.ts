/**
 * API endpoint for completing tokenized consultations
 *
 * This endpoint is called after AI response completion
 * to distribute revenue between expert and platform
 */

import { NextRequest } from 'next/server';
import { createAPIHandlerWithParams } from '@/lib/api/base-handler';
import { getChatSession } from '@/lib/chat-utils';
import { z } from 'zod';

// Validation schema for consultation completion
const completeConsultationSchema = z.object({
  consultationId: z.string().min(1, 'Consultation ID is required'),
  userAddress: z.string().min(1, 'User address is required'),
  expertSymbol: z.string().min(1, 'Expert symbol is required'),
  transactionHash: z.string().optional(), // Hash of token deduction transaction
});

/**
 * POST /api/chats/[id]/complete-consultation
 * Complete consultation and call smart contract for revenue distribution
 */
export const POST = createAPIHandlerWithParams(async (request: NextRequest, params) => {
  const { id: sessionId } = params;
  const body = await request.json();
  const validatedData = completeConsultationSchema.parse(body);

  const { consultationId, userAddress, expertSymbol, transactionHash } = validatedData;

  // Check session existence
  const session = getChatSession(sessionId);
  if (!session) {
    throw new Error('Chat session not found');
  }

  console.log(`Completing consultation ${consultationId} for expert ${expertSymbol}`);

  try {
    // In real implementation, smart contract would be called here
    // for consultation completion and revenue distribution

    // Example logic:
    // 1. Get expert contract by expertSymbol
    // 2. Call completeConsultation(userAddress, consultationId)
    // 3. Contract automatically distributes revenue

    // For demonstration, just log
    console.log('📋 Consultation completion details:', {
      sessionId,
      consultationId,
      userAddress,
      expertSymbol,
      transactionHash,
      timestamp: new Date().toISOString(),
    });

    // In the future, real blockchain integration will be here:
    /*
    const { ethers } = await import('ethers');
    const { EXPERT_TOKEN_ABI } = await import('@/types/contracts');
    
    // Get expert contract address from database or config
    const expertTokenAddress = await getExpertTokenAddress(expertSymbol);
    
    // Create contract for calling
    const contract = new ethers.Contract(
      expertTokenAddress,
      EXPERT_TOKEN_ABI,
      signer // get platform signer
    );
    
    // Call consultation completion
    const tx = await contract.completeConsultation(
      userAddress,
      ethers.BigNumber.from(consultationId.replace(/\D/g, ''))
    );
    
    // Wait for confirmation
    const receipt = await tx.wait();
    */

    // Update session status (add completed consultation info)
    const completionInfo = {
      consultationId,
      userAddress,
      expertSymbol,
      completedAt: new Date().toISOString(),
      transactionHash,
      status: 'completed' as const,
    };

    // In real implementation, save to database
    console.log('✅ Consultation completed successfully:', completionInfo);

    return {
      success: true,
      consultation: completionInfo,
      message: `Consultation ${consultationId} completed successfully`,
    };
  } catch (error) {
    console.error('❌ Failed to complete consultation:', error);

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      consultationId,
    };
  }
});

/**
 * GET /api/chats/[id]/complete-consultation
 * Get information about completed consultations for session
 */
export const GET = createAPIHandlerWithParams(async (request: NextRequest, params) => {
  const { id: sessionId } = params;

  const session = getChatSession(sessionId);
  if (!session) {
    throw new Error('Chat session not found');
  }

  // In real implementation, get from database
  // For now, return stub
  return {
    sessionId,
    completedConsultations: [], // Array of completed consultations
    totalConsultations: 0,
    totalTokensSpent: 0,
  };
});
