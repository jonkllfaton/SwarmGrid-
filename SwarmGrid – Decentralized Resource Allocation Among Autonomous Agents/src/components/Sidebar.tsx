import React, { useState } from 'react';
import { useSimulation } from '../context/SimulationContext';
import { Play, Pause, RotateCcw, StepForward, Settings, BarChart3, Grid } from 'lucide-react';

const Sidebar: React.FC = () => {
  const { state, settings, updateSettings, startSimulation, pauseSimulation, resetSimulation, stepSimulation } = useSimulation();
  const [activeTab, setActiveTab] = useState<'controls' | 'settings' | 'stats'>('controls');

  const handleSpeedChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSpeed = parseFloat(e.target.value);
    // Restart simulation with new speed if it was running
    const wasRunning = state.isRunning;
    if (wasRunning) pauseSimulation();
    
    updateSettings({ speed: newSpeed });
    
    if (wasRunning) startSimulation();
  };

  const handleSettingChange = (
    setting: keyof typeof settings,
    value: number | string | Record<string, any>
  ) => {
    updateSettings({ [setting]: value });
  };

  return (
    <div className="w-full md:w-80 bg-gray-800 border-r border-gray-700 flex flex-col h-full shrink-0">
      <div className="flex border-b border-gray-700">
        <button
          className={`flex-1 py-3 ${activeTab === 'controls' ? 'bg-gray-700 text-blue-400' : 'text-gray-400 hover:bg-gray-700/50'}`}
          onClick={() => setActiveTab('controls')}
        >
          <Grid size={18} className="mx-auto" />
        </button>
        <button
          className={`flex-1 py-3 ${activeTab === 'settings' ? 'bg-gray-700 text-blue-400' : 'text-gray-400 hover:bg-gray-700/50'}`}
          onClick={() => setActiveTab('settings')}
        >
          <Settings size={18} className="mx-auto" />
        </button>
        <button
          className={`flex-1 py-3 ${activeTab === 'stats' ? 'bg-gray-700 text-blue-400' : 'text-gray-400 hover:bg-gray-700/50'}`}
          onClick={() => setActiveTab('stats')}
        >
          <BarChart3 size={18} className="mx-auto" />
        </button>
      </div>
      
      <div className="p-4 flex-grow overflow-y-auto">
        {activeTab === 'controls' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold mb-4 text-blue-400">Simulation Controls</h2>
              
              <div className="flex space-x-2 mb-6">
                {!state.isRunning ? (
                  <button
                    onClick={startSimulation}
                    className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-md flex items-center"
                  >
                    <Play size={16} className="mr-1" />
                    Start
                  </button>
                ) : (
                  <button
                    onClick={pauseSimulation}
                    className="bg-amber-600 hover:bg-amber-700 text-white py-2 px-4 rounded-md flex items-center"
                  >
                    <Pause size={16} className="mr-1" />
                    Pause
                  </button>
                )}
                
                <button
                  onClick={resetSimulation}
                  className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-md flex items-center"
                >
                  <RotateCcw size={16} className="mr-1" />
                  Reset
                </button>
                
                <button
                  onClick={stepSimulation}
                  className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md flex items-center"
                  disabled={state.isRunning}
                >
                  <StepForward size={16} className="mr-1" />
                  Step
                </button>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Simulation Speed
                </label>
                <input
                  type="range"
                  min="0.5"
                  max="5"
                  step="0.5"
                  value={state.speed}
                  onChange={handleSpeedChange}
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>Slow</span>
                  <span>Normal</span>
                  <span>Fast</span>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-md font-semibold mb-2 text-gray-200">Visualization Mode</h3>
              <div className="grid grid-cols-3 gap-2">
                {(['normal', 'heatmap', 'network'] as const).map((mode) => (
                  <button
                    key={mode}
                    className={`py-2 px-3 rounded-md text-sm ${
                      settings.visualizationMode === mode
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                    onClick={() => handleSettingChange('visualizationMode', mode)}
                  >
                    {mode.charAt(0).toUpperCase() + mode.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="bg-gray-700/50 p-3 rounded-md">
              <h3 className="text-sm font-medium text-gray-300 mb-2">Simulation Status</h3>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Tick:</span>
                  <span className="text-white font-mono">{state.tick}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Agents:</span>
                  <span className="text-white font-mono">{state.agents.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Transactions:</span>
                  <span className="text-white font-mono">{state.transactions.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Status:</span>
                  <span className={`font-mono ${state.isRunning ? 'text-green-400' : 'text-amber-400'}`}>
                    {state.isRunning ? 'Running' : 'Paused'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'settings' && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold mb-4 text-blue-400">Simulation Settings</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Grid Size
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-xs text-gray-400">Width</span>
                    <input
                      type="number"
                      min="5"
                      max="50"
                      value={settings.gridWidth}
                      onChange={(e) => handleSettingChange('gridWidth', parseInt(e.target.value))}
                      className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-1.5 text-sm"
                    />
                  </div>
                  <div>
                    <span className="text-xs text-gray-400">Height</span>
                    <input
                      type="number"
                      min="5"
                      max="50"
                      value={settings.gridHeight}
                      onChange={(e) => handleSettingChange('gridHeight', parseInt(e.target.value))}
                      className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-1.5 text-sm"
                    />
                  </div>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Initial Agents: {settings.initialAgents}
                </label>
                <input
                  type="range"
                  min="10"
                  max="200"
                  value={settings.initialAgents}
                  onChange={(e) => handleSettingChange('initialAgents', parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Agent Distribution
                </label>
                <div className="space-y-2">
                  <div>
                    <div className="flex justify-between text-xs text-gray-400 mb-1">
                      <span>Providers: {Math.round(settings.providerRatio * 100)}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={settings.providerRatio}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value);
                        // Adjust other ratios to ensure sum is 1
                        const remaining = 1 - val;
                        const consumerRatio = remaining * (settings.consumerRatio / (settings.consumerRatio + settings.hybridRatio));
                        const hybridRatio = remaining - consumerRatio;
                        
                        updateSettings({
                          providerRatio: val,
                          consumerRatio,
                          hybridRatio
                        });
                      }}
                      className="w-full h-2 bg-green-900 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-xs text-gray-400 mb-1">
                      <span>Consumers: {Math.round(settings.consumerRatio * 100)}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={settings.consumerRatio}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value);
                        // Adjust other ratios to ensure sum is 1
                        const remaining = 1 - val;
                        const providerRatio = remaining * (settings.providerRatio / (settings.providerRatio + settings.hybridRatio));
                        const hybridRatio = remaining - providerRatio;
                        
                        updateSettings({
                          consumerRatio: val,
                          providerRatio,
                          hybridRatio
                        });
                      }}
                      className="w-full h-2 bg-red-900 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-xs text-gray-400 mb-1">
                      <span>Hybrid: {Math.round(settings.hybridRatio * 100)}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={settings.hybridRatio}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value);
                        // Adjust other ratios to ensure sum is 1
                        const remaining = 1 - val;
                        const providerRatio = remaining * (settings.providerRatio / (settings.providerRatio + settings.consumerRatio));
                        const consumerRatio = remaining - providerRatio;
                        
                        updateSettings({
                          hybridRatio: val,
                          providerRatio,
                          consumerRatio
                        });
                      }}
                      className="w-full h-2 bg-purple-900 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Movement Probability: {Math.round(settings.movementProbability * 100)}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={settings.movementProbability}
                  onChange={(e) => handleSettingChange('movementProbability', parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Trade Probability: {Math.round(settings.tradeProbability * 100)}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={settings.tradeProbability}
                  onChange={(e) => handleSettingChange('tradeProbability', parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Reputation Impact: {Math.round(settings.reputationImpact * 100)}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="0.5"
                  step="0.01"
                  value={settings.reputationImpact}
                  onChange={(e) => handleSettingChange('reputationImpact', parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                />
              </div>
            </div>
            
            <button
              onClick={resetSimulation}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md mt-4"
            >
              Apply Settings
            </button>
          </div>
        )}
        
        {activeTab === 'stats' && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold mb-4 text-blue-400">Statistics</h2>
            
            <div className="bg-gray-700/50 p-3 rounded-md">
              <h3 className="text-sm font-medium text-blue-300 mb-2">Economic Metrics</h3>
              <div className="space-y-2">
                <div>
                  <label className="text-xs text-gray-400">Success Rate</label>
                  <div className="w-full bg-gray-700 rounded-full h-2.5">
                    <div 
                      className="bg-green-600 h-2.5 rounded-full" 
                      style={{ width: `${state.economicMetrics.successRate * 100}%` }}
                    ></div>
                  </div>
                  <div className="text-right text-xs text-gray-300">
                    {Math.round(state.economicMetrics.successRate * 100)}%
                  </div>
                </div>
                
                <div>
                  <label className="text-xs text-gray-400">Compute Utilization</label>
                  <div className="w-full bg-gray-700 rounded-full h-2.5">
                    <div 
                      className="bg-blue-600 h-2.5 rounded-full" 
                      style={{ width: `${state.economicMetrics.resourceUtilization.compute * 100}%` }}
                    ></div>
                  </div>
                  <div className="text-right text-xs text-gray-300">
                    {Math.round(state.economicMetrics.resourceUtilization.compute * 100)}%
                  </div>
                </div>
                
                <div>
                  <label className="text-xs text-gray-400">Storage Utilization</label>
                  <div className="w-full bg-gray-700 rounded-full h-2.5">
                    <div 
                      className="bg-yellow-500 h-2.5 rounded-full" 
                      style={{ width: `${state.economicMetrics.resourceUtilization.storage * 100}%` }}
                    ></div>
                  </div>
                  <div className="text-right text-xs text-gray-300">
                    {Math.round(state.economicMetrics.resourceUtilization.storage * 100)}%
                  </div>
                </div>
                
                <div>
                  <label className="text-xs text-gray-400">Data Utilization</label>
                  <div className="w-full bg-gray-700 rounded-full h-2.5">
                    <div 
                      className="bg-teal-500 h-2.5 rounded-full" 
                      style={{ width: `${state.economicMetrics.resourceUtilization.data * 100}%` }}
                    ></div>
                  </div>
                  <div className="text-right text-xs text-gray-300">
                    {Math.round(state.economicMetrics.resourceUtilization.data * 100)}%
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-700/50 p-3 rounded-md">
              <h3 className="text-sm font-medium text-blue-300 mb-2">Average Prices</h3>
              <div className="space-y-2">
                {(['compute', 'storage', 'data'] as const).map(resource => (
                  <div key={resource} className="flex justify-between items-center">
                    <span className="text-sm capitalize text-gray-300">{resource}</span>
                    <span className="font-mono text-sm">
                      {state.economicMetrics.averagePrice[resource].toFixed(2)} $
                    </span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="bg-gray-700/50 p-3 rounded-md">
              <h3 className="text-sm font-medium text-blue-300 mb-2">Agent Statistics</h3>
              <div className="space-y-2">
                {(['provider', 'consumer', 'hybrid'] as const).map(type => {
                  const count = state.agents.filter(a => a.type === type).length;
                  const percentage = (count / state.agents.length) * 100;
                  
                  return (
                    <div key={type}>
                      <label className="text-xs text-gray-400 capitalize">{type}s</label>
                      <div className="w-full bg-gray-700 rounded-full h-2.5">
                        <div 
                          className={`h-2.5 rounded-full ${
                            type === 'provider' 
                              ? 'bg-green-600' 
                              : type === 'consumer' 
                                ? 'bg-red-600' 
                                : 'bg-purple-600'
                          }`} 
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                      <div className="text-right text-xs text-gray-300">
                        {count} ({Math.round(percentage)}%)
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;