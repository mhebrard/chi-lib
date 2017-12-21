# Pie Chart
Series of values represented as pie chart. The sum of values is displayed at the center. When the slice is too small, the label is hidden. A tooltip display slice title, size and percentage.

**sources**
* [D3.js v4.x](https://github.com/d3/d3/blob/master/API.md) (d3-scale, d3-scale-chromatic, d3-shape, d3-selection, d3-transition)
* [d3 arcs / pie shape](https://github.com/d3/d3-shape/blob/master/README.md#arcs)
* Input data is an array of objects: {name: '...', size: #}. This array is affected to the property 'serie' of an object to fit the json format.

**actions:**
* init: create an empty chart
* update: inject the data in the chart
* setCutoff: modify the cutoff (see parameters)
* enableSingle: click on a slice to disable all but this one.
* enableSwitch: Shift+click or Ctrl+clik to switch a slice between disabled and enabled stage.
* enableAll: left click to enable all slices.

**parameters**
* div = 'body': container id
* id = 'view': figure id
* data = {serie: [{name: 'root', size: 1}]}: input data
* title = 'Pie chart of ': figure title
* titleSize = 20: title font size
* fontSize = 14: text font size
* width = 800: figure width
* height = 600: figure height
* margin = {top: 30, bottom: 5, left: 5, right: 5}: margin in pixel
* color = [hex colors]: palette for arc fill color
* inner = 70: radius of central (empty) circle in pixel
* cornerRadius = 3: round corner for each slice
* padAngle = 0.01: space between slices
* aMin = 0.1: minimal angle to display label in slice
* cutoff = 3000: minimal value to display a slice.
