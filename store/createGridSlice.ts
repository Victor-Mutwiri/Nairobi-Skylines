import { CitySlice, GridSlice, TileData } from './types';
import { BUILDING_COSTS, SAVE_KEY } from './constants';

export const createGridSlice: CitySlice<GridSlice> = (set, get) => ({
  tiles: {},
  fires: {},
  tickCount: 0,
  powerCapacity: 0,
  powerDemand: 0,
  trafficDensity: 0,

  addBuilding: (x, z, type, rotation) => set((state) => {
    // 1. Check Cost
    const config = BUILDING_COSTS[type];
    if (state.money < config.cost) return state;

    // 2. Check Dimensions and Availability
    // Rotate dimensions if rotation is 1 or 3 (90 or 270 degrees)
    const isRotated = rotation % 2 !== 0;
    const width = isRotated ? (config.depth || 1) : (config.width || 1);
    const depth = isRotated ? (config.width || 1) : (config.depth || 1);
    
    const tilesToOccupy: string[] = [];

    // Grid boundary check and Occupancy check
    // We assume (x,z) is the top-left anchor (or pivot)
    for (let dx = 0; dx < width; dx++) {
      for (let dz = 0; dz < depth; dz++) {
        const checkX = x + dx;
        const checkZ = z + dz;
        const key = `${checkX},${checkZ}`;
        
        if (checkX < -10 || checkX >= 10 || checkZ < -10 || checkZ >= 10) {
             return state; // Out of bounds
        }

        if (state.tiles[key]) {
             return state; // Occupied
        }
        tilesToOccupy.push(key);
      }
    }

    // 3. Place Tiles
    const newTiles = { ...state.tiles };

    // Main Tile
    newTiles[`${x},${z}`] = { 
        type, 
        x, 
        z, 
        rotation: rotation,
        hasRoadAccess: true, // Optimistic init, verified in next tick
        isPowered: true 
    };

    // Reserved (Filler) Tiles
    for (let dx = 0; dx < width; dx++) {
        for (let dz = 0; dz < depth; dz++) {
            if (dx === 0 && dz === 0) continue; // Skip main tile
            newTiles[`${x + dx},${z + dz}`] = { 
                type: 'reserved', 
                x: x + dx, 
                z: z + dz, 
                rotation: rotation,
                parentX: x,
                parentZ: z
            };
        }
    }

    // Check Win Condition immediately
    const isWin = type === 'nbk_tower';
    
    return {
      money: state.money - config.cost,
      tiles: newTiles,
      gameWon: isWin ? true : state.gameWon
    };
  }),

  removeBuilding: (x, z) => set((state) => {
    const key = `${x},${z}`;
    let tile = state.tiles[key];
    
    if (!tile) return state;

    // Handle Reserved Tiles: redirect to parent
    if (tile.type === 'reserved' && tile.parentX !== undefined && tile.parentZ !== undefined) {
        const parentKey = `${tile.parentX},${tile.parentZ}`;
        tile = state.tiles[parentKey];
        if (!tile) return state; 
    }

    let penaltyHappiness = 0;
    let penaltyCorruption = 0;

    // Penalty for evicting informal settlements
    if (tile.type === 'informal_settlement') {
       penaltyHappiness = -20;
       penaltyCorruption = 10;
    }

    // Handle Multi-tile Removal
    const config = BUILDING_COSTS[tile.type];
    // Need to account for rotation when calculating occupied area for removal?
    // Actually, we just need to find all reserved tiles pointing to this parent.
    // Simpler approach: Scan grid or re-calculate dimensions based on stored rotation.
    
    const isRotated = tile.rotation % 2 !== 0;
    const width = isRotated ? (config.depth || 1) : (config.width || 1);
    const depth = isRotated ? (config.width || 1) : (config.depth || 1);

    const newTiles = { ...state.tiles };

    // Remove all parts of the building
    for (let dx = 0; dx < width; dx++) {
        for (let dz = 0; dz < depth; dz++) {
            const k = `${tile.x + dx},${tile.z + dz}`;
            delete newTiles[k];
        }
    }
    
    return { 
      tiles: newTiles,
      happiness: Math.max(0, state.happiness + penaltyHappiness),
      corruption: state.corruption + penaltyCorruption
    };
  }),

  runGameTick: () => {
    const state = get();
    const taxRate = state.taxRate || 1.0;
    
    // Financial Tracking
    let incomeResidential = 0;
    let incomeCommercial = 0;
    let incomeIndustrial = 0;
    let incomeAgricultural = 0;
    let incomeTolls = 0;
    let expenseInfra = 0;
    let expenseServices = 0;

    let calcCorruption = 0;
    let calcHappiness = 50; 
    let calcPopulation = 0;
    let calcPollution = 0;
    
    let policeCount = 0;
    const fireStations: {x: number, z: number}[] = [];
    let happinessPenalty = 0;

    let calcPowerCapacity = 0;
    let calcPowerDemand = 0;

    const tileKeys = Object.keys(state.tiles);

    // --- GRID CONNECTIVITY ANALYSIS (BFS) ---
    // 1. Identify Network Nodes (Roads and Power Plants)
    const roadKeys = new Set<string>();
    const powerSourceKeys: string[] = [];
    
    Object.values(state.tiles).forEach((t: TileData) => {
        const key = `${t.x},${t.z}`;
        if (t.type === 'road' || t.type === 'expressway_pillar') roadKeys.add(key);
        if (t.type === 'power_plant') powerSourceKeys.push(key);
    });

    // 2. BFS Power Propagation
    const poweredNetwork = new Set<string>();
    const bfsQueue: string[] = [];

    // Initialize with Power Plants
    powerSourceKeys.forEach(key => {
        poweredNetwork.add(key);
        bfsQueue.push(key);
    });

    // Run BFS (Electricity follows Roads)
    while(bfsQueue.length > 0) {
        const currentKey = bfsQueue.shift()!;
        const [cx, cz] = currentKey.split(',').map(Number);
        
        const neighbors = [
            `${cx+1},${cz}`, `${cx-1},${cz}`, `${cx},${cz+1}`, `${cx},${cz-1}`
        ];

        for(const nKey of neighbors) {
            if(!poweredNetwork.has(nKey)) {
                // Power flows through Roads
                if(roadKeys.has(nKey)) {
                    poweredNetwork.add(nKey);
                    bfsQueue.push(nKey);
                }
            }
        }
    }

    // 3. Update Tile Status & Calculate Capacity
    Object.values(state.tiles).forEach((tile: TileData) => {
        if (tile.type === 'reserved') return; 

        const config = BUILDING_COSTS[tile.type];
        if (config.powerProduction) calcPowerCapacity += config.powerProduction;
        if (config.powerConsumption) calcPowerDemand += config.powerConsumption;
        
        if (tile.type === 'fire_station') {
          fireStations.push({x: tile.x, z: tile.z});
        }
    });

    // Global Capacity Check
    const isPowerCapacitySufficient = calcPowerCapacity >= calcPowerDemand;

    // Track state changes to avoid unnecessary re-renders if nothing changed
    let tilesChanged = false;
    const newTilesMap = { ...state.tiles };

    // 4. Evaluate Buildings based on Connectivity
    Object.values(state.tiles).forEach((tile: TileData) => {
      if (tile.type === 'reserved') return;

      const config = BUILDING_COSTS[tile.type];
      // Account for rotation
      const isRotated = tile.rotation % 2 !== 0;
      const width = isRotated ? (config.depth || 1) : (config.width || 1);
      const depth = isRotated ? (config.width || 1) : (config.depth || 1);
      
      let hasRoadAccess = false;
      let hasPowerAccess = false;

      // Check perimeter for Roads and Powered Nodes
      for(let dx = 0; dx < width; dx++) {
        for(let dz = 0; dz < depth; dz++) {
            const tx = tile.x + dx;
            const tz = tile.z + dz;
            const neighbors = [
                `${tx+1},${tz}`, `${tx-1},${tz}`, `${tx},${tz+1}`, `${tx},${tz-1}`
            ];

            for(const nKey of neighbors) {
                const nTile = state.tiles[nKey];
                if (nTile) {
                    if (nTile.type === 'road' || nTile.type === 'expressway_pillar') {
                        hasRoadAccess = true;
                        if (poweredNetwork.has(nKey)) {
                            hasPowerAccess = true;
                        }
                    }
                    if (nTile.type === 'power_plant') {
                         hasPowerAccess = true; 
                    }
                }
            }
        }
      }

      // Self-check for Infrastructure
      if (tile.type === 'road' || tile.type === 'expressway_pillar') {
         hasRoadAccess = true;
         hasPowerAccess = poweredNetwork.has(`${tile.x},${tile.z}`);
      }
      if (tile.type === 'power_plant') {
         hasPowerAccess = true; // Source
      }
      
      // Update Tile Data if status changed
      if (tile.hasRoadAccess !== hasRoadAccess || tile.isPowered !== hasPowerAccess) {
          tilesChanged = true;
          newTilesMap[`${tile.x},${tile.z}`] = {
              ...tile,
              hasRoadAccess,
              isPowered: hasPowerAccess
          };
      }

      // --- GAMEPLAY IMPACT CALCULATION ---
      
      // Population: Counts regardless of service status (People move in, even if no power)
      if (config.population) {
          calcPopulation += config.population;
      }

      const requiresPower = !!config.powerConsumption;
      const needsRoad = tile.type !== 'acacia' && tile.type !== 'plantation' && tile.type !== 'informal_settlement' && tile.type !== 'road'; 
      
      const effectiveRoadAccess = needsRoad ? hasRoadAccess : true;

      // A building functions (Generates Revenue) if:
      const isFunctioning = effectiveRoadAccess && (!requiresPower || (requiresPower && isPowerCapacitySufficient && hasPowerAccess));

      // Financial Calculation (APPLY TAX RATE HERE)
      if (config.revenue) {
          if (isFunctioning) {
             const baseRev = config.revenue;
             
             if (tile.type === 'runda_house' || tile.type === 'apartment') {
                 incomeResidential += (baseRev * taxRate);
             }
             else if (tile.type === 'factory') {
                 incomeIndustrial += (baseRev * taxRate);
             }
             else if (tile.type === 'plantation') {
                 incomeAgricultural += (baseRev * taxRate); // Agricultural subsidies? Let's tax them normally for now.
             }
             else if (tile.type === 'expressway_pillar') {
                 incomeTolls += baseRev; // Tolls are flat fee, not taxed by rate usually
             }
             else {
                 // Commercial (Offices, Kiosks, Malls, Bars)
                 incomeCommercial += (baseRev * taxRate);
             }
          }
      }
      
      // Upkeep Calculation (Always paid)
      if (config.upkeep) {
         if (tile.type === 'road') expenseInfra += config.upkeep;
         else expenseServices += config.upkeep;
      }

      // Happiness
      if (isFunctioning && config.happiness) calcHappiness += config.happiness;

      // Pollution
      if (isFunctioning && config.pollution) calcPollution += config.pollution;

      // Penalties for Broken Services
      if (!effectiveRoadAccess && needsRoad) {
           if (config.population) happinessPenalty += 2;
      }
      if (effectiveRoadAccess && requiresPower && (!hasPowerAccess || !isPowerCapacitySufficient)) {
           if (config.population) happinessPenalty += 5;
      }

      // Corruption & Police
      if (tile.type === 'kiosk' && isFunctioning) calcCorruption += 1;
      if (tile.type === 'police_station' && isFunctioning) policeCount += 1;

      // Bar Proximity
      if (tile.type === 'bar' && isFunctioning) {
         const neighbors = [
            {x: tile.x + 1, z: tile.z}, {x: tile.x - 1, z: tile.z},
            {x: tile.x, z: tile.z + 1}, {x: tile.x, z: tile.z - 1}
         ];
         let nearHouse = false;
         for (const n of neighbors) {
            const key = `${n.x},${n.z}`;
            const neighborTile = state.tiles[key];
            if (neighborTile && (neighborTile.type === 'runda_house' || neighborTile.type === 'apartment')) {
                nearHouse = true;
                break;
            }
         }
         if (nearHouse) happinessPenalty += 1;
      }
    });

    // --- TAX HAPPINESS IMPACT ---
    // Low tax (0.5) = +5 Happiness
    // High tax (1.5) = -10 Happiness
    // Extortion (2.0) = -25 Happiness
    if (taxRate <= 0.8) calcHappiness += 5;
    if (taxRate >= 1.2) happinessPenalty += 10;
    if (taxRate >= 1.8) happinessPenalty += 15;

    // --- TRAFFIC SIMULATION LOGIC ---
    const roadCount = roadKeys.size;
    const trafficCapacity = Math.max(1, roadCount * 15); 
    const trafficDensity = calcPopulation / trafficCapacity;
    
    let trafficPenalty = 0;
    if (trafficDensity > 1.0) {
        trafficPenalty = Math.floor((trafficDensity - 1.0) * 20); 
        trafficPenalty = Math.min(30, trafficPenalty);
    }
    happinessPenalty += trafficPenalty;

    // --- FIRE LOGIC ---
    let newFires = { ...state.fires };
    let emergencyCost = 0;

    Object.keys(newFires).forEach(key => {
      const [fx, fz] = key.split(',').map(Number);
      
      let extinguished = false;
      for (const station of fireStations) {
        const dist = Math.abs(station.x - fx) + Math.abs(station.z - fz); 
        if (dist <= 3) {
          extinguished = true;
          break;
        }
      }

      if (extinguished) {
        delete newFires[key];
        emergencyCost += 1000;
      } else {
        newFires[key] += 1; 
        happinessPenalty += 2; 

        if (newFires[key] > 2) {
           const neighbors: {x: number, z: number}[] = [
            {x: fx+1, z: fz}, {x: fx-1, z: fz}, {x: fx, z: fz+1}, {x: fx, z: fz-1}
           ];
           const randomNeighbor = neighbors[Math.floor(Math.random() * neighbors.length)];
           const nKey = `${randomNeighbor.x},${randomNeighbor.z}`;
           
           const t = state.tiles[nKey] as TileData | undefined;
           if (t && !newFires[nKey] && t.type !== 'road' && t.type !== 'reserved') {
              newFires[nKey] = 0; 
           }
        }
      }
    });

    // Random Ignition
    if (state.tickCount % 5 === 0 && Math.random() < 0.05 && tileKeys.length > 0) {
       const randomKey = tileKeys[Math.floor(Math.random() * tileKeys.length)];
       const tile = state.tiles[randomKey];
       if (tile.type !== 'road' && tile.type !== 'reserved' && !newFires[randomKey]) {
          newFires[randomKey] = 0;
       }
    }

    calcPollution = Math.max(0, calcPollution);

    let baseInsecurity = Math.floor(calcPopulation / 10);
    Object.values(state.tiles).forEach((t: TileData) => {
        if(t.type === 'informal_settlement') baseInsecurity += 5;
    });
    
    const calcInsecurity = Math.max(0, baseInsecurity - (policeCount * 5));

    const eventCorruption = Math.floor(state.kickbackRevenue / 50); 
    const totalCorruption = calcCorruption + eventCorruption;

    const pollutionPenalty = calcPollution > 50 ? Math.floor((calcPollution - 50) / 2) : 0;
    
    let slumHappinessPenalty = 0;
     Object.values(state.tiles).forEach((t: TileData) => {
        if(t.type === 'informal_settlement') slumHappinessPenalty += 5;
    });

    calcHappiness = calcHappiness - totalCorruption - calcInsecurity - happinessPenalty - pollutionPenalty - slumHappinessPenalty;
    if (!isPowerCapacitySufficient && calcPowerDemand > 0) calcHappiness -= 20; 
    calcHappiness = Math.max(0, Math.min(100, calcHappiness));

    const totalIncome = incomeResidential + incomeCommercial + incomeIndustrial + incomeAgricultural + incomeTolls + state.kickbackRevenue;
    const totalExpenses = expenseInfra + expenseServices + emergencyCost;
    const netIncome = totalIncome - totalExpenses;
    
    const newTickCount = state.tickCount + 1;
    let newEvent = state.activeEvent;
    
    if (newTickCount > 0 && newTickCount % 24 === 0 && !state.activeEvent) {
      newEvent = 'tender_expressway';
    }

    // --- LAND GRABBING LOGIC ---
    let finalTiles = tilesChanged ? newTilesMap : state.tiles;

    if (newTickCount % 10 === 0 && calcInsecurity > 30) {
        const candidates: {x: number, z: number}[] = [];
        const isEmpty = (x: number, z: number) => !finalTiles[`${x},${z}`];
        
        Object.values(finalTiles).forEach((t: TileData) => {
            if (t.type === 'road' || t.type === 'apartment') {
                 const neighbors = [
                    {x: t.x+1, z: t.z}, {x: t.x-1, z: t.z},
                    {x: t.x, z: t.z+1}, {x: t.x, z: t.z-1}
                 ];
                 neighbors.forEach(n => {
                     if (n.x >= -10 && n.x < 10 && n.z >= -10 && n.z < 10) {
                         if (isEmpty(n.x, n.z)) {
                             candidates.push(n);
                         }
                     }
                 });
            }
        });

        if (candidates.length > 0) {
            const spot = candidates[Math.floor(Math.random() * candidates.length)];
            const key = `${spot.x},${spot.z}`;
            if (!finalTiles[key]) {
                finalTiles = {
                    ...finalTiles,
                    [key]: { type: 'informal_settlement', x: spot.x, z: spot.z, rotation: Math.floor(Math.random()*4) }
                };
            }
        }
    }

    set({ 
        money: state.money + netIncome,
        population: calcPopulation,
        happiness: calcHappiness,
        insecurity: calcInsecurity,
        corruption: totalCorruption,
        pollution: calcPollution,
        powerCapacity: calcPowerCapacity,
        powerDemand: calcPowerDemand,
        trafficDensity: trafficDensity,
        tickCount: newTickCount,
        activeEvent: newEvent,
        fires: newFires,
        tiles: finalTiles,
        financials: {
            income: {
                residential: incomeResidential,
                commercial: incomeCommercial,
                industrial: incomeIndustrial,
                agricultural: incomeAgricultural,
                tolls: incomeTolls,
                kickbacks: state.kickbackRevenue,
                total: totalIncome
            },
            expenses: {
                infrastructure: expenseInfra,
                services: expenseServices,
                emergency: emergencyCost,
                total: totalExpenses
            },
            net: netIncome
        }
    });
    
    return netIncome;
  },

  saveGame: () => {
    const state = get();
    const dataToSave = {
      money: state.money,
      population: state.population,
      happiness: state.happiness,
      insecurity: state.insecurity,
      corruption: state.corruption,
      pollution: state.pollution,
      tiles: state.tiles,
      tickCount: state.tickCount,
      kickbackRevenue: state.kickbackRevenue,
      fires: state.fires,
      gameWon: state.gameWon,
      taxRate: state.taxRate
    };
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(dataToSave));
      console.log("Game Saved Successfully");
    } catch (e) {
      console.error("Failed to save game", e);
    }
  },
});