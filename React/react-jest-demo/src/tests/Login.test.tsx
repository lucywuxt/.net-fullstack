import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Login from "../components/Login";

describe("Login Component", () => {

  test("renders login form", () => {

    render(<Login />);

    expect(
      screen.getByRole("heading", { name: "Login Component" })
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", { name: "Login" })
    ).toBeInTheDocument();

  });

  test("shows validation error for empty fields", async () => {

    const user = userEvent.setup();

    render(<Login />);

    await user.click(
      screen.getByRole("button", { name: "Login" })
    );

    expect(
      screen.getByText("All fields are required")
    ).toBeInTheDocument();

  });

  test("successful login with valid credentials", async () => {

    const user = userEvent.setup();

    render(<Login />);

    await user.type(
      screen.getByLabelText("Username"),
      "admin"
    );

    await user.type(
      screen.getByLabelText("Password"),
      "admin123"
    );

    await user.click(
      screen.getByRole("button", { name: "Login" })
    );

    expect(
      screen.getByText("Login Successful")
    ).toBeInTheDocument();

  });

  test("invalid login credentials", async () => {

    const user = userEvent.setup();

    render(<Login />);

    await user.type(
      screen.getByLabelText("Username"),
      "wronguser"
    );

    await user.type(
      screen.getByLabelText("Password"),
      "wrongpassword"
    );

    await user.click(
      screen.getByRole("button", { name: "Login" })
    );

    expect(
      screen.getByText("Invalid Credentials")
    ).toBeInTheDocument();

  });

});