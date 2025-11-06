/**
 * Test data helpers for E2E tests
 */

export const TestData = {
  /**
   * Generate unique email for test user
   */
  generateEmail: (prefix = "test") => {
    const timestamp = Date.now();
    return `${prefix}-${timestamp}@example.com`;
  },

  /**
   * Generate valid password
   */
  generatePassword: () => {
    return `TestPass${Date.now()}!`;
  },

  /**
   * Sample recipe data
   */
  recipes: {
    simple: {
      title: "Simple Test Recipe",
      description: "A simple recipe for testing",
      ingredients: "1 cup flour\n2 eggs\n1 cup milk",
      instructions: "Mix ingredients\nBake at 350F for 30 minutes",
    },
    detailed: {
      title: "Detailed Test Recipe",
      description: "A detailed recipe with all fields",
      ingredients: "2 cups all-purpose flour\n3 large eggs\n1.5 cups whole milk\n1/2 cup sugar\n1 tsp vanilla extract",
      instructions:
        "1. Preheat oven to 350F\n2. Mix dry ingredients\n3. Add wet ingredients\n4. Bake for 35-40 minutes\n5. Let cool before serving",
      prepTime: "20",
      cookTime: "40",
      servings: "8",
    },
    vegetarian: {
      title: "Vegetarian Recipe",
      description: "Healthy vegetarian meal",
      ingredients: "2 zucchini\n1 bell pepper\n2 tomatoes\n1 onion\nOlive oil",
      instructions: "Chop vegetables\nSauté in olive oil\nSeason to taste",
    },
    withMeat: {
      title: "Recipe with Meat",
      description: "Recipe containing meat for AI modification testing",
      ingredients: "500g chicken breast\n2 cups rice\n1 onion\n2 cloves garlic",
      instructions: "Season and cook chicken\nPrepare rice\nMix together with sautéed onions",
    },
  },

  /**
   * User preferences for onboarding
   */
  preferences: {
    vegetarian: ["vegetarian", "no-meat"],
    vegan: ["vegan", "plant-based"],
    glutenFree: ["gluten-free", "no-gluten"],
    dairyFree: ["dairy-free", "no-dairy"],
  },

  /**
   * Common allergens
   */
  allergens: ["nuts", "shellfish", "eggs", "dairy", "soy", "wheat"],

  /**
   * Wait times for various operations (in ms)
   */
  waitTimes: {
    short: 500,
    medium: 1000,
    long: 2000,
    aiModification: 30000,
  },
};

/**
 * Helper to create recipe with unique title
 */
export function createUniqueRecipe(base: (typeof TestData.recipes)[keyof typeof TestData.recipes]) {
  return {
    ...base,
    title: `${base.title} ${Date.now()}`,
  };
}

/**
 * Helper to generate test user credentials
 */
export function createTestUser() {
  return {
    email: TestData.generateEmail(),
    password: TestData.generatePassword(),
  };
}
