# FP Flow

FP Flow is a flow library that is very small and built on vanillajs. You can pass on a simple node of your html element and it creates the node. You can create the connections as well very easily, with simple javascript.

## Installation

1. Install the package by running `npm install`.
2. Create a container with class `fp-scroll-container` and make sure it takes the height you intend for. Apply height if necessary. Careful, it has to match the class name exactly.
3. You are ready to go.

## Usage

1. Import the class FPFlow from the package.
2. Instantiate `FPFlow`. Eg.: `const flow = new FPFlow()`
3. Import the main.css into the project that is passed with this package
4. Call the methods provided by the instantiated object created from `FPFlow` class to perform specific tasks.

## Methods

There are various methodes that can be easily viewed but the most used are descibed below.

### addNode
#### Parameter
HTMLElement of the node. If you are using React, use `createElement` method. For angular you have to use `Dynamic Component Rendering`.

#### Description
To add a node, you simply call `addNode` method on the intantiated object by passing the html element of your node that you want to create


### removeNode
#### Parameter
Id of the node that you received on calling addNode method

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


## To Do
1. Add comments
2. Remove event listeners
3. Apply requestAnmationFrame