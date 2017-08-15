# Mutation By Position
Histogram of mutation count along a reference sequence. At each position the mutated nucleotide (a, t, g, c) is count and displayed in a specific color (see legend). User can define some regions to be highlighted (CDR1, CRD2) or to be masked (primer).

**sources**
* [D3.js v4.x](https://github.com/d3/d3/blob/master/API.md) (d3-axis, d3-scale, d3-shape, d3-selection, d3-transition)
* [d3 stack](https://github.com/d3/d3-shape/blob/master/README.md#stacks)
* Input data is an object with one property by position, and for each position an object that list the count of mutations for each nucleotide. {5: {a: 1, t: 1, g: 1, c: 1}, ...};

**parameters**
* div = 'body': container id
* id = 'view': figure id
* data = {5: {a: 1, t: 1, g: 1, c: 1}, 10: {a: 2, t: 2, g: 2, c: 2}}: input data
* title = 'Mutation by position of ': figure title
* titleSize = 20: title font size
* fontSize = 14: text font size
* width = 800: figure width
* height = 400: figure height
* margin = {top: 50, bottom: 40, left: 40, right: 20}: margin in pixel
* xRange = [0, 15]: min and max for x axis;
* yRange = [0, null]; min and max for y axis, if 'null': self adapt to data;
* frames = [{label: 'FRAME1', x1: 5, x2: 10, fill: '#eee'}]: array of labeled regions.
* masks = [{label: 'mask1', x1: 1, x2: 5, fill: '#808'}]: array of region where the mutation are not shown.
