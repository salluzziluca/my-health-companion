export type NewMeal = {
  food_id: number;
  grams: number;
  meal_name: string;
  meal_of_the_day: string;
  timestamp: string;
};

export type Meal = NewMeal & {
  id: number;
  calories: number;
  timestamp?: string;
};
