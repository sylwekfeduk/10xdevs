import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { CreateRecipeCommand, RecipeDetailDto } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

// Zod schema for client-side validation
export const CreateRecipeFormSchema = z.object({
  title: z.string().min(1, "Title is required."),
  ingredients: z.string().min(1, "Ingredients are required."),
  instructions: z.string().min(1, "Instructions are required."),
});

// ViewModel type inferred from schema
export type CreateRecipeFormViewModel = z.infer<typeof CreateRecipeFormSchema>;

export function NewRecipeForm() {
  const [globalError, setGlobalError] = useState<string | null>(null);

  // Initialize form with react-hook-form and zod resolver
  const form = useForm<CreateRecipeFormViewModel>({
    resolver: zodResolver(CreateRecipeFormSchema),
    defaultValues: {
      title: "",
      ingredients: "",
      instructions: "",
    },
  });

  // Submit handler
  async function onSubmit(data: CreateRecipeFormViewModel) {
    setGlobalError(null);

    const payload: CreateRecipeCommand = {
      ...data,
      original_recipe_id: null,
    };

    try {
      const response = await fetch("/api/recipes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      // Handle 401 Unauthorized - session expired
      if (response.status === 401) {
        // eslint-disable-next-line react-compiler/react-compiler
        window.location.href = "/login";
        return;
      }

      // Handle 400 Bad Request - validation errors
      if (response.status === 400) {
        const errorData = await response.json();
        if (errorData.details) {
          // Handle field-specific errors from the API
          for (const fieldName in errorData.details) {
            form.setError(fieldName as keyof CreateRecipeFormViewModel, {
              type: "server",
              message: errorData.details[fieldName][0], // Use first error message
            });
          }
        } else {
          setGlobalError(errorData.message || "An error occurred.");
        }
        return;
      }

      // Handle 500+ Server Error
      if (response.status >= 500) {
        setGlobalError("An internal server error occurred. Please try again later.");
        return;
      }

      // Handle success (201 Created)
      if (response.ok) {
        const newRecipe: RecipeDetailDto = await response.json();
        window.location.href = `/recipes/${newRecipe.id}`;
        return;
      }

      // Handle any other non-ok response
      setGlobalError("An unexpected error occurred. Please try again.");
    } catch {
      setGlobalError("A network error occurred. Please check your connection.");
    }
  }

  // Reset handler
  function onReset() {
    form.reset();
    setGlobalError(null);
  }

  return (
    <div className="space-y-6">
      {globalError && (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{globalError}</AlertDescription>
        </Alert>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Title Field */}
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Input placeholder="Enter recipe title" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Ingredients Field */}
          <FormField
            control={form.control}
            name="ingredients"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Ingredients</FormLabel>
                <FormControl>
                  <Textarea placeholder="Enter ingredients (one per line)" className="min-h-32" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Instructions Field */}
          <FormField
            control={form.control}
            name="instructions"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Instructions</FormLabel>
                <FormControl>
                  <Textarea placeholder="Enter cooking instructions" className="min-h-32" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Action Buttons */}
          <div className="flex gap-4">
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? "Creating..." : "Create Recipe"}
            </Button>
            <Button type="button" variant="outline" onClick={onReset} disabled={form.formState.isSubmitting}>
              Reset
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
