import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { Button } from "./button";

describe("Button", () => {
  describe("Basic Rendering", () => {
    it("should render button with text", () => {
      // Arrange & Act
      render(<Button>Click me</Button>);

      // Assert
      expect(screen.getByRole("button", { name: /click me/i })).toBeInTheDocument();
    });

    it("should render button with children nodes", () => {
      // Arrange & Act
      render(
        <Button>
          <span>Icon</span>
          <span>Text</span>
        </Button>
      );

      // Assert
      expect(screen.getByText("Icon")).toBeInTheDocument();
      expect(screen.getByText("Text")).toBeInTheDocument();
    });

    it("should apply data-slot attribute", () => {
      // Arrange & Act
      const { container } = render(<Button>Test</Button>);

      // Assert
      const button = container.querySelector("button");
      expect(button).toHaveAttribute("data-slot", "button");
    });
  });

  describe("Click Handling", () => {
    it("should handle click events", async () => {
      // Arrange
      const user = userEvent.setup();
      const handleClick = vi.fn();

      render(<Button onClick={handleClick}>Click me</Button>);

      // Act
      const button = screen.getByRole("button", { name: /click me/i });
      await user.click(button);

      // Assert
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it("should not call onClick when disabled", async () => {
      // Arrange
      const user = userEvent.setup();
      const handleClick = vi.fn();

      render(
        <Button disabled onClick={handleClick}>
          Click me
        </Button>
      );

      // Act
      const button = screen.getByRole("button", { name: /click me/i });
      await user.click(button);

      // Assert
      expect(handleClick).not.toHaveBeenCalled();
    });

    it("should handle multiple clicks", async () => {
      // Arrange
      const user = userEvent.setup();
      const handleClick = vi.fn();

      render(<Button onClick={handleClick}>Click me</Button>);

      // Act
      const button = screen.getByRole("button", { name: /click me/i });
      await user.click(button);
      await user.click(button);
      await user.click(button);

      // Assert
      expect(handleClick).toHaveBeenCalledTimes(3);
    });
  });

  describe("Disabled State", () => {
    it("should be disabled when disabled prop is true", () => {
      // Arrange & Act
      render(<Button disabled>Disabled</Button>);

      // Assert
      const button = screen.getByRole("button", { name: /disabled/i });
      expect(button).toBeDisabled();
    });

    it("should apply disabled opacity styles", () => {
      // Arrange & Act
      const { container } = render(<Button disabled>Disabled</Button>);

      // Assert
      const button = container.querySelector("button");
      expect(button?.className).toContain("disabled:opacity-50");
    });

    it("should apply disabled pointer-events-none", () => {
      // Arrange & Act
      const { container } = render(<Button disabled>Disabled</Button>);

      // Assert
      const button = container.querySelector("button");
      expect(button?.className).toContain("disabled:pointer-events-none");
    });
  });

  describe("Variants", () => {
    it("should apply default variant by default", () => {
      // Arrange & Act
      const { container } = render(<Button>Default</Button>);

      // Assert
      const button = container.querySelector("button");
      expect(button?.className).toContain("bg-primary");
      expect(button?.className).toContain("text-primary-foreground");
    });

    it("should apply destructive variant classes", () => {
      // Arrange & Act
      const { container } = render(<Button variant="destructive">Delete</Button>);

      // Assert
      const button = container.querySelector("button");
      expect(button?.className).toContain("bg-destructive");
      expect(button?.className).toContain("text-white");
    });

    it("should apply outline variant classes", () => {
      // Arrange & Act
      const { container } = render(<Button variant="outline">Outline</Button>);

      // Assert
      const button = container.querySelector("button");
      expect(button?.className).toContain("border");
      expect(button?.className).toContain("bg-background");
    });

    it("should apply secondary variant classes", () => {
      // Arrange & Act
      const { container } = render(<Button variant="secondary">Secondary</Button>);

      // Assert
      const button = container.querySelector("button");
      expect(button?.className).toContain("bg-secondary");
      expect(button?.className).toContain("text-secondary-foreground");
    });

    it("should apply ghost variant classes", () => {
      // Arrange & Act
      const { container } = render(<Button variant="ghost">Ghost</Button>);

      // Assert
      const button = container.querySelector("button");
      expect(button?.className).toContain("hover:bg-accent");
    });

    it("should apply link variant classes", () => {
      // Arrange & Act
      const { container } = render(<Button variant="link">Link</Button>);

      // Assert
      const button = container.querySelector("button");
      expect(button?.className).toContain("text-primary");
      expect(button?.className).toContain("underline-offset-4");
    });
  });

  describe("Sizes", () => {
    it("should apply default size by default", () => {
      // Arrange & Act
      const { container } = render(<Button>Default Size</Button>);

      // Assert
      const button = container.querySelector("button");
      expect(button?.className).toContain("h-9");
      expect(button?.className).toContain("px-4");
      expect(button?.className).toContain("py-2");
    });

    it("should apply small size classes", () => {
      // Arrange & Act
      const { container } = render(<Button size="sm">Small</Button>);

      // Assert
      const button = container.querySelector("button");
      expect(button?.className).toContain("h-8");
      expect(button?.className).toContain("px-3");
    });

    it("should apply large size classes", () => {
      // Arrange & Act
      const { container } = render(<Button size="lg">Large</Button>);

      // Assert
      const button = container.querySelector("button");
      expect(button?.className).toContain("h-10");
      expect(button?.className).toContain("px-6");
    });

    it("should apply icon size classes", () => {
      // Arrange & Act
      const { container } = render(<Button size="icon">🔍</Button>);

      // Assert
      const button = container.querySelector("button");
      expect(button?.className).toContain("size-9");
    });

    it("should apply icon-sm size classes", () => {
      // Arrange & Act
      const { container } = render(<Button size="icon-sm">🔍</Button>);

      // Assert
      const button = container.querySelector("button");
      expect(button?.className).toContain("size-8");
    });

    it("should apply icon-lg size classes", () => {
      // Arrange & Act
      const { container } = render(<Button size="icon-lg">🔍</Button>);

      // Assert
      const button = container.querySelector("button");
      expect(button?.className).toContain("size-10");
    });
  });

  describe("Variant and Size Combinations", () => {
    it("should apply both variant and size classes", () => {
      // Arrange & Act
      const { container } = render(
        <Button variant="destructive" size="lg">
          Delete Large
        </Button>
      );

      // Assert
      const button = container.querySelector("button");
      expect(button?.className).toContain("bg-destructive");
      expect(button?.className).toContain("h-10");
      expect(button?.className).toContain("px-6");
    });

    it("should work with outline variant and small size", () => {
      // Arrange & Act
      const { container } = render(
        <Button variant="outline" size="sm">
          Small Outline
        </Button>
      );

      // Assert
      const button = container.querySelector("button");
      expect(button?.className).toContain("border");
      expect(button?.className).toContain("h-8");
    });

    it("should work with ghost variant and icon size", () => {
      // Arrange & Act
      const { container } = render(
        <Button variant="ghost" size="icon">
          ✕
        </Button>
      );

      // Assert
      const button = container.querySelector("button");
      expect(button?.className).toContain("hover:bg-accent");
      expect(button?.className).toContain("size-9");
    });
  });

  describe("Custom ClassName", () => {
    it("should merge custom className with button styles", () => {
      // Arrange & Act
      const { container } = render(<Button className="custom-class">Custom</Button>);

      // Assert
      const button = container.querySelector("button");
      expect(button?.className).toContain("custom-class");
      expect(button?.className).toContain("inline-flex");
    });

    it("should allow Tailwind class overrides via custom className", () => {
      // Arrange & Act
      const { container } = render(<Button className="bg-blue-500">Override</Button>);

      // Assert
      const button = container.querySelector("button");
      // twMerge should keep the last bg-* class
      expect(button?.className).toContain("bg-blue-500");
    });
  });

  describe("asChild Prop (Polymorphism)", () => {
    it("should render as child component when asChild is true", () => {
      // Arrange & Act
      const { container } = render(
        <Button asChild>
          <a href="/test">Link Button</a>
        </Button>
      );

      // Assert
      const link = container.querySelector("a");
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute("href", "/test");
      expect(link?.textContent).toBe("Link Button");
    });

    it("should apply button styles to child element with asChild", () => {
      // Arrange & Act
      const { container } = render(
        <Button asChild variant="destructive">
          <a href="/delete">Delete Link</a>
        </Button>
      );

      // Assert
      const link = container.querySelector("a");
      expect(link?.className).toContain("inline-flex");
      expect(link?.className).toContain("bg-destructive");
      expect(link).toHaveAttribute("data-slot", "button");
    });

    it("should work with asChild and custom components", () => {
      // Arrange
      const CustomLink = ({
        children,
        ...props
      }: React.AnchorHTMLAttributes<HTMLAnchorElement> & { children: React.ReactNode }) => (
        <a {...props} data-custom="true">
          {children}
        </a>
      );

      // Act
      const { container } = render(
        <Button asChild>
          <CustomLink href="/custom">Custom Component</CustomLink>
        </Button>
      );

      // Assert
      const link = container.querySelector("a");
      expect(link).toHaveAttribute("data-custom", "true");
      expect(link?.className).toContain("inline-flex");
    });

    it("should not render button element when asChild is true", () => {
      // Arrange & Act
      const { container } = render(
        <Button asChild>
          <a href="/test">Link</a>
        </Button>
      );

      // Assert
      const button = container.querySelector("button");
      const link = container.querySelector("a");
      expect(button).not.toBeInTheDocument();
      expect(link).toBeInTheDocument();
    });
  });

  describe("Additional HTML Attributes", () => {
    it("should pass through additional props", () => {
      // Arrange & Act
      const { container } = render(
        <Button type="submit" name="submitButton" value="submit">
          Submit
        </Button>
      );

      // Assert
      const button = container.querySelector("button");
      expect(button).toHaveAttribute("type", "submit");
      expect(button).toHaveAttribute("name", "submitButton");
      expect(button).toHaveAttribute("value", "submit");
    });

    it("should support aria attributes", () => {
      // Arrange & Act
      const { container } = render(
        <Button aria-label="Close dialog" aria-pressed="true">
          ✕
        </Button>
      );

      // Assert
      const button = container.querySelector("button");
      expect(button).toHaveAttribute("aria-label", "Close dialog");
      expect(button).toHaveAttribute("aria-pressed", "true");
    });

    it("should support data attributes", () => {
      // Arrange & Act
      render(<Button data-testid="custom-button">Test</Button>);

      // Assert
      expect(screen.getByTestId("custom-button")).toBeInTheDocument();
    });
  });

  describe("Focus and Keyboard Navigation", () => {
    it("should be focusable by default", () => {
      // Arrange & Act
      render(<Button>Focusable</Button>);

      // Assert
      const button = screen.getByRole("button", { name: /focusable/i });
      button.focus();
      expect(button).toHaveFocus();
    });

    it("should not be focusable when disabled", () => {
      // Arrange & Act
      render(<Button disabled>Not Focusable</Button>);

      // Assert
      const button = screen.getByRole("button", { name: /not focusable/i });
      button.focus();
      expect(button).not.toHaveFocus();
    });

    it("should apply focus-visible ring styles", () => {
      // Arrange & Act
      const { container } = render(<Button>Focus Test</Button>);

      // Assert
      const button = container.querySelector("button");
      expect(button?.className).toContain("focus-visible:ring-ring");
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty children", () => {
      // Arrange & Act
      const { container } = render(<Button></Button>);

      // Assert
      const button = container.querySelector("button");
      expect(button).toBeInTheDocument();
      expect(button?.textContent).toBe("");
    });

    it("should handle null children gracefully", () => {
      // Arrange & Act
      expect(() => {
        render(<Button>{null}</Button>);
      }).not.toThrow();
    });

    it("should handle undefined variant (uses default)", () => {
      // Arrange & Act
      const { container } = render(<Button variant={undefined}>Test</Button>);

      // Assert
      const button = container.querySelector("button");
      expect(button?.className).toContain("bg-primary");
    });

    it("should re-render correctly when props change", () => {
      // Arrange
      const { rerender, container } = render(<Button>Initial</Button>);

      // Act - Change to disabled
      rerender(<Button disabled>Updated</Button>);

      // Assert
      const button = container.querySelector("button");
      expect(button).toBeDisabled();
      expect(button?.textContent).toBe("Updated");
    });
  });
});
