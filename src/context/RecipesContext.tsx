import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { recipes as seedRecipes, Recipe } from '../data/mockData';
import {
  createRecipe as apiCreateRecipe,
  deleteRecipe as apiDeleteRecipe,
  getRecipes as apiGetRecipes,
  RECIPES_ENDPOINT,
  RecipePatch,
  RecipePayload,
  updateRecipe as apiUpdateRecipe,
} from '../services/api';

const RECIPES_STORAGE_KEY = 'wasfa-recipes-cache';
let memoryRecipesCache: Recipe[] | null = null;
const HAS_REMOTE_API = Boolean(process.env.EXPO_PUBLIC_API_BASE_URL?.trim());

type SyncStatus = 'loading' | 'online' | 'offline';

type RecipesContextValue = {
  recipes: Recipe[];
  loading: boolean;
  error: string | null;
  syncStatus: SyncStatus;
  syncMessage: string | null;
  refreshRecipes: () => Promise<void>;
  createRecipe: (recipe: RecipePayload) => Promise<Recipe>;
  updateRecipe: (recipeId: string, patch: RecipePatch) => Promise<Recipe>;
  deleteRecipe: (recipeId: string) => Promise<void>;
  getRecipeById: (recipeId: string) => Recipe | undefined;
};

const RecipesContext = createContext<RecipesContextValue | null>(null);

