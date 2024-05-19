# FP Flow

FP Flow is a flow library that is very small and built on vanillajs. You can pass on a simple node of your html element and it creates the node. You can create the connections as well very easily, with simple javascript.

## Installation

1. Install the package by running `npm install`.
2. Import the `main.css` that is passed with this package, into your project.
3. Create a container with class `fp-scroll-container` and make sure it takes the height you intend for. Apply height if necessary. Careful, it has to match the class name exactly.
4. You are ready to go.

## Usage

1. Import the class `Flow` from the package.
2. Instantiate `Flow`. Eg.: `const flow = new Flow()`.
3. Call the methods provided by the instantiated object created from `Flow` class to perform specific tasks.

## Methods

There are various methods that can be easily viewed but the most used are descibed below.

### addNode
#### Parameter
HTMLElement of the node. If you are using React, use `createElement` method. For angular you have to use `Dynamic Component Rendering`.

#### Description
To add a node, simply call `addNode` method on the intantiated object by passing the html element of your node that you want to create.


### removeNode
#### Parameter
Id of the node that you received on calling addNode method.

#### Description
To remove a node, you simply call `removeNode` method on the intantiated object by passing the `id` of your node that you got by doing `addNode`.


### addConnection
#### Parameter
Node1Id, Node2Id. The `id`s of the nodes you want to connect.

#### Description
To add a connection, simply call `addConnection` method on the intantiated object by passing the `id`s of the nodes that you want to connect.


### removeConnection
#### Parameter
Node1Id, Node2Id. The `id`s of the nodes you want to remove the connection of.

#### Description
To remove a connection between two nodes, simply call `removeConnection` method on the intantiated object by passing the `id`s of the nodes that you want to connect.

### getRenditionInfo

#### Description
If you want to save the flow for reuse, which you would be doing in most cases, call `getRenditionInfo` to get the data that you can pass to your backend. This is the minimum data required by this flow library to be rendered. In the each node object inside `flow.nodes` array. the `data` property can also be used to set extra information about the element or its state.

### renderSavedFlow

#### Parameter
Saved flow object

#### Description
Once you saved your rendition data, call `renderSavedFlow` method to render the the flow next time after you brought the data from API. Remember to create the nodes with elements by calling `node.element = <html element>` and their state, that you saved to `node.data` property. <strong>Don't call the `addNode` or `addConnection` or any other method before calling `renderSavedFlow` when you have the pre-saved flow data and you want to render that flow.</strong>


## Properties
There are mainly two types of properties. One is for the flow object we created from the Flow class, another is the node object we got from calling addNode.

### flow
The flow object can be gotten by calling `new Flow()`. Following are its properties.

#### nodes
This returns all the array of nodes you created

#### element
This gives the container element

#### canvas
This gives the canvas on which we are drawing the blocks. It's an html div element. You can easily set style or background color.

#### strokeWidth
Width of the connection strokes. It has the same unit as canvas context line width. It's changable directly.

#### strokeColor
It gives you the color of the strokkeline. It's also directly changeable.


### node
You can get the node object on calling the `addNode` method. Following are its main properties.

#### element
This returns the node element you passed.

#### data
This is the property you would like to put most focus on as you can store your data here. You can modify, reasign and delete as you do with js objects. Be careful not to save the whole node object in backend as it holds unnecessary information.

## Rendering a saved flow
Look at `renderSavedFlow` method.

## To Do
1. Add comments
2. Remove event listeners
3. Apply requestAnmationFrame