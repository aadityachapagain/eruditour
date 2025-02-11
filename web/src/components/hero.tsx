import { FaLightbulb, FaPen, FaBook } from 'react-icons/fa';

export default function Hero() {
  return (
    <div className="bg-gradient-brain bg-cover bg-center py-20">
      <div className="container mx-auto px-6 text-center">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">
          Your Personal AI Learning Assistant
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          Achieve your learning goals with personalized study plans, real-time recommendations, and progress tracking.
        </p>
        <div className="flex justify-center space-x-8">
          <div className="flex flex-col items-center">
            <FaLightbulb className="text-4xl text-primary mb-2" />
            <p className="text-gray-700">Smart Recommendations</p>
          </div>
          <div className="flex flex-col items-center">
            <FaPen className="text-4xl text-secondary mb-2" />
            <p className="text-gray-700">Interactive Learning</p>
          </div>
          <div className="flex flex-col items-center">
            <FaBook className="text-4xl text-primary mb-2" />
            <p className="text-gray-700">Track Progress</p>
          </div>
        </div>
      </div>
    </div>
  );
}