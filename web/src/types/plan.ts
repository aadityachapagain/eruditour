export interface LearningPlan {
  id: number;
  goal: string;
  plan: Record<string, string[]>;
  progress: number;
  created_at: string;
  completed: boolean;
  completed_at?: string;
  difficulty: string;
}
  
export interface Progress {
  total_plans: number;
  completed_plans: number;
  in_progress: number;
  recent_activities?: Array<{
    id: number;
    activity: string;
    completed_at: string;
  }>;
}

export interface CreatePlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (goal: string) => Promise<void>;
}


export interface ActivityLog {
  activity_id: number;
  completed: boolean;
  notes?: string;
}

export interface ProgressStats {
  total_plans: number;
  completed_plans: number;
  in_progress: number;
  weekly_activity: DailyActivity[];
  completion_rate: number;
  streak_days: number;
}

export interface DailyActivity {
  date: string;
  count: number;
}

export interface CreatePlanInput {
  goal: string;
  duration_days?: number;
  difficulty?: "beginner" | "intermediate" | "advanced";
}