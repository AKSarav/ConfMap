import './input.css';
import yaml from 'js-yaml';
import * as echarts from 'echarts';

/**
 * ConfMap Color Scheme
 * 
 * A carefully curated 13-level color palette designed for optimal visual separation
 * and contrast between different configuration hierarchy levels:
 * 
 * Level 0 (Root): Lavender Blue #d6dffc - calm root anchor
 * Level 1: Mint Green #b8e0d2 - fresh contrast
 * Level 2: Soft Amber #ffe6b8 - warm separation from green/blue
 * Level 3: Aqua Teal #a9e2da - cool reset, distinct from amber
 * Level 4: Peach #ffd1b3 - warm step down
 * Level 5: Light Cyan #c0f1ff - icy cool
 * Level 6: Coral Pink #ffb6b9 - warm and bold
 * Level 7: Sky Blue #a7d0f2 - subtle but not too close to Level 0
 * Level 8: Golden Yellow #ffe8a3 - sunny highlight
 * Level 9: Sage Green #c7e9c0 - earthy cool green
 * Level 10: Apricot #ffcfa8 - warm pastel
 * Level 11: Soft Indigo #b5b3ff - deep cool purple for depth
 * Level 12: Light Rose #f7c6e0 - gentle warm closure
 */

// Define the color palette inspired by the user's image
// Carefully selected colors for better contrast and visual separation between levels
const COLORS = [
  '#d6dffc',  // Level 0 (Root): Lavender Blue - calm root anchor
  '#b8e0d2',  // Level 1: Mint Green - fresh contrast
  '#ffe6b8',  // Level 2: Soft Amber - warm separation from green/blue
  '#a9e2da',  // Level 3: Aqua Teal - cool reset, distinct from amber
  '#ffd1b3',  // Level 4: Peach - warm step down
  '#c0f1ff',  // Level 5: Light Cyan - icy cool
  '#ffb6b9',  // Level 6: Coral Pink - warm and bold
  '#a7d0f2',  // Level 7: Sky Blue - subtle but not too close to Level 0
  '#ffe8a3',  // Level 8: Golden Yellow - sunny highlight
  '#c7e9c0',  // Level 9: Sage Green - earthy cool green
  '#ffcfa8',  // Level 10: Apricot - warm pastel
  '#b5b3ff',  // Level 11: Soft Indigo - deep cool purple for depth
  '#f7c6e0'   // Level 12: Light Rose - gentle warm closure
];

// Function to get column color based on depth
// Returns the color for the specified depth level using modulo to cycle through colors
function getColumnColor(depth: number): string {
  return COLORS[depth % COLORS.length];
}
const HIGHLIGHT_COLOR = 'crimson';
const CLUSTER_THRESHOLD = 10;

// Type for ECharts tree data structure
type EChartsTreeData = {
  name: string;
  depth: number;
  isParent: boolean;
  children?: EChartsTreeData[];
  collapsed?: boolean;
  itemStyle: {
    color: string;
    borderColor: string;
    borderWidth: number;
  };
  label: {
    backgroundColor?: string;
    borderColor: string;
    borderWidth: number;
  }
};

const fileUpload = document.getElementById('file-upload') as HTMLInputElement;
const chooseFileBtn = document.getElementById('choose-file-btn') as HTMLButtonElement | null;
const selectedFileName = document.getElementById('selected-file-name') as HTMLSpanElement | null;
const mindmapContainer = document.getElementById('mindmap-container') as HTMLDivElement;
const searchInput = document.getElementById('search-input') as HTMLInputElement;
const searchButton = document.getElementById('search-button') as HTMLButtonElement;
const layoutDropdown = document.getElementById('layout-dropdown') as HTMLSelectElement;
const contextMenu = document.getElementById('context-menu') as HTMLDivElement;
const focusNodeButton = document.getElementById('focus-node-button') as HTMLLIElement;
const displayDropdown = document.getElementById('display-dropdown') as HTMLSelectElement | null;
const helpButton = document.getElementById('help-button') as HTMLButtonElement;
const helpPanel = document.getElementById('help-panel') as HTMLDivElement;
const helpCloseBtn = document.getElementById('help-close-btn') as HTMLButtonElement;
const helpOverlay = document.getElementById('help-overlay') as HTMLDivElement;


const myChart = echarts.init(mindmapContainer);
let originalTreeData: EChartsTreeData | null = null;
let currentLayout: 'LR' | 'TB' | 'radial' = 'LR';
let focusedNode: EChartsTreeData | null = null;
let lineShadowsEnabled = true;
let smoothCurvesEnabled = true; // Smooth curves by default
let currentHoveredNode: EChartsTreeData | null = null;
let lastSelectedNode: EChartsTreeData | null = null;
let isTidyUpMode = false;
let tidyUpTreeData: EChartsTreeData | null = null;
let isAllExpanded = false; // Track expand/collapse state
let currentSearchResults: string[] = []; // Store current search matches
let currentSearchIndex = 0; // Track which result we're focusing on
let isWordWrapEnabled = false; // Track word wrapping state

/**
 * Recursively transforms data, applying clustering logic for dense nodes.
 */
function toEChartsTree(data: any, name = 'root', depth = 0): EChartsTreeData {
  // Ensure each column (depth level) gets a distinct color
  const node: EChartsTreeData = {
    name,
    depth,
    isParent: false,
    itemStyle: {
      color: 'transparent',
      borderColor: 'transparent',
      borderWidth: 0,
    },
    label: {
        backgroundColor: getColumnColor(depth),
        borderColor: 'transparent',
        borderWidth: 0,
    }
  };

  let childrenData: { key: string, value: any }[] = [];
  if (Array.isArray(data)) {
    childrenData = data.map((item, index) => ({ key: `[${index}]`, value: item }));
  } else if (typeof data === 'object' && data !== null) {
    childrenData = Object.entries(data).map(([key, value]) => ({ key, value }));
  }

  node.isParent = childrenData.length > 0;
  
  // Set default collapsed state: show only first 2-3 levels expanded
  if (node.isParent && depth >= 2) {
    node.collapsed = true;
  }

  const hasGrandchildren = childrenData.some(child => typeof child.value === 'object' && child.value !== null && Object.keys(child.value).length > 0);
  if (childrenData.length > CLUSTER_THRESHOLD && hasGrandchildren) {
    node.children = [];
    const clusterSize = 10;
    for (let i = 0; i < childrenData.length; i += clusterSize) {
      const chunk = childrenData.slice(i, i + clusterSize);
      const clusterName = `[${i} - ${i + chunk.length - 1}]`;
      const clusterNode: EChartsTreeData = {
        name: clusterName,
        depth: depth + 1,
        isParent: true,
        collapsed: depth + 1 >= 2, // Apply same collapsed logic to cluster nodes
        itemStyle: { color: 'transparent', borderColor: 'transparent', borderWidth: 0 },
        label: { backgroundColor: getColumnColor(depth + 1), borderColor: 'transparent', borderWidth: 0 },
        children: chunk.map(child => toEChartsTree(child.value, child.key, depth + 2)),
      };
      node.children.push(clusterNode);
    }
  } else if (childrenData.length > 0) {
    node.children = childrenData.map(child => toEChartsTree(child.value, child.key, depth + 1));
  } else {
    node.name = `${name}: ${data}`;
  }

  return node;
}

