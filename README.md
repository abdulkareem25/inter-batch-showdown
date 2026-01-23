# Visual Editor

A professional, web-based design canvas application for creating and editing visual layouts with intuitive drag-and-drop functionality, real-time property editing, and export capabilities.

## Features

### 🎨 Core Design Tools
- **Element Creation**: Add rectangles and text elements to your canvas with a single click
- **Drag & Drop**: Smoothly drag elements around the canvas with intelligent boundary detection
- **Resize Handles**: Resize elements using corner handles (NW, NE, SW, SE) with precise control
- **Rotation & Scaling**: Apply rotation and scale transformations to elements for advanced layouts
- **Multi-select Layer Support**: Organize and manage multiple elements efficiently

### 🎯 Selection & Manipulation
- **Element Selection**: Click elements on the canvas or in the layers panel to select them
- **Visual Feedback**: Selected elements display clear visual indicators with resize handles
- **Duplicate Elements**: Quickly duplicate selected elements while preserving all properties
- **Delete Elements**: Remove unwanted elements from your canvas
- **Boundary Constraints**: Elements stay within canvas bounds during drag and resize operations with intelligent rotation handling

### 🎛️ Properties Panel
- **Real-time Editing**: Modify properties of selected elements instantly:
  - Position (X, Y coordinates)
  - Dimensions (Width, Height)
  - Colors (Background and text colors)
  - Text content
  - Rotation angle and transformations
  - Z-index (layering)
  - Element scaling (scaleX, scaleY)

### 📋 Layers Management
- **Layers Panel**: Complete overview of all elements in your design
- **Visual Hierarchy**: See element types and properties at a glance
- **Quick Selection**: Click any layer to select and edit that element
- **Layer Renaming**: Double-click a layer name to rename elements for better organization
- **Layer Reordering**: Move layers up and down with arrow buttons to control stacking order
- **Z-Index Control**: Manage layering order to arrange elements front to back

### 🔧 Advanced Features
- **Grid System**: Toggle grid overlay for precise alignment and positioning
- **Undo/Redo Functionality**: Full history support for undoing and redoing actions
- **Element Renaming**: Double-click layer names to rename elements for better organization
- **Layer Reordering**: Move layers up and down to control Z-index and visual stacking
- **Element Alignment**: Align selected elements to canvas edges or center (left, right, top, bottom, center-h, center-v)
- **Rotation & Flipping**: 
  - Manual rotation input (0-360°)
  - Quick rotate 90° button
  - Horizontal and vertical flip transformations
- **Keyboard Shortcuts**: 
  - `Ctrl+Z` / `Cmd+Z`: Undo
  - `Ctrl+Y` / `Cmd+Y` or `Ctrl+Shift+Z` / `Cmd+Shift+Z`: Redo
  - `Ctrl+C` / `Cmd+C`: Copy element
  - `Ctrl+V` / `Cmd+V`: Paste/Duplicate element
  - `Delete`: Remove selected element
  - `Arrow Keys`: Move element (5px) / `Shift+Arrow`: Move element (10px)

### 💾 Data Management
- **Save to Storage**: Automatically save your work to browser local storage
- **Load from Storage**: Resume previous designs on page reload
- **Clear Canvas**: Reset the entire design to start fresh
- **Export JSON**: Export your design as structured JSON data for integration or backup
- **Export HTML**: Generate standalone HTML file of your design for web publishing

### 🎯 Precision & Performance
- **Smart Boundary Detection**: Advanced collision detection with rotation support ensures elements never leave the canvas
- **Optimized Rendering**: Efficient DOM manipulation for smooth performance even with multiple elements
- **Cursor Feedback**: Visual cursor changes (grabbing/pointer) for better UX
- **Smooth Animations**: Transitions and effects for natural interactions

### 🎨 Modern Dark UI
- **Professional Theme**: Dark mode interface with carefully selected color palette
- **Optimal Layout**: Three-panel design (Layers, Canvas, Properties) for optimal workflow
- **Intuitive Toolbar**: Quick access buttons for common operations
- **Custom Fonts**: Uses Inter font for clean, modern typography

## Getting Started

### Requirements
- Modern web browser (Chrome, Firefox, Safari, Edge)
- No installation or build process required

### Usage

1. **Open the application**: Load `index.html` in your web browser
2. **Create elements**: Click "Add Rectangle" or "Add Text" buttons
3. **Edit properties**: Select an element and modify its properties in the Properties panel
4. **Arrange layout**: Drag elements to position them, resize with handles
5. **Save your work**: Click "Save" button to store your design
6. **Export**: Use "Export JSON" or "Export HTML" to export your design

## Project Structure

```
├── index.html      # HTML markup for the application UI
├── style.css       # Styling and layout (dark theme)
├── app.js          # Core application logic and functionality
└── README.md       # Project documentation
```

## Technical Stack

- **HTML5**: Semantic markup structure
- **CSS3**: Modern styling with CSS variables and flexbox layout
- **Vanilla JavaScript**: Pure JavaScript (no frameworks) for lightweight, fast performance
- **Web APIs**: 
  - DOM Manipulation
  - Local Storage API
  - Mouse/Keyboard Events

## Key Capabilities

| Feature | Description |
|---------|-------------|
| **Canvas-based Design** | Create pixel-perfect layouts on a virtual canvas |
| **Element Types** | Support for rectangles and text elements |
| **Transformations** | Rotation, scaling, flipping, and positioning |
| **Alignment Tools** | Align elements to canvas edges or center positions |
| **Layer Management** | Rename, reorder, and organize elements efficiently |
| **History System** | Full undo/redo support with comprehensive history |
| **Export Options** | JSON and HTML export formats |
| **Persistent Storage** | Automatic saving to local storage |
| **Grid Alignment** | Optional grid overlay for precise positioning |

## Browser Compatibility

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Performance

- Lightweight (no dependencies)
- Smooth 60 FPS interactions
- Optimized rendering pipeline
- Efficient event delegation

## Future Enhancements

Potential features for future versions:
- Additional shape types (circles, polygons, lines)
- Text formatting options (font, size, weight, alignment)
- Gradient and pattern fills
- Image import and manipulation
- Group and alignment tools
- Responsive design preview
- Collaboration features
- Touch device support

## License

This project is part of the Inter Batch Showdown initiative.

---

**Created with ❤️ for modern web design workflows**
