import React, { useEffect, useState } from 'react';
import { getAllPatients, executeQuery } from '../databseutil/Database';

interface Patient {
  id: number;
  name: string;
  email: string | null;
  age: string;
  phone: string | null;
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
      
      if (customQueryMode) {
        const result = await executeQuery(sqlQuery);
        if (result.success) {
          setPatients(result.data);
        } else {
          throw new Error(result.error);
        }
      } else {
        setPatients(await getAllPatients());
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [customQueryMode]);

  const handleQuerySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchData();
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">
            {customQueryMode ? 'SQL Query Results' : 'Patient Records'}
          </h1>
          
          <div className="flex gap-2">
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
              {loading ? 'Loading...' : 'Refresh'}
            </button>
          </div>
        </div>

        {customQueryMode && (
          <form onSubmit={handleQuerySubmit} className="mb-6">
            <div className="flex gap-2">
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
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4">
            <p className="font-mono text-sm">{error}</p>
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
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead className="bg-gray-50">
                <tr>
                  {patients[0] && Object.keys(patients[0]).map((key) => (
                    <th 
                      key={key}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      {key}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {patients.map((patient, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    {Object.values(patient).map((value, i) => (
                      <td 
                        key={i}
                        className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                      >
                        {typeof value === 'string' && value.includes('T') 
                          ? new Date(value).toLocaleString() 
                          : value || '-'}
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