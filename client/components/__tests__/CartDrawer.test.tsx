import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { CartProvider, useCart } from "../../contexts/CartContext";
import CartDrawer from "../CartDrawer";

function Wrapper({ children }: any) {
  return <CartProvider>{children}</CartProvider>;
}

describe("CartDrawer integration", () => {
  it("shows added item and total", async () => {
    // Use a small helper component to interact with cart context
    function TestAdder() {
      const { addItem, toggleCart } = useCart();
      return (
        <div>
          <button
            onClick={() =>
              addItem({
                id: "p1",
                name: "Apple",
                price: 10,
                category: "fruit",
                image: "",
                selectedQuantityOption: null,
              })
            }
          >
            Add
          </button>
          <button onClick={() => toggleCart()}>Open</button>
        </div>
      );
    }

    render(
      <MemoryRouter>
        <Wrapper>
          <TestAdder />
          <CartDrawer />
        </Wrapper>
      </MemoryRouter>,
    );

    await userEvent.click(screen.getByText("Add"));
    await userEvent.click(screen.getByText("Open"));

    expect(screen.getByText("Apple")).toBeTruthy();
    expect(screen.getByText(/Total:/)).toBeTruthy();
  });
});