/**
 * Creates a grid pattern for the background
 */
function createGridPattern(): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;
  const size = 20; // Grid cell size
  
  canvas.width = size;
  canvas.height = size;
  
  // Set background
  ctx.fillStyle = '#f8fafc';
  ctx.fillRect(0, 0, size, size);
  
  // Draw grid lines
  ctx.strokeStyle = '#e2e8f0';
  ctx.lineWidth = 0.5;
  
  // Vertical line
  ctx.beginPath();
  ctx.moveTo(size, 0);
  ctx.lineTo(size, size);
  ctx.stroke();
  
  // Horizontal line
  ctx.beginPath();
  ctx.moveTo(0, size);
  ctx.lineTo(size, size);
  ctx.stroke();
  
  return canvas;
}



/**
 * Initializes an empty chart with grid background for better UX
 */
function initializeEmptyChart() {
  const option: echarts.EChartsOption = {
    backgroundColor: {
      type: 'pattern',
      image: createGridPattern(),
      repeat: 'repeat'
    },
    title: {
      text: 'Upload a configuration file to visualize',
      subtext: 'Supports YAML, YML, and JSON files',
      left: 'center',
      top: '40%',
      textStyle: {
        color: '#666',
        fontSize: 18,
        fontWeight: 'normal'
      },
      subtextStyle: {
        color: '#999',
        fontSize: 14
      }
    },
    series: []
  };
  
  myChart.setOption(option);
}





/**
 * Updates the chart with the given data and options.
 */
function renderChart(data: EChartsTreeData) {
  const isRadial = currentLayout === 'radial';
  const option: echarts.EChartsOption = {
    // Always show grid for better UX
    backgroundColor: {
      type: 'pattern',
      image: createGridPattern(),
      repeat: 'repeat'
    },
    tooltip: {
      trigger: 'item',
      triggerOn: 'mousemove',
      formatter: (params: any) => {
        const { name } = params.data;
        return `<div style="padding: 8px;">
          <div style="font-weight: bold;">${name}</div>
        </div>`;
      },
    },
    legend: {
      type: 'scroll',
      orient: 'vertical',
      right: 10,
      top: 20,
      data: COLORS.map((_, index) => `L${index}`),
      formatter: (name: string) => {
        const level = parseInt(name.substring(1));
        const color = COLORS[level] || '#ccc';
        const levelNames = [
          'Root', 'L1', 'L2', 'L3', 'L4', 'L5', 'L6', 'L7', 'L8', 'L9', 'L10', 'L11', 'L12'
        ];
        return `<span style="display: inline-block; width: 16px; height: 16px; background-color: ${color}; border-radius: 3px; margin-right: 8px; border: 1px solid rgba(0,0,0,0.2);"></span>${levelNames[level] || name}`;
      },
      textStyle: {
        fontSize: 12,
      },
      itemGap: 8,
      pageTextStyle: {
        color: '#666',
      },

    },
        series: [
          {
            type: 'tree',
            data: [data],
            layout: isRadial ? 'radial' : 'orthogonal',
            orient: isRadial ? undefined : (currentLayout === 'radial' ? undefined : currentLayout),
            top: isRadial ? '10%' : '5%',
            left: isRadial ? '10%' : '5%',
            bottom: isRadial ? '10%' : '5%',
            right: isRadial ? '10%' : '15%',
            roam: true,
            zlevel: 2,
            symbol: 'none',
            symbolSize: 0,
            // Add spacing between nodes for better readability
            nodeGap: isRadial ? 30 : 50, // Horizontal gap between nodes at same level
            layerGap: isRadial ? 60 : 100, // Vertical gap between different levels/layers
            // Additional spacing configuration
            initialTreeDepth: -1, // Show all levels by default
            leaves: {
              label: {
                position: isRadial ? 'inside' : (currentLayout === 'TB' ? 'bottom' : 'right'),
                padding: [8, 16], // Smaller padding for leaf nodes
              }
            },
        itemStyle: {
          borderColor: 'transparent',
          borderWidth: 0,
          color: 'transparent',
        },
        label: {
          position: isRadial ? 'inside' : (currentLayout === 'TB' ? 'top' : 'right'),
          verticalAlign: 'middle',
          align: isRadial ? 'center' : (currentLayout === 'TB' ? 'center' : 'left'),
          padding: isWordWrapEnabled ? [16, 24] : [12, 20], // Increased padding for word-wrapped text
          borderRadius: 8,
          backgroundColor: 'inherit',
          borderColor: 'transparent',
          borderWidth: 0,
          // Add margin between labels
          distance: 8, // Distance from the connection line
          formatter: (params: any) => {
            const { name, isParent, collapsed } = params.data;
            const wrappedName = wrapText(name);
            if (isParent) {
              const marker = collapsed ? '+' : '-';
              return `{marker| ${marker} }{name| ${wrappedName}}`;
            }
            return `{name|${wrappedName}}`;
          },
          rich: {
            marker: {
              backgroundColor: 'rgba(0,0,0,0.05)',
              color: '#555',
              width: 22,
              height: 22,
              lineHeight: 22,
              align: 'center',
              borderRadius: 4,
              fontWeight: 'bold',
              padding: [2, 4], // Add padding inside marker
            },
            name: {
              color: '#333',
              fontSize: 14,
              padding: [0, 8], // Add padding around text
              lineHeight: isWordWrapEnabled ? 18 : 22, // Adjust line height for word wrapping
              width: isWordWrapEnabled ? 200 : 'auto', // Set width for word wrapping
              overflow: 'break', // Allow text to break
            }
          }
        },
        lineStyle: {
          color: 'rgba(0,0,0,0.3)',
          curveness: isRadial ? 0 : (smoothCurvesEnabled ? 0.5 : 0),
          width: 2,
          shadowBlur: lineShadowsEnabled ? 4 : 0,
          shadowColor: lineShadowsEnabled ? 'rgba(0,0,0,0.4)' : 'transparent',
          shadowOffsetX: lineShadowsEnabled ? 1 : 0,
          shadowOffsetY: lineShadowsEnabled ? 1 : 0,
        },

        emphasis: {
          focus: 'descendant',
          lineStyle: {
            color: 'rgba(59, 130, 246, 0.8)',
            width: 3,
            shadowBlur: lineShadowsEnabled ? 8 : 0,
            shadowColor: lineShadowsEnabled ? 'rgba(59, 130, 246, 0.5)' : 'transparent',
            shadowOffsetX: lineShadowsEnabled ? 2 : 0,
            shadowOffsetY: lineShadowsEnabled ? 2 : 0,
          },
          label: {
            borderColor: 'rgba(59, 130, 246, 0.8)',
            borderWidth: 3,
          }
        },
        expandAndCollapse: true,
        animationDuration: 550,
        animationDurationUpdate: 750,
      },

    ],
  };
  myChart.setOption(option, { notMerge: true });
}

