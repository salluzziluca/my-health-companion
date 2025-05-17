export type NewMeal = {
  name: string;
  calories: number;
};

export type Meal = NewMeal & {
  id: number;
};
