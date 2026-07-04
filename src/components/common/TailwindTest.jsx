// src/components/common/TailwindTest.jsx
import React from 'react';

const TailwindTest = () => {
  return (
    <div className="p-8 max-w-md mx-auto bg-white rounded-xl shadow-lg space-y-4">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Tailwind CSS Test
        </h1>
        <p className="text-gray-600">
          If you can see styled elements below, Tailwind is working!
        </p>
      </div>

      <div className="space-y-3">
        <button className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors">
          Primary Button
        </button>

        <button className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg transition-colors">
          Success Button
        </button>

        <div className="flex space-x-2">
          <div className="flex-1 bg-red-100 text-red-800 px-3 py-2 rounded-md text-sm font-medium">
            Error Alert
          </div>
          <div className="flex-1 bg-yellow-100 text-yellow-800 px-3 py-2 rounded-md text-sm font-medium">
            Warning Alert
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <div className="bg-purple-500 text-white p-3 rounded text-center text-sm">
            Purple
          </div>
          <div className="bg-pink-500 text-white p-3 rounded text-center text-sm">
            Pink
          </div>
          <div className="bg-indigo-500 text-white p-3 rounded text-center text-sm">
            Indigo
          </div>
        </div>
      </div>
    </div>
  );
};

export default TailwindTest;