// Custom file trigger for consistent UI
if (chooseFileBtn) {
  chooseFileBtn.addEventListener('click', () => fileUpload?.click());
}

fileUpload.addEventListener('change', (event) => {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (!file) return;

  if (selectedFileName) {
    selectedFileName.textContent = file.name;
  }

  const reader = new FileReader();
  reader.onload = (e) => {
    const content = e.target?.result as string;
    let data: any;

    try {
      if (file.name.endsWith('.yml') || file.name.endsWith('.yaml')) {
        data = yaml.load(content);
      } else if (file.name.endsWith('.json')) {
        data = JSON.parse(content);
      } else {
        mindmapContainer.innerHTML = '<p>Unsupported file type.</p>';
        return;
      }

      originalTreeData = toEChartsTree(data);
      renderChart(originalTreeData);
      
      // Initialize button state based on actual tree state
      updateExpandCollapseButton();

    } catch (error) {
      mindmapContainer.innerHTML = `<p>Error parsing file: ${(error as Error).message}</p>`;
    }
  };
  reader.readAsText(file);
});

function handleSearch() {
  if (!originalTreeData) return;

  const searchTerm = searchInput.value.toLowerCase().trim();
  if (!searchTerm) {
    // Clear search results
    currentSearchResults = [];
    currentSearchIndex = 0;
    updateSearchNavigationButtons();
    
    // Exit TidyUp mode when clearing search
    if (isTidyUpMode) {
      isTidyUpMode = false;
      tidyUpTreeData = null;
      const tidyUpIndicator = document.getElementById('tidyup-indicator');
      if (tidyUpIndicator) tidyUpIndicator.classList.add('hidden');
    }
    renderChart(originalTreeData);
    showTidyUpNotification('Search cleared');
    return;
  }

  // Use the current displayed data (either original or TidyUp) as base for search
  const baseData = isTidyUpMode && tidyUpTreeData ? tidyUpTreeData : originalTreeData;
  const searchedData = JSON.parse(JSON.stringify(baseData));
  let matchCount = 0;
  const matchedNodes: string[] = [];

  function traverse(node: EChartsTreeData): boolean {
    const isMatch = node.name.toLowerCase().includes(searchTerm);
    let hasMatchInSubtree = false;
    
    // Reset highlighting first
    node.label.borderColor = 'transparent';
    node.label.borderWidth = 0;
    
    // Check if this node matches
    if (isMatch) {
      node.label.borderColor = HIGHLIGHT_COLOR;
      node.label.borderWidth = 2;
      matchCount++;
      matchedNodes.push(node.name);
      hasMatchInSubtree = true;
    }
    
    // Check all children (not just until first match)
    if (node.children) {
      let anyChildMatches = false;
      node.children.forEach(child => {
        if (traverse(child)) {
          anyChildMatches = true;
        }
      });
      
      if (anyChildMatches) {
        hasMatchInSubtree = true;
        // Expand parent nodes that contain matches
        node.collapsed = false;
      }
    }
    
    return hasMatchInSubtree;
  }

  traverse(searchedData);

  if (matchCount > 0) {
    renderChart(searchedData);
    
    // Store search results for navigation
    currentSearchResults = matchedNodes;
    currentSearchIndex = 0;
    
    // Show navigation buttons if multiple results
    updateSearchNavigationButtons();
    
    // Show search results feedback with navigation hint
    const searchFeedback = matchCount === 1 
      ? `Found 1 match: "${matchedNodes[0]}"`
      : `Found ${matchCount} matches: ${matchedNodes.slice(0, 3).join(', ')}${matchCount > 3 ? ` and ${matchCount - 3} more...` : ''}${matchCount > 1 ? ' (Use ↑↓ arrows to navigate)' : ''}`;
    
    showTidyUpNotification(searchFeedback);
    
    // Update search button to show results count
    const searchBtn = document.getElementById('search-button');
    if (searchBtn) {
      const originalText = searchBtn.innerHTML;
      searchBtn.innerHTML = `<span class="text-xs">${matchCount} found</span>`;
      searchBtn.style.backgroundColor = '#10b981'; // Green color
      
      // Reset button after 3 seconds
      setTimeout(() => {
        searchBtn.innerHTML = originalText;
        searchBtn.style.backgroundColor = '';
      }, 3000);
    }
    
  } else {
    // Clear search results
    currentSearchResults = [];
    currentSearchIndex = 0;
    updateSearchNavigationButtons();
    showTidyUpNotification('No matching nodes found.');
    
    // Update search button to show no results
    const searchBtn = document.getElementById('search-button');
    if (searchBtn) {
      const originalText = searchBtn.innerHTML;
      searchBtn.innerHTML = '<span class="text-xs">No matches</span>';
      searchBtn.style.backgroundColor = '#ef4444'; // Red color
      
      // Reset button after 2 seconds
      setTimeout(() => {
        searchBtn.innerHTML = originalText;
        searchBtn.style.backgroundColor = '';
      }, 2000);
    }
  }
}

function updateLayoutDropdown() {
    layoutDropdown.value = currentLayout;
}

function handleLayoutChange(layout: 'LR' | 'TB' | 'radial') {
    if (!originalTreeData) return;
    currentLayout = layout;
    updateLayoutDropdown();
    myChart.clear();
    
    // Render the appropriate data (TidyUp or original)
    const dataToRender = isTidyUpMode && tidyUpTreeData ? tidyUpTreeData : originalTreeData;
    renderChart(dataToRender);
}

