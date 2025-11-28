import React, { useState } from 'react';

import toast from 'react-hot-toast';
import {
  Link,
  useNavigate,
} from 'react-router-dom';

import SummaryApi from '../common/SummaryApi';
import Axios from '../utils/Axios';

const Signup = () => {
  const nagivate = useNavigate();
  const [data, setData] = useState({
    name: "",
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
        ...SummaryApi.register,
        data: data,
      });

      if (response.data.success) {
        toast.success(response.data.message);
        nagivate("/login");
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
        <h2 className="text-3xl font-semibold text-white text-center mb-6">Sign Up</h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Full Name</label>
            <input
              type="text"
              name="name"
              value={data.name}
              onChange={handleOnChange}
              required
              placeholder="John Doe"
              className="w-full rounded-xl border border-slate-700 bg-slate-900/70 px-3 py-2.5 text-slate-100 placeholder-slate-500 outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-400 transition"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={data.email}
              onChange={handleOnChange}
              required
              placeholder="you@example.com"
              className="w-full rounded-xl border border-slate-700 bg-slate-900/70 px-3 py-2.5 text-slate-100 placeholder-slate-500 outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-400 transition"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Password</label>
            <input
              type="text"
              name="password"
              value={data.password}
              onChange={handleOnChange}
              required
              placeholder="••••••••"
              className="w-full rounded-xl border border-slate-700 bg-slate-900/70 px-3 py-2.5 text-slate-100 placeholder-slate-500 outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-400 transition"
            />
          </div>

          <button
            type="submit"
            className={`w-full  text-slate-900 font-semibold py-2.5 rounded-xl shadow-lg shadow-emerald-500/30 transition ${
              loading ? "bg-emerald-300 hover:bg-emerald-200" : "bg-emerald-500 hover:bg-emerald-400 cursor-pointer"
            } `}
            disabled={loading}
          >
            {loading ? "Saving..." : "Sign Up"}
          </button>
        </form>

        <p className="text-sm text-slate-400 mt-4 text-center">
          Already have an account?{" "}
          <Link to="/login" className="text-emerald-400 hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
