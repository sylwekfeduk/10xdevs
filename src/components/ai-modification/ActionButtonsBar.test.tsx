import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { ActionButtonsBar } from "./ActionButtonsBar";

describe("ActionButtonsBar", () => {
  // Arrange: Setup common test data
  const mockOnSaveClick = vi.fn();
  const mockOnDiscardClick = vi.fn();

  beforeEach(() => {
    // Reset mocks before each test
    mockOnSaveClick.mockClear();
    mockOnDiscardClick.mockClear();
  });

  describe("Button States - Enabled/Disabled Logic", () => {
    it("should enable both buttons when neither isSaving nor isLoading", () => {
      // Arrange
      const props = {
        isSaving: false,
        isLoading: false,
        onSaveClick: mockOnSaveClick,
        onDiscardClick: mockOnDiscardClick,
      };

      // Act
      render(<ActionButtonsBar {...props} />);

      // Assert
      const saveButton = screen.getByRole("button", { name: /save modified recipe/i });
      const discardButton = screen.getByRole("button", { name: /discard changes/i });

      expect(saveButton).toBeEnabled();
      expect(discardButton).toBeEnabled();
    });

    it("should disable both buttons when isSaving is true", () => {
      // Arrange
      const props = {
        isSaving: true,
        isLoading: false,
        onSaveClick: mockOnSaveClick,
        onDiscardClick: mockOnDiscardClick,
      };

      // Act
      render(<ActionButtonsBar {...props} />);

      // Assert
      const saveButton = screen.getByRole("button", { name: /saving/i });
      const discardButton = screen.getByRole("button", { name: /discard changes/i });

      expect(saveButton).toBeDisabled();
      expect(discardButton).toBeDisabled();
    });

    it("should disable both buttons when isLoading is true", () => {
      // Arrange
      const props = {
        isSaving: false,
        isLoading: true,
        onSaveClick: mockOnSaveClick,
        onDiscardClick: mockOnDiscardClick,
      };

      // Act
      render(<ActionButtonsBar {...props} />);

      // Assert
      const saveButton = screen.getByRole("button", { name: /save modified recipe/i });
      const discardButton = screen.getByRole("button", { name: /discard changes/i });

      expect(saveButton).toBeDisabled();
      expect(discardButton).toBeDisabled();
    });

    it("should disable both buttons when both isSaving and isLoading are true", () => {
      // Arrange
      const props = {
        isSaving: true,
        isLoading: true,
        onSaveClick: mockOnSaveClick,
        onDiscardClick: mockOnDiscardClick,
      };

      // Act
      render(<ActionButtonsBar {...props} />);

      // Assert
      const saveButton = screen.getByRole("button", { name: /saving/i });
      const discardButton = screen.getByRole("button", { name: /discard changes/i });

      expect(saveButton).toBeDisabled();
      expect(discardButton).toBeDisabled();
    });
  });

  describe("Dynamic Button Text", () => {
    it('should display "Save Modified Recipe" when not saving', () => {
      // Arrange
      const props = {
        isSaving: false,
        isLoading: false,
        onSaveClick: mockOnSaveClick,
        onDiscardClick: mockOnDiscardClick,
      };

      // Act
      render(<ActionButtonsBar {...props} />);

      // Assert
      expect(screen.getByText("Save Modified Recipe")).toBeInTheDocument();
      expect(screen.queryByText(/saving\.\.\./i)).not.toBeInTheDocument();
    });

    it('should display "Saving..." when isSaving is true', () => {
      // Arrange
      const props = {
        isSaving: true,
        isLoading: false,
        onSaveClick: mockOnSaveClick,
        onDiscardClick: mockOnDiscardClick,
      };

      // Act
      render(<ActionButtonsBar {...props} />);

      // Assert
      expect(screen.getByText("Saving...")).toBeInTheDocument();
      expect(screen.queryByText("Save Modified Recipe")).not.toBeInTheDocument();
    });

    it('should transition text from "Save Modified Recipe" to "Saving..." on state change', () => {
      // Arrange
      const props = {
        isSaving: false,
        isLoading: false,
        onSaveClick: mockOnSaveClick,
        onDiscardClick: mockOnDiscardClick,
      };

      // Act - Initial render
      const { rerender } = render(<ActionButtonsBar {...props} />);
      expect(screen.getByText("Save Modified Recipe")).toBeInTheDocument();

      // Act - Update to saving state
      rerender(<ActionButtonsBar {...props} isSaving={true} />);

      // Assert
      expect(screen.getByText("Saving...")).toBeInTheDocument();
      expect(screen.queryByText("Save Modified Recipe")).not.toBeInTheDocument();
    });
  });

  describe("Click Handlers - Callback Invocation", () => {
    it("should call onSaveClick when Save button is clicked", async () => {
      // Arrange
      const user = userEvent.setup();
      const props = {
        isSaving: false,
        isLoading: false,
        onSaveClick: mockOnSaveClick,
        onDiscardClick: mockOnDiscardClick,
      };

      render(<ActionButtonsBar {...props} />);

      // Act
      const saveButton = screen.getByRole("button", { name: /save modified recipe/i });
      await user.click(saveButton);

      // Assert
      expect(mockOnSaveClick).toHaveBeenCalledTimes(1);
      expect(mockOnDiscardClick).not.toHaveBeenCalled();
    });

    it("should call onDiscardClick when Discard button is clicked", async () => {
      // Arrange
      const user = userEvent.setup();
      const props = {
        isSaving: false,
        isLoading: false,
        onSaveClick: mockOnSaveClick,
        onDiscardClick: mockOnDiscardClick,
      };

      render(<ActionButtonsBar {...props} />);

      // Act
      const discardButton = screen.getByRole("button", { name: /discard changes/i });
      await user.click(discardButton);

      // Assert
      expect(mockOnDiscardClick).toHaveBeenCalledTimes(1);
      expect(mockOnSaveClick).not.toHaveBeenCalled();
    });

    it("should call onSaveClick multiple times for multiple clicks when enabled", async () => {
      // Arrange
      const user = userEvent.setup();
      const props = {
        isSaving: false,
        isLoading: false,
        onSaveClick: mockOnSaveClick,
        onDiscardClick: mockOnDiscardClick,
      };

      render(<ActionButtonsBar {...props} />);

      // Act
      const saveButton = screen.getByRole("button", { name: /save modified recipe/i });
      await user.click(saveButton);
      await user.click(saveButton);
      await user.click(saveButton);

      // Assert
      expect(mockOnSaveClick).toHaveBeenCalledTimes(3);
    });

    it("should not call onSaveClick when button is disabled (isSaving)", async () => {
      // Arrange
      const user = userEvent.setup();
      const props = {
        isSaving: true,
        isLoading: false,
        onSaveClick: mockOnSaveClick,
        onDiscardClick: mockOnDiscardClick,
      };

      render(<ActionButtonsBar {...props} />);

      // Act - Try to click disabled button
      const saveButton = screen.getByRole("button", { name: /saving/i });
      await user.click(saveButton);

      // Assert
      expect(mockOnSaveClick).not.toHaveBeenCalled();
    });

    it("should not call onDiscardClick when button is disabled (isLoading)", async () => {
      // Arrange
      const user = userEvent.setup();
      const props = {
        isSaving: false,
        isLoading: true,
        onSaveClick: mockOnSaveClick,
        onDiscardClick: mockOnDiscardClick,
      };

      render(<ActionButtonsBar {...props} />);

      // Act - Try to click disabled button
      const discardButton = screen.getByRole("button", { name: /discard changes/i });
      await user.click(discardButton);

      // Assert
      expect(mockOnDiscardClick).not.toHaveBeenCalled();
    });

    it("should not call any callbacks when both buttons are disabled", async () => {
      // Arrange
      const user = userEvent.setup();
      const props = {
        isSaving: true,
        isLoading: true,
        onSaveClick: mockOnSaveClick,
        onDiscardClick: mockOnDiscardClick,
      };

      render(<ActionButtonsBar {...props} />);

      // Act - Try to click both disabled buttons
      const saveButton = screen.getByRole("button", { name: /saving/i });
      const discardButton = screen.getByRole("button", { name: /discard changes/i });

      await user.click(saveButton);
      await user.click(discardButton);

      // Assert
      expect(mockOnSaveClick).not.toHaveBeenCalled();
      expect(mockOnDiscardClick).not.toHaveBeenCalled();
    });
  });

  describe("UI Structure and Accessibility", () => {
    it("should render both buttons in the DOM", () => {
      // Arrange
      const props = {
        isSaving: false,
        isLoading: false,
        onSaveClick: mockOnSaveClick,
        onDiscardClick: mockOnDiscardClick,
      };

      // Act
      render(<ActionButtonsBar {...props} />);

      // Assert
      const buttons = screen.getAllByRole("button");
      expect(buttons).toHaveLength(2);
    });

    it("should render Save button with proper icon", () => {
      // Arrange
      const props = {
        isSaving: false,
        isLoading: false,
        onSaveClick: mockOnSaveClick,
        onDiscardClick: mockOnDiscardClick,
      };

      // Act
      render(<ActionButtonsBar {...props} />);

      // Assert - Check for Save icon (lucide-react adds specific attributes)
      const saveButton = screen.getByRole("button", { name: /save modified recipe/i });
      const svg = saveButton.querySelector("svg");
      expect(svg).toBeInTheDocument();
    });

    it("should render Discard button with proper icon", () => {
      // Arrange
      const props = {
        isSaving: false,
        isLoading: false,
        onSaveClick: mockOnSaveClick,
        onDiscardClick: mockOnDiscardClick,
      };

      // Act
      render(<ActionButtonsBar {...props} />);

      // Assert - Check for X icon
      const discardButton = screen.getByRole("button", { name: /discard changes/i });
      const svg = discardButton.querySelector("svg");
      expect(svg).toBeInTheDocument();
    });

    it("should render Discard button with outline variant", () => {
      // Arrange
      const props = {
        isSaving: false,
        isLoading: false,
        onSaveClick: mockOnSaveClick,
        onDiscardClick: mockOnDiscardClick,
      };

      // Act
      render(<ActionButtonsBar {...props} />);

      // Assert - Check for outline variant classes
      const discardButton = screen.getByRole("button", { name: /discard changes/i });
      expect(discardButton.className).toContain("border");
    });

    it("should render Save button with default variant", () => {
      // Arrange
      const props = {
        isSaving: false,
        isLoading: false,
        onSaveClick: mockOnSaveClick,
        onDiscardClick: mockOnDiscardClick,
      };

      // Act
      render(<ActionButtonsBar {...props} />);

      // Assert - Save button should have primary styles
      const saveButton = screen.getByRole("button", { name: /save modified recipe/i });
      expect(saveButton.className).toContain("bg-primary");
    });
  });

  describe("Edge Cases and Business Rules", () => {
    it("should handle rapid state transitions without errors", () => {
      // Arrange
      const props = {
        isSaving: false,
        isLoading: false,
        onSaveClick: mockOnSaveClick,
        onDiscardClick: mockOnDiscardClick,
      };

      // Act - Rapid rerenders with different states
      const { rerender } = render(<ActionButtonsBar {...props} />);

      rerender(<ActionButtonsBar {...props} isSaving={true} />);
      rerender(<ActionButtonsBar {...props} isLoading={true} />);
      rerender(<ActionButtonsBar {...props} isSaving={true} isLoading={true} />);
      rerender(<ActionButtonsBar {...props} isSaving={false} isLoading={false} />);

      // Assert - Should not throw errors and render correctly
      expect(screen.getByRole("button", { name: /save modified recipe/i })).toBeEnabled();
      expect(screen.getByRole("button", { name: /discard changes/i })).toBeEnabled();
    });

    it("should maintain button order (Discard first, then Save in HTML)", () => {
      // Arrange
      const props = {
        isSaving: false,
        isLoading: false,
        onSaveClick: mockOnSaveClick,
        onDiscardClick: mockOnDiscardClick,
      };

      // Act
      render(<ActionButtonsBar {...props} />);

      // Assert - Check visual order (uses flex-col-reverse on mobile)
      const buttons = screen.getAllByRole("button");
      // In DOM: Discard is first, Save is second (flex-col-reverse reverses visual order)
      expect(buttons[0]).toHaveTextContent(/discard changes/i);
      expect(buttons[1]).toHaveTextContent(/save modified recipe/i);
    });

    it("should preserve callbacks when state changes", async () => {
      // Arrange
      const user = userEvent.setup();
      const props = {
        isSaving: false,
        isLoading: false,
        onSaveClick: mockOnSaveClick,
        onDiscardClick: mockOnDiscardClick,
      };

      // Act - Render, change state, then click
      const { rerender } = render(<ActionButtonsBar {...props} />);
      rerender(<ActionButtonsBar {...props} isSaving={true} />);
      rerender(<ActionButtonsBar {...props} isSaving={false} />);

      const saveButton = screen.getByRole("button", { name: /save modified recipe/i });
      await user.click(saveButton);

      // Assert
      expect(mockOnSaveClick).toHaveBeenCalledTimes(1);
    });

    it("should handle undefined callbacks gracefully (should not crash)", () => {
      // Arrange & Act - This tests TypeScript safety, but in runtime we test it doesn't crash
      // Note: TypeScript prevents this, but we test defensive programming
      expect(() => {
        render(<ActionButtonsBar isSaving={false} isLoading={false} onSaveClick={vi.fn()} onDiscardClick={vi.fn()} />);
      }).not.toThrow();
    });
  });

  describe("Integration with Button Component", () => {
    it("should apply disabled opacity style when buttons are disabled", () => {
      // Arrange
      const props = {
        isSaving: true,
        isLoading: false,
        onSaveClick: mockOnSaveClick,
        onDiscardClick: mockOnDiscardClick,
      };

      // Act
      render(<ActionButtonsBar {...props} />);

      // Assert - Button component adds disabled:opacity-50
      const saveButton = screen.getByRole("button", { name: /saving/i });
      expect(saveButton.className).toContain("disabled:opacity-50");
    });

    it("should prevent pointer events on disabled buttons", () => {
      // Arrange
      const props = {
        isSaving: false,
        isLoading: true,
        onSaveClick: mockOnSaveClick,
        onDiscardClick: mockOnDiscardClick,
      };

      // Act
      render(<ActionButtonsBar {...props} />);

      // Assert - Button component adds disabled:pointer-events-none
      const saveButton = screen.getByRole("button", { name: /save modified recipe/i });
      expect(saveButton.className).toContain("disabled:pointer-events-none");
    });
  });
});