function handleDisplayOptionChange() {
    const displayMode = displayDropdown?.value;
    
    switch (displayMode) {
        case 'default':
            smoothCurvesEnabled = true;
            lineShadowsEnabled = true;
            break;
        case 'minimal':
            smoothCurvesEnabled = false;
            lineShadowsEnabled = false;
            break;
        case 'enhanced':
            smoothCurvesEnabled = true;
            lineShadowsEnabled = true;
            break;
        case 'technical':
            smoothCurvesEnabled = false;
            lineShadowsEnabled = true;
            break;
    }
    
    if (originalTreeData) {
        renderChart(originalTreeData);
    }
}





function handleFocus() {
    if (!focusedNode || !originalTreeData) return;

    function collapseAll(node: EChartsTreeData) {
        if (node.isParent) node.collapsed = true;
        if (node.children) node.children.forEach(child => collapseAll(child));
    }
    collapseAll(originalTreeData);

    function expandPath(node: EChartsTreeData, targetNode: EChartsTreeData): boolean {
        if (node === targetNode || (node.children && node.children.some(child => expandPath(child, targetNode)))) {
            node.collapsed = false;
            return true;
        }
        return false;
    }
    
    let targetNodeInTree: EChartsTreeData | null = null;
    function findNode(node: EChartsTreeData, target: EChartsTreeData) {
        if (node.name === target.name && node.depth === target.depth) {
            targetNodeInTree = node;
            return;
        }
        if (node.children) node.children.forEach(child => findNode(child, target));
    }
    findNode(originalTreeData, focusedNode);
    
    if (targetNodeInTree) expandPath(originalTreeData, targetNodeInTree);

    renderChart(originalTreeData);
    focusedNode = null;
}

/**
 * Creates a lineage tree showing only the path from root to target node and all its descendants
 */
function createLineageTree(originalData: EChartsTreeData, targetNode: EChartsTreeData): EChartsTreeData {
  console.log('Creating lineage tree for target:', targetNode.name, 'at depth:', targetNode.depth);
  
  // Deep clone the original data
  const lineageTree = JSON.parse(JSON.stringify(originalData));
  
  // Find the path from root to target node
  const pathToTarget: string[] = [];
  
  function findPath(node: EChartsTreeData, target: EChartsTreeData, currentPath: string[]): boolean {
    currentPath.push(node.name);
    
    if (node.name === target.name && node.depth === target.depth) {
      pathToTarget.push(...currentPath);
      return true;
    }
    
    if (node.children) {
      for (const child of node.children) {
        if (findPath(child, target, currentPath)) {
          return true;
        }
      }
    }
    
    currentPath.pop();
    return false;
  }
  
  findPath(originalData, targetNode, []);
  console.log('Path to target:', pathToTarget);
  
  // Filter the tree to show only lineage
  function filterLineage(node: EChartsTreeData, currentPath: string[], targetDepth: number): EChartsTreeData | null {
    const nodePathIndex = currentPath.indexOf(node.name);
    const isOnPath = nodePathIndex !== -1;
    const isAtOrBeyondTarget = node.depth >= targetDepth;
    
    console.log(`Filtering node: ${node.name}, depth: ${node.depth}, isOnPath: ${isOnPath}, isAtOrBeyondTarget: ${isAtOrBeyondTarget}`);
    
    if (!isOnPath && !isAtOrBeyondTarget) {
      console.log(`  Excluding node: ${node.name}`);
      return null; // Node is not on the path and not at/beyond target depth
    }
    
    const filteredNode = { ...node };
    
    if (node.children && node.children.length > 0) {
      const filteredChildren: EChartsTreeData[] = [];
      
      for (const child of node.children) {
        // If we're at the target depth, include all children
        if (node.depth === targetDepth) {
          console.log(`  Including all children of target node: ${child.name}`);
          filteredChildren.push(child);
        } else {
          // Otherwise, only include children on the path
          const filteredChild = filterLineage(child, currentPath, targetDepth);
          if (filteredChild) {
            filteredChildren.push(filteredChild);
          }
        }
      }
      
      filteredNode.children = filteredChildren.length > 0 ? filteredChildren : undefined;
      console.log(`  Node ${node.name} has ${filteredChildren.length} filtered children`);
    }
    
    return filteredNode;
  }
  
  const result = filterLineage(lineageTree, pathToTarget, targetNode.depth);
  console.log('Final lineage tree:', result);
  return result || lineageTree;
}

/**
 * Handles the TidyUp feature - shows only lineage of the currently hovered/selected node
 */
function handleTidyUp() {
  console.log('handleTidyUp called, originalTreeData:', !!originalTreeData, 'currentHoveredNode:', currentHoveredNode?.name, 'lastSelectedNode:', lastSelectedNode?.name);
  
  if (!originalTreeData) {
    showTidyUpNotification('Please upload a configuration file first');
    return;
  }

  // Use currentHoveredNode first, then fall back to lastSelectedNode
  const targetNode = currentHoveredNode || lastSelectedNode;
  
  if (!targetNode) {
    // Show notification that no node is selected
    showTidyUpNotification('Please hover over or click a node first, then press Alt+T');
    return;
  }
  
  if (isTidyUpMode) {
    // Exit TidyUp mode - restore original tree
    console.log('Exiting TidyUp mode');
    isTidyUpMode = false;
    tidyUpTreeData = null;
    renderChart(originalTreeData);
    showTidyUpNotification('TidyUp mode disabled - showing full tree');
  } else {
    // Enter TidyUp mode - show only lineage
    console.log('Entering TidyUp mode for node:', targetNode.name);
    isTidyUpMode = true;
    tidyUpTreeData = createLineageTree(originalTreeData, targetNode);
    console.log('Created lineage tree:', tidyUpTreeData);
    renderChart(tidyUpTreeData);
    showTidyUpNotification(`TidyUp mode enabled - showing lineage of "${targetNode.name}"`);
  }
}


/**
 * Copies the lineage (path from root + all descendants) of a node to clipboard
 */
