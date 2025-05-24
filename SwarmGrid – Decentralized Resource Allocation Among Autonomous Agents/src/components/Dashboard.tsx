import React from 'react';
import { useSimulation } from '../context/SimulationContext';
import { TrendingUp, TrendingDown, History, BarChart } from 'lucide-react';

const Dashboard: React.FC = () => {
  const { state } = useSimulation();
  const { transactions, economicMetrics } = state;
  
  // Get recent transactions
  const recentTransactions = transactions.slice(-5).reverse();
  
  // Calculate resource price changes
  const resourceTypes = ['compute', 'storage', 'data'] as const;
  const priceChanges: Record<string, { value: number, increasing: boolean }> = {};
  
  resourceTypes.forEach(type => {
    // Get recent transactions for this resource
    const resourceTransactions = transactions
      .filter(t => t.resourceType === type && t.success)
      .slice(-20);
    
    if (resourceTransactions.length >= 10) {
      // Calculate average price for first and second half
      const mid = Math.floor(resourceTransactions.length / 2);
      const firstHalf = resourceTransactions.slice(0, mid);
      const secondHalf = resourceTransactions.slice(mid);
      
      const firstAvg = firstHalf.reduce((sum, t) => sum + t.price / t.amount, 0) / firstHalf.length;
      const secondAvg = secondHalf.reduce((sum, t) => sum + t.price / t.amount, 0) / secondHalf.length;
      
      const change = secondAvg - firstAvg;
      const percentChange = firstAvg !== 0 ? (change / firstAvg) * 100 : 0;
      
      priceChanges[type] = {
        value: Math.abs(percentChange),
        increasing: percentChange > 0
      };
    } else {
      priceChanges[type] = { value: 0, increasing: false };
    }
  });
  
  return (
    <div className="bg-gray-800 border-t border-gray-700 p-4">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Price Trends */}
          <div className="bg-gray-700/50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-blue-300 flex items-center mb-3">
              <BarChart size={16} className="mr-1" />
              Resource Price Trends
            </h3>
            
            <div className="grid grid-cols-3 gap-2">
              {resourceTypes.map(type => (
                <div key={type} className="bg-gray-800 p-3 rounded">
                  <h4 className="text-xs text-gray-400 capitalize mb-1">{type}</h4>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-semibold">
                      {economicMetrics.averagePrice[type].toFixed(1)}
                    </span>
                    
                    {priceChanges[type].value > 0 && (
                      <div className={`flex items-center text-xs ${
                        priceChanges[type].increasing ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {priceChanges[type].increasing ? (
                          <TrendingUp size={14} className="mr-1" />
                        ) : (
                          <TrendingDown size={14} className="mr-1" />
                        )}
                        {priceChanges[type].value.toFixed(1)}%
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Recent Transactions */}
          <div className="bg-gray-700/50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-blue-300 flex items-center mb-3">
              <History size={16} className="mr-1" />
              Recent Transactions
            </h3>
            
            {recentTransactions.length > 0 ? (
              <ul className="space-y-2">
                {recentTransactions.map(transaction => (
                  <li key={transaction.id} className="bg-gray-800 p-2 rounded text-xs">
                    <div className="flex justify-between items-center">
                      <span className={transaction.success ? 'text-green-400' : 'text-red-400'}>
                        {transaction.success ? '✓' : '✗'}
                      </span>
                      <span className="capitalize text-gray-300">
                        {transaction.resourceType}
                      </span>
                      <span>
                        {transaction.amount} units
                      </span>
                      <span className="font-mono">
                        {transaction.price} $
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-center text-gray-500 py-4">
                No transactions yet
              </div>
            )}
          </div>
          
          {/* Network Statistics */}
          <div className="bg-gray-700/50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-blue-300 mb-3">
              Network Statistics
            </h3>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-800 p-3 rounded">
                <h4 className="text-xs text-gray-400 mb-1">Total Transactions</h4>
                <p className="text-xl font-semibold">{economicMetrics.totalTransactions}</p>
              </div>
              
              <div className="bg-gray-800 p-3 rounded">
                <h4 className="text-xs text-gray-400 mb-1">Success Rate</h4>
                <p className="text-xl font-semibold">
                  {(economicMetrics.successRate * 100).toFixed(1)}%
                </p>
              </div>
              
              <div className="bg-gray-800 p-3 rounded">
                <h4 className="text-xs text-gray-400 mb-1">Agents</h4>
                <p className="text-xl font-semibold">{state.agents.length}</p>
              </div>
              
              <div className="bg-gray-800 p-3 rounded">
                <h4 className="text-xs text-gray-400 mb-1">Grid Size</h4>
                <p className="text-xl font-semibold">
                  {state.gridSize.width}×{state.gridSize.height}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;