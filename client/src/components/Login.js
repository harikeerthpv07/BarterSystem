import { useState } from "react";
import API from "../api";
import { useNavigate } from "react-router-dom";
import "./Login.css";
import AboutMe from "../components/AboutMe";
import HowToUse from "../components/HowToUse";


export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post("/auth/login", form);
      localStorage.setItem("token", res.data.token); // save JWT
      setMessage(res.data.message);
      navigate("/dashboard"); // redirect to dashboard
    } catch (err) {
      setMessage(err.response?.data?.error || "Login failed");
    }
  };

  return (
    <div className="login-container">
      <h2>Login</h2>
      <AboutMe/>
      <br/>
      <HowToUse/>
      <br/>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          required
        />
        <button type="submit">Login</button>
      </form>
      {message && <p>{message}</p>}
            <p>
        Dont have an account?{" "}
        <button onClick={() => navigate("/signup")}>Sign Up</button>
      </p>
    </div>
  );
}
