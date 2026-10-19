import React, { useState } from 'react';
import { systemAPI } from '../services/api';
import toast from 'react-hot-toast';
import { Shield, RefreshCw, AlertTriangle, CheckCircle, Database, Activity } from 'lucide-react';

const SystemIntegrity = () => {
  const [loading, setLoading] = useState(false);
  const [hashReport, setHashReport] = useState(null);
  const [mismatchedUsers, setMismatchedUsers] = useState([]);
  const [tamperResult, setTamperResult] = useState(null);
  const [tamperedComplaints, setTamperedComplaints] = useState([]);
  const [selectedComplaints, setSelectedComplaints] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');

  const handleHashCheck = async () => {
    setLoading(true);
    try {
      const response = await systemAPI.getHashReport();
      setHashReport(response.data.report);
      toast.success('Hash report generated successfully!');
    } catch (error) {
      console.error('Error getting hash report:', error);
      toast.error('Failed to generate hash report');
    } finally {
      setLoading(false);
    }
  };

  const handleSyncAllHashes = async () => {
    if (!window.confirm('This will synchronize all users to the current system hash. Continue?')) {
      return;
    }

    setLoading(true);
    try {
      const response = await systemAPI.syncHashes();
      toast.success(response.data.message);
      handleHashCheck(); // Refresh report
    } catch (error) {
      console.error('Error syncing hashes:', error);
      toast.error('Failed to sync hashes');
    } finally {
      setLoading(false);
    }
  };

  const handleGetMismatchedUsers = async () => {
    setLoading(true);
    try {
      const response = await systemAPI.getMismatchedUsers();
      setMismatchedUsers(response.data.users);
      toast.success(`Found ${response.data.count} mismatched user(s)`);
    } catch (error) {
      console.error('Error getting mismatched users:', error);
      toast.error('Failed to get mismatched users');
    } finally {
      setLoading(false);
    }
  };

  const handleSyncUser = async (userId) => {
    setLoading(true);
    try {
      const response = await systemAPI.syncUser(userId);
      toast.success(response.data.message);
      handleGetMismatchedUsers(); // Refresh list
      handleHashCheck(); // Refresh report
    } catch (error) {
      console.error('Error syncing user:', error);
      toast.error('Failed to sync user');
    } finally {
      setLoading(false);
    }
  };

  const handleDetectTampering = async () => {
    setLoading(true);
    try {
      const response = await systemAPI.detectTampering();
      console.log('Tamper detection response:', response.data);
      setTamperResult(response.data.result);
      
      // If tampering detected, automatically identify tampered complaints
      if (response.data.result.tamperingDetected) {
        toast.error('🚨 Tampering detected in the system!');
        await handleIdentifyTamperedComplaints();
      } else {
        toast.success('✅ No tampering detected');
        setTamperedComplaints([]);
      }
    } catch (error) {
      console.error('Error detecting tampering:', error);
      toast.error('Failed to detect tampering');
    } finally {
      setLoading(false);
    }
  };

  const handleIdentifyTamperedComplaints = async () => {
    try {
      const response = await systemAPI.identifyTamperedComplaints();
      setTamperedComplaints(response.data.tamperedComplaints || []);
      if (response.data.tamperedCount > 0) {
        toast(`Found ${response.data.tamperedCount} tampered complaint(s)`, {
          icon: '🔍',
        });
      }
    } catch (error) {
      console.error('Error identifying tampered complaints:', error);
      toast.error('Failed to identify tampered complaints');
    }
  };

  const handleRemoveTamperedComplaints = async () => {
    if (selectedComplaints.length === 0) {
      toast.error('Please select complaints to remove');
      return;
    }

    if (!window.confirm(
      `Are you sure you want to permanently delete ${selectedComplaints.length} tampered complaint(s)? 

This action cannot be undone. A new system hash will be generated.

Affected users will be notified about the removal.`
    )) {
      return;
    }

    setLoading(true);
    try {
      const response = await systemAPI.removeTamperedComplaints(selectedComplaints);
      toast.success(
        `✅ Removed ${response.data.deletedCount} tampered complaint(s) and sent ${response.data.notificationsSent} notification(s) to affected users`
      );
      
      // Reset selections and refresh
      setSelectedComplaints([]);
      setTamperedComplaints([]);
      
      // Re-run detection
      await handleDetectTampering();
    } catch (error) {
      console.error('Error removing tampered complaints:', error);
      toast.error('Failed to remove tampered complaints');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-500 to-orange-500 text-white p-6 rounded-lg shadow-lg">
        <div className="flex items-center gap-3 mb-2">
          <Shield className="h-8 w-8" />
          <h2 className="text-2xl font-bold">System Integrity Monitor</h2>
        </div>
        <p className="text-red-50">Monitor and maintain the integrity of your system data</p>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="border-b flex gap-4 px-6">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-3 px-4 border-b-2 transition ${
              activeTab === 'overview' 
                ? 'border-primary text-primary font-semibold' 
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('hash-check')}
            className={`py-3 px-4 border-b-2 transition ${
              activeTab === 'hash-check' 
                ? 'border-primary text-primary font-semibold' 
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Hash Verification
          </button>
          <button
            onClick={() => setActiveTab('tampering')}
            className={`py-3 px-4 border-b-2 transition ${
              activeTab === 'tampering' 
                ? 'border-primary text-primary font-semibold' 
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Tamper Detection
          </button>
        </div>

        <div className="p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-blue-50 p-6 rounded-lg border-l-4 border-blue-500">
                  <div className="flex items-center gap-3 mb-3">
                    <Database className="h-6 w-6 text-blue-600" />
                    <h3 className="font-semibold text-lg">Hash Verification</h3>
                  </div>
                  <p className="text-gray-700 mb-4">
                    Check and verify the integrity of all user data against the system hash.
                  </p>
                  <button
                    onClick={handleHashCheck}
                    disabled={loading}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 flex items-center gap-2"
                  >
                    <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                    Run Hash Check
                  </button>
                </div>

                <div className="bg-orange-50 p-6 rounded-lg border-l-4 border-orange-500">
                  <div className="flex items-center gap-3 mb-3">
                    <AlertTriangle className="h-6 w-6 text-orange-600" />
                    <h3 className="font-semibold text-lg">Tamper Detection</h3>
                  </div>
                  <p className="text-gray-700 mb-4">
                    Detect any unauthorized modifications to the system data.
                  </p>
                  <button
                    onClick={handleDetectTampering}
                    disabled={loading}
                    className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 disabled:bg-gray-400 flex items-center gap-2"
                  >
                    <Activity className={`h-4 w-4 ${loading ? 'animate-pulse' : ''}`} />
                    Detect Tampering
                  </button>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="font-semibold text-lg mb-4">Quick Actions</h3>
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={handleGetMismatchedUsers}
                    disabled={loading}
                    className="bg-white border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 disabled:bg-gray-100"
                  >
                    View Mismatched Users
                  </button>
                  <button
                    onClick={handleSyncAllHashes}
                    disabled={loading}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:bg-gray-400"
                  >
                    Sync All Hashes
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Hash Check Tab */}
          {activeTab === 'hash-check' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold">Hash Verification Report</h3>
                <button
                  onClick={handleHashCheck}
                  disabled={loading}
                  className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 flex items-center gap-2"
                >
                  <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                  Refresh Report
                </button>
              </div>

              {hashReport ? (
                <div className="space-y-4">
                  {/* System Hash */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">System Hash</h4>
                    <p className="font-mono text-sm break-all text-gray-700">
                      {hashReport.systemHash}
                    </p>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-blue-50 p-4 rounded-lg text-center">
                      <p className="text-3xl font-bold text-blue-600">{hashReport.totalUsers}</p>
                      <p className="text-sm text-gray-600">Total Users</p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg text-center">
                      <p className="text-3xl font-bold text-green-600">{hashReport.matchingUsers}</p>
                      <p className="text-sm text-gray-600">Matching</p>
                    </div>
                    <div className="bg-red-50 p-4 rounded-lg text-center">
                      <p className="text-3xl font-bold text-red-600">{hashReport.mismatchingUsers}</p>
                      <p className="text-sm text-gray-600">Mismatching</p>
                    </div>
                    <div className={`p-4 rounded-lg text-center ${
                      hashReport.integrityStatus === 'OK' ? 'bg-green-100' : 'bg-red-100'
                    }`}>
                      <div className="flex items-center justify-center gap-2">
                        {hashReport.integrityStatus === 'OK' ? (
                          <CheckCircle className="h-6 w-6 text-green-600" />
                        ) : (
                          <AlertTriangle className="h-6 w-6 text-red-600" />
                        )}
                      </div>
                      <p className={`text-sm font-semibold ${
                        hashReport.integrityStatus === 'OK' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {hashReport.integrityStatus}
                      </p>
                    </div>
                  </div>

                  {/* Mismatched Users */}
                  {hashReport.mismatchingUserDetails?.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-3 text-red-600">Mismatched Users</h4>
                      <div className="space-y-2">
                        {hashReport.mismatchingUserDetails.map(user => (
                          <div key={user.id} className="bg-red-50 p-3 rounded-lg flex justify-between items-center">
                            <div>
                              <p className="font-medium">{user.name}</p>
                              <p className="text-sm text-gray-600 font-mono">{user.userHash?.substring(0, 16)}...</p>
                            </div>
                            <button
                              onClick={() => handleSyncUser(user.id)}
                              disabled={loading}
                              className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 disabled:bg-gray-400"
                            >
                              Sync
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  {hashReport.mismatchingUsers > 0 && (
                    <button
                      onClick={handleSyncAllHashes}
                      disabled={loading}
                      className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 disabled:bg-gray-400"
                    >
                      Sync All Users to System Hash
                    </button>
                  )}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <Database className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                  <p>Click "Refresh Report" to generate a hash verification report</p>
                </div>
              )}
            </div>
          )}

          {/* Tampering Tab */}
          {activeTab === 'tampering' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold">Tamper Detection</h3>
                <button
                  onClick={handleDetectTampering}
                  disabled={loading}
                  className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 disabled:bg-gray-400 flex items-center gap-2"
                >
                  <Activity className={`h-4 w-4 ${loading ? 'animate-pulse' : ''}`} />
                  Run Detection
                </button>
              </div>

              {tamperResult ? (
                <div className="space-y-4">
                  <div className={`p-6 rounded-lg ${
                    tamperResult.tamperingDetected ? 'bg-red-50 border-2 border-red-500' : 'bg-green-50 border-2 border-green-500'
                  }`}>
                    <div className="flex items-center gap-3 mb-3">
                      {tamperResult.tamperingDetected ? (
                        <AlertTriangle className="h-8 w-8 text-red-600" />
                      ) : (
                        <CheckCircle className="h-8 w-8 text-green-600" />
                      )}
                      <h4 className={`text-xl font-bold ${
                        tamperResult.tamperingDetected ? 'text-red-700' : 'text-green-700'
                      }`}>
                        {tamperResult.tamperingDetected ? '🚨 Tampering Detected!' : '✅ No Tampering Detected'}
                      </h4>
                    </div>
                    <p className="text-gray-700 mb-4">
                      {tamperResult.tamperingDetected 
                        ? 'Database content has been modified without proper hash updates!' 
                        : 'System integrity verified - no unauthorized modifications detected.'}
                    </p>
                    
                    {/* Show recovery status */}
                    {tamperResult.tamperingDetected && (
                      <div className="mt-4 space-y-2">
                        <p className={`text-sm font-semibold ${
                          tamperResult.recoverableToPrevious ? 'text-green-700' : 'text-red-700'
                        }`}>
                          {tamperResult.recoverableToPrevious 
                            ? '✅ Recoverable: Can restore to previous state' 
                            : '⚠️ Not recoverable to previous state'}
                        </p>
                        <p className={`text-sm font-semibold ${
                          tamperResult.recoverableToHistorical ? 'text-green-700' : 'text-gray-600'
                        }`}>
                          {tamperResult.recoverableToHistorical 
                            ? '✅ Historical recovery available' 
                            : 'No historical recovery points'}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Tampered Complaints List */}
                  {tamperedComplaints && tamperedComplaints.length > 0 && (
                    <div className="bg-red-50 border-2 border-red-300 p-6 rounded-lg">
                      <div className="flex justify-between items-center mb-4">
                        <h5 className="font-semibold text-red-900 text-lg">
                          🚨 Tampered Complaints Detected ({tamperedComplaints.length})
                        </h5>
                        <button
                          onClick={handleRemoveTamperedComplaints}
                          disabled={loading || selectedComplaints.length === 0}
                          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:bg-gray-400 flex items-center gap-2"
                        >
                          <AlertTriangle className="h-4 w-4" />
                          Remove Selected ({selectedComplaints.length})
                        </button>
                      </div>
                      
                      <p className="text-sm text-red-700 mb-4">
                        The following complaints have been modified without proper hash updates. 
                        Select the complaints you want to remove from the system.
                      </p>

                      <div className="space-y-2 max-h-96 overflow-y-auto">
                        {tamperedComplaints.map((complaint) => (
                          <div
                            key={complaint.id}
                            className="bg-white p-4 rounded-lg border-l-4 border-red-500 hover:shadow-md transition"
                          >
                            <div className="flex items-start gap-3">
                              <input
                                type="checkbox"
                                checked={selectedComplaints.includes(complaint.id)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedComplaints([...selectedComplaints, complaint.id]);
                                  } else {
                                    setSelectedComplaints(selectedComplaints.filter(id => id !== complaint.id));
                                  }
                                }}
                                className="mt-1 w-4 h-4"
                              />
                              <div className="flex-1">
                                <h6 className="font-semibold text-gray-900">{complaint.title}</h6>
                                <p className="text-sm text-gray-600 mt-1">{complaint.description}</p>
                                <div className="mt-2 flex flex-wrap gap-2 text-xs">
                                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                    {complaint.category}
                                  </span>
                                  <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded">
                                    {complaint.status}
                                  </span>
                                  <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded">
                                    Modified: {new Date(complaint.lastModified).toLocaleString()}
                                  </span>
                                </div>
                                <div className="mt-2 text-xs text-gray-500 font-mono">
                                  <p>Stored Hash: {complaint.storedHash}</p>
                                  <p>Calculated Hash: {complaint.calculatedHash} ❌</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="mt-4 p-4 bg-yellow-50 rounded-lg border border-yellow-300">
                        <p className="text-sm text-yellow-900">
                          <span className="font-semibold">⚠️ Recovery Process:</span>
                        </p>
                        <ol className="text-sm text-yellow-800 mt-2 ml-4 space-y-1 list-decimal">
                          <li>Review the tampered complaints listed above</li>
                          <li>Select the complaints you want to remove</li>
                          <li>Click "Remove Selected" to permanently delete them</li>
                          <li>System will automatically regenerate the hash with remaining data</li>
                          <li>New hash will be saved and tampering will be resolved</li>
                        </ol>
                      </div>
                    </div>
                  )}

                  {/* Detailed Results */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Current State */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h5 className="font-semibold mb-2 flex items-center gap-2">
                        <Database className="h-5 w-5 text-blue-600" />
                        Current State
                      </h5>
                      <div className="space-y-1 text-sm">
                        <p><span className="font-medium">Hash:</span> {tamperResult.current?.hash?.substring(0, 16)}...</p>
                        <p><span className="font-medium">Valid:</span> 
                          <span className={`ml-2 ${
                            tamperResult.current?.databaseValid ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {tamperResult.current?.databaseValid ? '✅ Yes' : '❌ No'}
                          </span>
                        </p>
                        <p><span className="font-medium">Complaints:</span> {tamperResult.current?.complaintCount}</p>
                      </div>
                    </div>

                    {/* Previous State */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h5 className="font-semibold mb-2 flex items-center gap-2">
                        <RefreshCw className="h-5 w-5 text-orange-600" />
                        Previous State
                      </h5>
                      <div className="space-y-1 text-sm">
                        <p><span className="font-medium">Hash:</span> {tamperResult.previous?.hash?.substring(0, 16)}...</p>
                        <p><span className="font-medium">Valid:</span> 
                          <span className={`ml-2 ${
                            tamperResult.previous?.databaseValid ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {tamperResult.previous?.databaseValid ? '✅ Yes' : '❌ No'}
                          </span>
                        </p>
                        <p><span className="font-medium">Complaints:</span> {tamperResult.previous?.complaintCount}</p>
                      </div>
                    </div>
                  </div>

                  {/* Historical Checks */}
                  {tamperResult.historical && tamperResult.historical.length > 0 && (
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h5 className="font-semibold mb-3">Historical Hash Validation</h5>
                      <div className="space-y-2">
                        {tamperResult.historical.map((hist, index) => (
                          <div key={index} className="flex justify-between items-center text-sm bg-white p-2 rounded">
                            <span>Version {hist.version}</span>
                            <span className="text-xs text-gray-500">
                              {new Date(hist.timestamp).toLocaleString()}
                            </span>
                            <span className={hist.isValid ? 'text-green-600' : 'text-red-600'}>
                              {hist.isValid ? '✅ Valid' : '❌ Invalid'}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <AlertTriangle className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                  <p>Click "Run Detection" to check for data tampering</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SystemIntegrity;
