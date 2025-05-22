export interface WeightLog {
    weight: number;
    timestamp: string;
}

export interface WeightHistory {
    date: string;
    weight: number;
    timestamp: string;
}

export interface WeeklySummary {
    week_start_date: string;
    week_end_date: string;
    weight_data: {
        start_weight: number;
        end_weight: number;
        weight_change: number;
        weight_logs: WeightHistory[];
    };
    calorie_data: {
        total_calories: number;
        average_daily_calories: number;
        days_logged: number;
        daily_breakdown: {
            date: string;
            calories: number;
            meals_count: number;
        }[];
    };
    meal_trends: {
        total_meals: number;
        favorite_foods: string[];
        most_frequent_meal_time: string;
        meal_distribution: {
            [key: string]: number;
        };
    };
    notes?: string;
}

export interface WeeklyNote {
    week_start_date: string;
    notes: string;
} 