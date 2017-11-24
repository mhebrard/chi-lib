# Bar Chart
Series of values represented as bar chart. A tooltip display bar title, size and percentage.

**sources**
* [D3.js v4.x](https://github.com/d3/d3/blob/master/API.md) (d3-axis, d3-scale, d3-scale-chromatic, d3-selection, d3-transition)
* Input data is an array of objects: {name: '...', size: #}. This array is affected to the property 'serie' of an object to fit the json format.

**actions:**
* init: create an empty chart
* update: inject the data in the chart
* setCutoff: modify the cutoff (see parameters)
* disable: click on a bar to gray it out
* enable: click on a grayout bar to enable it again

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
* legend = {inner: true, bottom: 0, left: 50, padding:5}: legend space in pixel
* color = [hex colors]: palette for bar fill color
* padding = 0.1: space between bars
* cuttoff = 3000: minimal value to display a bar.,
* sort = (a, b) => b.size - a.size: sort function.
