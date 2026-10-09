import { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";

interface RegistrationData {
  firstName: string;
  lastName: string;
  age: number;
  password: string;
  city: string;
  isEmployeed: boolean;
}

export default function Registration() {

  const [formData, setFormData] = useState<RegistrationData>({
    firstName: "",
    lastName: "",
    age: 0,
    password: "",
    city: "",
    isEmployeed: false
  });

  const [message, setMessage] = useState("");

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {

    const { name, value } = e.target;

    const updatedValue =
      e.target instanceof HTMLInputElement &&
      e.target.type === "checkbox"
        ? e.target.checked
        : name === "age"
          ? Number(value)
          : value;

    setFormData(prev => ({
      ...prev,
      [name]: updatedValue
    }));
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (
      !formData.firstName.trim() ||
      !formData.lastName.trim() ||
      !formData.password ||
      !formData.city ||
      formData.age <= 0
    ) {
      setMessage("Please fill all required fields");
      return;
    }

    setMessage("Registration Successful");
  };

  return (
    <div>
      <h1>Registration Component</h1>

      <form onSubmit={handleSubmit}>

        <div>
          <label htmlFor="firstName">First Name</label>
          <input
            id="firstName"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
          />
        </div>

        <div>
          <label htmlFor="lastName">Last Name</label>
          <input
            id="lastName"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
          />
        </div>

        <div>
          <label htmlFor="age">Age</label>
          <input
            id="age"
            name="age"
            type="number"
            value={formData.age}
            onChange={handleChange}
          />
        </div>

        <div>
          <label htmlFor="registrationPassword">
            Password
          </label>
          <input
            id="registrationPassword"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
          />
        </div>

        <div>
          <label htmlFor="city">City</label>
          <select
            id="city"
            name="city"
            value={formData.city}
            onChange={handleChange}
          >
            <option value="">Select City</option>
            <option value="Chicago">Chicago</option>
            <option value="DC">DC</option>
            <option value="LA">LA</option>
          </select>
        </div>

        <div>
          <label htmlFor="isEmployeed">
            <input
              id="isEmployeed"
              name="isEmployeed"
              type="checkbox"
              checked={formData.isEmployeed}
              onChange={handleChange}
            />
            Is Employed
          </label>
        </div>

        <button type="submit">
          Register
        </button>

      </form>

      <p role="status">{message}</p>
    </div>
  );
}