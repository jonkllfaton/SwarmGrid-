import React, { useRef, useEffect } from 'react';
import { useSimulation } from '../context/SimulationContext';
import { ResourceType } from '../types';

const GridVisualization: React.FC = () => {
  const { state, settings } = useSimulation();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Get colors for different agent types and resources
  const agentColors = {
    provider: '#4ADE80', // green
    consumer: '#FB7185', // red
    hybrid: '#A78BFA'    // purple
  };
  
  const resourceColors = {
    compute: 'rgba(59, 130, 246, 0.5)', // blue
    storage: 'rgba(234, 179, 8, 0.5)',  // yellow
    data: 'rgba(20, 184, 166, 0.5)'     // teal
  };

  // Draw the grid and agents
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const { grid, gridSize } = state;
    if (!grid) return; // Add safety check for grid
    
    const { visualizationMode } = settings;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Calculate cell size
    const cellWidth = canvas.width / gridSize.width;
    const cellHeight = canvas.height / gridSize.height;
    
    // Draw grid
    ctx.strokeStyle = 'rgba(75, 85, 99, 0.3)';
    ctx.lineWidth = 1;
    
    // Draw vertical lines
    for (let x = 0; x <= gridSize.width; x++) {
      ctx.beginPath();
      ctx.moveTo(x * cellWidth, 0);
      ctx.lineTo(x * cellWidth, canvas.height);
      ctx.stroke();
    }
    
    // Draw horizontal lines
    for (let y = 0; y <= gridSize.height; y++) {
      ctx.beginPath();
      ctx.moveTo(0, y * cellHeight);
      ctx.lineTo(canvas.width, y * cellHeight);
      ctx.stroke();
    }
    
    // Draw cells based on visualization mode
    for (let y = 0; y < gridSize.height; y++) {
      if (!grid[y]) continue; // Add safety check for grid row
      
      for (let x = 0; x < gridSize.width; x++) {
        if (!grid[y][x]) continue; // Add safety check for grid cell
        
        const cell = grid[y][x];
        
        // Draw cell background based on visualization mode
        if (visualizationMode === 'heatmap') {
          // Heatmap visualization based on economic activity
          const intensity = Math.min(1, cell.heatLevel / 10);
          ctx.fillStyle = `rgba(249, 115, 22, ${intensity})`;
          ctx.fillRect(x * cellWidth, y * cellHeight, cellWidth, cellHeight);
        } else if (visualizationMode === 'network') {
          // Network visualization
          // Draw connections between agents that have traded
          if (cell.agents?.length > 0) { // Add safety check for agents array
            cell.agents.forEach(agent => {
              if (agent?.history?.length > 0) { // Add safety checks for agent and history
                // Draw the most recent connections
                const recentTrades = agent.history.slice(-3);
                
                recentTrades.forEach(trade => {
                  if (!trade) return; // Add safety check for trade object
                  
                  // Find the other agent's position
                  const otherAgentId = agent.id === trade.providerId 
                    ? trade.consumerId 
                    : trade.providerId;
                  
                  const otherAgent = state.agents?.find(a => a?.id === otherAgentId); // Add safety checks
                  
                  if (otherAgent?.position) { // Add safety check for other agent position
                    // Draw connection line
                    ctx.beginPath();
                    ctx.moveTo(
                      (x + 0.5) * cellWidth,
                      (y + 0.5) * cellHeight
                    );
                    ctx.lineTo(
                      (otherAgent.position.x + 0.5) * cellWidth,
                      (otherAgent.position.y + 0.5) * cellHeight
                    );
                    
                    // Set line color based on success and resource type
                    if (trade.success) {
                      ctx.strokeStyle = resourceColors[trade.resourceType] || 'rgba(156, 163, 175, 0.3)';
                    } else {
                      ctx.strokeStyle = 'rgba(156, 163, 175, 0.3)'; // gray for failed trades
                    }
                    
                    ctx.lineWidth = Math.max(1, trade.amount / 10);
                    ctx.stroke();
                  }
                });
              }
            });
          }
        } else {
          // Normal mode: show resources distribution
          if (cell.resources) { // Add safety check for resources object
            const resourceKeys = Object.keys(cell.resources) as ResourceType[];
            
            // Draw resource levels
            resourceKeys.forEach((resource, index) => {
              const amount = cell.resources[resource];
              if (amount > 0) {
                const intensity = Math.min(0.7, amount / 100);
                const height = cellHeight * (intensity * 0.3);
                
                // Stagger resource visualizations within the cell
                const offsetX = cellWidth * 0.1 * index;
                const offsetY = cellHeight * 0.1 * index;
                
                ctx.fillStyle = resourceColors[resource];
                ctx.fillRect(
                  x * cellWidth + offsetX,
                  y * cellHeight + cellHeight - height - offsetY,
                  cellWidth * 0.8,
                  height
                );
              }
            });
          }
        }
        
        // Draw agents
        if (cell.agents?.length > 0) { // Add safety check for agents array
          cell.agents.forEach((agent, index) => {
            if (!agent) return; // Add safety check for agent object
            
            // Calculate position within cell (stagger multiple agents)
            const agentSize = Math.min(cellWidth, cellHeight) * 0.4;
            const offsetX = (index % 2) * (cellWidth * 0.25);
            const offsetY = Math.floor(index / 2) * (cellHeight * 0.25);
            
            const agentX = x * cellWidth + cellWidth * 0.5 - agentSize * 0.5 + offsetX;
            const agentY = y * cellHeight + cellHeight * 0.5 - agentSize * 0.5 + offsetY;
            
            // Draw agent
            ctx.fillStyle = agent.color || agentColors[agent.type] || '#808080';
            ctx.beginPath();
            ctx.arc(
              agentX + agentSize * 0.5,
              agentY + agentSize * 0.5,
              agentSize * 0.5,
              0,
              Math.PI * 2
            );
            ctx.fill();
            
            // Draw reputation indicator
            if (typeof agent.reputation === 'number') { // Add safety check for reputation
              const reputationColor = agent.reputation > 70 
                ? 'rgba(74, 222, 128, 0.8)' // green for high rep
                : agent.reputation < 30 
                  ? 'rgba(251, 113, 133, 0.8)' // red for low rep
                  : 'rgba(250, 204, 21, 0.8)'; // yellow for medium rep
              
              const repSize = agentSize * 0.3;
              
              ctx.fillStyle = reputationColor;
              ctx.beginPath();
              ctx.arc(
                agentX + agentSize,
                agentY,
                repSize,
                0,
                Math.PI * 2
              );
              ctx.fill();
            }
          });
        }
      }
    }
  }, [state, settings, agentColors, resourceColors]);

  // Resize canvas when window size changes
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      // Get container dimensions
      const container = canvas.parentElement;
      if (!container) return;
      
      const rect = container.getBoundingClientRect();
      
      // Set canvas size to match container, maintaining aspect ratio
      const aspectRatio = state.gridSize.width / state.gridSize.height;
      let width = rect.width;
      let height = width / aspectRatio;
      
      // If height is too large, scale down
      if (height > rect.height) {
        height = rect.height;
        width = height * aspectRatio;
      }
      
      canvas.width = width;
      canvas.height = height;
    };
    
    // Initialize size
    handleResize();
    
    // Add resize listener
    window.addEventListener('resize', handleResize);
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [state.gridSize]);

  return (
    <div className="flex-grow p-4 overflow-hidden flex items-center justify-center">
      <canvas 
        ref={canvasRef} 
        className="border border-gray-700 rounded-lg shadow-lg bg-gray-800"
      />
    </div>
  );
};

export default GridVisualization;