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


const myChart = echarts.init(mindmapContainer);
let originalTreeData: EChartsTreeData | null = null;
let currentLayout: 'LR' | 'TB' | 'radial' = 'LR';
let focusedNode: EChartsTreeData | null = null;
let lineShadowsEnabled = true;
let smoothCurvesEnabled = true; // Smooth curves by default

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
        top: isRadial ? '15%' : '2%',
        left: isRadial ? '15%' : '10%',
        bottom: isRadial ? '15%' : '2%',
        right: isRadial ? '15%' : '20%',
        roam: true,
        zlevel: 2,
        symbol: 'none',
        symbolSize: 0,
        itemStyle: {
          borderColor: 'transparent',
          borderWidth: 0,
          color: 'transparent',
        },
        label: {
          position: isRadial ? 'inside' : (currentLayout === 'TB' ? 'top' : 'right'),
          verticalAlign: 'middle',
          align: isRadial ? 'center' : (currentLayout === 'TB' ? 'center' : 'left'),
          padding: [8, 15],
          borderRadius: 8,
          backgroundColor: 'inherit',
          borderColor: 'transparent',
          borderWidth: 0,
          formatter: (params: any) => {
            const { name, isParent, collapsed } = params.data;
            if (isParent) {
              const marker = collapsed ? '+' : '-';
              return `{marker| ${marker} }{name| ${name}}`;
            }
            return `{name|${name}}`;
          },
          rich: {
            marker: {
              backgroundColor: 'rgba(0,0,0,0.05)',
              color: '#555',
              width: 20,
              height: 20,
              lineHeight: 20,
              align: 'center',
              borderRadius: 4,
              fontWeight: 'bold',
            },
            name: {
              color: '#333',
              fontSize: 14,
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
    renderChart(originalTreeData);
    return;
  }

  const searchedData = JSON.parse(JSON.stringify(originalTreeData));
  let found = false;

  function traverse(node: EChartsTreeData): boolean {
    const isMatch = node.name.toLowerCase().includes(searchTerm);
    node.label.borderColor = 'transparent';
    node.label.borderWidth = 0;
    if (isMatch) {
      node.label.borderColor = HIGHLIGHT_COLOR;
      node.label.borderWidth = 2;
      found = true;
    }
    if (node.children) {
      let childFound = node.children.some(child => traverse(child));
      if (childFound) {
        node.collapsed = false;
        return true;
      }
    }
    return isMatch;
  }

  traverse(searchedData);

  if (found) {
    renderChart(searchedData);
  } else {
    alert('No matching nodes found.');
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
    renderChart(originalTreeData);
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
 * Downloads the current mind map as a PNG image
 */
function downloadAsPNG() {
    if (!myChart) return;
    
    try {
        // Get the chart as base64 data URL
        const dataURL = myChart.getDataURL({
            type: 'png',
            pixelRatio: 2, // Higher quality
            backgroundColor: '#ffffff'
        });
        
        // Create a temporary link element
        const link = document.createElement('a');
        link.download = 'confmap-mindmap.png';
        link.href = dataURL;
        
        // Trigger download
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Show success feedback
        const downloadBtn = document.getElementById('download-png-btn');
        if (downloadBtn) {
            const originalText = downloadBtn.innerHTML;
            downloadBtn.innerHTML = '<span class="emoji-icon">✅</span> Saved!';
            downloadBtn.style.backgroundColor = '#10b981'; // Green color
            
            // Reset button after 2 seconds
            setTimeout(() => {
                downloadBtn.innerHTML = originalText;
                downloadBtn.style.backgroundColor = '';
            }, 2000);
        }
    } catch (error) {
        console.error('Error downloading PNG:', error);
        // Show error feedback
        const downloadBtn = document.getElementById('download-png-btn');
        if (downloadBtn) {
            const originalText = downloadBtn.innerHTML;
            downloadBtn.innerHTML = '<span class="emoji-icon">❌</span> Error';
            downloadBtn.style.backgroundColor = '#ef4444'; // Red color
            
            // Reset button after 2 seconds
            setTimeout(() => {
                downloadBtn.innerHTML = originalText;
                downloadBtn.style.backgroundColor = '';
            }, 2000);
        }
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


window.addEventListener('click', () => {
    contextMenu.style.display = 'none';
});

// Simplified context menu handling
myChart.on('contextmenu', (params) => {
    if (params.dataType === 'node') {
        focusedNode = params.data as EChartsTreeData;
        // Simple positioning without complex event handling
        contextMenu.style.left = '50%';
        contextMenu.style.top = '50%';
        contextMenu.style.display = 'block';
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

window.addEventListener('resize', () => {
  myChart.resize();
});