# Bar Chart
Series of values represented as bar chart. A tooltip display bar title, size and percentage.

**sources**
* [D3.js v4.x](https://github.com/d3/d3/blob/master/API.md) (d3-axis, d3-scale, d3-scale-chromatic, d3-selection, d3-transition)
* Input data is an array of objects: {name: '...', size: #}. This array is affected to the property 'serie' of an object to fit the json format.

**actions:**
* init: create an empty chart
* update: inject the data in the chart
* setCutoff: modify the cutoff (see parameters)
* enableSingle: click on a bar to disable all but this one.
* enableSwitch: Shift+click or Ctrl+clik to switch a bar between disabled and enabled stage.
* enableAll: left click to enable all bars.

**parameters**
* div = 'body': container id
* id = 'view': figure id
* data = {serie: [{name: 'root', size: 1}]}: input data
* title = 'Bar chart of ': figure title
* titleSize = 20: title font size
* fontSize = 14: text font size
* width = 800: figure width
* height = 600: figure height
* margin = {top: 30, bottom: 5, left: 5, right: 0}: margin in pixel
* legend = {inner: true, padding: 5, bottom: 100, left: 50}: legend space in pixel
* color = [hex colors]: palette for bar fill color
* barWidth = 0; if positive, use barWidth to set the figure size. Else, use width to set the figure size
* barPadding = 0.1: ration of the width used as bar padding
* minWidth = 100: minimal width of the chart (overwrite width parameter);
* cuttoff = 3000: minimal value to display a bar.,
* sort = (a, b) => b.size - a.size: sort function.
