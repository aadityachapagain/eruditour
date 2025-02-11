import Link from 'next/link';
import {ProgressChartView} from '@/components/progressCharts';

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center">
      <h1 className="text-6xl font-bold mb-8 text-white">
        AI-Powered Learning Assistant
      </h1>
      <p className="text-xl text-gray-400 mb-12">
        Achieve your learning goals with personalized study plans, real-time recommendations, and progress tracking.
      </p>
      <div className="space-x-4 mb-16">
        <Link href="/login" className="bg-blue-500 text-white px-8 py-3 rounded-lg hover:bg-blue-600 text-lg">
          Login
        </Link>
        <Link href="/register" className="bg-green-500 text-white px-8 py-3 rounded-lg hover:bg-green-600 text-lg">
          Register
        </Link>
      </div>
      <div className="w-full max-w-4xl bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-6">Your Progress Overview</h2>
        <ProgressChartView />
      </div>
    </div>
  );
}