function copyLineageToClipboard(targetNode: EChartsTreeData) {
  if (!originalTreeData) return;
  
  console.log('Copying lineage for:', targetNode.name);
  
  // Get the lineage tree
  const lineageTree = createLineageTree(originalTreeData, targetNode);
  
  // Convert tree to readable text format
  function treeToText(node: EChartsTreeData, indent: string = '', isLast: boolean = true): string {
    const connector = isLast ? '└── ' : '├── ';
    const nodeText = `${indent}${connector}${node.name}\n`;
    
    if (node.children && node.children.length > 0) {
      const childIndent = indent + (isLast ? '    ' : '│   ');
      const childTexts = node.children.map((child, index) => 
        treeToText(child, childIndent, index === node.children!.length - 1)
      );
      return nodeText + childTexts.join('');
    }
    
    return nodeText;
  }
  
  // Convert to YAML-like format (alternative)
  function treeToYamlLike(node: EChartsTreeData, indent: string = ''): string {
    let result = `${indent}${node.name}:\n`;
    
    if (node.children && node.children.length > 0) {
      const childIndent = indent + '  ';
      const childTexts = node.children.map(child => 
        treeToYamlLike(child, childIndent)
      );
      result += childTexts.join('');
    } else {
      // If it's a leaf node, show it as a value
      result = `${indent}${node.name}\n`;
    }
    
    return result;
  }
  
  // Generate both formats
  const treeFormat = `Lineage Tree for "${targetNode.name}":\n\n${treeToText(lineageTree)}`;
  const yamlFormat = `\nYAML-like format:\n\n${treeToYamlLike(lineageTree)}`;
  
  const fullText = treeFormat + yamlFormat;
  
  // Copy to clipboard
  navigator.clipboard.writeText(fullText).then(() => {
    showTidyUpNotification(`Copied lineage of "${targetNode.name}" to clipboard!`);
    console.log('Lineage copied to clipboard:', fullText);
  }).catch(err => {
    console.error('Failed to copy to clipboard:', err);
    showTidyUpNotification('Failed to copy to clipboard - check console for details');
  });
}

/**
 * Wraps text to multiple lines based on character limit
 */
function wrapText(text: string, maxCharsPerLine: number = 25): string {
  if (!isWordWrapEnabled || text.length <= maxCharsPerLine) {
    return text;
  }
  
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';
  
  for (const word of words) {
    // If adding this word would exceed the limit
    if (currentLine.length + word.length + 1 > maxCharsPerLine) {
      // If current line has content, push it and start new line
      if (currentLine.length > 0) {
        lines.push(currentLine.trim());
        currentLine = word;
      } else {
        // Word is longer than max chars, split it
        if (word.length > maxCharsPerLine) {
          let remainingWord = word;
          while (remainingWord.length > maxCharsPerLine) {
            lines.push(remainingWord.substring(0, maxCharsPerLine));
            remainingWord = remainingWord.substring(maxCharsPerLine);
          }
          currentLine = remainingWord;
        } else {
          currentLine = word;
        }
      }
    } else {
      // Add word to current line
      if (currentLine.length > 0) {
        currentLine += ' ' + word;
      } else {
        currentLine = word;
      }
    }
  }
  
  // Don't forget the last line
  if (currentLine.length > 0) {
    lines.push(currentLine.trim());
  }
  
  return lines.join('\n');
}

/**
 * Toggles word wrapping mode for lengthy node text
 */
function toggleWordWrap() {
  isWordWrapEnabled = !isWordWrapEnabled;
  
  if (!originalTreeData) {
    showTidyUpNotification('Please upload a configuration file first');
    return;
  }
  
  // Re-render the chart with the new word wrap setting
  const dataToRender = isTidyUpMode && tidyUpTreeData ? tidyUpTreeData : originalTreeData;
  renderChart(dataToRender);
  
  // Show notification
  const status = isWordWrapEnabled ? 'enabled' : 'disabled';
  showTidyUpNotification(`Word wrapping ${status} for lengthy text`);
}

/**
 * Shows a temporary notification for TidyUp actions and updates the indicator
 */
