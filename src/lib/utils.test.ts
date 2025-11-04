import { describe, it, expect } from "vitest";
import { cn } from "./utils";

describe("utils", () => {
  describe("cn - Basic Functionality", () => {
    it("should merge class names correctly", () => {
      // Arrange & Act
      const result = cn("text-red-500", "bg-blue-500");

      // Assert
      expect(result).toBe("text-red-500 bg-blue-500");
    });

    it("should handle single class name", () => {
      // Arrange & Act
      const result = cn("single-class");

      // Assert
      expect(result).toBe("single-class");
    });

    it("should handle multiple class names", () => {
      // Arrange & Act
      const result = cn("class-1", "class-2", "class-3", "class-4");

      // Assert
      expect(result).toBe("class-1 class-2 class-3 class-4");
    });

    it("should handle empty string", () => {
      // Arrange & Act
      const result = cn("");

      // Assert
      expect(result).toBe("");
    });

    it("should handle no arguments", () => {
      // Arrange & Act
      const result = cn();

      // Assert
      expect(result).toBe("");
    });
  });

  describe("cn - Conditional Classes", () => {
    it("should handle conditional classes with logical AND", () => {
      // Arrange & Act
      const result = cn("base-class", false && "hidden", true && "visible");

      // Assert
      expect(result).toBe("base-class visible");
    });

    it("should handle conditional classes with ternary operator", () => {
      // Arrange & Act
      const isActive = true;
      const result = cn("base", isActive ? "active" : "inactive");

      // Assert
      expect(result).toBe("base active");
    });

    it("should filter out false, null, and undefined values", () => {
      // Arrange & Act
      const result = cn("base", false, null, undefined, "other");

      // Assert
      expect(result).toBe("base other");
    });

    it("should handle complex conditional logic", () => {
      // Arrange
      const isDisabled = true;
      const isLoading = false;
      const variant = "primary";

      // Act
      const result = cn(
        "button",
        isDisabled && "opacity-50",
        isLoading && "cursor-wait",
        variant === "primary" && "bg-blue-500"
      );

      // Assert
      expect(result).toBe("button opacity-50 bg-blue-500");
    });
  });

  describe("cn - Tailwind Conflict Resolution", () => {
    it("should resolve padding conflicts (last wins)", () => {
      // Arrange & Act
      const result = cn("p-4", "p-8");

      // Assert
      expect(result).toBe("p-8");
    });

    it("should resolve margin conflicts", () => {
      // Arrange & Act
      const result = cn("m-2", "m-4", "m-6");

      // Assert
      expect(result).toBe("m-6");
    });

    it("should resolve background color conflicts", () => {
      // Arrange & Act
      const result = cn("bg-red-500", "bg-blue-500");

      // Assert
      expect(result).toBe("bg-blue-500");
    });

    it("should resolve text color conflicts", () => {
      // Arrange & Act
      const result = cn("text-gray-500", "text-black");

      // Assert
      expect(result).toBe("text-black");
    });

    it("should keep non-conflicting classes", () => {
      // Arrange & Act
      const result = cn("p-4", "bg-blue-500", "p-8", "text-white");

      // Assert
      expect(result).toBe("bg-blue-500 p-8 text-white");
    });

    it("should resolve complex spacing conflicts", () => {
      // Arrange & Act
      const result = cn("px-4 py-2", "px-6", "py-4");

      // Assert
      // px-6 should override px-4, py-4 should override py-2
      expect(result).toBe("px-6 py-4");
    });

    it("should resolve width conflicts", () => {
      // Arrange & Act
      const result = cn("w-full", "w-1/2", "w-64");

      // Assert
      expect(result).toBe("w-64");
    });

    it("should resolve height conflicts", () => {
      // Arrange & Act
      const result = cn("h-screen", "h-full", "h-auto");

      // Assert
      expect(result).toBe("h-auto");
    });
  });

  describe("cn - Arrays and Objects", () => {
    it("should handle arrays of classes", () => {
      // Arrange & Act
      const result = cn(["text-red-500", "bg-blue-500"], "p-4");

      // Assert
      expect(result).toBe("text-red-500 bg-blue-500 p-4");
    });

    it("should handle nested arrays", () => {
      // Arrange & Act
      const result = cn(["text-red-500", ["bg-blue-500", "p-4"]], "m-2");

      // Assert
      expect(result).toBe("text-red-500 bg-blue-500 p-4 m-2");
    });

    it("should handle objects with boolean values", () => {
      // Arrange & Act
      const result = cn({
        "text-red-500": true,
        "bg-blue-500": false,
        "p-4": true,
        "m-2": false,
      });

      // Assert
      expect(result).toBe("text-red-500 p-4");
    });

    it("should handle mixed arrays and strings", () => {
      // Arrange & Act
      const result = cn("base", ["modifier-1", "modifier-2"], "final");

      // Assert
      expect(result).toBe("base modifier-1 modifier-2 final");
    });

    it("should handle objects and arrays together", () => {
      // Arrange & Act
      const result = cn(
        "base",
        ["array-1", "array-2"],
        {
          "object-true": true,
          "object-false": false,
        },
        "final"
      );

      // Assert
      expect(result).toBe("base array-1 array-2 object-true final");
    });
  });

  describe("cn - Edge Cases", () => {
    it("should handle undefined values", () => {
      // Arrange & Act
      const result = cn("base", undefined, "other");

      // Assert
      expect(result).toBe("base other");
    });

    it("should handle null values", () => {
      // Arrange & Act
      const result = cn("base", null, "other");

      // Assert
      expect(result).toBe("base other");
    });

    it("should handle empty strings", () => {
      // Arrange & Act
      const result = cn("", "base", "", "other", "");

      // Assert
      expect(result).toBe("base other");
    });

    it("should handle whitespace", () => {
      // Arrange & Act
      const result = cn("base", "  ", "other");

      // Assert
      expect(result).toBe("base other");
    });

    it("should handle multiple spaces in class names", () => {
      // Arrange & Act
      const result = cn("base  extra-space", "other");

      // Assert
      // Should normalize spaces
      expect(result).toContain("base");
      expect(result).toContain("extra-space");
      expect(result).toContain("other");
    });

    it("should handle all falsy values", () => {
      // Arrange & Act
      const result = cn(false, null, undefined, 0, "", NaN, "actual-class");

      // Assert
      expect(result).toBe("actual-class");
    });

    it("should handle number 0 (falsy)", () => {
      // Arrange & Act
      const result = cn("base", 0, "other");

      // Assert
      expect(result).toBe("base other");
    });

    it("should handle empty array", () => {
      // Arrange & Act
      const result = cn([], "base", "other");

      // Assert
      expect(result).toBe("base other");
    });

    it("should handle empty object", () => {
      // Arrange & Act
      const result = cn({}, "base", "other");

      // Assert
      expect(result).toBe("base other");
    });
  });

  describe("cn - Real-World Usage Patterns", () => {
    it("should work with component variant pattern", () => {
      // Arrange
      const variant = "primary";
      const size = "lg";
      const disabled = false;

      // Act
      const result = cn(
        "button",
        variant === "primary" && "bg-blue-500 text-white",
        variant === "secondary" && "bg-gray-200 text-gray-800",
        size === "sm" && "px-2 py-1",
        size === "lg" && "px-6 py-3",
        disabled && "opacity-50 cursor-not-allowed"
      );

      // Assert
      expect(result).toBe("button bg-blue-500 text-white px-6 py-3");
    });

    it("should work with state-based classes", () => {
      // Arrange
      const isActive = true;
      const isHovered = false;
      const isDisabled = false;

      // Act
      const result = cn(
        "base-class",
        isActive && "bg-blue-500",
        isHovered && "bg-blue-600",
        isDisabled && "opacity-50"
      );

      // Assert
      expect(result).toBe("base-class bg-blue-500");
    });

    it("should work with responsive classes and variants", () => {
      // Arrange & Act
      const result = cn("w-full", "sm:w-1/2", "md:w-1/3", "lg:w-1/4", "p-4", "hover:bg-gray-100", "focus:ring-2");

      // Assert
      expect(result).toContain("w-full");
      expect(result).toContain("sm:w-1/2");
      expect(result).toContain("md:w-1/3");
      expect(result).toContain("lg:w-1/4");
      expect(result).toContain("p-4");
      expect(result).toContain("hover:bg-gray-100");
      expect(result).toContain("focus:ring-2");
    });

    it("should override base classes with custom className", () => {
      // Arrange - Simulating component with default classes and custom override
      const baseClasses = "p-4 bg-blue-500 text-white";
      const customClassName = "bg-red-500 text-black";

      // Act
      const result = cn(baseClasses, customClassName);

      // Assert
      expect(result).toBe("p-4 bg-red-500 text-black");
    });

    it("should work with dark mode variants", () => {
      // Arrange & Act
      const result = cn("bg-white text-black", "dark:bg-gray-900 dark:text-white", "p-4");

      // Assert
      expect(result).toContain("bg-white");
      expect(result).toContain("text-black");
      expect(result).toContain("dark:bg-gray-900");
      expect(result).toContain("dark:text-white");
      expect(result).toContain("p-4");
    });

    it("should handle utility-first composition pattern", () => {
      // Arrange - Common pattern: base styles + conditional modifiers
      const baseStyles = "flex items-center justify-between";
      const spacing = "gap-4 p-6";
      const colors = "bg-white border border-gray-200";
      const isLoading = false;
      const hasError = false;

      // Act
      const result = cn(
        baseStyles,
        spacing,
        colors,
        isLoading && "opacity-50 pointer-events-none",
        hasError && "border-red-500 bg-red-50"
      );

      // Assert
      expect(result).toBe("flex items-center justify-between gap-4 p-6 bg-white border border-gray-200");
    });
  });

  describe("cn - Performance and Type Safety", () => {
    it("should handle large number of arguments efficiently", () => {
      // Arrange
      const classes = Array.from({ length: 100 }, (_, i) => `class-${i}`);

      // Act
      const result = cn(...classes);

      // Assert
      expect(result).toContain("class-0");
      expect(result).toContain("class-50");
      expect(result).toContain("class-99");
    });

    it("should return string type", () => {
      // Arrange & Act
      const result = cn("test-class");

      // Assert
      expect(typeof result).toBe("string");
    });

    it("should be deterministic (same input = same output)", () => {
      // Arrange
      const input = ["base", "modifier", "p-4", "text-red-500"];

      // Act
      const result1 = cn(...input);
      const result2 = cn(...input);

      // Assert
      expect(result1).toBe(result2);
    });

    it("should handle special characters in class names", () => {
      // Arrange & Act
      const result = cn("w-[123px]", "h-[calc(100vh-64px)]", "top-1/2");

      // Assert
      expect(result).toContain("w-[123px]");
      expect(result).toContain("h-[calc(100vh-64px)]");
      expect(result).toContain("top-1/2");
    });
  });
});
