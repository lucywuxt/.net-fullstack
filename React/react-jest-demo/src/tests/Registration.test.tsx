import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Registration from "../components/Registration";

describe("Registration Component", () => {

  test("renders registration form", () => {

    render(<Registration />);

    expect(
      screen.getByLabelText("First Name")
    ).toBeInTheDocument();

    expect(
      screen.getByLabelText("Last Name")
    ).toBeInTheDocument();

    expect(
      screen.getByLabelText("Age")
    ).toBeInTheDocument();

    expect(
      screen.getByLabelText("Password")
    ).toBeInTheDocument();

    expect(
      screen.getByLabelText("City")
    ).toBeInTheDocument();

    expect(
      screen.getByLabelText("Is Employed")
    ).toBeInTheDocument();

  });

  test("displays validation error on empty submission", async () => {

    const user = userEvent.setup();

    render(<Registration />);

    await user.click(
      screen.getByRole("button", { name: "Register" })
    );

    expect(
      screen.getByText("Please fill all required fields")
    ).toBeInTheDocument();

  });

  test("registration succeeds with valid data", async () => {

    const user = userEvent.setup();

    render(<Registration />);

    await user.type(
      screen.getByLabelText("First Name"),
      "John"
    );

    await user.type(
      screen.getByLabelText("Last Name"),
      "Smith"
    );

    await user.clear(screen.getByLabelText("Age"));

    await user.type(
      screen.getByLabelText("Age"),
      "25"
    );

    await user.type(
      screen.getByLabelText("Password"),
      "Test@123"
    );

    await user.selectOptions(
      screen.getByLabelText("City"),
      "LA"
    );

    await user.click(
      screen.getByLabelText("Is Employed")
    );

    expect(
      screen.getByLabelText("Is Employed")
    ).toBeChecked();

    expect(
      screen.getByLabelText("City")
    ).toHaveValue("LA");

    await user.click(
      screen.getByRole("button", { name: "Register" })
    );

    expect(
      screen.getByText("Registration Successful")
    ).toBeInTheDocument();

  });

});