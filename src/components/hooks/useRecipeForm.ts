import { useState, useCallback } from "react";
import { useForm, type UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { recipeClientService } from "@/lib/services/recipe-client.service";
import { navigate } from "@/lib/navigation.service";
import type { CreateRecipeCommand } from "@/types";

// Zod schema for client-side validation
export const createRecipeFormSchema = z.object({
  title: z.string().min(1, "Title is required."),
  ingredients: z.string().min(1, "Ingredients are required."),
  instructions: z.string().min(1, "Instructions are required."),
});

export type CreateRecipeFormData = z.infer<typeof createRecipeFormSchema>;

interface UseRecipeFormReturn {
  form: UseFormReturn<CreateRecipeFormData>;
  globalError: string | null;
  isSubmitting: boolean;
  onSubmit: (data: CreateRecipeFormData) => Promise<void>;
  onReset: () => void;
}

/**
 * Custom hook for managing recipe creation form logic
 * Encapsulates form state, validation, submission, and error handling
 */
export function useRecipeForm(): UseRecipeFormReturn {
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<CreateRecipeFormData>({
    resolver: zodResolver(createRecipeFormSchema),
    mode: "onChange",
    defaultValues: {
      title: "",
      ingredients: "",
      instructions: "",
    },
  });

  const onSubmit = useCallback(
    async (data: CreateRecipeFormData) => {
      setGlobalError(null);
      setIsSubmitting(true);

      const payload: CreateRecipeCommand = {
        ...data,
        original_recipe_id: null,
      };

      try {
        const result = await recipeClientService.createRecipe(payload);

        if (!result.success) {
          if (result.fieldErrors) {
            // Handle field-specific errors from the API
            for (const fieldName in result.fieldErrors) {
              form.setError(fieldName as keyof CreateRecipeFormData, {
                type: "server",
                message: result.fieldErrors[fieldName][0], // Use first error message
              });
            }
          } else {
            setGlobalError(result.error);
          }
          setIsSubmitting(false);
          return;
        }

        // Navigate to the new recipe on success
        navigate.toRecipe(result.data.id);
      } catch {
        setGlobalError("An unexpected error occurred. Please try again.");
        setIsSubmitting(false);
      }
    },
    [form]
  );

  const onReset = useCallback(() => {
    form.reset();
    setGlobalError(null);
  }, [form]);

  return {
    form,
    globalError,
    isSubmitting,
    onSubmit,
    onReset,
  };
}
