import React, { createContext, useContext, useState, useEffect } from 'react';

interface FavoritesContextType {
  favoriteRestaurants: string[];
  favoriteFoods: string[];
  toggleRestaurant: (id: string) => void;
  toggleFood: (id: string) => void;
  isRestaurantFavorite: (id: string) => boolean;
  isFoodFavorite: (id: string) => boolean;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

const STORAGE_KEY = 'foodora_favorites';

export const FavoritesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [favoriteRestaurants, setFavRest] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      const parsed = stored ? JSON.parse(stored) : {};
      return parsed.restaurants ?? ['rest-2', 'rest-3'];
    } catch {
      return ['rest-2', 'rest-3'];
    }
  });

  const [favoriteFoods, setFavFoods] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      const parsed = stored ? JSON.parse(stored) : {};
      return parsed.foods ?? ['food-201', 'food-302'];
    } catch {
      return ['food-201', 'food-302'];
    }
  });

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ restaurants: favoriteRestaurants, foods: favoriteFoods })
    );
  }, [favoriteRestaurants, favoriteFoods]);

  const toggleRestaurant = (id: string) => {
    setFavRest((prev) =>
      prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id]
    );
  };

  const toggleFood = (id: string) => {
    setFavFoods((prev) =>
      prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]
    );
  };

  return (
    <FavoritesContext.Provider
      value={{
        favoriteRestaurants,
        favoriteFoods,
        toggleRestaurant,
        toggleFood,
        isRestaurantFavorite: (id) => favoriteRestaurants.includes(id),
        isFoodFavorite: (id) => favoriteFoods.includes(id),
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = (): FavoritesContextType => {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error('useFavorites must be used within FavoritesProvider');
  return ctx;
};
