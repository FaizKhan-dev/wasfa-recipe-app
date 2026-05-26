import React, { createContext, useContext, useMemo, useState } from 'react';

import { Recipe } from '../data/mockData';
import { useRecipes } from './RecipesContext';

type SavedRecipesContextValue = {
  savedRecipeIds: Set<string>;
  isRecipeSaved: (recipeId: string) => boolean;
  toggleRecipeSaved: (recipeId: string) => Promise<void>;
};

const SavedRecipesContext = createContext<SavedRecipesContextValue | null>(null);

export const SavedRecipesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { recipes, updateRecipe } = useRecipes();

  const savedRecipeIds = useMemo(
    () => new Set(recipes.filter((recipe) => recipe.isSaved).map((recipe) => recipe.id)),
    [recipes],
  );

  const isRecipeSaved = (recipeId: string) => savedRecipeIds.has(recipeId);

  const toggleRecipeSaved = async (recipeId: string) => {
    const recipe = recipes.find((item) => item.id === recipeId);

    if (!recipe) {
      return;
    }

    await updateRecipe(recipeId, { isSaved: !recipe.isSaved });
  };

  return (
    <SavedRecipesContext.Provider value={{ savedRecipeIds, isRecipeSaved, toggleRecipeSaved }}>
      {children}
    </SavedRecipesContext.Provider>
  );
};

export const useSavedRecipes = () => {
  const context = useContext(SavedRecipesContext);

  if (!context) {
    throw new Error('useSavedRecipes must be used within a SavedRecipesProvider');
  }

  return context;
};

type ShoppingItem = {
  id: string;
  name: string;
  checked: boolean;
  category?: string;
};

type ShoppingListContextValue = {
  items: ShoppingItem[];
  checkedCount: number;
  addItem: (name: string) => void;
  addIngredientsFromRecipe: (recipe: Recipe) => void;
  toggleItem: (id: string) => void;
  deleteItem: (id: string) => void;
  clearChecked: () => void;
};

const DEFAULT_ITEMS: ShoppingItem[] = [
  { id: '1', name: 'Beef Steaks', checked: false, category: 'Meat' },
  { id: '2', name: 'Salt', checked: true, category: 'Pantry' },
  { id: '3', name: 'Rosemary', checked: false, category: 'Herbs' },
  { id: '4', name: 'Garlic Cloves', checked: false, category: 'Vegetables' },
  { id: '5', name: 'Black Pepper', checked: true, category: 'Pantry' },
  { id: '6', name: 'Butter', checked: false, category: 'Dairy' },
  { id: '7', name: 'Olive Oil', checked: false, category: 'Pantry' },
];

const ShoppingListContext = createContext<ShoppingListContextValue | null>(null);

const ingredientCategoryMap: Record<string, string> = {
  'beef steaks': 'Meat',
  salt: 'Pantry',
  rosemary: 'Herbs',
  'garlic cloves': 'Vegetables',
  'black pepper': 'Pantry',
  butter: 'Dairy',
  'olive oil': 'Pantry',
  eggs: 'Dairy',
  'bell pepper': 'Vegetables',
  onion: 'Vegetables',
  'feta cheese': 'Dairy',
  'all-purpose flour': 'Pantry',
  'mixed berries': 'Fruit',
  sugar: 'Pantry',
  'heavy cream': 'Dairy',
  spaghetti: 'Pantry',
  guanciale: 'Meat',
  'egg yolks': 'Dairy',
  'pecorino romano': 'Dairy',
  chicken: 'Meat',
  avocado: 'Produce',
};

const normalizeId = () => Date.now().toString() + Math.random().toString(36).slice(2, 7);

export const ShoppingListProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<ShoppingItem[]>(DEFAULT_ITEMS);

  const checkedCount = useMemo(() => items.filter((item) => item.checked).length, [items]);

  const addItem = (name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;

    setItems((current) => [
      { id: normalizeId(), name: trimmed, checked: false },
      ...current,
    ]);
  };

  const addIngredientsFromRecipe = (recipe: Recipe) => {
    setItems((current) => {
      const existingNames = new Set(current.map((item) => item.name.toLowerCase()));
      const next = [...current];

      recipe.ingredients.forEach((ingredient) => {
        const label = ingredient.name.trim();
        if (!label || existingNames.has(label.toLowerCase())) return;

        next.unshift({
          id: normalizeId(),
          name: label,
          checked: false,
          category: ingredientCategoryMap[label.toLowerCase()] ?? ingredientCategoryMap[recipe.category.toLowerCase()] ?? 'Recipe',
        });
      });

      return next;
    });
  };

  const toggleItem = (id: string) => {
    setItems((current) => current.map((item) => (item.id === id ? { ...item, checked: !item.checked } : item)));
  };

  const deleteItem = (id: string) => {
    setItems((current) => current.filter((item) => item.id !== id));
  };

  const clearChecked = () => {
    setItems((current) => current.filter((item) => !item.checked));
  };

  return (
    <ShoppingListContext.Provider
      value={{
        items,
        checkedCount,
        addItem,
        addIngredientsFromRecipe,
        toggleItem,
        deleteItem,
        clearChecked,
      }}
    >
      {children}
    </ShoppingListContext.Provider>
  );
};

export const useShoppingList = () => {
  const context = useContext(ShoppingListContext);

  if (!context) {
    throw new Error('useShoppingList must be used within a ShoppingListProvider');
  }

  return context;
};