function showTidyUpNotification(message: string) {
  // Update the TidyUp mode indicator
  const tidyUpIndicator = document.getElementById('tidyup-indicator');
  const tidyUpNodeName = document.getElementById('tidyup-node-name');
  
  if (isTidyUpMode && currentHoveredNode && tidyUpIndicator && tidyUpNodeName) {
    tidyUpIndicator.classList.remove('hidden');
    tidyUpNodeName.textContent = currentHoveredNode.name;
  } else if (tidyUpIndicator) {
    tidyUpIndicator.classList.add('hidden');
  }
  
  // Create or update notification element
  let notification = document.getElementById('tidyup-notification');
  if (!notification) {
    notification = document.createElement('div');
    notification.id = 'tidyup-notification';
    notification.className = 'fixed top-4 right-4 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg z-50 transition-all duration-300 transform translate-x-full';
    document.body.appendChild(notification);
  }
  
  notification.textContent = message;
  notification.style.transform = 'translateX(0)';
  
  // Hide after 3 seconds
  setTimeout(() => {
    if (notification) {
      notification.style.transform = 'translateX(100%)';
      setTimeout(() => {
        if (notification && notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 300);
    }
  }, 3000);
}

/**
 * Expands all nodes in the tree (removes all collapsed states)
 */
function expandAllNodes() {
    if (!originalTreeData) {
        showTidyUpNotification('Please upload a configuration file first');
        return;
    }
    
    // Function to recursively expand all nodes
    function expandRecursively(node: EChartsTreeData) {
        if (node.isParent) {
            node.collapsed = false;
        }
        if (node.children) {
            node.children.forEach(child => expandRecursively(child));
        }
    }
    
    // Expand all nodes in the original tree data
    expandRecursively(originalTreeData);
    
    // If we're in TidyUp mode, also expand the TidyUp tree
    if (isTidyUpMode && tidyUpTreeData) {
        expandRecursively(tidyUpTreeData);
        renderChart(tidyUpTreeData);
    } else {
        renderChart(originalTreeData);
    }
    
    // Update state and button
    isAllExpanded = true;
    updateExpandCollapseButton();
    showTidyUpNotification('All nodes expanded!');
}

/**
 * Collapses all nodes in the tree (sets all parent nodes as collapsed)
 */
function collapseAllNodes() {
    if (!originalTreeData) {
        showTidyUpNotification('Please upload a configuration file first');
        return;
    }
    
    // Function to recursively collapse all nodes
    function collapseRecursively(node: EChartsTreeData) {
        if (node.isParent) {
            node.collapsed = true;
        }
        if (node.children) {
            node.children.forEach(child => collapseRecursively(child));
        }
    }
    
    // Collapse all nodes in the original tree data
    collapseRecursively(originalTreeData);
    
    // If we're in TidyUp mode, also collapse the TidyUp tree
    if (isTidyUpMode && tidyUpTreeData) {
        collapseRecursively(tidyUpTreeData);
        renderChart(tidyUpTreeData);
    } else {
        renderChart(originalTreeData);
    }
    
    // Update state and button
    isAllExpanded = false;
    updateExpandCollapseButton();
    showTidyUpNotification('All nodes collapsed!');
}

/**
 * Toggles between expand all and collapse all
 */
function toggleExpandCollapseAll() {
    if (isAllExpanded) {
        collapseAllNodes();
    } else {
        expandAllNodes();
    }
}

/**
 * Checks if all expandable nodes in the tree are currently expanded
 */
function checkIfAllExpanded(node: EChartsTreeData): boolean {
    if (node.isParent && node.collapsed) {
        return false; // Found a collapsed parent node
    }
    if (node.children) {
        return node.children.every(child => checkIfAllExpanded(child));
    }
    return true; // No collapsed nodes found
}

/**
 * Updates the search navigation buttons visibility and state
 */
function updateSearchNavigationButtons() {
    const navButtons = document.getElementById('search-nav-buttons');
    const prevBtn = document.getElementById('search-prev-btn');
    const nextBtn = document.getElementById('search-next-btn');
    
    if (!navButtons || !prevBtn || !nextBtn) return;
    
    if (currentSearchResults.length > 1) {
        navButtons.classList.remove('hidden');
        navButtons.classList.add('flex');
        
        // Update button states (could disable if only one result, but we'll keep them enabled for cycling)
        prevBtn.removeAttribute('disabled');
        nextBtn.removeAttribute('disabled');
    } else {
        navButtons.classList.add('hidden');
        navButtons.classList.remove('flex');
    }
}

/**
 * Finds a node in the tree by name and depth for focusing
 */
function findNodeInTree(tree: EChartsTreeData, targetName: string): EChartsTreeData | null {
    if (tree.name === targetName) {
        return tree;
    }
    
    if (tree.children) {
        for (const child of tree.children) {
            const found = findNodeInTree(child, targetName);
            if (found) return found;
        }
    }
    
    return null;
}

/**
 * Focuses on a specific node by highlighting it and centering the view
 */
function focusOnSearchResult(nodeName: string) {
    if (!originalTreeData) return;
    
    // Find the node in the current tree data
    const currentData = isTidyUpMode && tidyUpTreeData ? tidyUpTreeData : originalTreeData;
    const targetNode = findNodeInTree(currentData, nodeName);
    
    if (targetNode) {
        // Create a temporary enhanced highlight for the focused node
        const tempTreeData = JSON.parse(JSON.stringify(currentData));
        
        function highlightFocusedNode(node: EChartsTreeData): void {
            if (node.name === nodeName) {
                // Enhanced highlighting for the focused node with pulse effect
                node.label.borderColor = '#3b82f6'; // Blue color for focus
                node.label.borderWidth = 4;
                node.label.backgroundColor = '#dbeafe'; // Light blue background
                
                // Add emphasis styling for the focused node
                node.itemStyle = {
                    ...node.itemStyle,
                    color: '#3b82f6',
                    borderColor: '#1d4ed8',
                    borderWidth: 2
                };
            } else if (node.label.borderColor === HIGHLIGHT_COLOR) {
                // Keep search highlights but make them less prominent when another node is focused
                node.label.borderColor = '#ef4444'; // Keep red but slightly muted
                node.label.borderWidth = 1;
            }
            
            if (node.children) {
                node.children.forEach(child => highlightFocusedNode(child));
            }
        }
        
        highlightFocusedNode(tempTreeData);
        
        // Render with the enhanced highlighting
        renderChart(tempTreeData);
        
        // Try to focus and center on the node
        try {
            // First, expand parent nodes to ensure the target is visible
            function ensureNodeVisible(node: EChartsTreeData, targetName: string): boolean {
                if (node.name === targetName) {
                    return true;
                }
                
                if (node.children) {
                    for (const child of node.children) {
                        if (ensureNodeVisible(child, targetName)) {
                            // Expand this parent node to make child visible
                            node.collapsed = false;
                            return true;
                        }
                    }
                }
                
                return false;
            }
            
            ensureNodeVisible(tempTreeData, nodeName);
            
            // Re-render with expanded parents
            renderChart(tempTreeData);
            
            // Try to highlight the specific node in ECharts
            setTimeout(() => {
                myChart.dispatchAction({
                    type: 'highlight',
                    name: nodeName
                });
                
                // Attempt to center on the node (this may vary by ECharts version)
                myChart.dispatchAction({
                    type: 'focusNodeAdjacency',
                    name: nodeName
                });
                
            }, 200);
            
        } catch (error) {
            console.log('Enhanced chart focus not available, using basic highlight:', error);
        }
        
        // Show brief notification
        showTidyUpNotification(`Focused on: "${nodeName}" (${currentSearchIndex + 1}/${currentSearchResults.length})`);
        
        // Create a subtle pulse effect
        let pulseCount = 0;
        const pulseInterval = setInterval(() => {
            pulseCount++;
            
            if (pulseCount <= 3) {
                // Create pulse by alternating border width
                const pulseTreeData = JSON.parse(JSON.stringify(currentData));
                function pulseNode(node: EChartsTreeData): void {
                    if (node.name === nodeName) {
                        const borderWidth = pulseCount % 2 === 0 ? 4 : 3;
                        node.label.borderColor = '#3b82f6';
                        node.label.borderWidth = borderWidth;
                        node.label.backgroundColor = '#dbeafe';
                    } else if (node.label.borderColor === HIGHLIGHT_COLOR) {
                        node.label.borderColor = HIGHLIGHT_COLOR;
                        node.label.borderWidth = 2;
                    }
                    
                    if (node.children) {
                        node.children.forEach(child => pulseNode(child));
                    }
                }
                
                pulseNode(pulseTreeData);
                renderChart(pulseTreeData);
            } else {
                // Stop pulsing and return to normal search highlighting
                clearInterval(pulseInterval);
                if (currentSearchResults.length > 0) {
                    renderChart(currentData);
                }
            }
        }, 300); // Pulse every 300ms
    }
}

/**
 * Navigates to previous search result
 */
function navigateToPreviousResult() {
    if (currentSearchResults.length === 0) return;
    
    currentSearchIndex = (currentSearchIndex - 1 + currentSearchResults.length) % currentSearchResults.length;
    const currentMatch = currentSearchResults[currentSearchIndex];
    
    // Focus on the node instead of just showing notification
    focusOnSearchResult(currentMatch);
}

/**
 * Navigates to next search result
 */
function navigateToNextResult() {
    if (currentSearchResults.length === 0) return;
    
    currentSearchIndex = (currentSearchIndex + 1) % currentSearchResults.length;
    const currentMatch = currentSearchResults[currentSearchIndex];
    
    // Focus on the node instead of just showing notification
    focusOnSearchResult(currentMatch);
}

/**
 * Updates the expand/collapse button text and icon based on current tree state
 */
function updateExpandCollapseButton() {
    const expandBtn = document.getElementById('expand-all-btn');
    if (expandBtn && originalTreeData) {
        // Check actual tree state instead of relying on flag
        const actuallyAllExpanded = checkIfAllExpanded(originalTreeData);
        isAllExpanded = actuallyAllExpanded;
        
        if (isAllExpanded) {
            expandBtn.innerHTML = '<span class="emoji-icon">📁</span> Collapse All';
        } else {
            expandBtn.innerHTML = '<span class="emoji-icon">📂</span> Expand All';
        }
    }
}

/**
 * Downloads the current mind map as a PNG image with full content capture
 */
function downloadAsPNG() {
    if (!myChart) return;
    
    try {
        // Show loading state
        const downloadBtn = document.getElementById('download-png-btn');
        if (downloadBtn) {
            const originalText = downloadBtn.innerHTML;
            downloadBtn.innerHTML = '<span class="emoji-icon">⏳</span> Exporting...';
            downloadBtn.style.backgroundColor = '#f59e0b'; // Orange color
        }
        
        // First, expand all nodes to ensure everything is visible
        if (originalTreeData) {
            if (!isAllExpanded) {
                expandAllNodes();
            }
        }
        
        // Wait for expansion to complete, then reset view to fit all content
        setTimeout(() => {
            try {
                // Use ECharts' restore action to fit all content in view
                myChart.dispatchAction({
                    type: 'restore'
                });
                
                // Wait for the restore action to complete
                setTimeout(() => {
                    try {
                        // Now capture the full content with proper margins
                        const dataURL = myChart.getDataURL({
                            type: 'png',
                            pixelRatio: 2, // Good quality without being too large
                            backgroundColor: '#ffffff',
                            excludeComponents: ['toolbox', 'legend'] // Exclude UI components for cleaner export
                        });
                        
                        // Create a temporary link element
                        const link = document.createElement('a');
                        link.download = `confmap-mindmap-${new Date().toISOString().slice(0, 10)}.png`;
                        link.href = dataURL;
                        
                        // Trigger download
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                        
                        // Show success feedback
                        if (downloadBtn) {
                            downloadBtn.innerHTML = '<span class="emoji-icon">✅</span> Saved!';
                            downloadBtn.style.backgroundColor = '#10b981'; // Green color
                            
                            // Reset button after 2 seconds
                            setTimeout(() => {
                                downloadBtn.innerHTML = '<span class="hidden md:inline">Export PNG ↓</span><span class="md:hidden">📸</span>';
                                downloadBtn.style.backgroundColor = '';
                            }, 2000);
                        }
                        
                        // Show success notification
                        showTidyUpNotification('Full mind map exported as PNG!');
                        
                    } catch (innerError) {
                        console.error('Error in final PNG export:', innerError);
                        showPNGError();
                    }
                }, 200); // Wait for restore to complete
                
            } catch (innerError) {
                console.error('Error in restore action:', innerError);
                showPNGError();
            }
        }, 300); // Wait for expansion to complete
        
    } catch (error) {
        console.error('Error downloading PNG:', error);
        showPNGError();
    }
}

/**
 * Shows the help panel with slide animation
 */
function showHelpPanel() {
  if (helpPanel && helpOverlay) {
    helpPanel.classList.remove('hidden');
    helpOverlay.classList.remove('hidden');
    
    // Trigger animation after element is visible
    setTimeout(() => {
      helpPanel.classList.remove('translate-x-full');
    }, 10);
    
    // Prevent body scroll when help panel is open
    document.body.style.overflow = 'hidden';
  }
}

/**
 * Hides the help panel with slide animation
 */
function hideHelpPanel() {
  if (helpPanel && helpOverlay) {
    helpPanel.classList.add('translate-x-full');
    
    // Hide elements after animation completes
    setTimeout(() => {
      helpPanel.classList.add('hidden');
      helpOverlay.classList.add('hidden');
    }, 300);
    
    // Restore body scroll
    document.body.style.overflow = '';
  }
}

/**
 * Shows error feedback for PNG export
 */
function showPNGError() {
    const downloadBtn = document.getElementById('download-png-btn');
    if (downloadBtn) {
        downloadBtn.innerHTML = '<span class="emoji-icon">❌</span> Error';
        downloadBtn.style.backgroundColor = '#ef4444'; // Red color
        
        // Reset button after 2 seconds
        setTimeout(() => {
            downloadBtn.innerHTML = '<span class="hidden md:inline">Export PNG ↓</span><span class="md:hidden">📸</span>';
            downloadBtn.style.backgroundColor = '';
        }, 2000);
    }
}

// Event Listeners
searchButton.addEventListener('click', handleSearch);
searchInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') handleSearch();
});
layoutDropdown.addEventListener('change', (e) => handleLayoutChange((e.target as HTMLSelectElement).value as 'LR' | 'TB' | 'radial'));
focusNodeButton.addEventListener('click', handleFocus);

