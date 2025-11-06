import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

interface AuthFormLayoutProps {
  title: string;
  description: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

/**
 * Shared layout component for authentication forms
 * Provides consistent card-based layout with header, content, and footer
 */
export function AuthFormLayout({ title, description, children, footer }: AuthFormLayoutProps) {
  return (
    <Card className="bg-white shadow-2xl border-0">
      <CardHeader className="space-y-2 px-8 pt-8">
        <CardTitle className="text-2xl font-bold text-gray-900">{title}</CardTitle>
        <CardDescription className="text-gray-600">{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 px-8 pb-6">{children}</CardContent>
      {footer && <CardFooter className="flex justify-center pb-8 px-8">{footer}</CardFooter>}
    </Card>
  );
}
