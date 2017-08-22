# Heatmap
Two dimensions table of values represented as heatmap. The value is mapped to a color range.

**sources**
* [D3.js v4.x](https://github.com/d3/d3/blob/master/API.md) (d3-interpolate, d3-scale, d3-selection, d3-transition)
* Input data is an object where each properties (that will be the rows) is an object where each properties (that will be the columns) is the actual value of the cell. If columns are missing, they will be initiate at 0: {row1: {column1: #, ...}, row2:{...}}.

**parameters**
* div = 'body': container id
* id = 'view': figure id
* data = {row1: {column1: 1}}: input data
* title = 'Heatmap of ': figure title
* titleSize = 20: title font size
* fontSize = 14: text font size
* width = 800: figure width
* height = 600: figure height
* margin = {top: 30, bottom: 5, left: 5, right: 5, padding: 1}: margin and cell/cell padding in pixel
* legend = {top: 100, bottom: 100, left: 100, right: 100, padding: 5}: legend and cell/legend padding in pixel (if 0, the legend is not displayed)
* grid = false: if true, use gridWidth and gridHeight to set the figure size. If false, use width and height to set the figure size
* gridWidth = 0: cell width if grid is true
* gridHeight = 0: cell height if grid is true
* colorNull = '#fff': color for cell with value = 0
* color = [oranges]: palette for cell fill color
* cornerRadius = 3: round corner for each cell
