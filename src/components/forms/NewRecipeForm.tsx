import { useRecipeForm } from "@/components/hooks/useRecipeForm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent } from "@/components/ui/card";

interface NewRecipeFormProps {
  translations?: {
    formTitle: string;
    formTitlePlaceholder: string;
    formIngredients: string;
    formIngredientsPlaceholder: string;
    formInstructions: string;
    formInstructionsPlaceholder: string;
    createRecipe: string;
    creating: string;
    reset: string;
    error: string;
  };
}

export function NewRecipeForm({ translations }: NewRecipeFormProps = {}) {
  const { form, globalError, onSubmit, onReset } = useRecipeForm();

  return (
    <Card className="bg-white/95 backdrop-blur-sm shadow-md border-0">
      <CardContent className="pt-6">
        {globalError && (
          <Alert variant="destructive" className="mb-6">
            <AlertTitle>{translations?.error || "Error"}</AlertTitle>
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
                  <FormLabel>{translations?.formTitle || "Title"}</FormLabel>
                  <FormControl>
                    <Input placeholder={translations?.formTitlePlaceholder || "Enter recipe title"} {...field} />
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
                  <FormLabel>{translations?.formIngredients || "Ingredients"}</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={translations?.formIngredientsPlaceholder || "Enter ingredients (one per line)"}
                      className="min-h-32"
                      {...field}
                    />
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
                  <FormLabel>{translations?.formInstructions || "Instructions"}</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={translations?.formInstructionsPlaceholder || "Enter cooking instructions"}
                      className="min-h-32"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Action Buttons */}
            <div className="flex gap-4">
              <Button
                type="submit"
                disabled={form.formState.isSubmitting || !form.formState.isValid}
                className="bg-[#3F8C4F] hover:bg-[#234a3d] text-white font-medium"
              >
                {form.formState.isSubmitting
                  ? translations?.creating || "Creating..."
                  : translations?.createRecipe || "Create Recipe"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={onReset}
                disabled={form.formState.isSubmitting}
                className="border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                {translations?.reset || "Reset"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
