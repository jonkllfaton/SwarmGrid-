export type AgentType = 'provider' | 'consumer' | 'hybrid';
export type ResourceType = 'compute' | 'storage' | 'data';

export interface Position {
  x: number;
  y: number;
}

export interface Resource {
  type: ResourceType;
  amount: number;
}

export interface Agent {
  id: string;
  type: AgentType;
  position: Position;
  resources: {
    [key in ResourceType]: number;
  };
  inventory: Resource[];
  reputation: number;
  history: Transaction[];
  color: string;
}

export interface Transaction {
  id: string;
  providerId: string;
  consumerId: string;
  resourceType: ResourceType;
  amount: number;
  price: number;
  timestamp: number;
  success: boolean;
}

export interface GridCell {
  x: number;
  y: number;
  agents: Agent[];
  resources: {
    [key in ResourceType]: number;
  };
  heatLevel: number;
}

export interface SimulationState {
  agents: Agent[];
  grid: GridCell[][];
  transactions: Transaction[];
  tick: number;
  isRunning: boolean;
  speed: number;
  gridSize: {
    width: number;
    height: number;
  };
  resourceDistribution: {
    [key in ResourceType]: {
      total: number;
      distribution: number[][];
    };
  };
  economicMetrics: {
    totalTransactions: number;
    successRate: number;
    averagePrice: {
      [key in ResourceType]: number;
    };
    resourceUtilization: {
      [key in ResourceType]: number;
    };
  };
}

export interface SimulationSettings {
  gridWidth: number;
  gridHeight: number;
  initialAgents: number;
  providerRatio: number;
  consumerRatio: number;
  hybridRatio: number;
  initialResources: {
    [key in ResourceType]: number;
  };
  movementProbability: number;
  tradeProbability: number;
  reputationImpact: number;
  visualizationMode: 'normal' | 'heatmap' | 'network';
}