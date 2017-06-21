# Heatmap
Two dimensions table of values represented as heatmap. The value is mapped to a color range.

**sources**
* [D3.js v4.x](https://github.com/d3/d3/blob/master/API.md) (d3-scale, d3-scale-chromatic, d3-shape, d3-selection, d3-transition)
* [d3 arcs / pie shape](https://github.com/d3/d3-shape/blob/master/README.md#arcs)
* Input data is an array of objects: {name: '...', size: #}. This array is affected to the property 'serie' of an object to fit the json format.

**parameters**
* div = 'body': container id
* id = 'view': figure id
* data = {serie: [{name: 'root', size: 1}]}: input data
* title = 'Pie chart of ': figure title
* titleSize = 20: title font size
* fontSize = 14: text font size
* width = 800: figure width
* height = 600: figure height
* margin = {top: 30, bottom: 0, left: 0, right: 0}: margin in pixel
* color = null: palette for violin fill color
* inner = 70: radius of central (empty) circle in pixel
* cornerRadius = 3: round corner for each slice
* padAngle = 0.01: space between slices
* aMin = 0.1: minimal angle to display label in slice
