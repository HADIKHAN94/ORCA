import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { Send, Bot, User, CircleDashed, CheckCircle, Mic, MicOff, Globe } from 'lucide-react';
import { MarineMap, type MapConfig } from '../components/MarineMap';
import { useRole } from '../context/RoleContext';
import { useOceanData } from '../hooks/useOceanData';
import { usePFZ } from '../hooks/usePFZ';
import { useSafety } from '../hooks/useSafety';

interface Message { role: 'user' | 'assistant'; content: string; }
interface Agent { id: string; name: string; status: 'idle' | 'running' | 'complete'; }

const AGENT_NAMES = ['Ocean Data Agent', 'Weather Agent', 'Safety Agent', 'Fishing Advisory Agent', 'Reasoning Agent'];

const LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'hi', name: 'Hindi' },
  { code: 'mr', name: 'Marathi' },
  { code: 'te', name: 'Telugu' },
  { code: 'ta', name: 'Tamil' }
];

const buildContext = (ocean: any, safety: any, pfz: any, location: any) => {
  if (!ocean) return 'Live data is still loading.';
  const zones = pfz?.zones?.slice(0, 3).map((z: any) =>
    `  • ${z.id}: ${z.distance_km}km ${z.bearing_label} | Species: ${z.species?.join(', ')} | Intensity: ${z.intensity} | Chlorophyll: ${z.chlorophyll} mg/m³`
  ).join('\n') || '  No zones found near this location.';

  return `Location: ${location.name} (${location.lat.toFixed(2)}°N, ${location.lon.toFixed(2)}°E)

SEA CONDITIONS:
  • Wave Height: ${ocean.wave_height}m | Swell: ${ocean.swell_height}m | Period: ${ocean.wave_period}s
  • Wind: ${ocean.wind_speed} km/h from ${ocean.wind_direction_label}
  • Sea Surface Temp: ${ocean.sst}°C
  • Ocean Current: ${ocean.current_velocity} m/s
  • Visibility: ${ocean.visibility}

SAFETY:
  • Score: ${safety?.score ?? 'N/A'}/100 — ${safety?.label ?? 'N/A'}
  • Recommendation: ${safety?.recommendation ?? 'N/A'}
  • Distance to IMBL boundary: ${safety?.distance_to_imbl_km ?? 'N/A'} km
  • Nearest Port: ${safety?.nearest_port ?? 'N/A'}

POTENTIAL FISHING ZONES (PFZ):
${pfz?.monsoon_ban ? '  ⚠️ Monsoon ban ACTIVE — PFZ advisory suspended.' : zones}
  Total zones in radius: ${pfz?.total_zones ?? 0}`.trim();
};

