import './style.css';
import yaml from 'js-yaml';
import * as echarts from 'echarts';

// Define the color palette inspired by the user's image
const COLORS = ['#d6dffc', '#c0d0ff', '#b8e0d2', '#d8f3e9'];
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
  };
  label: {
    borderColor: string;
    borderWidth: number;
  }
};

const fileUpload = document.getElementById('file-upload') as HTMLInputElement;
const mindmapContainer = document.getElementById('mindmap-container') as HTMLDivElement;
const searchInput = document.getElementById('search-input') as HTMLInputElement;
const searchButton = document.getElementById('search-button') as HTMLButtonElement;
const lrLayoutButton = document.getElementById('lr-layout-button') as HTMLButtonElement;
const tbLayoutButton = document.getElementById('tb-layout-button') as HTMLButtonElement;
const radialLayoutButton = document.getElementById('radial-layout-button') as HTMLButtonElement;
const contextMenu = document.getElementById('context-menu') as HTMLDivElement;
const focusNodeButton = document.getElementById('focus-node-button') as HTMLLIElement;

const myChart = echarts.init(mindmapContainer);
let originalTreeData: EChartsTreeData | null = null;
let currentLayout: 'LR' | 'TB' | 'Radial' = 'LR';
let focusedNode: EChartsTreeData | null = null;

/**
 * Recursively transforms data, applying clustering logic for dense nodes.
 */
function toEChartsTree(data: any, name = 'root', depth = 0): EChartsTreeData {
  const node: EChartsTreeData = {
    name,
    depth,
    isParent: false,
    itemStyle: {
      color: COLORS[depth % COLORS.length],
    },
    label: {
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
        itemStyle: { color: COLORS[(depth + 1) % COLORS.length] },
        label: { borderColor: 'transparent', borderWidth: 0 },
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
 * Updates the chart with the given data and options.
 */
function renderChart(data: EChartsTreeData) {
  const isRadial = currentLayout === 'Radial';
  const option: echarts.EChartsOption = {
    tooltip: {
      trigger: 'item',
      triggerOn: 'mousemove',
      formatter: '{b}',
    },
    series: [
      {
        type: 'tree',
        data: [data],
        layout: isRadial ? 'radial' : 'orthogonal',
        orient: isRadial ? undefined : currentLayout,
        top: isRadial ? '15%' : '2%',
        left: isRadial ? '15%' : '10%',
        bottom: isRadial ? '15%' : '2%',
        right: isRadial ? '15%' : '20%',
        roam: true,
        nodeGap: isRadial ? 15 : 40,
        levelDistance: 200,
        symbol: 'none',
        symbolSize: 1,
        label: {
          position: isRadial ? 'inside' : (currentLayout === 'TB' ? 'top' : 'right'),
          verticalAlign: 'middle',
          align: isRadial ? 'center' : (currentLayout === 'TB' ? 'center' : 'left'),
          padding: [8, 15],
          borderRadius: 8,
          backgroundColor: 'inherit',
          borderColor: (params: any) => params.data.label.borderColor,
          borderWidth: (params: any) => params.data.label.borderWidth,
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
          color: 'source',
          curveness: isRadial ? 0 : 0.5,
          width: 1.5,
        },
        emphasis: {
          focus: 'descendant',
        },
        expandAndCollapse: true,
        animationDuration: 550,
        animationDurationUpdate: 750,
      },
    ],
  };
  myChart.setOption(option, { notMerge: true });
}

fileUpload.addEventListener('change', (event) => {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (!file) return;

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
  const query = searchInput.value.toLowerCase();
  const searchedData = JSON.parse(JSON.stringify(originalTreeData));

  if (!query) {
    function clearHighlights(node: EChartsTreeData) {
        node.label.borderColor = 'transparent';
        node.label.borderWidth = 0;
        if (node.children) node.children.forEach(clearHighlights);
    }
    clearHighlights(searchedData);
    renderChart(searchedData);
    return;
  }

  let found = false;
  function traverse(node: EChartsTreeData): boolean {
    let isMatch = node.name.toLowerCase().includes(query);
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

function updateActiveButton() {
    lrLayoutButton.classList.toggle('active', currentLayout === 'LR');
    tbLayoutButton.classList.toggle('active', currentLayout === 'TB');
    radialLayoutButton.classList.toggle('active', currentLayout === 'Radial');
}

function handleLayoutChange(layout: 'LR' | 'TB' | 'Radial') {
    if (!originalTreeData) return;
    currentLayout = layout;
    updateActiveButton();
    myChart.clear();
    renderChart(originalTreeData);
}

function handleFocus() {
    if (!focusedNode || !originalTreeData) return;

    function collapseAll(node: EChartsTreeData) {
        if (node.isParent) node.collapsed = true;
        if (node.children) node.children.forEach(collapseAll);
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

// Event Listeners
searchButton.addEventListener('click', handleSearch);
searchInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') handleSearch();
});
lrLayoutButton.addEventListener('click', () => handleLayoutChange('LR'));
tbLayoutButton.addEventListener('click', () => handleLayoutChange('TB'));
radialLayoutButton.addEventListener('click', () => handleLayoutChange('Radial'));
focusNodeButton.addEventListener('click', handleFocus);

window.addEventListener('click', () => {
    contextMenu.style.display = 'none';
});

myChart.on('contextmenu', (params) => {
    params.event.event.preventDefault();
    if (params.dataType === 'node') {
        focusedNode = params.data as EChartsTreeData;
        contextMenu.style.left = params.event.event.clientX + 'px';
        contextMenu.style.top = params.event.event.clientY + 'px';
        contextMenu.style.display = 'block';
    }
});

window.addEventListener('resize', () => {
  myChart.resize();
});