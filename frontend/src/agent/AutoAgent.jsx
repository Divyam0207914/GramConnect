import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AutoAgent = ({ sttText }) => {
  const [analysisResult, setAnalysisResult] = useState(null);
  const [executionResult, setExecutionResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [missingParams, setMissingParams] = useState([]);
  const [collectedParams, setCollectedParams] = useState({});

  const [typedText, setTypedText] = useState("");
  const [debouncedText, setDebouncedText] = useState("");
  
  const navigate = useNavigate();

  // ⏳ Debounce effect (triggers AFTER user stops typing)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedText(typedText);
    }, 1000);

    return () => clearTimeout(timer);
  }, [typedText]);

  // Analyze and execute text when debounced text updates
  useEffect(() => {
    if (debouncedText) {
      analyzeAndExecute(debouncedText);
    }
  }, [debouncedText]);

  // Also analyze and execute when sttText updates from voice
  useEffect(() => {
    if (sttText) {
      analyzeAndExecute(sttText);
      setTypedText(sttText);
    }
  }, [sttText]);

  const analyzeAndExecute = async (text) => {
    if (!text) return;

    setLoading(true);
    setError(null);
    setExecutionResult(null);
    setMissingParams([]);
    setCollectedParams({});

    try {
      // Send to agent for analysis and execution
      const response = await axios.post('/agent/execute', { query: text });
      
      // Handle the response
      if (response.data.action === 'login_success') {
        // Store token and navigate to dashboard
        localStorage.setItem('token', response.data.data.token);
        navigate('/dashboard');
      } else if (response.data.action === 'signup_success') {
        // Show success message and suggest login
        alert('Account created successfully! Please login.');
        navigate('/login');
      } else if (response.data.action === 'missing_params') {
        // Store missing parameters for user input
        setMissingParams(response.data.missingParams);
      }
      
      setExecutionResult(response.data);
    } catch (err) {
      console.error('Error analyzing/executing text:', err);
      setError('Failed to process your request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle parameter input changes
  const handleParamChange = (param, value) => {
    setCollectedParams(prev => ({
      ...prev,
      [param]: value
    }));
  };

  // Submit collected parameters
  const submitParameters = async () => {
    if (!debouncedText && !sttText) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Send to agent with collected parameters
      const response = await axios.post('/agent/execute', {
        query: debouncedText || sttText,
        context: collectedParams
      });
      
      // Handle the response
      if (response.data.action === 'login_success') {
        // Store token and navigate to dashboard
        localStorage.setItem('token', response.data.data.token);
        navigate('/dashboard');
      } else if (response.data.action === 'signup_success') {
        // Show success message and suggest login
        alert('Account created successfully! Please login.');
        navigate('/login');
      } else if (response.data.action === 'missing_params') {
        // Store missing parameters for user input
        setMissingParams(response.data.missingParams);
      }
      
      setExecutionResult(response.data);
      setMissingParams([]);
    } catch (err) {
      console.error('Error executing with parameters:', err);
      setError('Failed to process your request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mt-6">
      <h3 className="text-xl font-bold mb-4">AI Auto Agent</h3>

      {/* 🌟 User Typing Input */}
      <input
        type="text"
        value={typedText}
        onChange={(e) => setTypedText(e.target.value)}
        placeholder="Type your request (e.g., 'Login with email user@example.com and password password123')..."
        className="w-full border rounded-lg p-3 mb-4"
      />
      
      {loading && (
        <div className="flex items-center justify-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
          <span className="ml-3 text-gray-600">Processing your request...</span>
        </div>
      )}
      
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <p className="text-red-700">{error}</p>
        </div>
      )}
      
      {/* Missing Parameters Form */}
      {missingParams.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
          <h4 className="font-semibold text-yellow-800 mb-2">Missing Information</h4>
          <p className="text-yellow-700 mb-3">Please provide the following information:</p>
          <div className="space-y-3">
            {missingParams.map((param) => (
              <div key={param}>
                <label className="block text-sm font-medium text-gray-700 capitalize">
                  {param}
                </label>
                <input
                  type={param === 'password' ? 'password' : param === 'email' ? 'email' : 'text'}
                  placeholder={param}
                  value={collectedParams[param] || ''}
                  onChange={(e) => handleParamChange(param, e.target.value)}
                  className="w-full border rounded-lg p-2 mt-1"
                />
              </div>
            ))}
            <button
              onClick={submitParameters}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium py-2 px-4 rounded-lg transition duration-200"
            >
              Submit Information
            </button>
          </div>
        </div>
      )}
      
      {executionResult && !loading && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
          <h4 className="font-semibold text-green-800 mb-2">Result</h4>
          <p className="text-green-700">{executionResult.message}</p>
          {executionResult.data && (
            <div className="mt-2 text-sm text-green-600">
              <pre>{JSON.stringify(executionResult.data, null, 2)}</pre>
            </div>
          )}
        </div>
      )}
      
      {!executionResult && !loading && !error && (
        <div className="text-center py-8 text-gray-500">
          <p>Speak or enter a command to automatically process your request</p>
          <p className="text-sm mt-2">Examples: "Login with email user@example.com and password password123"</p>
          <p className="text-sm">"Signup with name John Doe, email john@example.com, password secure123, phone 1234567890"</p>
        </div>
      )}
    </div>
  );
};

export default AutoAgent;