// Download PNG button event listener
const downloadPngBtn = document.getElementById('download-png-btn');
if (downloadPngBtn) {
    downloadPngBtn.addEventListener('click', downloadAsPNG);
}

// Expand/Collapse All button event listener
const expandAllBtn = document.getElementById('expand-all-btn');
if (expandAllBtn) {
    expandAllBtn.addEventListener('click', toggleExpandCollapseAll);
}

// Search navigation button event listeners
const searchPrevBtn = document.getElementById('search-prev-btn');
const searchNextBtn = document.getElementById('search-next-btn');

if (searchPrevBtn) {
    searchPrevBtn.addEventListener('click', navigateToPreviousResult);
}

if (searchNextBtn) {
    searchNextBtn.addEventListener('click', navigateToNextResult);
}

// Fullscreen functionality - simple header toggle
let isFullscreen = false;
const fullscreenBtn = document.getElementById('fullscreen-btn');
const fullscreenText = document.querySelector('.fullscreen-text');

function toggleFullscreen() {
    isFullscreen = !isFullscreen;
    
    if (isFullscreen) {
        // Enter fullscreen - hide header
        document.body.classList.add('fullscreen-mode');
        if (fullscreenText) {
            fullscreenText.textContent = 'Exit Fullscreen';
        }
    } else {
        // Exit fullscreen - show header
        document.body.classList.remove('fullscreen-mode');
        if (fullscreenText) {
            fullscreenText.textContent = 'Fullscreen';
        }
    }
    
    // Resize chart after layout change
    setTimeout(() => {
        myChart.resize();
    }, 100);
}

if (fullscreenBtn) {
    fullscreenBtn.addEventListener('click', toggleFullscreen);
}

// Display options event listener (if present)
displayDropdown?.addEventListener('change', handleDisplayOptionChange);

// Help panel event listeners
if (helpButton) {
    helpButton.addEventListener('click', showHelpPanel);
}

if (helpCloseBtn) {
    helpCloseBtn.addEventListener('click', hideHelpPanel);
}