export const RecipesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [recipes, setRecipes] = useState<Recipe[]>(seedRecipes);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('loading');
  const [syncMessage, setSyncMessage] = useState<string | null>(null);

  const saveLocalRecipes = useCallback(async (nextRecipes: Recipe[]) => {
    setRecipes(nextRecipes);
    memoryRecipesCache = nextRecipes;

    try {
      await AsyncStorage.setItem(RECIPES_STORAGE_KEY, JSON.stringify(nextRecipes));
    } catch {
      // Keep working even when persistent browser/device storage is unavailable.
    }
  }, []);

  const loadLocalRecipes = useCallback(async () => {
    if (memoryRecipesCache?.length) {
      return memoryRecipesCache;
    }

    const cached = await AsyncStorage.getItem(RECIPES_STORAGE_KEY);

    if (!cached) {
      return seedRecipes;
    }

    try {
      const parsed = JSON.parse(cached) as Recipe[];
      return Array.isArray(parsed) && parsed.length > 0 ? parsed : seedRecipes;
    } catch {
      return seedRecipes;
    }
  }, []);

  const useOfflineFallback = useCallback(async (message: string) => {
    const localRecipes = await loadLocalRecipes();
    setRecipes(localRecipes);
    memoryRecipesCache = localRecipes;
    setSyncStatus('offline');
    setSyncMessage(message);
    setError(null);
    return localRecipes;
  }, [loadLocalRecipes]);

  const refreshRecipes = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const localRecipes = await loadLocalRecipes();
      setRecipes(localRecipes);
      memoryRecipesCache = localRecipes;

      if (!HAS_REMOTE_API) {
        setSyncStatus('offline');
        setSyncMessage('Set EXPO_PUBLIC_API_BASE_URL to enable JSON Server sync.');
        return;
      }

      const apiRecipes = await apiGetRecipes();
      await saveLocalRecipes(apiRecipes);
      setSyncStatus('online');
      setSyncMessage('Connected to JSON Server.');
      setError(null);
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : 'Unable to load recipes from local storage.';
      await useOfflineFallback(`Using device storage. ${message}`);
    } finally {
      setLoading(false);
    }
  }, [loadLocalRecipes, saveLocalRecipes, useOfflineFallback]);

  useEffect(() => {
    void refreshRecipes();
  }, [refreshRecipes]);

  const createRecipe = useCallback(async (recipe: RecipePayload) => {
    if (!HAS_REMOTE_API) {
      const localCreated: Recipe = {
        ...recipe,
        id: `local-${Date.now()}`,
      };
      const nextRecipes = [localCreated, ...recipes];
      await saveLocalRecipes(nextRecipes);
      setSyncStatus('offline');
      setSyncMessage('Saved on this device. Set EXPO_PUBLIC_API_BASE_URL to sync with JSON Server.');
      setError(null);
      return localCreated;
    }

    try {
      const created = await apiCreateRecipe(recipe);
      const nextRecipes = [created, ...recipes];
      await saveLocalRecipes(nextRecipes);
      setSyncStatus('online');
      setSyncMessage('Connected to JSON Server.');
      setError(null);
      return created;
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : 'Unable to create recipe on the API.';
      const localCreated: Recipe = {
        ...recipe,
        id: `local-${Date.now()}`,
      };
      const nextRecipes = [localCreated, ...recipes];
      await saveLocalRecipes(nextRecipes);
      setSyncStatus('offline');
      setSyncMessage(`POST ${RECIPES_ENDPOINT} failed: ${message}. Saved on this device instead.`);
      setError(null);
      return localCreated;
    }
  }, [recipes, saveLocalRecipes]);

  const updateRecipe = useCallback(async (recipeId: string, patch: RecipePatch) => {
    if (!HAS_REMOTE_API) {
      const fallbackRecipe = recipes.find((recipe) => recipe.id === recipeId);

      if (!fallbackRecipe) {
        throw new Error('Recipe not found locally.');
      }

      const updated: Recipe = { ...fallbackRecipe, ...patch, id: recipeId };
      const nextRecipes = recipes.map((recipe) => (recipe.id === recipeId ? updated : recipe));
      await saveLocalRecipes(nextRecipes);
      setSyncStatus('offline');
      setSyncMessage('Updated on this device. Set EXPO_PUBLIC_API_BASE_URL to sync with JSON Server.');
      setError(null);
      return updated;
    }

    try {
      const updated = await apiUpdateRecipe(recipeId, patch);
      const nextRecipes = recipes.map((recipe) => (recipe.id === recipeId ? updated : recipe));
      await saveLocalRecipes(nextRecipes);
      setSyncStatus('online');
      setSyncMessage('Connected to JSON Server.');
      setError(null);
      return updated;
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : 'Unable to update recipe on the API.';
      const fallbackRecipe = recipes.find((recipe) => recipe.id === recipeId);

      if (!fallbackRecipe) {
        throw new Error('Recipe not found locally.');
      }

      const updated: Recipe = { ...fallbackRecipe, ...patch, id: recipeId };
      const nextRecipes = recipes.map((recipe) => (recipe.id === recipeId ? updated : recipe));
      await saveLocalRecipes(nextRecipes);
      setSyncStatus('offline');
      setSyncMessage(`PATCH ${RECIPES_ENDPOINT}/${recipeId} failed: ${message}. Saved on this device instead.`);
      setError(null);
      return updated;
    }
  }, [recipes, saveLocalRecipes]);

  const deleteRecipe = useCallback(async (recipeId: string) => {
    if (!HAS_REMOTE_API) {
      const nextRecipes = recipes.filter((recipe) => recipe.id !== recipeId);
      await saveLocalRecipes(nextRecipes);
      setSyncStatus('offline');
      setSyncMessage('Deleted from this device. Set EXPO_PUBLIC_API_BASE_URL to sync with JSON Server.');
      setError(null);
      return;
    }

    try {
      await apiDeleteRecipe(recipeId);
      const nextRecipes = recipes.filter((recipe) => recipe.id !== recipeId);
      await saveLocalRecipes(nextRecipes);
      setSyncStatus('online');
      setSyncMessage('Connected to JSON Server.');
      setError(null);
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : 'Unable to delete recipe on the API.';
      const nextRecipes = recipes.filter((recipe) => recipe.id !== recipeId);
      await saveLocalRecipes(nextRecipes);
      setSyncStatus('offline');
      setSyncMessage(`DELETE ${RECIPES_ENDPOINT}/${recipeId} failed: ${message}. Deleted from this device instead.`);
      setError(null);
    }
  }, [recipes, saveLocalRecipes]);

  const getRecipeById = useCallback(
    (recipeId: string) => recipes.find((recipe) => recipe.id === recipeId),
    [recipes],
  );

  const value = useMemo(
    () => ({
      recipes,
      loading,
      error,
      syncStatus,
      syncMessage,
      refreshRecipes,
      createRecipe,
      updateRecipe,
      deleteRecipe,
      getRecipeById,
    }),
    [recipes, loading, error, syncStatus, syncMessage, refreshRecipes, createRecipe, updateRecipe, deleteRecipe, getRecipeById],
  );

  return <RecipesContext.Provider value={value}>{children}</RecipesContext.Provider>;
};

export const useRecipes = () => {
  const context = useContext(RecipesContext);

  if (!context) {
    throw new Error('useRecipes must be used within a RecipesProvider');
  }

  return context;
};
