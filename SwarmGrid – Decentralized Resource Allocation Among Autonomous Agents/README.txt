SwarmGrid - Decentralized Resource Allocation Among Autonomous Agents

	Autonomous Agents: Each agent operates independently using configurable behavior models.
	Decentralized Resource Allocation: Agents manage and exchange resources peer-to-peer with no central authority.
	Multi-Resource Inventory: Agents hold diverse resources (e.g., energy, food, compute time) and make strategic trade or share  
        decisions.

	Flexible Scenarios: Define your own agent types, initial distributions, utility models, and interaction protocols.
	Simulation Metrics: Analyze agent-level data like utility gain, resource equity, and distribution efficiency over time.
	Modular Design: Easily extend by adding new resource types, agent classes, or communication protocols.
	Supports Competition and Cooperation: Model both selfish and altruistic agent behaviors.
	Visualization Tools: Real-time graphs for network flow, resource utilization, agent clustering, and more.

Installation
	1. Clone the repository:
	   git clone https://github.com/jonkllfaton/swarmgrid.git
	   cd swarmgrid
	2. Install Python dependencies (Python 3.8+):
	   pip install -r requirements.txt
Usage
	Run the simulation with default parameters:
	   python run_simulation.py
	Customize the simulation by editing config.yaml:
	- Define agent roles and population size
	- Set initial resource allocations
	- Specify rules for interaction, exchange, and utility optimization
	- Control duration, logging, and output formats
	Run with custom config:
	   python run_simulation.py --config config.yaml

Example Agent Types
	Gatherer: Searches and collects resources.
	Allocator: Distributes held resources based on weighted utility.
	Optimizer: Trades to maximize personal or group efficiency.
	Balancer: Detects inequalities and redistributes excess.
	Competitor: Prioritizes self-gain and strategic withholding.

Output
	Detailed logs of agent decisions and transactions
	CSV outputs tracking:
	- Agent inventories
	- Resource movement
	- Utility scores
	Optional visualization (enable in config):
	- Network graphs of interactions
	- Heatmaps of resource spread
	- Time series plots of global resource distribution
Contributing
	
        Contributions are welcome! Submit issues and pull requests.

License & Attribution
	Copyright (c) 2025 jonkllfaton
	All rights reserved.
	
        This project is the intellectual property of jonkllfaton. Unauthorized copying, distribution, modification, or use of any part of      

        this project is strictly prohibited without prior written permission.
	For permissions or inquiries, contact: jonkllfaton@gmail.com
