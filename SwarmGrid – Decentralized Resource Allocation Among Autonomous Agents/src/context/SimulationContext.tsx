import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { 
  Agent, 
  SimulationState, 
  SimulationSettings, 
  ResourceType,
  AgentType,
  Transaction,
  Position,
  GridCell
} from '../types';
import { generateRandomColor, generateId } from '../utils/helpers';
import { initializeGrid } from '../utils/gridUtils';

interface SimulationContextType {
  state: SimulationState;
  settings: SimulationSettings;
  updateSettings: (settings: Partial<SimulationSettings>) => void;
  startSimulation: () => void;
  pauseSimulation: () => void;
  resetSimulation: () => void;
  stepSimulation: () => void;
}

const defaultSettings: SimulationSettings = {
  gridWidth: 20,
  gridHeight: 20,
  initialAgents: 50,
  providerRatio: 0.4,
  consumerRatio: 0.4,
  hybridRatio: 0.2,
  initialResources: {
    compute: 1000,
    storage: 1000,
    data: 1000
  },
  movementProbability: 0.3,
  tradeProbability: 0.5,
  reputationImpact: 0.1,
  visualizationMode: 'normal'
};

const defaultState: SimulationState = {
  agents: [],
  grid: [],
  transactions: [],
  tick: 0,
  isRunning: false,
  speed: 1,
  gridSize: {
    width: defaultSettings.gridWidth,
    height: defaultSettings.gridHeight
  },
  resourceDistribution: {
    compute: { total: 0, distribution: [] },
    storage: { total: 0, distribution: [] },
    data: { total: 0, distribution: [] }
  },
  economicMetrics: {
    totalTransactions: 0,
    successRate: 0,
    averagePrice: {
      compute: 0,
      storage: 0,
      data: 0
    },
    resourceUtilization: {
      compute: 0,
      storage: 0,
      data: 0
    }
  }
};

const SimulationContext = createContext<SimulationContextType | undefined>(undefined);

