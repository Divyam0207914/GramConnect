import React from 'react';
import AutoAgent from '../agent/AutoAgent';

const AutoAgentDemo = () => {
  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">AI Auto Agent Demo</h1>
          <p className="text-gray-600">
            Natural language interaction for civic management
          </p>
        </div>
        
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">How to Test</h2>
          <ul className="list-disc pl-5 space-y-2 text-gray-700">
            <li>Type a command like "Login with email user@example.com and password password123"</li>
            <li>The agent will automatically understand your intent and execute the appropriate API call</li>
            <li>For missing parameters, the agent will prompt you to provide them</li>
            <li>Try different commands like signup, login, or general queries</li>
          </ul>
        </div>
        
        <AutoAgent />
        
        <div className="mt-8 bg-blue-50 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Test Commands</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-lg">
              <h3 className="font-medium text-blue-800 mb-2">Login Commands</h3>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• "Login with email user@example.com and password password123"</li>
                <li>• "I want to login to my account"</li>
                <li>• "Sign in with email test@example.com pass mypassword"</li>
              </ul>
            </div>
            <div className="bg-white p-4 rounded-lg">
              <h3 className="font-medium text-blue-800 mb-2">Signup Commands</h3>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• "Signup with name John Doe, email john@example.com, password secure123, phone 1234567890"</li>
                <li>• "Create a new account with name Jane Smith and email jane@example.com"</li>
                <li>• "Register as a new user"</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AutoAgentDemo;