import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Header } from '../components/Header';
import { TerrainGrid } from '../components/TerrainGrid';
import { MissionControls } from '../components/MissionControls';
import { CurrentRouteBar } from '../components/CurrentRouteBar';
import { MissionStatusBar } from '../components/MissionStatusBar';
import { MissionEvents } from '../components/MissionEvents';
import { MissionCompleteCard } from '../components/MissionCompleteCard';
import { ReplanNotification } from '../components/ReplanNotification';

import type {
  CellData,
  EventLogItem,
  MissionMetricsData,
  MissionStatusState,
  NavigationMode,
  AutonomousMode,
  ToolMode,
  TerrainType,
} from '../types/simulator';
import { planRouteApi, replanRouteApi } from '../services/api';
import { calculateTerrainSafety } from '../utils/astar';
import {
  scanAhead,
  getSensorCoverageCells,
  findProactiveAlternativeRoute,
} from '../utils/predictiveNavigation';

const DEFAULT_ROWS = 20;
const DEFAULT_COLS = 20;

function createEmptyGrid(rows = DEFAULT_ROWS, cols = DEFAULT_COLS): CellData[][] {
  const grid: CellData[][] = [];
  for (let r = 0; r < rows; r++) {
    const row: CellData[] = [];
    for (let c = 0; c < cols; c++) {
      row.push({
        row: r,
        col: c,
        terrain: 'normal',
        isObstacle: false,
        isDynamicObstacle: false,
      });
    }
    grid.push(row);
  }
  return grid;
}

