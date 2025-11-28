import React, { useState } from 'react';

import toast from 'react-hot-toast';
import {
  Link,
  useNavigate,
} from 'react-router-dom';

import SummaryApi from '../common/SummaryApi';
import Axios from '../utils/Axios';

const Login = () => {
  const nagivate = useNavigate();
  const [data, setData] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);

  const handleOnChange = (e) => {
    const { name, value } = e.target;
    setData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await Axios({
        ...SummaryApi.login,
        data: data,
      });

      if (response.data.success) {
        toast.success(response.data.message);
        localStorage.setItem("accesstoken", response.data.data.accesstoken);
        localStorage.setItem("userName", response.data.data.userName);
        nagivate("/");
      } else {
        toast.error(response.data.message || "Registration failed");
      }
    } catch (error) {
      console.error(error);
      toast.error(
        error?.response?.data?.message || "Something went wrong. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-900 via-slate-900 to-emerald-900 px-4">
      <div className="w-full max-w-md bg-slate-900/80 backdrop-blur-xl border border-slate-800/70 rounded-3xl shadow-2xl p-8">
        <h2 className="text-3xl font-semibold text-white text-center mb-6">Login</h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Email</label>
            <input
              type="email"
              required
              value={data.email}
              name="email"
              onChange={handleOnChange}
              placeholder="you@example.com"
              className="w-full rounded-xl border border-slate-700 bg-slate-900/70 px-3 py-2.5 text-slate-100 placeholder-slate-500 outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-400 transition"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Password</label>
            <input
              type="text"
              required
              placeholder="••••••••"
              value={data.password}
              name="password"
              onChange={handleOnChange}
              className="w-full rounded-xl border border-slate-700 bg-slate-900/70 px-3 py-2.5 text-slate-100 placeholder-slate-500 outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-400 transition"
            />
          </div>

          <button
            type="submit"
            className={`w-full bg-indigo-500 hover:bg-indigo-400 text-white font-semibold py-2.5 rounded-xl shadow-lg shadow-indigo-500/30 transition ${
              loading ? "bg-indigo-300 hover:bg-indigo-200" : "bg-indigo-500 hover:bg-indigo-400 cursor-pointer"
            } `}
            disabled={loading}
          >
            {loading ? "Login..." : "Login"}
          </button>
        </form>

        <p className="text-sm text-slate-400 mt-4 text-center">
          Don't have an account?{" "}
          <Link to="/signup" className="text-indigo-400 hover:underline">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
