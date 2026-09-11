import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Globe, MessageSquare, Shield, Map as MapIcon, BarChart3,
  Plus, Minus, Crosshair, Layers, Cloud, Thermometer,
  Navigation2, Waves, Play, ArrowRight, Fish, Microscope,
  Anchor, AlertTriangle, Ship, ShieldCheck, Zap, Lock, Users,
  Bot, GitMerge, Route, RefreshCw
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);

  return (
    <div className="min-h-screen bg-white font-sans">

      {/* ── NAVBAR ──────────────────────────────────────────────── */}
      <nav className="border-b border-gray-100 bg-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <img src="/orca-logo.svg" alt="ORCA" className="w-10 h-10 object-contain" />
            <div>
              <p className="text-base font-black tracking-widest text-marine-900 leading-none">ORCA</p>
              <p className="text-[10px] text-gray-400 leading-none mt-0.5 tracking-wide">Your Intelligent Guide to the Sea</p>
            </div>
          </div>

          <div className="hidden md:flex items-center space-x-8 text-sm font-medium text-gray-600">
            <a href="#features" className="hover:text-marine-600 transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-marine-600 transition-colors">How ORCA Works</a>
            <a href="#use-cases" className="hover:text-marine-600 transition-colors">Use Cases</a>
            <a href="#resources" className="hover:text-marine-600 transition-colors">Resources</a>
            <a href="#about" className="hover:text-marine-600 transition-colors">About Us</a>
          </div>

          <div className="flex items-center space-x-4">
            <button className="flex items-center space-x-1.5 text-sm text-gray-600 hover:text-marine-600 transition-colors">
              <Globe className="w-4 h-4" />
              <span className="font-medium">English</span>
              <span className="text-gray-400">▾</span>
            </button>
            <Link
              to="/roles"
              className="bg-marine-600 text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-marine-700 transition-colors shadow-sm"
            >
              Sign In
            </Link>
          </div>
        </div>
      </nav>

      {/* ── HERO ─────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-6 pt-14 pb-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

          {/* Left: Copy */}
          <div>
            <div className="inline-flex items-center space-x-2 border border-gray-200 bg-gray-50 text-gray-600 px-4 py-2 rounded-full text-xs font-semibold mb-6">
              <Crosshair className="w-3.5 h-3.5 text-marine-500" />
              <span>Agentic AI Marine Intelligence Platform</span>
            </div>

            <h1 className="text-5xl font-extrabold text-gray-900 leading-tight mb-4">
              Ask the Ocean.<br />
              <span className="text-marine-500">Navigate with Confidence.</span>
            </h1>

            <p className="text-base text-gray-500 leading-relaxed mb-8 max-w-lg">
              ORCA combines satellite data, ocean science and Agentic AI
              to deliver real-time insights, safer routes and smarter
              decisions for everyone who relies on the sea.
            </p>

            {/* Feature icons */}
            <div className="grid grid-cols-4 gap-4 mb-9">
              {[
                { icon: MessageSquare, label: 'Ask in Natural Language',      color: 'text-blue-500',   bg: 'bg-blue-50'   },
                { icon: Shield,        label: 'Real-time Safety & Alerts',    color: 'text-emerald-500',bg: 'bg-emerald-50'},
                { icon: MapIcon,       label: 'Smart Routes & Navigation',    color: 'text-indigo-500', bg: 'bg-indigo-50' },
                { icon: BarChart3,     label: 'Data-driven Recommendations',  color: 'text-orange-500', bg: 'bg-orange-50' },
              ].map(f => (
                <div key={f.label} className="flex flex-col items-start space-y-1.5">
                  <div className={`${f.bg} ${f.color} p-2 rounded-lg`}>
                    <f.icon className="w-4 h-4" />
                  </div>
                  <p className="text-xs text-gray-600 font-medium leading-snug">{f.label}</p>
                </div>
              ))}
            </div>

            {/* CTAs */}
            <div className="flex items-center space-x-4">
              <Link
                to="/roles"
                className="flex items-center space-x-2 bg-marine-600 text-white px-6 py-3 rounded-xl font-semibold text-sm hover:bg-marine-700 transition-colors shadow-md shadow-marine-600/20"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Ask ORCA Now</span>
              </Link>

            </div>
          </div>

          {/* Right: Hero Video Card */}
          <div className="relative">
            <div className="absolute -inset-2 bg-gradient-to-tr from-blue-100 to-cyan-50 rounded-3xl -z-10 opacity-60"></div>
            <div className="rounded-2xl overflow-hidden shadow-2xl" style={{ background: '#0b1e35' }}>

              {/* Video area */}
              <div className="relative" style={{ height: '320px' }}>
                <video
                  ref={videoRef}
                  className="absolute inset-0 w-full h-full object-cover"
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload="auto"
                  style={{ background: '#0A192F' }}
                >
                  <source src="/videos/orca-demo.mp4" type="video/mp4" />
                </video>

                {/* Dark gradient overlay at bottom for stats readability */}
                <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />

                {/* Live badge */}
                <div className="absolute top-3 left-3 z-20 flex items-center space-x-1.5 bg-black/50 backdrop-blur-sm border border-white/10 rounded-md px-2.5 py-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span className="text-white text-[11px] font-semibold">Live Marine View</span>
                  <span className="text-emerald-400 text-[11px] font-bold ml-0.5">· Live</span>
                </div>

                {/* Weather badge */}
                <div className="absolute top-3 right-3 z-20 flex items-center space-x-1.5 bg-black/50 backdrop-blur-sm border border-white/10 rounded-md px-2.5 py-1.5">
                  <Cloud className="w-3.5 h-3.5 text-gray-300" />
                  <div>
                    <p className="text-white text-[11px] font-bold leading-none">28.2°C</p>
                    <p className="text-gray-400 text-[9px] leading-none mt-0.5">Partly Cloudy</p>
                  </div>
                </div>
              </div>

              {/* Stats bar */}
              <div className="bg-[#0a1929] border-t border-white/[0.07] px-4 py-3 grid grid-cols-5 divide-x divide-white/[0.07]">
                {[
                  { icon: Navigation2, label: 'Distance to PFZ', value: '32.4 km',  sub: null,           valueColor: 'text-white' },
                  { icon: null,        label: 'ETA',              value: '1h 42m',   sub: null,           valueColor: 'text-white',  emoji: '⏱' },
                  { icon: Waves,       label: 'Wave Height',      value: '1.4 m',    sub: '↓ Low',        valueColor: 'text-white',  subColor: 'text-emerald-400' },
                  { icon: null,        label: 'Wind Speed',       value: '18 km/h',  sub: '↑ Moderate',   valueColor: 'text-white',  subColor: 'text-amber-400', emoji: '💨' },
                  { icon: Thermometer, label: 'Sea Temp',         value: '28.2°C',   sub: '↑ Favourable', valueColor: 'text-white',  subColor: 'text-emerald-400' },
                ].map((s, i) => (
                  <div key={i} className={`${i === 0 ? 'pr-3' : i === 4 ? 'pl-3' : 'px-3'}`}>
                    <div className="flex items-center space-x-1 mb-1">
                      {s.icon ? <s.icon className="w-2.5 h-2.5 text-gray-500" /> : <span className="text-[10px]">{s.emoji}</span>}
                      <p className="text-[9px] text-gray-500 uppercase tracking-wider leading-none">{s.label}</p>
                    </div>
                    <p className={`${s.valueColor} text-base font-bold leading-none`}>{s.value}</p>
                    {s.sub && <p className={`${(s as any).subColor} text-[9px] mt-0.5 font-medium`}>{s.sub}</p>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* ── INTELLIGENCE FOR EVERY OCEAN USER ────────────────────── */}
      <section id="use-cases" className="bg-gray-50 border-t border-gray-100 py-14 px-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-10">Intelligence for Every Ocean User</h2>
          <div className="grid grid-cols-5 gap-4">
            {[
              { icon: Fish,          color: 'text-blue-600',   bg: 'bg-blue-50',   title: 'Fishermen',          desc: 'Find best fishing zones, check conditions, get alerts and navigate safely.' },
              { icon: Microscope,    color: 'text-emerald-600',bg: 'bg-emerald-50', title: 'Marine Researchers', desc: 'Explore ocean data, analyze trends and generate scientific insights.' },
              { icon: Anchor,        color: 'text-indigo-600', bg: 'bg-indigo-50',  title: 'Coastal Authorities',desc: 'Monitor marine activities, manage resources and ensure coastal safety.' },
              { icon: AlertTriangle, color: 'text-orange-500', bg: 'bg-orange-50',  title: 'Disaster Managers',  desc: 'Track hazards, identify risks and make faster decisions to save lives.' },
              { icon: Ship,          color: 'text-teal-600',   bg: 'bg-teal-50',    title: 'Maritime Operators', desc: 'Plan routes, optimize operations and reduce risk & fuel consumption.' },
            ].map(u => (
              <div key={u.title} className="bg-white rounded-xl border border-gray-100 p-5 hover:shadow-md transition-shadow">
                <div className={`${u.bg} ${u.color} w-10 h-10 rounded-lg flex items-center justify-center mb-4`}>
                  <u.icon className="w-5 h-5" />
                </div>
                <h3 className={`text-sm font-bold ${u.color} mb-2`}>{u.title}</h3>
                <p className="text-xs text-gray-500 leading-relaxed mb-4">{u.desc}</p>
                <Link to="/roles" className={`text-xs font-semibold ${u.color} flex items-center space-x-1 hover:underline`}>
                  <span>Explore</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOOTER TRUST BAR ─────────────────────────────────────── */}
      <footer className="border-t border-gray-100 bg-white py-8 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-4 gap-8 divide-x divide-gray-100">
          {[
            { icon: ShieldCheck, title: 'Trusted Data Sources',  sub: 'ISRO · NOAA · INCOIS · IMD · Global Agencies' },
            { icon: Zap,         title: 'Powered by Agentic AI', sub: 'Autonomous · Adaptive · Explainable'           },
            { icon: Lock,        title: 'Secure & Reliable',     sub: 'Your data is safe with us'                     },
            { icon: Users,       title: 'Built for Everyone',    sub: 'Accessible · Simple · Multilingual'            },
          ].map((item, i) => (
            <div key={item.title} className={`${i > 0 ? 'pl-8' : ''} flex items-start space-x-3`}>
              <item.icon className="w-5 h-5 text-marine-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-gray-800">{item.title}</p>
                <p className="text-xs text-gray-400 mt-0.5">{item.sub}</p>
              </div>
            </div>
          ))}
        </div>
      </footer>

    </div>
  );
};
