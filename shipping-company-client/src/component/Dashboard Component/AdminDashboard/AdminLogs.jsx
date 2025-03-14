import { useState, useEffect } from 'react';

export default function AdminLogs() {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const response = await fetch('/api/admin-logs');
        const data = await response.json();
        setLogs(data);
      } catch (error) {
        console.error('Error fetching admin logs:', error);
      }
    };
    
    fetchLogs();
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold">Admin Logs</h1>
      <p>View login attempts, changes, and security logs.</p>
      <div className="mt-4 overflow-x-auto">
        {logs.length === 0 ? (
          <p className="text-center text-gray-500">No logs available yet.</p>
        ) : (
          <table className="min-w-full table-auto border-collapse border border-gray-300">
            <thead>
              <tr>
                <th className="border border-gray-300 px-4 py-2">Action</th>
                <th className="border border-gray-300 px-4 py-2">User</th>
                <th className="border border-gray-300 px-4 py-2">Status</th>
                <th className="border border-gray-300 px-4 py-2">Details</th>
                <th className="border border-gray-300 px-4 py-2">Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {logs.map(log => (
                <tr key={log._id}>
                  <td className="border border-gray-300 px-4 py-2">{log.action}</td>
                  <td className="border border-gray-300 px-4 py-2">{log.userEmail}</td>
                  <td className="border border-gray-300 px-4 py-2">{log.status}</td>
                  <td className="border border-gray-300 px-4 py-2">{log.details}</td>
                  <td className="border border-gray-300 px-4 py-2">{new Date(log.timestamp).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
