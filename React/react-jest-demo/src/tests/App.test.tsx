import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "../App";

describe("Application Routing", () => {

  beforeEach(() => {
    window.history.pushState({}, "", "/");
  });

  test("home page loads by default", () => {

    render(<App />);

    expect(
      screen.getByText("Welcome to React Jest Demo")
    ).toBeInTheDocument();

  });

  test("navigates to Counter page", async () => {

    const user = userEvent.setup();

    render(<App />);

    await user.click(
      screen.getByRole("link", { name: "Counter" })
    );

    expect(
      screen.getByRole("heading", {
        name: "Counter Component"
      })
    ).toBeInTheDocument();

  });

  test("navigates to Registration page", async () => {

    const user = userEvent.setup();

    render(<App />);

    await user.click(
      screen.getByRole("link", { name: "Registration" })
    );

    expect(
      screen.getByRole("heading", {
        name: "Registration Component"
      })
    ).toBeInTheDocument();

  });

});