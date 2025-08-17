# ConfMap Color Scheme Guide

## 🎨 Overview

ConfMap uses a sophisticated 13-level color coding system designed to provide optimal visual separation and contrast between different configuration hierarchy levels. Each color is carefully selected to ensure readability and aesthetic appeal.

## 🌈 Color Palette

### Level 0 (Root) - Lavender Blue `#d6dffc`
- **Purpose**: Calm root anchor
- **Use Case**: Top-level configuration elements
- **Visual Impact**: Soft, professional, easy on the eyes

### Level 1 - Mint Green `#b8e0d2`
- **Purpose**: Fresh contrast from root
- **Use Case**: Primary configuration sections
- **Visual Impact**: Natural, fresh, distinct from blue

### Level 2 - Soft Amber `#ffe6b8`
- **Purpose**: Warm separation from green/blue
- **Use Case**: Secondary configuration sections
- **Visual Impact**: Warm, inviting, creates clear separation

### Level 3 - Aqua Teal `#a9e2da`
- **Purpose**: Cool reset, distinct from amber
- **Use Case**: Tertiary configuration sections
- **Visual Impact**: Cool, refreshing, provides visual break

### Level 4 - Peach `#ffd1b3`
- **Purpose**: Warm step down
- **Use Case**: Fourth-level configurations
- **Visual Impact**: Soft, warm, gentle transition

### Level 5 - Light Cyan `#c0f1ff`
- **Purpose**: Icy cool
- **Use Case**: Fifth-level configurations
- **Visual Impact**: Bright, cool, stands out clearly

### Level 6 - Coral Pink `#ffb6b9`
- **Purpose**: Warm and bold
- **Use Case**: Sixth-level configurations
- **Visual Impact**: Bold, warm, high visibility

### Level 7 - Sky Blue `#a7d0f2`
- **Purpose**: Subtle but not too close to Level 0
- **Use Case**: Seventh-level configurations
- **Visual Impact**: Subtle, professional, distinct from root

### Level 8 - Golden Yellow `#ffe8a3`
- **Purpose**: Sunny highlight
- **Use Case**: Eighth-level configurations
- **Visual Impact**: Bright, cheerful, high contrast

### Level 9 - Sage Green `#c7e9c0`
- **Purpose**: Earthy cool green
- **Use Case**: Ninth-level configurations
- **Visual Impact**: Natural, calming, distinct from other greens

### Level 10 - Apricot `#ffcfa8`
- **Purpose**: Warm pastel
- **Use Case**: Tenth-level configurations
- **Visual Impact**: Soft, warm, gentle

### Level 11 - Soft Indigo `#b5b3ff`
- **Purpose**: Deep cool purple for depth
- **Use Case**: Eleventh-level configurations
- **Visual Impact**: Deep, sophisticated, creates depth

### Level 12 - Light Rose `#f7c6e0`
- **Purpose**: Gentle warm closure
- **Use Case**: Twelfth-level configurations
- **Visual Impact**: Gentle, warm, perfect ending

## 🎯 Design Principles

### 1. **Contrast Maximization**
- Each color is chosen to maximize contrast with adjacent levels
- Warm and cool colors alternate to create visual rhythm
- Saturation and brightness are balanced for readability

### 2. **Accessibility**
- All colors meet WCAG contrast guidelines
- Colors are distinguishable for colorblind users
- High contrast ensures readability in various lighting conditions

### 3. **Visual Hierarchy**
- Root level uses calming, professional colors
- Middle levels use vibrant, attention-grabbing colors
- Deep levels use sophisticated, depth-creating colors

### 4. **Aesthetic Appeal**
- Colors are pleasing to the eye
- Professional appearance suitable for business use
- Consistent with modern design trends

## 📊 Usage Guidelines

### **Best Practices**
1. **Limit Nesting**: Try to keep configurations under 8 levels for optimal readability
2. **Consistent Structure**: Use similar structures across different configuration files
3. **Color Reference**: Use the legend to understand level relationships
4. **Tooltip Information**: Hover over nodes to see level details

### **Common Patterns**
- **Level 0**: Application name, project root, main configuration
- **Level 1**: Major sections (database, api, cache, etc.)
- **Level 2**: Subsections (endpoints, credentials, etc.)
- **Level 3**: Configuration groups (hosts, ports, etc.)
- **Level 4+**: Specific settings and values

## 🔧 Customization

### **Adding New Colors**
To add more levels, extend the `COLORS` array in `src/main.ts`:

```typescript
const COLORS = [
  // ... existing colors ...
  '#newcolor',  // Level 13: New Color Name
];
```

### **Modifying Existing Colors**
Update the hex values in the `COLORS` array to change specific level colors.

### **CSS Classes**
Use the provided CSS classes for consistent styling:

```css
.column-level-0 { background-color: #d6dffc; }
.column-level-1 { background-color: #b8e0d2; }
/* ... etc ... */
```

## 📱 Testing Your Configuration

1. **Upload** your configuration file to ConfMap
2. **Observe** the color coding at different levels
3. **Verify** that adjacent levels have good contrast
4. **Check** that the hierarchy is clear and readable
5. **Use** the legend to understand level relationships

## 🎨 Color Psychology

### **Warm Colors** (Amber, Peach, Coral, Golden, Apricot, Rose)
- Create energy and excitement
- Draw attention to important elements
- Provide visual breaks in the hierarchy

### **Cool Colors** (Blue, Green, Teal, Cyan, Indigo)
- Create calm and professionalism
- Establish structure and order
- Provide visual anchors

### **Neutral Colors** (Lavender, Mint, Sage)
- Bridge between warm and cool
- Create smooth transitions
- Maintain visual harmony

## 🚀 Future Enhancements

- **Dynamic Color Schemes**: User-selectable color themes
- **Custom Color Mapping**: User-defined color assignments
- **Accessibility Modes**: High-contrast and colorblind-friendly options
- **Export Options**: Save color-coded diagrams as images

---

*This color scheme is designed to make complex configuration hierarchies easy to understand and navigate. Each color serves a specific purpose in creating a clear visual hierarchy.*
