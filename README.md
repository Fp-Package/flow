# Flow JS
It's a package built with vanilla js to go with any framework whatsover for creating flows. You can pass your own element inside the node, save the flows, re-render in different devices and do whatever you want. We give you the connections and arrow and building blocks.

## Save flow
Just call `flowInfo` and you'll get the flow info to save. Remember to save node related data in `node.metaData`, that will help you gain back the state when you re-render a saved flow.

## Render a saved flow
Pass a secondary parameter which is the flow info you saved into flow constructor like `new FlowJS(el, data)`.