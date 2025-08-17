# ConfMap

A sophisticated mind map visualization tool for YAML, JSON, and YML configuration files with an intelligent 13-level color coding system.

## ✨ Features

- **🎨 Intelligent Color Coding**: 13 distinct colors for different hierarchy levels
- **📁 Multi-format Support**: YAML, JSON, and YML files
- **🔍 Interactive Search**: Find and highlight specific nodes
- **🎯 Multiple Layouts**: Horizontal, Vertical, and Radial views
- **📱 Responsive Design**: Works on all device sizes
- **🎯 Node Focus**: Right-click to focus on specific nodes
- **📊 Visual Hierarchy**: Clear column-based organization

## 🎨 Color Scheme

ConfMap uses a carefully curated 13-level color palette designed for optimal visual separation and contrast:

| Level | Color Name | Hex Code | Description |
|-------|------------|----------|-------------|
| **0** | Lavender Blue | `#d6dffc` | Calm root anchor |
| **1** | Mint Green | `#b8e0d2` | Fresh contrast |
| **2** | Soft Amber | `#ffe6b8` | Warm separation from green/blue |
| **3** | Aqua Teal | `#a9e2da` | Cool reset, distinct from amber |
| **4** | Peach | `#ffd1b3` | Warm step down |
| **5** | Light Cyan | `#c0f1ff` | Icy cool |
| **6** | Coral Pink | `#ffb6b9` | Warm and bold |
| **7** | Sky Blue | `#a7d0f2` | Subtle but not too close to Level 0 |
| **8** | Golden Yellow | `#ffe8a3` | Sunny highlight |
| **9** | Sage Green | `#c7e9c0` | Earthy cool green |
| **10** | Apricot | `#ffcfa8` | Warm pastel |
| **11** | Soft Indigo | `#b5b3ff` | Deep cool purple for depth |
| **12** | Light Rose | `#f7c6e0` | Gentle warm closure |

## 🚀 Getting Started

1. **Upload Configuration File**: Drag and drop or select a YAML, JSON, or YML file
2. **Explore the Mind Map**: Navigate through the hierarchical structure
3. **Use Different Layouts**: Switch between Horizontal, Vertical, and Radial views
4. **Search for Nodes**: Use the search functionality to find specific elements
5. **Focus on Nodes**: Right-click nodes to focus and expand their paths

## 📁 Sample Files

- `sample-config.yaml` - Demonstrates all 13 color levels
- Upload your own configuration files to see the color coding in action

## 🛠️ Technical Details

- Built with **TypeScript** and **ECharts**
- Responsive design with **Tailwind CSS**
- Supports deep nesting up to 13 levels
- Automatic color cycling for deeper levels
- Interactive tooltips with level information
- Legend showing all color levels

## 🔧 Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## 📱 Usage Examples

### Kubernetes Configurations
Perfect for visualizing complex Kubernetes YAML files with multiple nested levels.

### Application Configs
Great for understanding application configuration hierarchies and relationships.

### Infrastructure as Code
Ideal for Terraform, CloudFormation, and other IaC configurations.

## 🎯 Use Cases

- **Configuration Analysis**: Understand complex nested configurations
- **Documentation**: Create visual documentation of system architectures
- **Onboarding**: Help new team members understand system structures
- **Troubleshooting**: Visualize configuration relationships and dependencies
- **Planning**: Plan configuration changes with visual context

## 🤝 Contributing

Contributions are welcome! Please feel free to submit pull requests or open issues for bugs and feature requests.

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

**Developed with ❤️ From India**