export const SimulationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<SimulationSettings>(defaultSettings);
  const [state, setState] = useState<SimulationState>(defaultState);
  const [simulationInterval, setSimulationInterval] = useState<number | null>(null);

  // Initialize the simulation
  const initializeSimulation = useCallback(() => {
    const newAgents: Agent[] = [];
    const totalAgents = settings.initialAgents;
    const providerCount = Math.floor(totalAgents * settings.providerRatio);
    const consumerCount = Math.floor(totalAgents * settings.consumerRatio);
    const hybridCount = totalAgents - providerCount - consumerCount;

    // Create providers
    for (let i = 0; i < providerCount; i++) {
      newAgents.push(createAgent('provider'));
    }

    // Create consumers
    for (let i = 0; i < consumerCount; i++) {
      newAgents.push(createAgent('consumer'));
    }

    // Create hybrids
    for (let i = 0; i < hybridCount; i++) {
      newAgents.push(createAgent('hybrid'));
    }

    // Initialize grid
    const grid = initializeGrid(settings.gridWidth, settings.gridHeight);
    
    // Place agents on grid
    newAgents.forEach(agent => {
      grid[agent.position.y][agent.position.x].agents.push(agent);
    });

    // Initialize resource distribution
    const resourceDistribution = {
      compute: { 
        total: settings.initialResources.compute,
        distribution: Array(settings.gridHeight).fill(0).map(() => Array(settings.gridWidth).fill(0))
      },
      storage: { 
        total: settings.initialResources.storage,
        distribution: Array(settings.gridHeight).fill(0).map(() => Array(settings.gridWidth).fill(0)) 
      },
      data: { 
        total: settings.initialResources.data,
        distribution: Array(settings.gridHeight).fill(0).map(() => Array(settings.gridWidth).fill(0))
      }
    };

    // Distribute resources on grid
    distributeResources(grid, resourceDistribution);

    setState({
      ...defaultState,
      agents: newAgents,
      grid,
      gridSize: {
        width: settings.gridWidth,
        height: settings.gridHeight
      },
      resourceDistribution
    });
  }, [settings]);

  // Create a new agent
  const createAgent = (type: AgentType): Agent => {
    const x = Math.floor(Math.random() * settings.gridWidth);
    const y = Math.floor(Math.random() * settings.gridHeight);
    
    const resources = {
      compute: type === 'provider' || type === 'hybrid' ? Math.floor(Math.random() * 100) + 20 : 10,
      storage: type === 'provider' || type === 'hybrid' ? Math.floor(Math.random() * 100) + 20 : 10,
      data: type === 'provider' || type === 'hybrid' ? Math.floor(Math.random() * 100) + 20 : 10,
    };

    return {
      id: generateId(),
      type,
      position: { x, y },
      resources,
      inventory: [],
      reputation: 50, // Start with neutral reputation
      history: [],
      color: generateRandomColor(type)
    };
  };

  // Distribute resources on the grid
  const distributeResources = (
    grid: GridCell[][], 
    resourceDistribution: SimulationState['resourceDistribution']
  ) => {
    const resourceTypes: ResourceType[] = ['compute', 'storage', 'data'];
    
    resourceTypes.forEach(type => {
      let remaining = settings.initialResources[type];
      
      // Create some resource hotspots
      const hotspots = Math.floor(Math.random() * 5) + 3;
      
      for (let i = 0; i < hotspots; i++) {
        const x = Math.floor(Math.random() * settings.gridWidth);
        const y = Math.floor(Math.random() * settings.gridHeight);
        const amount = Math.floor((Math.random() * 0.3 + 0.1) * remaining);
        
        grid[y][x].resources[type] += amount;
        resourceDistribution[type].distribution[y][x] += amount;
        remaining -= amount;
      }
      
      // Distribute remaining resources randomly
      while (remaining > 0) {
        const x = Math.floor(Math.random() * settings.gridWidth);
        const y = Math.floor(Math.random() * settings.gridHeight);
        const amount = Math.min(Math.floor(Math.random() * 10) + 1, remaining);
        
        grid[y][x].resources[type] += amount;
        resourceDistribution[type].distribution[y][x] += amount;
        remaining -= amount;
      }
    });
  };

  // Update simulation settings
  const updateSettings = (newSettings: Partial<SimulationSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  // Step the simulation forward one tick
  const stepSimulation = useCallback(() => {
    setState(prevState => {
      const newState = { ...prevState };
      newState.tick += 1;

      // Move agents
      moveAgents(newState);

      // Execute trades
      executeTrades(newState);

      // Update metrics
      updateMetrics(newState);

      return newState;
    });
  }, []);

  // Move agents around the grid
  const moveAgents = (state: SimulationState) => {
    const { agents, grid, gridSize } = state;
    
    agents.forEach(agent => {
      // Remove agent from current cell
      const currentCell = grid[agent.position.y][agent.position.x];
      currentCell.agents = currentCell.agents.filter(a => a.id !== agent.id);
      
      // Decide if agent will move
      if (Math.random() < settings.movementProbability) {
        // Choose direction randomly
        const directions = [
          { x: 0, y: -1 }, // up
          { x: 1, y: 0 },  // right
          { x: 0, y: 1 },  // down
          { x: -1, y: 0 }  // left
        ];
        
        const direction = directions[Math.floor(Math.random() * directions.length)];
        
        // Calculate new position
        const newX = Math.max(0, Math.min(gridSize.width - 1, agent.position.x + direction.x));
        const newY = Math.max(0, Math.min(gridSize.height - 1, agent.position.y + direction.y));
        
        // Update agent position
        agent.position = { x: newX, y: newY };
      }
      
      // Add agent to new cell
      grid[agent.position.y][agent.position.x].agents.push(agent);
    });
  };

  // Execute trades between agents
  const executeTrades = (state: SimulationState) => {
    const { grid, gridSize } = state;
    const newTransactions: Transaction[] = [];
    
    // For each cell in the grid
    for (let y = 0; y < gridSize.height; y++) {
      for (let x = 0; x < gridSize.width; x++) {
        const cell = grid[y][x];
        
        // Skip if less than 2 agents in cell
        if (cell.agents.length < 2) continue;
        
        // Find providers and consumers in this cell
        const providers = cell.agents.filter(a => a.type === 'provider' || a.type === 'hybrid');
        const consumers = cell.agents.filter(a => a.type === 'consumer' || a.type === 'hybrid');
        
        // Skip if no providers or consumers
        if (providers.length === 0 || consumers.length === 0) continue;
        
        // For each consumer, try to trade with a provider
        consumers.forEach(consumer => {
          // Skip if already processed as provider
          if (consumer.type === 'hybrid' && Math.random() < 0.5) return;
          
          // Decide if a trade will happen
          if (Math.random() < settings.tradeProbability) {
            // Choose a provider (weighted by reputation)
            const providerWeights = providers.map(p => p.reputation);
            const totalWeight = providerWeights.reduce((a, b) => a + b, 0);
            let randomWeight = Math.random() * totalWeight;
            
            let selectedProvider: Agent | null = null;
            for (let i = 0; i < providers.length; i++) {
              randomWeight -= providerWeights[i];
              if (randomWeight <= 0) {
                selectedProvider = providers[i];
                break;
              }
            }
            
            // If no provider was selected, pick one randomly
            if (!selectedProvider) {
              selectedProvider = providers[Math.floor(Math.random() * providers.length)];
            }
            
            // Skip if consumer tried to trade with itself
            if (selectedProvider.id === consumer.id) return;
            
            // Choose a resource type to trade
            const resourceTypes: ResourceType[] = ['compute', 'storage', 'data'];
            const resourceType = resourceTypes[Math.floor(Math.random() * resourceTypes.length)];
            
            // Determine trade details
            const maxAmount = Math.min(
              selectedProvider.resources[resourceType], 
              Math.floor(Math.random() * 10) + 1
            );
            
            if (maxAmount <= 0) return; // No resources to trade
            
            const amount = Math.max(1, Math.floor(Math.random() * maxAmount));
            const basePrice = 10; // Base price per unit
            const reputationFactor = selectedProvider.reputation / 50; // Normalized reputation (1 is neutral)
            const price = Math.max(1, Math.floor(basePrice * amount * reputationFactor));
            
            // Execute the trade
            const success = Math.random() < 0.8; // 80% success rate for trades
            
            if (success) {
              // Transfer resources
              selectedProvider.resources[resourceType] -= amount;
              consumer.resources[resourceType] += amount;
              
              // Update reputations
              selectedProvider.reputation += settings.reputationImpact * 10;
              selectedProvider.reputation = Math.min(100, selectedProvider.reputation);
            } else {
              // Failed trade decreases reputation
              selectedProvider.reputation -= settings.reputationImpact * 15;
              selectedProvider.reputation = Math.max(0, selectedProvider.reputation);
            }
            
            // Record transaction
            const transaction: Transaction = {
              id: generateId(),
              providerId: selectedProvider.id,
              consumerId: consumer.id,
              resourceType,
              amount,
              price,
              timestamp: state.tick,
              success
            };
            
            // Add to provider and consumer history
            selectedProvider.history.push(transaction);
            consumer.history.push(transaction);
            
            // Add to state transactions
            newTransactions.push(transaction);
          }
        });
      }
    }
    
    // Update state transactions
    state.transactions = [...state.transactions, ...newTransactions];
  };

  // Update economic metrics
  const updateMetrics = (state: SimulationState) => {
    const { transactions, economicMetrics } = state;
    
    // Calculate only for recent transactions (last 50 ticks)
    const recentTransactions = transactions.filter(t => t.timestamp > state.tick - 50);
    
    if (recentTransactions.length === 0) return;
    
    // Total transactions
    economicMetrics.totalTransactions = transactions.length;
    
    // Success rate
    const successfulTransactions = recentTransactions.filter(t => t.success);
    economicMetrics.successRate = successfulTransactions.length / recentTransactions.length;
    
    // Average prices
    const resourceTypes: ResourceType[] = ['compute', 'storage', 'data'];
    
    resourceTypes.forEach(type => {
      const typeTransactions = successfulTransactions.filter(t => t.resourceType === type);
      
      if (typeTransactions.length > 0) {
        const totalPrice = typeTransactions.reduce((sum, t) => sum + t.price, 0);
        const totalAmount = typeTransactions.reduce((sum, t) => sum + t.amount, 0);
        economicMetrics.averagePrice[type] = totalPrice / totalAmount;
      }
    });
    
    // Resource utilization (how much of available resources are being traded)
    const totalResourcesTraded = {
      compute: successfulTransactions
        .filter(t => t.resourceType === 'compute')
        .reduce((sum, t) => sum + t.amount, 0),
      storage: successfulTransactions
        .filter(t => t.resourceType === 'storage')
        .reduce((sum, t) => sum + t.amount, 0),
      data: successfulTransactions
        .filter(t => t.resourceType === 'data')
        .reduce((sum, t) => sum + t.amount, 0)
    };
    
    const totalResourcesAvailable = state.agents.reduce(
      (total, agent) => {
        return {
          compute: total.compute + agent.resources.compute,
          storage: total.storage + agent.resources.storage,
          data: total.data + agent.resources.data
        };
      },
      { compute: 0, storage: 0, data: 0 }
    );
    
    resourceTypes.forEach(type => {
      if (totalResourcesAvailable[type] > 0) {
        economicMetrics.resourceUtilization[type] = 
          totalResourcesTraded[type] / totalResourcesAvailable[type];
      }
    });
  };

  // Control functions
  const startSimulation = useCallback(() => {
    if (!state.isRunning) {
      const interval = window.setInterval(() => {
        stepSimulation();
      }, 1000 / state.speed);
      
      setSimulationInterval(interval);
      setState(prev => ({ ...prev, isRunning: true }));
    }
  }, [state.isRunning, state.speed, stepSimulation]);

  const pauseSimulation = useCallback(() => {
    if (state.isRunning && simulationInterval !== null) {
      clearInterval(simulationInterval);
      setSimulationInterval(null);
      setState(prev => ({ ...prev, isRunning: false }));
    }
  }, [state.isRunning, simulationInterval]);

  const resetSimulation = useCallback(() => {
    if (simulationInterval !== null) {
      clearInterval(simulationInterval);
      setSimulationInterval(null);
    }
    initializeSimulation();
  }, [simulationInterval, initializeSimulation]);

  // Initialize on mount or when settings change
  useEffect(() => {
    initializeSimulation();
    
    // Cleanup on unmount
    return () => {
      if (simulationInterval !== null) {
        clearInterval(simulationInterval);
      }
    };
  }, [initializeSimulation, simulationInterval]);

  return (
    <SimulationContext.Provider
      value={{
        state,
        settings,
        updateSettings,
        startSimulation,
        pauseSimulation,
        resetSimulation,
        stepSimulation
      }}
    >
      {children}
    </SimulationContext.Provider>
  );
};

export const useSimulation = () => {
  const context = useContext(SimulationContext);
  if (context === undefined) {
    throw new Error('useSimulation must be used within a SimulationProvider');
  }
  return context;
};