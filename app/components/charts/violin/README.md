# Violin Plot
Series of values represented as violin plot. The corps of the violin is the distribution of values mirroring on Y axis. A box plot is added on top of the violin. In addition of the "curved body", data can be displayed as "bar chart" or "beeswarm" (see layouts)

**sources**
* From a plot by [z-m-k](http://bl.ocks.org/z-m-k/5014368)
* [D3.js v4.x](https://github.com/d3/d3/blob/master/API.md) (d3-array, d3-axis, d3-scale, d3-shape, d3-selection, d3-transition)
* Input data is an object with one property by serie and an array of value for each property. {serie1: [val1,val2,...], serie2: [val1,val2...]}

**actions**
* {type: 'init'} initialize the chart
* {type: 'update', data: {}} inject the data in the chart
* {type: 'setLayouts', payload: {}} set the different violin "body shape"

**parameters**
* div = 'body': container id
* id = 'view': figure id
* options = null: options menu id
* data = {serie: [0, 1]}: input data
* title = 'Violin plot of ': figure title
* titleSize = 20: title font size
* fontSize = 14: text font size
* height = 600: figure height
* margin = {top: 30, bottom: 30, left: 50, right: 50}: margin in pixel
* layouts = {violin: true, box: true, bar: false, beeswarm: false}: display/hide the different violin "body shape"
* ymin = null: minimal value of Y axis
* ymax = null: maximal value of Y axis
* catWidth = 100: width of each violin
* catSpacing = 20: space between violins
* strokeWidth = 3: width of boxplot stroke
* resolution = 10: number of bins for the violin
* interpolation 'basis': shape of the violin (basis | linear | step)
* xScale = 'common': violin X scale is shared (common) or specific to each serie (each);
* p.bg = ['#F88', '#A8F'...]: list of colors for the series
* p.fg = ['#900', '#609'...]: list of colors for the boxplot
