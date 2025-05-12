import React from "react";
import { useNavigate } from "react-router-dom";

const PatientRegistation= () => {
  
    const navigate=useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-10 rounded-2xl shadow-md space-y-6 w-full max-w-md">
        <h1 className="text-2xl font-bold text-center text-gray-800">Hospital Dashboard</h1>
        <button
          onClick={()=>navigate("/register")}
          className="w-full py-3 px-4 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition"
        >
          Patient Registration
        </button>
        <button
          onClick={() => navigate("/registerd-Patient")}
          className="w-full py-3 px-4 bg-green-500 text-white rounded-xl hover:bg-green-600 transition"
        >
          Patient List
        </button>
        <button
          onClick={() => navigate("/SqlSerch")}
          className="w-full py-3 px-4 bg-purple-500 text-white rounded-xl hover:bg-purple-600 transition"
        >
          SQL Query
        </button>
      </div>
    </div>
  );
};

export default PatientRegistation;
