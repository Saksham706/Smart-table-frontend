import React from "react";
import { Bell, Clock, Users, BookOpen, PartyPopper, UserCheck, BarChart3, Sparkles, TrendingUp } from "lucide-react";
import krmuLogo from "../assets/krmu_logo.jpg";
import "./Home.css";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar
} from "recharts";

const features = [
  {
    icon: <Clock size={32} />,
    title: "Timetable Management",
    desc: "Access and manage daily and weekly class schedules instantly."
  },
  {
    icon: <Bell size={32} />,
    title: "Event Alerts",
    desc: "Stay up to date with all campus notices and exam or holiday alerts."
  },
  {
    icon: <Users size={32} />,
    title: "Role-based Dashboards",
    desc: "Students, teachers, and admins see only what matters for them."
  },
  {
    icon: <BookOpen size={32} />,
    title: "Personalized Notifications",
    desc: "Receive messages, reminders, and urgent alerts tailored to you."
  },
  {
    icon: <PartyPopper size={32} />,
    title: "Events & Clubs",
    desc: "Never miss a seminar, festival, or club event with the calendar."
  },
];

const testimonials = [
  {
    text: "“KRMU's smart notifications help me never miss an exam update!”",
    user: "Ritika, Student"
  },
  {
    text: "“Love how I can update my lectures and notify students instantly.”",
    user: "Mr. Gupta, Faculty"
  },
  {
    text: "“Smooth admin tools and easy user management.”",
    user: "Dean Monica, Admin"
  }
];

const notificationsData = [
  { day: "Mon", value: 10 },
  { day: "Tue", value: 25 },
  { day: "Wed", value: 18 },
  { day: "Thu", value: 32 },
  { day: "Fri", value: 40 },
  { day: "Sat", value: 28 }
];

const attendanceData = [
  { day: "Mon", value: 70 },
  { day: "Tue", value: 72 },
  { day: "Wed", value: 68 },
  { day: "Thu", value: 75 },
  { day: "Fri", value: 78 }
];

const eventsData = [
  { month: "Jan", value: 50 },
  { month: "Feb", value: 65 },
  { month: "Mar", value: 80 },
  { month: "Apr", value: 95 }
];

export default function Home() {
  return (
    <div className="home-animated-bg">{/* Animated gradient background */}

      {/* NAVBAR */}
      <nav className="navbar glass-nav">
        <div className="navbar-left">
          <img src={krmuLogo} alt="KRMU" className="navbar-logo" />
          <span className="navbar-title">KRMU Smart Notification System</span>
        </div>
        <div className="navbar-right">
          <a href="/login" className="signin-btn">Sign In</a>
        </div>
      </nav>

      {/* HERO SECTION */}
      <header className="hero modern-hero">
        <div className="hero-text">
          <h1 className="fade-in-title">Stay Informed, Stay Ahead.</h1>
          <p className="hero-sub">
            The smartest way to manage timetables, alerts, events, and student communication.
          </p>
          <a href="/login" className="cta-btn glow-btn">Get Started</a>
        </div>

        <div className="hero-stats-card">
          <div className="stat-block">
            <Sparkles size={28} />
            <h3>12,500+</h3>
            <p>Active Students</p>
          </div>
          <div className="stat-block">
            <TrendingUp size={28} />
            <h3>98%</h3>
            <p>Notification Delivery Rate</p>
          </div>
          <div className="stat-block">
            <BarChart3 size={28} />
            <h3>350+</h3>
            <p>Daily Timetable Updates</p>
          </div>
        </div>
      </header>

      {/* FEATURES GRID */}
      <section className="features">
        <h2 className="section-title">Platform Features</h2>
        <div className="feature-grid">
          {features.map((f, i) => (
            <div key={i} className="feature-card hover-card">
              <div className="feature-icon neon-icon">{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ANALYTICS PREVIEW SECTION */}
      <section className="analytics-preview">
      <h2 className="section-title">Live Campus Insights</h2>

      <div className="analytics-container">

        {/* --- Chart 1: Notifications Sent --- */}
        <div className="analytics-card">
          <h4>Notifications Sent This Week</h4>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={notificationsData}>
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="value" stroke="#00c6ff" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* --- Chart 3: Event Participation --- */}
        <div className="analytics-card">
          <h4>Event Participation Growth</h4>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={eventsData}>
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#00eaff" />
            </BarChart>
          </ResponsiveContainer>
        </div>

      </div>
    </section>

      {/* TESTIMONIALS */}
      <section className="testimonials glass-sec">
        <h2 className="section-title">What Users Say</h2>
        <div className="testimonial-grid">
          {testimonials.map((t, i) => (
            <div key={i} className="testimonial-card">
              <p>{t.text}</p>
              <span className="testimonial-user">{t.user}</span>
            </div>
          ))}
        </div>
      </section>
      <footer className="footer">
        <p>© 2025 KRMU Smart Notification System</p>
        <p>Developed for enhancing communication & efficiency across campus.</p>
        <p>
          Need Help? <a href="/contact">Contact Support</a>
        </p>
      </footer>
    </div>
  );
}
