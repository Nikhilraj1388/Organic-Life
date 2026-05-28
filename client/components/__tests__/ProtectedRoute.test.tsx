import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import ProtectedRoute from "../ProtectedRoute";

vi.mock("../../contexts/AuthContext", () => ({
  useAuth: () => ({ isAuthenticated: false, user: null, isLoading: false }),
}));

describe("ProtectedRoute", () => {
  it("redirects to login when not authenticated", () => {
    render(
      <MemoryRouter initialEntries={["/protected"]}>
        <Routes>
          <Route path="/login" element={<div>Login Page</div>} />
          <Route
            path="/protected"
            element={
              <ProtectedRoute>
                <div>Protected</div>
              </ProtectedRoute>
            }
          />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText("Login Page")).toBeTruthy();
  });
});
