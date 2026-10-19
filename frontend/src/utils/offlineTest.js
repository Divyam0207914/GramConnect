/**
 * Simple test utility to verify offline functionality
 */

import { saveValidationResponse, getPendingValidationResponses } from './indexedDB.js';
import { addToSyncQueue } from './indexedDB.js';

export const testOfflineValidation = async () => {
  try {
    console.log('Testing offline validation functionality...');
    
    // Create a test validation response
    const testResponse = {
      validationId: 'test-validation-123',
      userId: 'test-user-456',
      response: 'approve',
      comments: 'Test comment for offline validation'
    };
    
    // Save to IndexedDB
    const saved = await saveValidationResponse(testResponse);
    console.log('Saved validation response:', saved);
    
    // Add to sync queue
    await addToSyncQueue({
      type: 'validation_response',
      validationId: testResponse.validationId,
      userId: testResponse.userId,
      priority: 9
    });
    console.log('Added to sync queue');
    
    // Retrieve pending responses
    const pending = await getPendingValidationResponses();
    console.log('Pending validation responses:', pending);
    
    console.log('Offline validation test completed successfully!');
    return true;
  } catch (error) {
    console.error('Offline validation test failed:', error);
    return false;
  }
};