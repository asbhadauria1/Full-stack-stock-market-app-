import React, { useState } from "react";
import { useForm } from "react-hook-form";
import toast, { Toaster } from "react-hot-toast";
import "./SignupForm.css"; // Import your custom CSS file
import { useNavigate } from "react-router-dom";
import { signup } from "../service/Api";

const SignupForm = () => {
  const navigate = useNavigate();
  const [showColdStartMessage, setShowColdStartMessage] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();

  const onSubmit = async (data) => {
    setShowColdStartMessage(false);

    // If Render is sleeping, show a wakeup notice after 3 seconds
    const coldStartTimer = setTimeout(() => {
      setShowColdStartMessage(true);
    }, 3000);

    try {
      const responce = await signup(data);
      clearTimeout(coldStartTimer);

      if (responce.status === 200 || responce.status === 201) {
        toast.success("Signup successful!");

        setTimeout(() => {
          navigate("/");
        }, 2000);
      }
    } catch (error) {
      clearTimeout(coldStartTimer);
      toast.error("Signup failed. Please try again.");
    }
  };

  return (
    <div className="signup-container">
      <h2 className="signup-header">Sign Up</h2>

      {/* Cold start waking notification */}
      {showColdStartMessage && (
        <div style={{ background: "#fff3cd", color: "#856404", padding: "10px", marginBottom: "15px", borderRadius: "4px", fontSize: "13px", textAlign: "center" }}>
          ⏳ Waking up server... Render free tier is spinning up from sleep mode. Please wait a moment!
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)}>
        <div>
          <input
            type="text"
            id="username"
            placeholder="Enter your username"
            {...register("username", {
              required: "username is required",
              minLength: { value: 6, message: "Minimum length is 6" },
            })}
            className="signup-input"
            disabled={isSubmitting}
          />
          {errors.username && (
            <span className="error-message">{errors.username.message}</span>
          )}
        </div>

        <div>
          <input
            type="text"
            id="name"
            placeholder="Enter your name"
            {...register("name", { required: "Name is required" })}
            className="signup-input"
            disabled={isSubmitting}
          />
          {errors.name && (
            <span className="error-message">{errors.name.message}</span>
          )}
        </div>

        <div>
          <input
            type="email"
            id="email"
            placeholder="Enter your email"
            {...register("email", {
              required: "Email is required",
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: "Invalid email address",
              },
            })}
            className="signup-input"
            disabled={isSubmitting}
          />
          {errors.email && (
            <span className="error-message">{errors.email.message}</span>
          )}
        </div>

        <div>
          <input
            type="password"
            id="password"
            placeholder="Enter your password"
            {...register("password", {
              required: "Password is required",
              minLength: { value: 6, message: "Minimum length is 6" },
            })}
            className="signup-input"
            disabled={isSubmitting}
          />
          {errors.password && (
            <span className="error-message">{errors.password.message}</span>
          )}
        </div>

        <button type="submit" disabled={isSubmitting} className="signup-button">
          {isSubmitting ? "Signing up..." : "Sign Up"}
        </button>
      </form>

      {/* Toast Container */}
      <Toaster position="top-center" />
    </div>
  );
};

export default SignupForm;