if (helpOverlay) {
    helpOverlay.addEventListener('click', hideHelpPanel);
}

// Close help panel with Escape key
document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && helpPanel && !helpPanel.classList.contains('hidden')) {
        event.preventDefault();
        hideHelpPanel();
    }
});


window.addEventListener('click', () => {
    contextMenu.style.display = 'none';
});

// Enhanced event handling for TidyUp feature with extensive debugging
console.log('Setting up ECharts event handlers...');

myChart.on('mouseover', (params) => {
    // Check if we have node data (tree series events have data property with node info)
    if (params.data && params.data.name) {
        currentHoveredNode = params.data as EChartsTreeData;
        lastSelectedNode = params.data as EChartsTreeData; // Also update last selected
        console.log('Hovered node:', currentHoveredNode.name);
        // Update cursor to indicate interactivity
        mindmapContainer.style.cursor = 'pointer';
    }
});

myChart.on('mouseout', (params) => {
    // Reset cursor
    mindmapContainer.style.cursor = 'default';
    // Keep the hovered node for a short time for TidyUp functionality
    setTimeout(() => {
        currentHoveredNode = null;
    }, 200); // Small delay to allow Alt+T to work
});

// Also track clicks to ensure we have a selected node
myChart.on('click', (params) => {
    // Check if we have node data
    if (params.data && params.data.name) {
        lastSelectedNode = params.data as EChartsTreeData;
        currentHoveredNode = params.data as EChartsTreeData;
        console.log('Clicked node:', lastSelectedNode.name);
    }
});


// Simplified context menu handling
myChart.on('contextmenu', (params) => {
    if (params.dataType === 'node') {
        focusedNode = params.data as EChartsTreeData;
        currentHoveredNode = params.data as EChartsTreeData; // Update for TidyUp
        // Simple positioning without complex event handling
        contextMenu.style.left = '50%';
        contextMenu.style.top = '50%';
        contextMenu.style.display = 'block';
    }
});

// Test if JavaScript is working
console.log('JavaScript loaded successfully!');

// Test basic keyboard event detection
document.addEventListener('keydown', (event) => {
    console.log('Key pressed:', event.key, 'Alt:', event.altKey, 'Ctrl:', event.ctrlKey);

    
    // Alt+T to toggle TidyUp mode - use event.code for keyboard layout independence
    if (event.altKey && (event.code === 'KeyT' || event.key.toLowerCase() === 't' || event.key === 'þ')) {
        event.preventDefault();
        const targetNode = currentHoveredNode || lastSelectedNode;
        console.log('Alt+T pressed, targetNode:', targetNode?.name);
        handleTidyUp();
    }
    
    // Alt+E to toggle expand/collapse all nodes
    if (event.altKey && (event.code === 'KeyE' || event.key.toLowerCase() === 'e')) {
        event.preventDefault();
        console.log('Alt+E pressed, toggling expand/collapse all nodes');
        toggleExpandCollapseAll();
    }
    
    // Alt+W to toggle word wrapping for lengthy text
    if (event.altKey && (event.code === 'KeyW' || event.key.toLowerCase() === 'w')) {
        event.preventDefault();
        console.log('Alt+W pressed, toggling word wrapping');
        toggleWordWrap();
    }
    
    // Ctrl+C to copy lineage of selected node to clipboard
    if (event.ctrlKey && event.code === 'KeyC') {
        const targetNode = currentHoveredNode || lastSelectedNode;
        if (targetNode && originalTreeData) {
            event.preventDefault();
            console.log('Ctrl+C pressed, copying lineage for:', targetNode.name);
            copyLineageToClipboard(targetNode);
        }
    }
    
    // Escape key to exit TidyUp mode
    if (event.key === 'Escape' && isTidyUpMode) {
        event.preventDefault();
        handleTidyUp(); // This will toggle off TidyUp mode
    }
    
    // Arrow keys to navigate through search results (when search input is focused or results exist)
    if (currentSearchResults.length > 0 && (event.key === 'ArrowUp' || event.key === 'ArrowDown')) {
        const activeElement = document.activeElement;
        const isSearchFocused = activeElement === searchInput;
        
        // Only handle arrow keys if search input is focused or no other input is focused
        if (isSearchFocused || (!activeElement || activeElement.tagName !== 'INPUT')) {
            event.preventDefault();
            
            if (event.key === 'ArrowUp') {
                // Up arrow: Previous result
                navigateToPreviousResult();
            } else {
                // Down arrow: Next result
                navigateToNextResult();
            }
        }
    }
});

// Initialize layout dropdown
updateLayoutDropdown();

// Initialize display dropdown to default (if present)
if (displayDropdown) {
  displayDropdown.value = 'default';
}

// Initialize chart with grid background for better UX in idle state
initializeEmptyChart();

// Scrollable controls functionality
function initializeScrollableControls() {
    const controlsContainer = document.querySelector('.overflow-x-auto');
    const leftFade = document.querySelector('.scroll-fade-left');
    const rightFade = document.querySelector('.scroll-fade-right');
    
    if (!controlsContainer || !leftFade || !rightFade) return;
    
    function updateScrollIndicators() {
        const { scrollLeft, scrollWidth, clientWidth } = controlsContainer as Element;
        
        // Show/hide left fade
        if (scrollLeft > 10) {
            leftFade.classList.remove('hidden');
        } else {
            leftFade.classList.add('hidden');
        }
        
        // Show/hide right fade
        if (scrollLeft < scrollWidth - clientWidth - 10) {
            rightFade.classList.remove('hidden');
        } else {
            rightFade.classList.add('hidden');
        }
    }
    
    // Update indicators on scroll
    controlsContainer.addEventListener('scroll', updateScrollIndicators);
    
    // Update indicators on resize
    window.addEventListener('resize', updateScrollIndicators);
    
    // Initial update
    setTimeout(updateScrollIndicators, 100);
    
    // Add smooth scroll to controls on mobile
    if ('ontouchstart' in window) {
        controlsContainer.addEventListener('touchstart', () => {
            controlsContainer.classList.add('scroll-smooth');
        });
        
        controlsContainer.addEventListener('touchend', () => {
            setTimeout(() => {
                controlsContainer.classList.remove('scroll-smooth');
            }, 300);
        });
    }
    
    // Expose scroll to control function globally for future use
    (window as any).scrollToControl = (controlId: string) => {
        const control = document.getElementById(controlId);
        if (control && controlsContainer) {
            control.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'nearest', 
                inline: 'center' 
            });
        }
    };
}

// Initialize scrollable controls
initializeScrollableControls();

window.addEventListener('resize', () => {
  myChart.resize();
});