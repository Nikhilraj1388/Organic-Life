// Import jest-dom matchers and extend Vitest's expect with them.
import * as matchers from "@testing-library/jest-dom/matchers";
import { expect } from "vitest";

expect.extend(matchers as any);

// You can add other global test setup here, e.g. mocking fetch, configuring globals, etc.
