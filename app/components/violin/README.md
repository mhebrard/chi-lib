# Violin
Series of values represented as violin plot. The corps of the violin is the distribution of values mirroring on Y axis. A box plot is added on top of the violin.

**sources**
* From a plot by [z-m-k](http://bl.ocks.org/z-m-k/5014368)
* [D3.js v4.x](https://github.com/d3/d3/blob/master/API.md) (d3-array, d3-axis, d3-scale, d3-scale-chromatic, d3-shape, d3-selection, d3-transition)
* Input data is an object with one property by serie and an array of value for each property. {serie1: [val1,val2,...], serie2: [val1,val2...]}

**parameters**
* div = 'body': container id
* id = 'view': figure id
* data = {serie: [0, 1]}: input data
* title = 'Violin plot of ': figure title
* titleSize = 18: title font size
* fontSize = 14: text font size
* height = 600: figure height
* margin = {top: 30, bottom: 30, left: 50, right: 50}: margin in pixel
* ymin = null: minimal value of Y axis
* ymax = null: maximal value of Y axis
* catWidth = 100: width of each violin
* catSpacing = 20: space between violins
* color = null: palette for violin fill color
* violinStroke = '#000': violin stroke color
* boxFill = '#fff': box fill color
* boxStroke = '#000': box stroke color
* meanColor = '#000': mean fill color
* labelColor = '#000': labels color
* resolution = 10: number of bins for the violin
* interpolation 'basis': shape of the violin (basis | linear | step)
* normalized = false: violin X scale is shared (false) or specific (true);
