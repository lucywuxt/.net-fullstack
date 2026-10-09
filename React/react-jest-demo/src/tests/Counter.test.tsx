import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Counter from "../components/Counter";

describe("Counter Component", () => {

  test("initial count should be zero", () => {

    render(<Counter />);

    expect(
      screen.getByTestId("counter-value")
    ).toHaveTextContent("Count: 0");

  });

  test("increment button increases count", async () => {

    const user = userEvent.setup();

    render(<Counter />);

    await user.click(
      screen.getByRole("button", { name: "Increment" })
    );

    expect(
      screen.getByTestId("counter-value")
    ).toHaveTextContent("Count: 1");

  });

  test("decrement button decreases count", async () => {

    const user = userEvent.setup();

    render(<Counter />);

    await user.click(
      screen.getByRole("button", { name: "Decrement" })
    );

    expect(
      screen.getByTestId("counter-value")
    ).toHaveTextContent("Count: -1");

  });

  test("reset button resets count", async () => {

    const user = userEvent.setup();

    render(<Counter />);

    await user.click(
      screen.getByRole("button", { name: "Increment" })
    );

    await user.click(
      screen.getByRole("button", { name: "Reset" })
    );

    expect(
      screen.getByTestId("counter-value")
    ).toHaveTextContent("Count: 0");

  });

});