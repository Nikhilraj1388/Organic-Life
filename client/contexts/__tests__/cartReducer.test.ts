import { describe, it, expect } from "vitest";
import { cartReducer } from "../CartContext";

const sampleItem = {
  id: "p1",
  name: "Apple",
  price: 100,
  image: "/placeholder.svg",
  category: "Fruits",
  selectedQuantityOption: { label: "1 unit", value: 1 },
};

describe("cartReducer", () => {
  it("adds item to empty cart", () => {
    const initial = { items: [], isOpen: false };
    const next = cartReducer(initial as any, {
      type: "ADD_ITEM",
      payload: sampleItem,
    });
    expect(next.items.length).toBe(1);
    expect(next.items[0].quantity).toBe(1);
  });

  it("increments quantity for existing item", () => {
    const initial = { items: [{ ...sampleItem, quantity: 1 }], isOpen: false };
    const next = cartReducer(initial as any, {
      type: "ADD_ITEM",
      payload: { ...sampleItem, quantity: 2 },
    });
    expect(next.items.length).toBe(1);
    expect(next.items[0].quantity).toBe(3);
  });

  it("removes item", () => {
    const initial = { items: [{ ...sampleItem, quantity: 2 }], isOpen: false };
    const next = cartReducer(initial as any, {
      type: "REMOVE_ITEM",
      payload: "p1",
    });
    expect(next.items.length).toBe(0);
  });

  it("updates quantity and removes when zero", () => {
    const initial = { items: [{ ...sampleItem, quantity: 2 }], isOpen: false };
    const next = cartReducer(initial as any, {
      type: "UPDATE_QUANTITY",
      payload: { id: "p1", quantity: 0 },
    });
    expect(next.items.length).toBe(0);
  });

  it("toggles cart open state", () => {
    const initial = { items: [], isOpen: false };
    const next = cartReducer(initial as any, { type: "TOGGLE_CART" });
    expect(next.isOpen).toBe(true);
  });
});
