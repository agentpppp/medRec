import React, { useEffect, useState } from 'react';
import { getAllPatients, executeQuery } from '../databseutil/Database';

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

const PatientSql = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sqlQuery, setSqlQuery] = useState<string>(
    "SELECT * FROM patients ORDER BY created_at DESC"
  );
  const [customQueryMode, setCustomQueryMode] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      let result;
      if (customQueryMode) {
        result = await executeQuery(sqlQuery);
        if (result.success) {
          setPatients(result.data);
        } else {
          throw new Error(result.error || 'Query execution failed');
        }
      } else {
        result = await getAllPatients();
        setPatients(result);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      setPatients([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [customQueryMode]); // Only run when customQueryMode changes

  const handleQuerySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchData();
  };

  // Get all possible columns from the first non-empty patient
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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <h1 className="text-2xl font-bold text-gray-800">
            {customQueryMode ? 'SQL Query Results' : 'Patient Records'}
          </h1>
          
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setCustomQueryMode(!customQueryMode)}
              className={`px-4 py-2 rounded-md ${
                customQueryMode 
                  ? 'bg-gray-500 hover:bg-gray-600' 
                  : 'bg-blue-500 hover:bg-blue-600'
              } text-white`}
            >
              {customQueryMode ? 'Show Default View' : 'Custom SQL Query'}
            </button>
            <button
              onClick={fetchData}
              disabled={loading}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md disabled:opacity-50"
            >
              {loading ? (
                <>
                  <span className="inline-block animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></span>
                  Loading...
                </>
              ) : 'Refresh'}
            </button>
          </div>
        </div>

        {customQueryMode && (
          <form onSubmit={handleQuerySubmit} className="mb-6">
            <div className="flex flex-col md:flex-row gap-2">
              <textarea
                value={sqlQuery}
                onChange={(e) => setSqlQuery(e.target.value)}
                className="flex-1 p-2 border rounded-md font-mono text-sm h-20"
                placeholder="Enter SQL query (e.g. SELECT * FROM patients WHERE age > 30)"
              />
              <button
                type="submit"
                disabled={loading}
                className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-md h-20 disabled:opacity-50"
              >
                Execute
              </button>
            </div>
          </form>
        )}

        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4 rounded">
            <p className="font-mono text-sm break-all">{error}</p>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : patients.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No records found. {customQueryMode && "Try a different query."}
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
                {patients.map((patient, index) => (
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

export default PatientSql;