# Heatmap
Two dimensions table of values represented as heatmap. The value is mapped to a color range.

**sources**
* [D3.js v4.x](https://github.com/d3/d3/blob/master/API.md) (d3-array, d3-axis, d3-collection, d3-interpolate, d3-scale, d3-selection, d3-transition)
* Based on [Blefari](https://bl.ocks.org/Bl3f/cdb5ad854b376765fa99) example.
* Input data is an array of objects: {x: '...', y: '...', size: #}. With x and y the label of the column and the row respectively. This array is affected to the property 'serie' of an object to fit the json format.

**actions:**
* init: create an empty chart
* update: inject the data in the chart
* enableGroup: click on a label to disable all but this category. Shift+click or Ctrl+click on a label to switch the category between disabled and enabled stage.
* enableAll: left click to enable all the category.

**parameters**
* div = 'body': container id
* id = 'view': figure id
* data = {serie: [{x: 'col1', y: 'row1', size: 1}]}: input data
* title = 'Heatmap of ': figure title
* titleSize = 20: title font size
* fontSize = 14: text font size
* width = 800: figure width
* height = 400: figure height
* margin = {top: 30, bottom: 5, left: 5, right: 5}: margin in pixel
* legend = {top: 70, bottom: 70, left: 100, right: 100}: legend in pixel (if 0, the legend is not displayed)
* grid = true: if true, use gridWidth and gridHeight to set the figure size. If false, use width and height to set the figure size
* gridWidth = 30: cell width if grid is true
* gridHeight = 30: cell height if grid is true
* color = [oranges]: palette for cell fill color
* cornerRadius = 3: round corner for each cell
* padding = 0.1: ration of the width and height use as cell padding