export const Simulator: React.FC = () => {
  const [rows, setRows] = useState(DEFAULT_ROWS);
  const [cols, setCols] = useState(DEFAULT_COLS);
  const [grid, setGrid] = useState<CellData[][]>(() => createEmptyGrid(DEFAULT_ROWS, DEFAULT_COLS));
  const [startPos, setStartPos] = useState<[number, number]>([2, 2]);
  const [destPos, setDestPos] = useState<[number, number]>([18, 18]);
  const [roverPos, setRoverPos] = useState<[number, number]>([2, 2]);

  // Mode and Tools
  const [toolMode, setToolMode] = useState<ToolMode>('start');
  const [selectedTerrain, setSelectedTerrain] = useState<TerrainType>('rough');
  const [navigationMode, setNavigationMode] = useState<NavigationMode>('balanced');
  const [autonomousMode, setAutonomousMode] = useState<AutonomousMode>('predictive');
  const [sensorRange, setSensorRange] = useState<number>(4);

  // Paths & Simulation State
  const [initialPath, setInitialPath] = useState<[number, number][]>([]);
  const [replannedPath, setReplannedPath] = useState<[number, number][]>([]);
  const [activePath, setActivePath] = useState<[number, number][]>([]);
  const [pathIndex, setPathIndex] = useState<number>(0);
  const [status, setStatus] = useState<MissionStatusState>('READY');
  const [pathRevealIndex, setPathRevealIndex] = useState(-1);
  const [replanPhase, setReplanPhase] = useState<'idle' | 'updating' | 'replanning' | 'found'>('idle');

  // Predictive Look-Ahead State
  const [predictivePhase, setPredictivePhase] = useState<'idle' | 'predicted' | 'replanning' | 'updated'>('idle');
  const [predictiveReason, setPredictiveReason] = useState<string>('');

  // Metrics State
  const [metrics, setMetrics] = useState<MissionMetricsData>({
    plannedDistance: 0,
    actualDistance: 0,
    steps: 0,
    terrainCost: 0,
    planningTimeMs: 0,
    replanningTimeMs: 0,
    replansCount: 0,
    predictiveAvoidances: 0,
    hazardsPredicted: 0,
    reactiveReplansCount: 0,
    progressPercent: 0,
    safetyBreakdown: { safe: 400, risky: 0, blocked: 0, total: 400 },
  });

  // Event Logs State
  const [logs, setLogs] = useState<EventLogItem[]>([]);

  const animationTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pathRevealTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Demo Mode progression flags
  const demoPredictiveTriggeredRef = useRef(false);
  const demoReactiveTriggeredRef = useRef(false);
  const demoModeActiveRef = useRef(false);

  const [navPaused, setNavPaused] = useState(false);
  const roverPosRef = useRef(roverPos);
  const pathIndexRef = useRef(pathIndex);
  const activePathRef = useRef(activePath);
  const gridRef = useRef(grid);
  const autonomousModeRef = useRef(autonomousMode);
  const sensorRangeRef = useRef(sensorRange);
  const isProactiveReplanningRef = useRef(false);

  useEffect(() => {
    roverPosRef.current = roverPos;
  }, [roverPos]);
  useEffect(() => {
    pathIndexRef.current = pathIndex;
  }, [pathIndex]);
  useEffect(() => {
    activePathRef.current = activePath;
  }, [activePath]);
  useEffect(() => {
    gridRef.current = grid;
  }, [grid]);
  useEffect(() => {
    autonomousModeRef.current = autonomousMode;
  }, [autonomousMode]);
  useEffect(() => {
    sensorRangeRef.current = sensorRange;
  }, [sensorRange]);

  // Compute Virtual Sensor Coverage Area
  const sensorCells = useMemo(() => {
    if (autonomousMode !== 'predictive') return new Set<string>();
    return getSensorCoverageCells(roverPos, activePath, pathIndex, sensorRange, rows, cols);
  }, [autonomousMode, roverPos, activePath, pathIndex, sensorRange, rows, cols]);

  // Logger helper
  const addLog = useCallback((message: string, type: EventLogItem['type'] = 'info') => {
    const timeStr = new Date().toLocaleTimeString('en-US', { hour12: false });
    const newLog: EventLogItem = {
      id: Math.random().toString(36).substring(2, 9),
      timestamp: timeStr,
      message,
      type,
    };
    setLogs((prev) => [...prev, newLog]);
  }, []);

  // Update Environment Safety Analysis whenever grid changes
  useEffect(() => {
    const safety = calculateTerrainSafety(grid);
    setMetrics((prev) => ({ ...prev, safetyBreakdown: safety }));
  }, [grid]);

  // Initial greeting log
  useEffect(() => {
    addLog('System ready. Select start and destination or use Demo Mode.', 'info');
  }, [addLog]);

  // Handle cell click / paint
  const handleCellClick = (r: number, c: number) => {
    if (status === 'NAVIGATING' || status === 'REPLANNING' || status === 'OBSTACLE_DETECTED' || status === 'HAZARD_PREDICTED') {
      return; // Lock grid during navigation
    }

    if (toolMode === 'start') {
      setStartPos([r, c]);
      setRoverPos([r, c]);
      addLog(`Rover Start position set to (${r}, ${c})`, 'info');
    } else if (toolMode === 'destination') {
      setDestPos([r, c]);
      addLog(`Destination set to (${r}, ${c})`, 'info');
    } else if (toolMode === 'terrain') {
      setGrid((prev) => {
        const next = prev.map((row) => [...row]);
        next[r][c] = {
          ...next[r][c],
          terrain: selectedTerrain,
          isObstacle: selectedTerrain === 'obstacle',
          isDynamicObstacle: false,
        };
        return next;
      });
    } else if (toolMode === 'obstacle') {
      setGrid((prev) => {
        const next = prev.map((row) => [...row]);
        next[r][c] = {
          ...next[r][c],
          terrain: 'obstacle',
          isObstacle: true,
          isDynamicObstacle: false,
        };
        return next;
      });
    }
  };

  const animatePathReveal = useCallback((pathLength: number) => {
    if (pathRevealTimerRef.current) clearInterval(pathRevealTimerRef.current);
    setPathRevealIndex(0);
    if (pathLength <= 1) {
      setPathRevealIndex(pathLength - 1);
      return;
    }
    pathRevealTimerRef.current = setInterval(() => {
      setPathRevealIndex((prev) => {
        const next = prev + 1;
        if (next >= pathLength - 1) {
          if (pathRevealTimerRef.current) clearInterval(pathRevealTimerRef.current);
        }
        return Math.min(next, pathLength - 1);
      });
    }, 35);
  }, []);

  // 1. Proactive Look-Ahead Replanning Engine
  const runProactiveReplan = useCallback(
    async (
      currentPos: [number, number],
      hazardCell: [number, number],
      reason: string
    ) => {
      if (isProactiveReplanningRef.current) return;
      isProactiveReplanningRef.current = true;

      // Halt movement timer while proactive replanning is processed
      if (animationTimerRef.current) clearInterval(animationTimerRef.current);

      setStatus('HAZARD_PREDICTED');
      setPredictivePhase('predicted');
      setPredictiveReason(reason);
      addLog('🔍 Hazard predicted ahead', 'warning');
      addLog(`Upcoming hazard: ${reason}. Proactively finding alternative route...`, 'info');

      setMetrics((prev) => ({
        ...prev,
        hazardsPredicted: prev.hazardsPredicted + 1,
      }));

      // Allow UI notification to display clearly
      await new Promise((r) => setTimeout(r, 600));

      setPredictivePhase('replanning');
      addLog(`↻ Running A* replanning from ROVER CURRENT POSITION (${currentPos[0]}, ${currentPos[1]})...`, 'replan');

      const startTime = performance.now();
      const altResult = findProactiveAlternativeRoute(
        currentPos,
        destPos,
        gridRef.current,
        navigationMode,
        hazardCell
      );
      const elapsed = Number((performance.now() - startTime).toFixed(2));

      if (altResult.success && altResult.path.length > 0) {
        setReplannedPath(altResult.path);
        setActivePath(altResult.path);
        setPathIndex(0);

        setMetrics((prev) => ({
          ...prev,
          replanningTimeMs: elapsed,
          predictiveAvoidances: prev.predictiveAvoidances + 1,
          replansCount: prev.replansCount + 1,
        }));

        setPredictivePhase('updated');
        addLog('↻ Proactive route adjustment', 'replan');
        addLog(`✓ Route updated. Proactively avoided hazard at (${hazardCell[0]}, ${hazardCell[1]}).`, 'success');
        addLog('✓ Navigation continued', 'info');

        await new Promise((r) => setTimeout(r, 700));
        setPredictivePhase('idle');
        isProactiveReplanningRef.current = false;
        setStatus('NAVIGATING');
      } else {
        addLog('✖ NO ALTERNATIVE ROUTE available to bypass hazard; continuing with caution.', 'warning');
        setPredictivePhase('idle');
        isProactiveReplanningRef.current = false;
        setStatus('NAVIGATING');
      }
    },
    [addLog, destPos, navigationMode]
  );

  // 2. Reactive Replanning Engine (Existing Behavior)
  const runReplanFromCurrent = useCallback(
    async (updatedGrid: CellData[][], currentPos: [number, number]) => {
      setReplanPhase('updating');
      addLog('Cost map updated with dynamic obstacle.', 'warning');

      await new Promise((r) => setTimeout(r, 700));
      setReplanPhase('replanning');
      setStatus('REPLANNING');
      addLog(
        `↻ Running A* replanning from ROVER CURRENT POSITION (${currentPos[0]}, ${currentPos[1]})...`,
        'replan'
      );

      const replanRes = await replanRouteApi(currentPos, destPos, updatedGrid, navigationMode);

      if (replanRes.success && replanRes.path.length > 0) {
        setReplannedPath(replanRes.path);
        setActivePath(replanRes.path);
        setPathIndex(0);
        setReplanPhase('found');

        setMetrics((prev) => ({
          ...prev,
          replanningTimeMs: replanRes.replanningTimeMs ?? replanRes.planningTimeMs,
          reactiveReplansCount: prev.reactiveReplansCount + 1,
          replansCount: prev.replansCount + 1,
        }));

        addLog('↻ Reactive replanning', 'replan');
        addLog(
          `✓ New route generated! Replanning Time: ${replanRes.replanningTimeMs ?? replanRes.planningTimeMs}ms. Resuming navigation automatically.`,
          'success'
        );

        setTimeout(() => {
          setReplanPhase('idle');
          setStatus('NAVIGATING');
          addLog('Navigation resumed along replanned route.', 'info');
        }, 900);
      } else {
        setReplanPhase('idle');
        setStatus('FAILED');
        addLog('✖ Replanning Failed: No alternative path found to destination!', 'danger');
      }
    },
    [addLog, destPos, navigationMode]
  );

  // Calculate Initial Route (A*)
  const handleCalculateRoute = async () => {
    setStatus('PLANNING');
    addLog(`Running A* pathfinding [Mode: ${navigationMode.toUpperCase()}]...`, 'info');

    const result = await planRouteApi(startPos, destPos, grid, navigationMode);

    if (result.success && result.path.length > 0) {
      setInitialPath(result.path);
      setReplannedPath([]);
      setActivePath(result.path);
      setPathIndex(0);
      setRoverPos(startPos);
      setStatus('ROUTE_FOUND');
      animatePathReveal(result.path.length);

      setMetrics((prev) => ({
        ...prev,
        plannedDistance: result.distance,
        actualDistance: 0,
        steps: result.steps,
        terrainCost: result.terrainCost,
        planningTimeMs: result.planningTimeMs,
        progressPercent: 0,
      }));

      addLog('✓ Route calculated', 'success');
      addLog(
        `✓ Route Found! Distance: ${result.distance} cells, Terrain Cost: ${result.terrainCost}, Planning Time: ${result.planningTimeMs}ms`,
        'success'
      );
    } else {
      setStatus('FAILED');
      addLog(`✖ NO SAFE ROUTE AVAILABLE — ${result.error || 'Modify terrain or reset.'}`, 'danger');
    }
  };

  // Step Rover along path
  const stepRover = useCallback(() => {
    setPathIndex((prevIndex) => {
      const nextIndex = prevIndex + 1;
      if (nextIndex >= activePath.length) {
        // Destination reached!
        if (animationTimerRef.current) clearInterval(animationTimerRef.current);
        setStatus('COMPLETED');
        addLog('✓ Destination reached', 'success');
        addLog('🎉 MISSION COMPLETE! Destination successfully reached.', 'success');
        return prevIndex;
      }

      const nextPos = activePath[nextIndex];
      setRoverPos(nextPos);

      // 1. Reactive obstacle check: is the cell stepped onto blocked?
      const [r, c] = nextPos;
      if (grid[r]?.[c]?.isDynamicObstacle || grid[r]?.[c]?.isObstacle) {
        if (animationTimerRef.current) clearInterval(animationTimerRef.current);
        setStatus('OBSTACLE_DETECTED');
        addLog('⚠ Dynamic obstacle detected', 'danger');
        addLog(`⚠ DYNAMIC OBSTACLE DETECTED at (${r}, ${c})! Rover stopping.`, 'danger');
        return prevIndex;
      }

      // Update progress metrics
      setMetrics((prev) => {
        const actualDist = nextIndex;
        const progress = Math.min(
          100,
          Math.round((nextIndex / Math.max(activePath.length - 1, 1)) * 100)
        );
        return {
          ...prev,
          actualDistance: actualDist,
          steps: nextIndex + 1,
          progressPercent: progress,
        };
      });

      // 2. Predictive Look-Ahead Check: Scan upcoming cells before reaching them
      if (
        autonomousModeRef.current === 'predictive' &&
        !isProactiveReplanningRef.current
      ) {
        const scanResult = scanAhead(
          nextPos,
          activePath,
          nextIndex,
          sensorRangeRef.current,
          grid,
          navigationMode
        );

        if (scanResult.hasHazard && scanResult.hazardCell) {
          setTimeout(() => {
            void runProactiveReplan(nextPos, scanResult.hazardCell!, scanResult.reason);
          }, 0);
          return nextIndex;
        }
      }

      return nextIndex;
    });
  }, [activePath, grid, addLog, navigationMode, runProactiveReplan]);

  // Start Navigation Loop
  const handleStartMission = async () => {
    let pathToFollow = activePath;
    if (pathToFollow.length === 0) {
      setStatus('PLANNING');
      const result = await planRouteApi(startPos, destPos, grid, navigationMode);
      if (!result.success || result.path.length === 0) {
        setStatus('FAILED');
        addLog(`✖ Cannot start mission: ${result.error || 'No route'}`, 'danger');
        return;
      }
      setInitialPath(result.path);
      setActivePath(result.path);
      pathToFollow = result.path;
      setPathIndex(0);
      setRoverPos(startPos);
      animatePathReveal(result.path.length);
      setMetrics((prev) => ({
        ...prev,
        plannedDistance: result.distance,
        steps: result.steps,
        terrainCost: result.terrainCost,
        planningTimeMs: result.planningTimeMs,
      }));
    }

    setNavPaused(false);
    setStatus('NAVIGATING');
    demoPredictiveTriggeredRef.current = false;
    demoReactiveTriggeredRef.current = false;
    addLog('✓ Rover navigation started', 'info');
  };

  useEffect(() => {
    if (status === 'NAVIGATING') {
      animationTimerRef.current = setInterval(() => {
        stepRover();
      }, 280);
    } else if (animationTimerRef.current) {
      clearInterval(animationTimerRef.current);
    }

    return () => {
      if (animationTimerRef.current) clearInterval(animationTimerRef.current);
    };
  }, [status, stepRover]);

  // Demo Mode Dynamic Orchestration (Predictive & Reactive Sequence)
  useEffect(() => {
    if (!demoModeActiveRef.current) return;
    if (status !== 'NAVIGATING') return;
    const path = activePathRef.current;
    if (path.length < 8) return;

    // PHASE 5 & 6: At ~35-45% progress of initial route
    // Inject a hazard 3 cells ahead on current path (within 4-cell look-ahead range)
    if (!demoPredictiveTriggeredRef.current && pathIndexRef.current >= 5) {
      demoPredictiveTriggeredRef.current = true;
      const targetIdx = Math.min(pathIndexRef.current + 3, path.length - 1);
      const [hR, hC] = path[targetIdx];
      const currentPos: [number, number] = [...roverPosRef.current];

      const updatedGrid = gridRef.current.map((row) => row.map((cell) => ({ ...cell })));
      updatedGrid[hR][hC] = {
        ...updatedGrid[hR][hC],
        isObstacle: true,
        terrain: 'obstacle',
      };
      setGrid(updatedGrid);

      addLog(`[DEMO PHASE 5] Upcoming hazard injected at (${hR}, ${hC}) 3 cells ahead.`, 'warning');

      // Trigger predictive look-ahead reaction
      void runProactiveReplan(
        currentPos,
        [hR, hC],
        `Hazard detected 3 cells ahead at (${hR}, ${hC}) on active route`
      );
      return;
    }

    // PHASE 8: Later at ~60-70% progress of the new route
    // Drop dynamic obstacle directly on the rover's next step for REACTIVE demonstration
    if (
      demoPredictiveTriggeredRef.current &&
      !demoReactiveTriggeredRef.current &&
      pathIndexRef.current >= 9
    ) {
      demoReactiveTriggeredRef.current = true;
      demoModeActiveRef.current = false;
      const targetIdx = Math.min(pathIndexRef.current + 1, path.length - 1);
      const [obR, obC] = path[targetIdx];
      const currentPos: [number, number] = [...roverPosRef.current];

      if (animationTimerRef.current) clearInterval(animationTimerRef.current);

      const updatedGrid = gridRef.current.map((row) => row.map((cell) => ({ ...cell })));
      updatedGrid[obR][obC] = {
        ...updatedGrid[obR][obC],
        isDynamicObstacle: true,
        isObstacle: true,
      };

      setGrid(updatedGrid);
      setStatus('OBSTACLE_DETECTED');
      addLog(`[DEMO PHASE 8] Dynamic obstacle appeared directly on route at (${obR}, ${obC})!`, 'danger');
      addLog('⚠ Dynamic obstacle detected', 'danger');
      addLog('Rover movement stopped reactively. Updating cost map...', 'warning');

      setTimeout(() => {
        void runReplanFromCurrent(updatedGrid, currentPos);
      }, 900);
    }
  }, [pathIndex, status, addLog, runProactiveReplan, runReplanFromCurrent]);

  // Pause / Resume
  const handlePauseMission = () => {
    if (status === 'NAVIGATING') {
      setNavPaused(true);
      setStatus('ROUTE_FOUND');
      addLog('⏸ Mission paused', 'warning');
    }
  };

  const handleResumeMission = () => {
    if (navPaused && status === 'ROUTE_FOUND') {
      setNavPaused(false);
      setStatus('NAVIGATING');
      addLog('✓ Navigation resumed', 'info');
    }
  };

  // Trigger Dynamic Obstacle & Replanning (Manual Button)
  const handleSimulateDynamicObstacle = () => {
    if (status !== 'NAVIGATING' || activePathRef.current.length === 0) return;

    const path = activePathRef.current;
    const idx = pathIndexRef.current;
    const targetIdx = Math.min(idx + 3, path.length - 1);
    const targetCell = path[targetIdx];
    if (!targetCell) return;

    const [obR, obC] = targetCell;
    const currentPos: [number, number] = [...roverPosRef.current];

    const updatedGrid = gridRef.current.map((row) => row.map((cell) => ({ ...cell })));
    updatedGrid[obR][obC] = {
      ...updatedGrid[obR][obC],
      isDynamicObstacle: true,
      isObstacle: true,
    };

    setGrid(updatedGrid);

    if (autonomousModeRef.current === 'predictive') {
      // In Predictive Mode, look-ahead sensor catches it 3 cells ahead and avoids it proactively!
      void runProactiveReplan(
        currentPos,
        [obR, obC],
        `Dynamic obstacle injected 3 cells ahead at (${obR}, ${obC})`
      );
    } else {
      // In Reactive Mode, rover stops when obstacle blocks route
      if (animationTimerRef.current) clearInterval(animationTimerRef.current);
      setStatus('OBSTACLE_DETECTED');
      addLog('⚠ Dynamic obstacle detected', 'danger');
      addLog(`⚠ DYNAMIC OBSTACLE INJECTED at (${obR}, ${obC}) on active route!`, 'danger');
      addLog('Rover movement halted.', 'warning');

      setTimeout(() => {
        void runReplanFromCurrent(updatedGrid, currentPos);
      }, 900);
    }
  };

  // Reset Simulation
  const handleResetSimulation = () => {
    if (animationTimerRef.current) clearInterval(animationTimerRef.current);
    setGrid(createEmptyGrid(rows, cols));
    setStartPos([2, 2]);
    setDestPos([18, 18]);
    setRoverPos([2, 2]);
    setInitialPath([]);
    setReplannedPath([]);
    setActivePath([]);
    setPathIndex(0);
    setStatus('READY');
    setPathRevealIndex(-1);
    setReplanPhase('idle');
    setPredictivePhase('idle');
    setPredictiveReason('');
    demoPredictiveTriggeredRef.current = false;
    demoReactiveTriggeredRef.current = false;
    demoModeActiveRef.current = false;
    isProactiveReplanningRef.current = false;
    setNavPaused(false);
    setMetrics({
      plannedDistance: 0,
      actualDistance: 0,
      steps: 0,
      terrainCost: 0,
      planningTimeMs: 0,
      replanningTimeMs: 0,
      replansCount: 0,
      predictiveAvoidances: 0,
      hazardsPredicted: 0,
      reactiveReplansCount: 0,
      progressPercent: 0,
      safetyBreakdown: { safe: 400, risky: 0, blocked: 0, total: 400 },
    });
    addLog('Reset simulation', 'info');
  };

  // Clear Terrain (keep start & dest)
  const handleGenerateTerrain = () => {
    setGrid(createEmptyGrid(rows, cols));
    setInitialPath([]);
    setReplannedPath([]);
    setActivePath([]);
    setStatus('READY');
    addLog(`Empty ${rows}×${cols} terrain grid generated.`, 'info');
  };

  const applyGridSize = (newRows: number, newCols: number) => {
    const r = Math.min(30, Math.max(8, newRows));
    const c = Math.min(30, Math.max(8, newCols));
    setRows(r);
    setCols(c);
    setGrid(createEmptyGrid(r, c));
    setStartPos([Math.min(2, r - 1), Math.min(2, c - 1)]);
    setDestPos([Math.min(r - 2, r - 1), Math.min(c - 2, c - 1)]);
    setRoverPos([Math.min(2, r - 1), Math.min(2, c - 1)]);
    setInitialPath([]);
    setReplannedPath([]);
    setActivePath([]);
    setStatus('READY');
  };

  const handleClearTerrain = () => {
    setGrid(createEmptyGrid(rows, cols));
    setInitialPath([]);
    setReplannedPath([]);
    setActivePath([]);
    setStatus('READY');
    addLog('Terrain grid cleared.', 'info');
  };

  // Generate Random Terrain
  const handleGenerateRandomTerrain = () => {
    handleClearTerrain();
    const newGrid = createEmptyGrid(rows, cols);

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if ((r === startPos[0] && c === startPos[1]) || (r === destPos[0] && c === destPos[1])) {
          continue;
        }
        const rnd = Math.random();
        if (rnd < 0.12) newGrid[r][c].isObstacle = true;
        else if (rnd < 0.24) newGrid[r][c].terrain = 'rough';
        else if (rnd < 0.33) newGrid[r][c].terrain = 'difficult';
        else if (rnd < 0.39) newGrid[r][c].terrain = 'high_risk';
      }
    }
    setGrid(newGrid);
    addLog('Randomized terrain generated with safe navigation corridors.', 'info');
  };

  // ONE-CLICK DEMO MODE (JUDGE PRESENTATION FLOW)
  const handleRunDemoMode = async () => {
    handleResetSimulation();
    demoPredictiveTriggeredRef.current = false;
    demoReactiveTriggeredRef.current = false;
    demoModeActiveRef.current = true;
    setAutonomousMode('predictive');
    setSensorRange(4);
    applyGridSize(20, 20);
    addLog('▶ Demo mode started', 'replan');
    addLog('Phase 1: Predefined terrain map loaded (Zones & Static Obstacle wall).', 'info');

    // 1. Build Predefined Scenario
    const demoGrid = createEmptyGrid(20, 20);

    // Rough terrain zone
    for (let r = 5; r <= 11; r++) {
      for (let c = 4; c <= 9; c++) {
        demoGrid[r][c].terrain = 'rough';
      }
    }
    // Difficult terrain zone
    for (let r = 8; r <= 14; r++) {
      for (let c = 11; c <= 15; c++) {
        demoGrid[r][c].terrain = 'difficult';
      }
    }
    // High Risk zone
    for (let r = 12; r <= 16; r++) {
      for (let c = 6; c <= 10; c++) {
        demoGrid[r][c].terrain = 'high_risk';
      }
    }
    // Static Obstacle wall
    const wall = [
      [4, 8], [5, 8], [6, 8], [7, 8],
      [10, 5], [10, 6], [10, 7],
      [14, 12], [14, 13], [14, 14]
    ];
    wall.forEach(([r, c]) => {
      demoGrid[r][c].isObstacle = true;
    });

    const demoStart: [number, number] = [2, 2];
    const demoDest: [number, number] = [18, 18];

    setStartPos(demoStart);
    setDestPos(demoDest);
    setRoverPos(demoStart);
    setGrid(demoGrid);

    // 2. Calculate initial route
    setTimeout(async () => {
      addLog('Phase 2: Calculating initial A* route...', 'info');
      const res = await planRouteApi(demoStart, demoDest, demoGrid, 'balanced');

      if (res.success && res.path.length > 0) {
        setInitialPath(res.path);
        setActivePath(res.path);
        setPathIndex(0);
        setStatus('ROUTE_FOUND');

        setMetrics((prev) => ({
          ...prev,
          plannedDistance: res.distance,
          steps: res.steps,
          terrainCost: res.terrainCost,
          planningTimeMs: res.planningTimeMs,
        }));

        addLog('✓ Route calculated', 'success');
        addLog(`Initial route calculated (${res.distance} cells, cost: ${res.terrainCost}). Starting rover navigation...`, 'success');
        animatePathReveal(res.path.length);

        setTimeout(() => {
          setStatus('NAVIGATING');
          addLog('Phase 4: PREDICTIVE MODE active (Sensor Range = 4 cells).', 'info');
        }, 800);
      }
    }, 500);
  };

  return (
    <div className="min-h-screen flex flex-col bg-surface-muted">
      <Header status={status} />

      <main className="flex-1 p-4 lg:p-6 max-w-[1400px] mx-auto w-full flex flex-col gap-4">
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(280px,32%)_1fr] gap-4 items-start">
          <MissionControls
            toolMode={toolMode}
            setToolMode={setToolMode}
            selectedTerrain={selectedTerrain}
            setSelectedTerrain={setSelectedTerrain}
            navigationMode={navigationMode}
            setNavigationMode={setNavigationMode}
            autonomousMode={autonomousMode}
            setAutonomousMode={setAutonomousMode}
            sensorRange={sensorRange}
            setSensorRange={setSensorRange}
            onCalculateRoute={handleCalculateRoute}
            onStartMission={handleStartMission}
            onPauseMission={handlePauseMission}
            onResumeMission={handleResumeMission}
            onSimulateDynamicObstacle={handleSimulateDynamicObstacle}
            onResetSimulation={handleResetSimulation}
            onGenerateRandomTerrain={handleGenerateRandomTerrain}
            onClearTerrain={handleClearTerrain}
            onGenerateTerrain={handleGenerateTerrain}
            status={status}
            navPaused={navPaused}
            startPos={startPos}
            destPos={destPos}
            gridRows={rows}
            gridCols={cols}
            onGridRowsChange={(n) => applyGridSize(n, cols)}
            onGridColsChange={(n) => applyGridSize(rows, n)}
          />

          <TerrainGrid
            grid={grid}
            rows={rows}
            cols={cols}
            startPos={startPos}
            destPos={destPos}
            roverPos={roverPos}
            initialPath={initialPath}
            replannedPath={replannedPath}
            onCellClick={handleCellClick}
            status={status}
            pathRevealIndex={pathRevealIndex}
            navPaused={navPaused}
            onRunDemoMode={handleRunDemoMode}
            autonomousMode={autonomousMode}
            sensorRange={sensorRange}
            sensorCells={sensorCells}
          />
        </div>

        <ReplanNotification
          status={status}
          replanPhase={replanPhase}
          predictivePhase={predictivePhase}
          predictiveReason={predictiveReason}
        />

        <CurrentRouteBar
          distance={metrics.plannedDistance}
          terrainCost={metrics.terrainCost}
          navigationMode={navigationMode}
          status={status}
        />

        <MissionStatusBar metrics={metrics} status={status} />

        <MissionEvents logs={logs} />

        <MissionCompleteCard
          visible={status === 'COMPLETED'}
          metrics={metrics}
          onRunAgain={handleRunDemoMode}
          onReset={handleResetSimulation}
        />
      </main>
    </div>
  );
};
