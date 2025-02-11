'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { PlusCircle, Loader, X, Award, Calendar } from 'lucide-react';
import { withAuth } from '@/components/withAuth';
import CreatePlanModal from '@/components/modals/createplan';
import {ProgressCharts} from '@/components/progressCharts';
import { LearningPlan, ProgressStats, ActivityLog } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const Dashboard = () => {
  const [learningPlans, setLearningPlans] = useState<LearningPlan[]>([]);
  const [stats, setStats] = useState<ProgressStats | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'completed' | 'in_progress'>('all');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [plansRes, statsRes] = await Promise.all([
        axios.get<LearningPlan[]>('/api/learning-plan/all'),
        axios.get<ProgressStats>('/api/analytics/progress')
      ]);
      setLearningPlans(plansRes.data);
      setStats(statsRes.data);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePlan = async (goal: string, difficulty: string = 'intermediate') => {
    try {
      const response = await axios.post<LearningPlan>('/api/generate-plan', { 
        goal,
        difficulty,
        duration_days: 30
      });
      setLearningPlans([...learningPlans, response.data]);
      await fetchData();
      setIsModalOpen(false);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        alert(error.response.data.detail);
      }
    }
  };

  const handleActivityComplete = async (planId: number, activityId: number) => {
    try {
      await axios.post<ActivityLog>('/api/activity/log', {
        activity_id: activityId,
        completed: true
      });
      await fetchData();
    } catch (error) {
      console.error('Failed to log activity:', error);
    }
  };

  const handleDeletePlan = async (planId: number) => {
    if (!confirm('Are you sure you want to delete this plan?')) return;
    
    try {
      await axios.delete(`/api/learning-plan/${planId}`);
      setLearningPlans(learningPlans.filter(plan => plan.id !== planId));
      await fetchData();
    } catch (error) {
      console.error('Failed to delete plan:', error);
    }
  };

  const filteredPlans = learningPlans.filter(plan => {
    if (selectedFilter === 'completed') return plan.completed;
    if (selectedFilter === 'in_progress') return !plan.completed;
    return true;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Learning Dashboard</h1>
            {(stats?.streak_days??0) > 0 && (
              <div className="flex items-center gap-2 text-yellow-600 mt-2">
                <Award className="w-5 h-5" />
                <span>{stats?.streak_days??'0'} day streak!</span>
              </div>
            )}
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            <PlusCircle className="w-5 h-5" />
            Create New Plan
          </button>
        </div>

        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Plans</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total_plans}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Completed</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {stats.completed_plans}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">In Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {stats.in_progress}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">
                  {stats.completion_rate}%
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {stats && <ProgressCharts stats={stats} className="mb-8" />}

        <div className="mb-6 flex justify-between items-center">
          <div className="space-x-2">
            <button
              onClick={() => setSelectedFilter('all')}
              className={`px-4 py-2 rounded-lg ${
                selectedFilter === 'all' ? 'bg-blue-600 text-white' : 'bg-white'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setSelectedFilter('in_progress')}
              className={`px-4 py-2 rounded-lg ${
                selectedFilter === 'in_progress' ? 'bg-blue-600 text-white' : 'bg-white'
              }`}
            >
              In Progress
            </button>
            <button
              onClick={() => setSelectedFilter('completed')}
              className={`px-4 py-2 rounded-lg ${
                selectedFilter === 'completed' ? 'bg-blue-600 text-white' : 'bg-white'
              }`}
            >
              Completed
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredPlans.map((plan) => (
            <Card key={plan.id}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xl font-semibold">{plan.goal}</CardTitle>
                <button
                  onClick={() => handleDeletePlan(plan.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600">Progress</span>
                    <span className="text-sm font-medium">{Math.round(plan.progress)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${plan.progress}%` }}
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  {Object.entries(plan.plan).map(([day, activities]) => (
                    <div key={day}>
                      <h3 className="font-semibold text-gray-700">{day}</h3>
                      <ul className="mt-2 space-y-2">
                        {activities.map((activity, index) => (
                          <li
                            key={index}
                            className="flex items-center justify-between text-sm text-gray-600"
                          >
                            <span>{activity}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <CreatePlanModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleCreatePlan}
        />
      </div>
    </div>
  );
};

export default withAuth(Dashboard);