export const Copilot: React.FC = () => {
  const { location } = useRole();
  const { data: ocean } = useOceanData(location.lat, location.lon);
  const { data: pfz } = usePFZ(location.lat, location.lon);
  const { data: safety } = useSafety(location.lat, location.lon);

  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: `👋 Hello! I'm **ORCA**, your AI marine intelligence copilot.\n\nI have **live data for ${location.name}** loaded. You can ask me:\n- 🛡️ "Is it safe to fish today?"\n- 🐟 "Where are the nearest fishing zones?"\n- 🌊 "What are the wave conditions?"\n- 💨 "Wind forecast for next 6 hours?"` }
  ]);
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [latestMapConfig, setLatestMapConfig] = useState<MapConfig | null>(null);
  const [agents, setAgents] = useState<Agent[]>(AGENT_NAMES.map(n => ({ id: n, name: n, status: 'idle' })));
  const [showResult, setShowResult] = useState(false);
  const [showSimulation, setShowSimulation] = useState(false);
  const [windSpeed, setWindSpeed] = useState(20);
  const [simulationResult, setSimulationResult] = useState<any>(null);
  const [isListening, setIsListening] = useState(false);
  
  const [lang, setLang] = useState('en');
  const bottomRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  // Auto-parse map config from latest AI message
  useEffect(() => {
    if (messages.length > 0) {
      const lastMsg = messages[messages.length - 1];
      if (lastMsg.role === 'assistant') {
        const match = lastMsg.content.match(/<map_config>([\s\S]*?)<\/map_config>/);
        if (match) {
          try {
            const parsed = JSON.parse(match[1]);
            setLatestMapConfig(parsed);
          } catch (e) {
            console.error("Failed to parse AI map config", e);
          }
        }
      }
    }
  }, [messages]);

  const toggleListen = () => {
    if (!SpeechRecognition) return alert('Speech Recognition not supported in this browser.');
    const recognition = new SpeechRecognition();
    recognition.lang = lang === 'en' ? 'en-IN' : `${lang}-IN`;
    recognition.start();
    setIsListening(true);
    recognition.onresult = (event: any) => {
      setInput(event.results[0][0].transcript);
      setIsListening(false);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
  };

  const animateAgents = async () => {
    for (let i = 0; i < AGENT_NAMES.length; i++) {
      setAgents(prev => prev.map((a, idx) => ({ ...a, status: idx === i ? 'running' : idx < i ? 'complete' : 'idle' })));
      await new Promise(r => setTimeout(r, 350 + Math.random() * 250));
    }
    setAgents(prev => prev.map(a => ({ ...a, status: 'complete' })));
  };

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || isProcessing) return;

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsProcessing(true);
    setShowResult(false);
    setShowSimulation(false);
    setSimulationResult(null);
    setAgents(AGENT_NAMES.map(n => ({ id: n, name: n, status: 'idle' })));

    animateAgents();
    const ctx = buildContext(ocean, safety, pfz, location);
    const abort = new AbortController();
    abortRef.current = abort;

    try {
      const resp = await fetch('http://127.0.0.1:8000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg, lat: location.lat, lon: location.lon, context: ctx, lang }),
        signal: abort.signal
      });

      if (resp.ok && resp.body) {
        const reader = resp.body.getReader();
        const decoder = new TextDecoder();
        // Add empty assistant message to stream into
        setMessages(prev => [...prev, { role: 'assistant', content: '' }]);
        let buffer = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });

          // SSE events are separated by double newline
          const parts = buffer.split(/\r?\n\r?\n/);
          // Keep the last incomplete part in the buffer
          buffer = parts.pop() ?? '';

          for (const part of parts) {
            // Collect all data: lines in this SSE event and join with \n
            const dataLines = part.split('\n')
              .filter(l => l.startsWith('data: '))
              .map(l => l.substring(6));

            if (dataLines.length === 0) continue;

            for (const rawData of dataLines) {
              try {
                const text = JSON.parse(rawData) as string;
                console.log("RECEIVED TEXT:", text);
                setMessages(prev => {
                  const msgs = [...prev];
                  msgs[msgs.length - 1] = {
                    ...msgs[msgs.length - 1],
                    content: msgs[msgs.length - 1].content + text
                  };
                  return msgs;
                });
              } catch (e) { 
                console.error("JSON PARSE ERROR:", e, "RAW:", rawData);
                // fallback
                setMessages(prev => {
                  const msgs = [...prev];
                  msgs[msgs.length - 1] = {
                    ...msgs[msgs.length - 1],
                    content: msgs[msgs.length - 1].content + rawData
                  };
                  return msgs;
                });
              }
            }
          }
        }
        setShowResult(true);
      } else {
        throw new Error(`Backend returned ${resp.status}`);
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        setMessages(prev => [...prev, { role: 'assistant', content: `⚠️ Error connecting to ORCA AI. Please check that the backend is running on port 8000.\n\n*${err.message}*` }]);
      }
    }

    setIsProcessing(false);
  };

  const handleQuickQuestion = (q: string) => {
    setInput(q);
  };

  const runWhatIfSimulation = async () => {
    setIsProcessing(true);
    await new Promise(r => setTimeout(r, 1200));
    const baseScore = safety?.score ?? 70;
    const windFactor = windSpeed / (safety?.conditions?.wind_speed?.threshold ?? 30);
    const newScore = Math.max(0, Math.min(100, Math.round(baseScore - windFactor * 40)));
    setSimulationResult({
      risk: newScore < 40 ? 'High' : 'Moderate',
      score: newScore,
      route: windSpeed > 40 ? 'Coastal Route (12nm limit)' : 'Direct Route',
      eta: windSpeed > 40 ? '4h 20m' : '2h 45m',
      reason: `At ${windSpeed} km/h wind, safety drops to ${newScore}/100. ${windSpeed > 40 ? 'Stay within 12nm of coast.' : 'Conditions manageable with precautions.'}`,
    });
    setIsProcessing(false);
  };

  return (
    <div className="h-full flex gap-6 overflow-hidden">
      {/* Chat Panel */}
      <div className="flex-1 flex flex-col bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-marine-50 to-teal-50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-marine-600 flex items-center justify-center text-white shadow-sm">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-marine-900">ORCA Marine AI Copilot</h2>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                <p className="text-xs text-gray-500">Live context: {location.name}</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-gray-400" />
            <select value={lang} onChange={e => setLang(e.target.value)} className="text-xs bg-white border border-gray-200 rounded-lg p-1.5 outline-none focus:ring-2 focus:ring-marine-300">
              {LANGUAGES.map(l => <option key={l.code} value={l.code}>{l.name}</option>)}
            </select>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {messages.map((msg, i) => (
            <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.role === 'assistant' && (
                <div className="w-8 h-8 rounded-full bg-marine-600 flex items-center justify-center text-white flex-shrink-0 mt-1 shadow-sm">
                  <Bot className="w-4 h-4" />
                </div>
              )}
                            <div className={`max-w-[82%] ${msg.role === 'user'
                  ? 'bg-marine-600 text-white px-4 py-2.5 rounded-2xl rounded-tr-sm text-sm'
                  : 'bg-gray-50 border border-gray-200 px-5 py-4 rounded-2xl rounded-tl-sm text-sm'
                }`}>
                {msg.role === 'user' ? (
                  <span>{msg.content}</span>
                ) : (
                  <div className="prose prose-sm max-w-none prose-headings:text-marine-900 prose-headings:font-bold prose-table:text-xs prose-th:bg-marine-50 prose-th:text-marine-800">
                    <ReactMarkdown>{
                      msg.content.replace(/<map_config>[\s\S]*?<\/map_config>/g, '')
                    }</ReactMarkdown>
                  </div>
                )}
                {msg.role === 'assistant' && showResult && i === messages.length - 1 && (
                  <div className="mt-3 pt-3 border-t border-gray-200 flex gap-2 flex-wrap">
                    <button className="text-xs bg-marine-50 text-marine-700 px-3 py-1.5 rounded-lg border border-marine-200 hover:bg-marine-100 transition-colors font-medium">📊 View Evidence</button>
                    <button onClick={() => setShowSimulation(true)} className="text-xs bg-marine-50 text-marine-700 px-3 py-1.5 rounded-lg border border-marine-200 hover:bg-marine-100 transition-colors font-medium">🔮 Simulate Scenario</button>
                  </div>
                )}
              </div>
              {msg.role === 'user' && (
                <div className="w-8 h-8 rounded-full bg-marine-100 flex items-center justify-center text-marine-700 flex-shrink-0 mt-1">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}
          {isProcessing && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-marine-600 flex items-center justify-center text-white flex-shrink-0 mt-1 shadow-sm"><Bot className="w-4 h-4" /></div>
              <div className="bg-gray-50 border border-gray-200 px-5 py-4 rounded-2xl rounded-tl-sm min-w-[280px]">
                <h3 className="font-bold text-marine-900 mb-3 flex items-center gap-2 text-sm">
                  <span className="w-5 h-5 bg-marine-100 rounded flex items-center justify-center text-marine-700 text-xs">🤖</span>
                  Agentic Execution Trace
                </h3>
                <div className="space-y-2.5">
                  {agents.map(agent => (
                    <div key={agent.id} className="flex items-center gap-2.5">
                      {agent.status === 'idle' && <CircleDashed className="w-4 h-4 text-gray-300" />}
                      {agent.status === 'running' && <div className="w-4 h-4 rounded-full border-2 border-marine-500 border-t-transparent animate-spin" />}
                      {agent.status === 'complete' && <CheckCircle className="w-4 h-4 text-green-500" />}
                      <span className={`text-sm ${agent.status === 'complete' ? 'text-gray-900 font-medium' : 'text-gray-400'}`}>{agent.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Quick questions */}
        <div className="px-4 pt-2 flex gap-2 overflow-x-auto pb-1">
          {['Is it safe to fish today?', `Nearest PFZ from ${location.name}?`, 'Wave & wind conditions?', 'Best time to fish tomorrow?'].map(q => (
            <button key={q} type="button" onClick={() => handleQuickQuestion(q)} className="whitespace-nowrap text-xs bg-marine-50 text-marine-700 px-3 py-1.5 rounded-full hover:bg-marine-100 border border-marine-200 transition-colors font-medium flex-shrink-0">{q}</button>
          ))}
        </div>

        {/* Input */}
        <form onSubmit={handleSend} className="p-4 border-t border-gray-100">
          <div className="flex items-center gap-2">
            <button type="button" onClick={toggleListen} className={`p-2.5 rounded-xl transition-colors flex-shrink-0 ${isListening ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>
            <input type="text" value={input} onChange={e => setInput(e.target.value)}
              placeholder={isListening ? "🎤 Listening..." : "Ask about fishing zones, weather, safety, routes..."}
              className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-marine-300 transition-all" />
            <button type="submit" disabled={!input.trim() || isProcessing}
              className="p-2.5 bg-marine-600 text-white rounded-xl hover:bg-marine-700 disabled:opacity-40 transition-colors flex-shrink-0">
              <Send className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>

      {/* Right Panel */}
      <div className="w-[360px] flex flex-col gap-4 overflow-y-auto">
        {showResult && !showSimulation && (
          <div className="flex-1 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden" style={{ minHeight: '280px' }}>
            <MarineMap showRoute={true} config={latestMapConfig} />
          </div>
        )}

        {showSimulation && (
          <div className="flex-1 bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <h3 className="font-bold text-marine-900 mb-4 text-sm">🔮 What-If Simulation</h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-gray-700 block mb-1">Wind Speed Scenario: <strong>{windSpeed} km/h</strong></label>
                <input type="range" min="5" max="60" value={windSpeed} onChange={e => setWindSpeed(Number(e.target.value))} className="w-full accent-marine-600" />
                <div className="flex justify-between text-xs text-gray-400 mt-0.5"><span>Calm</span><span>Moderate</span><span>Storm</span></div>
              </div>
              <button onClick={runWhatIfSimulation} disabled={isProcessing} className="w-full bg-marine-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-marine-700 transition-colors disabled:opacity-50">Run Simulation</button>
              {simulationResult && (
                <div className={`p-4 border rounded-lg ${simulationResult.risk === 'High' ? 'bg-red-50 border-red-200' : 'bg-amber-50 border-amber-200'}`}>
                  <h4 className="font-bold text-gray-900 mb-2 text-sm">Simulated Outcome</h4>
                  <div className="space-y-1.5 text-sm">
                    <div className="flex justify-between"><span>Risk:</span><span className={`font-bold ${simulationResult.risk === 'High' ? 'text-red-600' : 'text-amber-600'}`}>{simulationResult.risk}</span></div>
                    <div className="flex justify-between"><span>Safety Score:</span><strong>{simulationResult.score}/100</strong></div>
                    <div className="flex justify-between"><span>Route:</span><strong>{simulationResult.route}</strong></div>
                    <div className="flex justify-between"><span>ETA:</span><strong>{simulationResult.eta}</strong></div>
                  </div>
                  <p className="text-xs text-gray-600 mt-3 pt-3 border-t border-gray-200">{simulationResult.reason}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};







