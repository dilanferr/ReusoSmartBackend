import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/navbar";
import ScrollToTop from "./components/ScrollToTop";
import Home from "./components/home";
import About from "./components/about";
import Points from "./components/points";
import Contacto from "./components/contacto";
import Login from "./components/login";
import Register from "./components/register";
import ForgotPassword from "./components/forgotPassword";
import ResetPassword from "./components/resetPassword";
import Footer from "./components/footer";
import Privacy from "./components/privacy";
import Terms from "./components/terms";
import Profile from "./components/Profile";
import AdminDashboard from "./components/AdminDashboard";

function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-emerald-50 text-gray-800">
        <ScrollToTop />
        <Navbar />
        <main className="grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/nosotros" element={<About />} />
            <Route path="/puntos" element={<Points />} />
            <Route path="/contacto" element={<Contacto />} />
            <Route path="/privacidad" element={<Privacy />} />
            <Route path="/terminos" element={<Terms />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgotPassword" element={<ForgotPassword />} />
            <Route path="/resetPassword" element={<ResetPassword />} />
            <Route path="/perfil" element={<Profile />} />
            {/* Ruta directa al Dashboard de Administración */}
            <Route path="/admin" element={<AdminDashboard />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
