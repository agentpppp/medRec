import React, { useEffect, useState } from 'react';
import { getAllPatients } from '../databseutil/Database';

interface Patient {
  id: number;
  name: string;
  email: string | null;
  age: string;
  phone: string | null;
  gender: string | null;
  address: string | null;
  emergencyContact: string | null;
  created_at: string;
}

const PatientDashboard = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: keyof Patient; direction: 'ascending' | 'descending' } | null>(null);

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const data = await getAllPatients();
      setPatients(data);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch patients:', err);
      setError('Failed to load patient data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    await fetchPatients();
  };
  const getColumns = () => {
    if (patients.length === 0) return [];
    
    // Find first patient with data
    const patientWithData = patients.find(p => p !== null);
    if (!patientWithData) return [];
    
    return Object.keys(patientWithData);
  };
  const formatValue = (value: any) => {
    if (value === null || value === undefined) return '-';
    
    // Check if value is a date string
    if (typeof value === 'string' && !isNaN(Date.parse(value))) {
      return new Date(value).toLocaleString();
    }
    
    return value.toString();
  };
  const requestSort = (key: keyof Patient) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const getSortedData = () => {
    if (!sortConfig) return patients;

    return [...patients].sort((a, b) => {
      if (a[sortConfig.key] === null) return 1;
      if (b[sortConfig.key] === null) return -1;
      if (a[sortConfig.key] === null && b[sortConfig.key] === null) return 0;

      if (a[sortConfig.key]! < b[sortConfig.key]!) {
        return sortConfig.direction === 'ascending' ? -1 : 1;
      }
      if (a[sortConfig.key]! > b[sortConfig.key]!) {
        return sortConfig.direction === 'ascending' ? 1 : -1;
      }
      return 0;
    });
  };

  const filteredPatients = getSortedData().filter(patient =>
    Object.values(patient).some(
      value =>
        value &&
        value.toString().toLowerCase().includes(searchTerm.toLowerCase())
  ));

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const SortIndicator = ({ column }: { column: keyof Patient }) => {
    if (!sortConfig || sortConfig.key !== column) return <span className="ml-1">↕</span>;
    return <span className="ml-1">{sortConfig.direction === 'ascending' ? '↑' : '↓'}</span>;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <h1 className="text-2xl font-bold text-gray-800">Patient Records</h1>
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <input
              type="text"
              placeholder="Search patients..."
              className="px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-300"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Refreshing...
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Refresh
                </>
              )}
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4 rounded">
            <p>{error}</p>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : filteredPatients.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            {searchTerm ? 'No matching patient records found.' : 'No patient records found.'}
          </div>
        ) : (
<div className="overflow-x-auto shadow ring-1 ring-black ring-opacity-5 rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {getColumns().map((key) => (
                    <th 
                      key={key}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      {key.replace(/_/g, ' ')}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPatients.map((patient, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    {getColumns().map((key) => (
                      <td 
                        key={`${index}-${key}`}
                        className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                      >
                        {formatValue(patient[key as keyof Patient])}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default PatientDashboard;