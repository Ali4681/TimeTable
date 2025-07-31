// =============================================================================
// Timetable Scheduler API Response Interfaces
// Production-ready TypeScript interfaces for graduation priority scheduling
// =============================================================================

// Core session interfaces
export interface ScheduledSession {
  assigned_instructor: string;
  day: string;
  time: string;
  room_id: string;
  room_name: string;
  module_id: string;
  module_name: string;
  teacher_name: string;
  doctor_name: string;
  enrollment: number;
  session_type: 'theoretical' | 'practical';
  is_graduation_critical: boolean;
  is_split_module: boolean;
  original_module_id: string | null;
  parent_theoretical_id: string | null;
  split_index: number | null;
}

// Add a type for localized strings
export interface LocalizedString {
  en: string;
  ar: string;
}

export interface Recommendation {
  action: LocalizedString;
  details: LocalizedString;
  type: 'teacher_availability' | 'room_conflict' | 'room_capacity' | 'parent_dependency';
  priority: 'critical' | 'high' | 'medium' | 'low';
  alternatives: LocalizedString[];
}

export interface UnscheduledSession {
  assigned_instructor: string;
  conflict_description: LocalizedString;
  conflict_reasons: LocalizedString[];
  conflict_type: string;
  doctor_name: string;
  enrollment: number;
  is_graduation_critical: boolean;
  is_split_module: boolean;
  module_id: string;
  module_name: string;
  original_module_id: string | null;
  parent_theoretical_id: string | null;
  recommendations: Recommendation[];
  session_type: 'theoretical' | 'practical';
  split_index: number | null;
  teacher_name: string;
}

// Split module interfaces
export interface OriginalModule {
  enrollment: number;
  is_graduation_critical: boolean;
  module_id: string;
  module_name: string;
}

export interface SplitBranch {
  enrollment: number;
  is_graduation_critical: boolean;
  module_id: string;
  module_name: string;
}

export interface PracticalSession {
  enrollment: number;
  is_graduation_critical: boolean;
  module_id: string;
  module_name: string;
  parent_theoretical_id: string;
}

export interface SplitModule {
  is_graduation_critical: boolean;
  original_module: OriginalModule;
  practical_sessions: PracticalSession[];
  reason: string;
  split_branches: SplitBranch[];
}

// Statistics interfaces
export interface OverviewStats {
  total_original_modules: number;
  total_sessions_generated: number;
  total_scheduled: number;
  total_unscheduled: number;
  overall_success_rate: number;
}

export interface GraduationPriorityStats {
  final_year_students: number;
  graduation_critical_modules: number;
  graduation_success_rate: number;
  graduation_risk_level: 'LOW' | 'MEDIUM' | 'HIGH';
  graduation_scheduled: number;
  graduation_unscheduled: number;
  graduation_theoretical: {
    scheduled: number;
    unscheduled: number;
  };
  graduation_practical: {
    scheduled: number;
    unscheduled: number;
  };
}

export interface SessionBreakdown {
  theoretical: {
    generated: number;
    scheduled: number;
    unscheduled: number;
    success_rate: number;
  };
  practical: {
    generated: number;
    scheduled: number;
    unscheduled: number;
    success_rate: number;
  };
}

export interface TeacherUtilization {
  scheduled_sessions: number;
  total_available_slots: number;
  utilization_rate: number;
}

export interface RoomUtilization {
  room_name: string;
  capacity: number;
  type: 'theoretical' | 'lab';
  scheduled_sessions: number;
  total_time_slots: number;
  utilization_rate: number;
}

export interface ResourceUtilization {
  teachers: Record<string, TeacherUtilization>;
  rooms: Record<string, RoomUtilization>;
}

export interface ConflictTypes {
  teacher_availability: number;
  room_conflicts: number;
  parent_dependency: number;
  capacity_issues: number;
}

export interface ConflictAnalysis {
  total_conflicts: number;
  graduation_critical_conflicts: number;
  conflict_types: ConflictTypes;
}

export interface SplittingStats {
  modules_split: number;
  graduation_critical_splits: number;
  total_split_branches: number;
  split_reasons: string[];
}

export interface StatsReport {
  overview: OverviewStats;
  graduation_priority: GraduationPriorityStats;
  session_breakdown: SessionBreakdown;
  resource_utilization: ResourceUtilization;
  conflict_analysis: ConflictAnalysis;
  splitting_stats: SplittingStats;
  
}

// System information interface
export interface InstructorAssignmentRules {
  theoretical_sessions: string;
  practical_sessions: string;
}

export interface SystemInfo {
  practical_lab_capacity: number;
  min_split_size: number;
  max_split_branches: number;
  final_year_threshold: number;
  total_time_slots: number;
  total_theoretical_rooms: number;
  total_lab_rooms: number;
  graduation_priority_enabled: boolean;
  instructor_assignment_rules: InstructorAssignmentRules;
}

// Main data interface
export interface TimetableScheduleData {
  scheduled_sessions: ScheduledSession[];
  unscheduled_sessions: UnscheduledSession[];
  split_modules: SplitModule[];
  stats_report: StatsReport;
  success: boolean;
  system_info: SystemInfo;
  timestamp: string;
}

// Top-level API response interface
export interface TimetableScheduleResponse {
  success: boolean;
  data: TimetableScheduleData;
  status: number;
  statusText: string;
}

