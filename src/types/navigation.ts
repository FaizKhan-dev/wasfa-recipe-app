import { NavigatorScreenParams } from '@react-navigation/native';

export type TabParamList = {
  Home: undefined;
  Saved: undefined;
  List: undefined;
  Profile: undefined;
};

export type RootStackParamList = {
  MainTabs: NavigatorScreenParams<TabParamList> | undefined;
  ManageRecipes: undefined;
  RecipeDetail: { recipeId: string };
  Search: undefined;
};