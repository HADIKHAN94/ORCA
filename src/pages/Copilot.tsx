import React, { useState } from 'react';
import { Send, Bot, User, CheckCircle, CircleDashed } from 'lucide-react';
import { MarineMap } from '../components/MarineMap';

type AgentStatus = 'idle' | 'running' | 'complete';

interface AgentTask {
  id: string;
  name: string;
  status: AgentStatus;
}

export const Copilot: React.FC = () => {
  const [messages, setMessages] = useState<{role: 'user'|'assistant', content: string}[]>([
    { role: 'assistant', content: 'Hello! I am ORCA, your Agentic Marine Copilot. How can I assist you with your operations today?' }
  ]);
  const [input, setInput] = useState('');
  const [agents, setAgents] = useState<AgentTask[]>([
    { id: 'planner', name: 'Planner Agent', status: 'idle' },
    { id: 'marine', name: 'Marine Data Agent', status: 'idle' },
    { id: 'weather', name: 'Weather Agent', status: 'idle' },
    { id: 'fishing', name: 'PFZ Analysis Agent', status: 'idle' },
    { id: 'risk', name: 'Risk Assessment Agent', status: 'idle' },
    { id: 'route', name: 'Route Optimization Agent', status: 'idle' }
  ]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [showSimulation, setShowSimulation] = useState(false);
  const [windSpeed, setWindSpeed] = useState(18);
  const [simulationResult, setSimulationResult] = useState<any>(null);

  const simulateWorkflow = async () => {
    setIsProcessing(true);
    setShowResult(false);
    
    // Reset agent states
    setAgents(agents.map(a => ({...a, status: 'idle'})));

    // Sequential simulation of agents working
    for (let i = 0; i < agents.length; i++) {
      setAgents(prev => {
        const next = [...prev];
        next[i].status = 'running';
        return next;
      });
      
      await new Promise(r => setTimeout(r, 600)); // Simulate work
      
      setAgents(prev => {
        const next = [...prev];
        next[i].status = 'complete';
        return next;
      });
    }

    setIsProcessing(false);
    setShowResult(true);
    setMessages(prev => [...prev, {
      role: 'assistant', 
      content: 'I recommend **PFZ Zone B** for tomorrow morning.\n\nFishing potential: High\nSafety: Good\nDistance: 32.4 km\nETA: 1h 42m\n\nI rejected Zone C because wave conditions are forecast to increase above safe limits.'
    }]);
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    
    setMessages(prev => [...prev, { role: 'user', content: input }]);
    const query = input.toLowerCase();
    setInput('');
    
    // Trigger the deterministic demo if it looks like the golden path question
    if (query.includes('where') || query.includes('fish') || query.includes('tomorrow')) {
      simulateWorkflow();
    } else {
      setTimeout(() => {
        setMessages(prev => [...prev, { role: 'assistant', content: 'I can assist you better if you ask about fishing zones, safety, or routes. Try asking: "Where should I fish tomorrow morning?"' }]);
      }, 1000);
    }
  };

  const runWhatIfSimulation = async () => {
    setIsProcessing(true);
    setSimulationResult(null);
    await new Promise(r => setTimeout(r, 1000));
    
    if (windSpeed > 30) {
      setSimulationResult({
        risk: 'High',
        route: 'Route A',
        eta: '1h 55m',
        reason: 'The original route is no longer recommended because increased wind raises risk exposure. Route A is chosen despite being longer.'
      });
    } else {
      setSimulationResult({
        risk: 'Moderate',
        route: 'Route B',
        eta: '1h 42m',
        reason: 'Conditions remain acceptable for the primary route.'
      });
    }
    setIsProcessing(false);
  };

  return (
    <div className="h-full flex gap-6">
      {/* Chat Area */}
      <div className="flex-1 bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center gap-3 bg-gray-50">
          <div className="w-10 h-10 bg-marine-100 rounded-full flex items-center justify-center text-marine-700">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-bold text-marine-900">Ask ORCA</h2>
            <p className="text-xs text-gray-500">Your AI Marine Copilot</p>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.map((msg, i) => (
            <div key={i} className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.role === 'assistant' && (
                <div className="w-8 h-8 rounded-full bg-marine-100 flex items-center justify-center text-marine-700 flex-shrink-0 mt-1">
                  <Bot className="w-4 h-4" />
                </div>
              )}
              
              <div className={`px-4 py-3 rounded-2xl max-w-[80%] ${
                msg.role === 'user' 
                  ? 'bg-marine-600 text-white rounded-tr-sm' 
                  : 'bg-gray-100 text-gray-800 rounded-tl-sm'
              }`}>
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                
                {/* Simulated Output UI */}
                {msg.role === 'assistant' && showResult && i === messages.length - 1 && (
                  <div className="mt-4 flex gap-2">
                    <button className="text-xs bg-white text-marine-700 px-3 py-1.5 rounded font-medium border border-marine-200 hover:bg-marine-50 transition-colors">
                      View Evidence
                    </button>
                    <button 
                      onClick={() => setShowSimulation(true)}
                      className="text-xs bg-white text-marine-700 px-3 py-1.5 rounded font-medium border border-marine-200 hover:bg-marine-50 transition-colors">
                      Simulate Scenario
                    </button>
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
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-marine-100 flex items-center justify-center text-marine-700 flex-shrink-0 mt-1">
                <Bot className="w-4 h-4" />
              </div>
              <div className="px-4 py-3 rounded-2xl bg-gray-100 text-gray-800 rounded-tl-sm">
                <div className="flex space-x-1 items-center h-5">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            </div>
          )}
        </div>

        <form onSubmit={handleSend} className="p-4 border-t border-gray-100 bg-white">
          <div className="relative">
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about fishing zones, weather, routes..." 
              className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-4 pr-12 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-marine-300 transition-all"
            />
            <button 
              type="submit" 
              disabled={!input.trim() || isProcessing}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-marine-600 text-white rounded-lg hover:bg-marine-700 transition-colors disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
          <div className="flex gap-2 mt-3 overflow-x-auto pb-1 hide-scrollbar">
            {["Where is the nearest PFZ?", "Is it safe to go tomorrow?", "Show safest route"].map(q => (
              <button 
                key={q} 
                type="button"
                onClick={() => setInput(q)}
                className="whitespace-nowrap text-xs bg-gray-100 text-gray-600 px-3 py-1.5 rounded-full hover:bg-gray-200 transition-colors border border-gray-200"
              >
                {q}
              </button>
            ))}
          </div>
        </form>
      </div>

      {/* Agents & Map Right Panel */}
      <div className="w-[400px] flex flex-col gap-6">
        
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <h3 className="font-bold text-marine-900 mb-4 flex items-center gap-2">
            Agentic Execution Trace
          </h3>
          <div className="space-y-3">
            {agents.map((agent) => (
              <div key={agent.id} className="flex items-center gap-3">
                {agent.status === 'idle' && <CircleDashed className="w-5 h-5 text-gray-300" />}
                {agent.status === 'running' && <div className="w-5 h-5 rounded-full border-2 border-marine-500 border-t-transparent animate-spin"></div>}
                {agent.status === 'complete' && <CheckCircle className="w-5 h-5 text-green-500" />}
                <span className={`text-sm font-medium ${agent.status === 'complete' ? 'text-gray-900' : 'text-gray-500'}`}>
                  {agent.name}
                </span>
              </div>
            ))}
          </div>
        </div>

        {showResult && !showSimulation && (
          <div className="flex-1 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col p-2">
            <MarineMap showRoute={true} />
          </div>
        )}

        {showSimulation && (
          <div className="flex-1 bg-white rounded-xl border border-gray-200 shadow-sm p-5 flex flex-col">
            <h3 className="font-bold text-marine-900 mb-4">What-If Simulation</h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Wind Speed (km/h): {windSpeed}</label>
                <input 
                  type="range" 
                  min="5" 
                  max="60" 
                  value={windSpeed}
                  onChange={(e) => setWindSpeed(Number(e.target.value))}
                  className="w-full accent-marine-600"
                />
              </div>
              <button 
                onClick={runWhatIfSimulation}
                disabled={isProcessing}
                className="w-full bg-marine-600 text-white py-2 rounded-lg font-medium hover:bg-marine-700 transition-colors disabled:opacity-50"
              >
                Run Simulation
              </button>

              {simulationResult && (
                <div className="mt-4 p-4 border border-marine-200 bg-marine-50 rounded-lg">
                  <h4 className="font-bold text-marine-900 mb-2">Simulated Outcome</h4>
                  <div className="space-y-2 text-sm text-gray-700">
                    <p className="flex justify-between"><span>Risk Level:</span> <span className={simulationResult.risk === 'High' ? 'text-risk-high font-bold' : 'text-risk-moderate font-bold'}>{simulationResult.risk}</span></p>
                    <p className="flex justify-between"><span>New Route:</span> <strong>{simulationResult.route}</strong></p>
                    <p className="flex justify-between"><span>ETA:</span> <strong>{simulationResult.eta}</strong></p>
                  </div>
                  <p className="text-xs text-gray-600 mt-3 pt-3 border-t border-marine-200">
                    {simulationResult.reason}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
