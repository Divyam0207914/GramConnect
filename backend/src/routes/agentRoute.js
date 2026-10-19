import express from 'express';
import { analyzeQuery } from '../../agent/reasoner.js';
import { executeAPI } from '../../agent/executor.js';

const router = express.Router();

/**
 * POST /agent/analyze
 * Analyze user query and suggest relevant routes
 */
router.post('/analyze', async (req, res) => {
  try {
    const { query } = req.body;
    
    if (!query) {
      return res.status(400).json({
        error: 'Query is required'
      });
    }
    
    // Analyze the query
    const result = await analyzeQuery(query);
    
    // Return the result
    res.json(result);
  } catch (error) {
    console.error('Error in agent analysis:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

/**
 * POST /agent/execute
 * Execute API calls based on user intent
 */
router.post('/execute', async (req, res) => {
  try {
    const { query, context } = req.body;
    
    if (!query) {
      return res.status(400).json({
        error: 'Query is required'
      });
    }
    
    // Execute the API call
    const result = await executeAPI(query, context || {});
    
    // For login and signup intents, automatically try to execute
    if (result.intent === 'login' || result.intent === 'signup') {
      // If we have missing parameters, return them to the client
      if (result.action === 'missing_params') {
        return res.json(result);
      }
      
      // If execution was successful, return the result
      if (result.success) {
        return res.json(result);
      }
    }
    
    // For other intents or if execution failed, return the result
    res.json(result);
  } catch (error) {
    console.error('Error in agent execution:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

export default router;