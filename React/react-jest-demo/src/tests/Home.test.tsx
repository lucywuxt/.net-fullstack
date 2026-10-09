import { render, screen } from "@testing-library/react";
import Home from "../components/Home";

describe("Home Component", () => {

  test("renders welcome heading", () => {

    render(<Home />);

    expect(
      screen.getByRole("heading", {
        name: "Welcome to React Jest Demo"
      })
    ).toBeInTheDocument();

  });

});