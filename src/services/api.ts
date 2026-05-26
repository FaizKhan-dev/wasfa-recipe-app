import { Recipe } from '../data/mockData';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

export type RecipePayload = Omit<Recipe, 'id'>;
export type RecipePatch = Partial<RecipePayload>;

type ApiRecipe = Recipe & { id: string | number };

const DEFAULT_PORT = 3000;

const getExpoHostName = () => {
  const hostUri = Constants.expoConfig?.hostUri?.trim();

  if (!hostUri) {
    return null;
  }

  const hostMatch = hostUri.match(/^(?:.*\/\/)?([^:/]+)(?::\d+)?/);
  return hostMatch?.[1]?.trim() ?? null;
};

const resolveApiBaseUrl = () => {
  const override = process.env.EXPO_PUBLIC_API_BASE_URL?.trim();
  if (override) {
    return override.replace(/\/$/, '');
  }

  if (Platform.OS === 'web') {
    return `http://localhost:${DEFAULT_PORT}`;
  }

  const host = getExpoHostName();

  if (host) {
    if (['localhost', '127.0.0.1', '::1'].includes(host) && Platform.OS === 'android') {
      return `http://10.0.2.2:${DEFAULT_PORT}`;
    }

    return `http://${host}:${DEFAULT_PORT}`;
  }

  if (Platform.OS === 'android') {
    return `http://10.0.2.2:${DEFAULT_PORT}`;
  }

  return `http://localhost:${DEFAULT_PORT}`;
};

const API_BASE_URL = resolveApiBaseUrl();

// If you test on a physical device and auto-resolution does not work,
// set EXPO_PUBLIC_API_BASE_URL to http://<your-computer-ip>:3000.
const RECIPES_ENDPOINT = `${API_BASE_URL}/recipes`;

const normalizeRecipe = (recipe: ApiRecipe): Recipe => ({
  ...recipe,
  id: String(recipe.id),
});

async function request<T>(url: string, init: RequestInit = {}): Promise<T> {
  let response: Response;

  try {
    response = await fetch(url, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        ...(init.headers ?? {}),
      },
    });
  } catch (cause) {
    const detail = cause instanceof Error ? cause.message : 'Network request failed';
    throw new Error(`${init.method ?? 'GET'} ${url} failed: ${detail}`);
  }

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`${init.method ?? 'GET'} ${url} failed with status ${response.status}${errorText ? `: ${errorText}` : ''}`);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const responseText = await response.text();
  if (!responseText) {
    return undefined as T;
  }

  try {
    return JSON.parse(responseText) as T;
  } catch {
    return responseText as T;
  }
}

export async function getRecipes(): Promise<Recipe[]> {
  const recipes = await request<ApiRecipe[]>(RECIPES_ENDPOINT);
  return recipes.map(normalizeRecipe);
}

export async function createRecipe(recipe: RecipePayload): Promise<Recipe> {
  const created = await request<ApiRecipe>(RECIPES_ENDPOINT, {
    method: 'POST',
    body: JSON.stringify(recipe),
  });

  return normalizeRecipe(created);
}

export async function updateRecipe(recipeId: string, patch: RecipePatch): Promise<Recipe> {
  const updated = await request<ApiRecipe>(`${RECIPES_ENDPOINT}/${recipeId}`, {
    method: 'PATCH',
    body: JSON.stringify(patch),
  });

  return normalizeRecipe(updated);
}

export async function deleteRecipe(recipeId: string): Promise<void> {
  await request<void>(`${RECIPES_ENDPOINT}/${recipeId}`, {
    method: 'DELETE',
  });
}

export { API_BASE_URL, RECIPES_ENDPOINT };
