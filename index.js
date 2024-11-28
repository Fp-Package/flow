// ts/icons.ts
var getIcon = (iconSvgHtmlString) => {
  const span = document.createElement("span");
  span.classList.add("fp-flowjs-controller-icon");
  span.innerHTML = iconSvgHtmlString;
  return span;
};
var defaultIconParams = {
  width: 16,
  height: 16,
  fill: "currentColor"
};
var DeleteIcon = (iconParams = defaultIconParams) => {
  const icon = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${iconParams.width}" height="${iconParams.height}" fill="${iconParams.fill}" viewBox="0 0 24 24">
        <path d="M3 6h18v2H3V6zm3 4v10c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V10H6zm2 2h2v8H8v-8zm4 0h2v8h-2v-8zm4 0h2v8h-2v-8zM15.5 4l1-1h-7l1 1H5v2h14V4z"/>
    </svg>
    `;
  return getIcon(icon);
};
var EditIcon = (iconParams = defaultIconParams) => {
  const icon = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${iconParams.width}" height="${iconParams.height}" fill="${iconParams.fill}" viewBox="0 0 24 24">
        <path d="M3 17.25V21h3.75l11-11-3.75-3.75-11 11z" />
        <path d="M20.71 7.04a1 1 0 000-1.41l-2.34-2.34a1 1 0 00-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
    </svg>

    `;
  return getIcon(icon);
};
var ConnectionIcon = (iconParams = defaultIconParams) => {
  const icon = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${iconParams.width}" height="${iconParams.height}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
        <polyline points="2,20 8,12 4,8 12,4 16,8 20,2" />
        <polyline points="18,3 20,2 19,4" />
    </svg>
    `;
  return getIcon(icon);
};

// ts/node.ts
var FlowNode = class {
  constructor(id, el, name) {
    this.id = id;
    this.el = el;
    this.name = name;
    this.nodeId = 0;
    this.connections = [];
    this.nodeId = id;
    this.nodeName = name || "Node " + this.nodeId;
    this.createNode(this.el, name);
  }
  createNode(el, name) {
    const node = document.createElement("div");
    node.classList.add("fp-flowjs-node", "fp-flowjs-node-" + this.nodeId);
    const title = document.createElement("div");
    title.classList.add("fp-flowjs-node-title");
    title.innerText = this.nodeName;
    const controllers = document.createElement("div");
    controllers.classList.add("fp-flowjs-node-controllers");
    const deleteIcon = DeleteIcon();
    const editIcon = EditIcon();
    const connectionIcon = ConnectionIcon();
    controllers.appendChild(editIcon);
    controllers.appendChild(connectionIcon);
    controllers.appendChild(deleteIcon);
    connectionIcon.addEventListener("click", () => {
      this.onConnection(this);
    });
    deleteIcon.addEventListener("click", () => {
      this.onRemove(this.nodeId);
    });
    const header = document.createElement("div");
    header.classList.add("fp-flowjs-node-header");
    header.appendChild(title);
    header.appendChild(controllers);
    node.appendChild(header);
    const body = document.createElement("div");
    body.classList.add("fp-flowjs-node-body");
    if (el) {
      body.appendChild(el);
    }
    node.appendChild(body);
    this.nodeElement = node;
    this.watchMove();
  }
  watchMove() {
    let isDragging = false;
    let offsetX = 0;
    let offsetY = 0;
    this.nodeElement.addEventListener("mousedown", (e) => {
      e.stopPropagation();
      this.onNodeMove(true);
      isDragging = true;
      offsetX = e.offsetX * this.zoomPosition();
      offsetY = e.offsetY * this.zoomPosition();
    });
    window.addEventListener("mousemove", (e) => {
      if (isDragging) {
        const { x, y } = this.parentScrollPosition();
        this.nodeElement.style.left = (x + e.clientX - offsetX) * this.zoomPosition() + "px";
        this.nodeElement.style.top = (y + e.clientY - offsetY) * this.zoomPosition() + "px";
        this.drawConnections();
      }
    });
    window.addEventListener("mouseup", (e) => {
      isDragging = false;
      this.onNodeMove(false);
    });
  }
  get centerX() {
    return this.nodeElement.offsetLeft + this.nodeElement.offsetWidth / 2;
  }
  get centerY() {
    return this.nodeElement.offsetTop + this.nodeElement.offsetHeight / 2;
  }
};

// ts/index.ts
var FlowJS = class {
  constructor(el) {
    this.el = el;
    this.nodeId = 0;
    this.nodes = [];
    this.currentZoom = 1;
    this.elementScale = 15;
    this.transformLevel = 15e-4;
    this.isOneNodeMoving = false;
    this.lineWidth = 1.5;
    this.MOUSE_MOVE_DELAY = 3e3;
    this.SCROLLBAR_WIDTH = 6;
    /**
     * Add a node to the flow
     * @param el HTMLElement to show inside the node
     * @param name Name of the node
     */
    this.addNode = (el, name) => {
      console.log("addNode");
      const node = new FlowNode(this.nodeId, el, name);
      this.nodes.push(node);
      this.nodeId++;
      this.containerElement.appendChild(node.nodeElement);
      node.onRemove = this.removeNode;
      node.onConnection = this.connectNodes;
      node.drawConnections = this.drawConnections;
      const boundingClientRect = this.containerElement.getBoundingClientRect();
      const { left, top } = boundingClientRect;
      node.nodeElement.style.left = left * -1 / this.currentZoom + "px";
      node.nodeElement.style.top = top * -1 / this.currentZoom + "px";
      node.parentScrollPosition = () => {
        return { x: this.parentElement.scrollLeft, y: this.parentElement.scrollTop };
      };
      node.zoomPosition = () => {
        return this.currentZoom;
      };
      node.onNodeMove = (bool) => {
        this.isOneNodeMoving = bool;
      };
    };
    /**
     * Remove a node from the flow
     * @param nodeId The id of the node to remove
     */
    this.removeNode = (nodeId) => {
      console.log("removeNode");
      const node = this.containerElement.querySelector(`.fp-flowjs-node-${nodeId}`);
      if (node) {
        this.containerElement.removeChild(node);
        this.nodes[nodeId] = null;
        this.drawConnections();
      }
    };
    /**
     * Connect two nodes
     * @param fromNode The id of the node to connect from
     */
    this.connectNodes = (fromNode) => {
      console.log("connectNodes");
      const el = document.createElement("div");
      el.classList.add("fp-flowjs-connections", "fpf-overflow-scroll");
      const title = document.createElement("div");
      title.style.fontWeight = "bold";
      title.style.marginBottom = "10px";
      title.innerText = "Connect to";
      el.appendChild(title);
      const fromNodeId = fromNode.nodeId;
      this.nodes.forEach((node) => {
        if (node && node.nodeId !== fromNodeId) {
          const nodeItem = document.createElement("div");
          nodeItem.classList.add("fp-flowjs-connection-item");
          nodeItem.innerText = node.nodeName;
          el.appendChild(nodeItem);
          nodeItem.addEventListener("click", () => {
            this.drawConnection(fromNode, node);
            this.modalElement.classList.remove("show");
            this.modalElement.querySelector(".flow-modal").innerHTML = "";
          });
        }
      });
      this.modalElement.querySelector(".flow-modal").appendChild(el);
      this.modalElement.classList.add("show");
    };
    this.drawConnections = () => {
      this.ctx.clearRect(0, 0, this.canvasElement.width, this.canvasElement.height);
      this.nodes.forEach((node) => {
        if (node) {
          node.connections.forEach((connection) => {
            if (connection.type === "out") {
              const toNode = this.nodes.find((n) => n && n.nodeId === connection.nodeId);
              if (toNode) {
                this.drawLine(node, toNode);
              }
            }
          });
        }
      });
    };
    console.log("flow", this);
    window["flow"] = this;
    if (!this.el) {
      throw new Error("Container element is required to be initiated with FlowJS class.");
    }
    ;
    this.parentElement = this.el;
    this.applyParentStyles();
    this.createContainer(this.el);
    this.setScrollPosition();
    this.createCanvasElement();
    this.handleZoom();
    this.handleScroll();
    this.createModal();
  }
  createContainer(el) {
    this.containerElement = document.createElement("div");
    el.appendChild(this.containerElement);
    this.containerElement.classList.add("fp-flowjs-container");
    this.initialWidth = this.parentElement.offsetWidth * this.elementScale;
    this.initialHeight = this.parentElement.offsetHeight * this.elementScale;
    this.containerElement.style.width = this.initialWidth + "px";
    this.containerElement.style.height = this.initialHeight + "px";
  }
  createCanvasElement() {
    this.canvasElement = document.createElement("canvas");
    this.canvasElement.classList.add("fp-flowjs-canvas");
    this.containerElement.appendChild(this.canvasElement);
    this.canvasElement.width = this.containerElement.offsetWidth;
    this.canvasElement.height = this.containerElement.offsetHeight;
  }
  applyParentStyles() {
    this.parentElement.classList.add("fp-flow-container");
    if (!this.parentElement.offsetHeight) {
      this.parentElement.style.height = "100%";
    }
    this.parentElement.style.overflow = "auto";
  }
  handleScroll() {
    let isDragging = false;
    let startClientX = 0;
    let startClientY = 0;
    let scrollLeft;
    let scrollTop;
    this.containerElement.addEventListener("mousedown", (e) => {
      this.containerElement.style.cursor = "grabbing";
      scrollLeft = this.parentElement.scrollLeft / this.currentZoom;
      scrollTop = this.parentElement.scrollTop / this.currentZoom;
      isDragging = true;
      startClientX = e.clientX;
      startClientY = e.clientY;
    });
    this.containerElement.addEventListener("mousemove", (e) => {
      this.parentElement.classList.add("add-scrolls");
      clearTimeout(this.mouseMoveTimer);
      this.mouseMoveTimer = setTimeout(() => {
        this.parentElement.classList.remove("add-scrolls");
      }, this.MOUSE_MOVE_DELAY);
      if (isDragging && !this.isOneNodeMoving) {
        const newScrollLeft = (scrollLeft + startClientX - e.clientX) * this.currentZoom;
        const newScrollTop = (scrollTop + startClientY - e.clientY) * this.currentZoom;
        this.parentElement.scrollLeft = newScrollLeft;
        this.parentElement.scrollTop = newScrollTop;
      }
    });
    this.containerElement.addEventListener("mouseup", () => {
      if (this.isOneNodeMoving) {
        return;
      }
      isDragging = false;
      this.containerElement.style.cursor = "initial";
    });
    this.parentElement.addEventListener("scroll", () => {
      this.parentElement.classList.add("add-scrolls");
      clearTimeout(this.mouseMoveTimer);
      this.mouseMoveTimer = setTimeout(() => {
        this.parentElement.classList.remove("add-scrolls");
      }, this.MOUSE_MOVE_DELAY);
      this.watchMinMaxScroll();
    });
  }
  setScrollPosition() {
    setTimeout(() => {
      this.parentElement.scrollTo({
        top: this.parentElement.scrollHeight / 2 - this.parentElement.offsetHeight / 2,
        left: this.parentElement.scrollWidth / 2 - this.parentElement.offsetWidth / 2
      });
    });
  }
  createModal() {
    const modal = document.createElement("div");
    modal.classList.add("flow-modal-backdrop");
    const modalContent = document.createElement("div");
    modalContent.classList.add("flow-modal");
    modal.appendChild(modalContent);
    this.containerElement.appendChild(modal);
    this.modalElement = modal;
    modal.addEventListener("click", (e) => {
      modal.classList.remove("show");
      modalContent.innerHTML = "";
    });
    modalContent.addEventListener("click", (e) => e.stopPropagation());
  }
  drawConnection(fromNode, toNode) {
    const existingConnection = fromNode.connections.find((c) => c.nodeId === toNode.nodeId && c.type === "out");
    if (existingConnection) {
      return;
    }
    this.drawLine(fromNode, toNode);
    fromNode.connections.push({ nodeId: toNode.nodeId, type: "out" });
    toNode.connections.push({ nodeId: fromNode.nodeId, type: "in" });
  }
  drawLine(fromNode, toNode) {
    this.ctx.beginPath();
    this.ctx.moveTo(fromNode.centerX, fromNode.centerY);
    this.ctx.lineTo(toNode.centerX, toNode.centerY);
    this.ctx.strokeStyle = "#eeeeee";
    this.ctx.lineWidth = this.lineWidth / this.currentZoom;
    this.ctx.stroke();
  }
  get ctx() {
    return this.canvasElement.getContext("2d");
  }
  handleZoom() {
    this.parentElement.addEventListener("wheel", (e) => {
      if (!e.ctrlKey) {
        return;
      }
      e.preventDefault();
      const deltaY = e.deltaY;
      if (deltaY > 0) {
        this.currentZoom -= this.transformLevel;
      } else {
        this.currentZoom += this.transformLevel;
      }
      if (this.currentZoom < this.minZoom) {
        this.currentZoom = this.minZoom;
      }
      const translateX = this.initialWidth * (1 - this.currentZoom) / 2;
      const translateY = this.initialHeight * (1 - this.currentZoom) / 2;
      this.containerElement.style.transform = `scale(${this.currentZoom}) translate(${translateX}px, ${translateY}px)`;
      this.watchMinMaxScroll();
    });
  }
  get minZoom() {
    return Math.max(
      this.parentElement.clientWidth / this.initialWidth,
      this.parentElement.clientHeight / this.initialHeight
    );
  }
  watchMinMaxScroll() {
    if (this.currentZoom < 1) {
      const zoomDiff = 1 - this.currentZoom;
      const minScrollWidth = this.containerElement.offsetWidth * zoomDiff;
      const minScrollHeight = this.containerElement.offsetHeight * zoomDiff;
      const minScrollLeftAllowed = Math.ceil(minScrollWidth);
      const minScrollTopAllowed = Math.ceil(minScrollHeight);
      const maxScrollLeftAllowed = (this.parentElement.scrollWidth - this.parentElement.offsetWidth) * this.currentZoom;
      const maxScrollTopAllowed = (this.parentElement.scrollHeight - this.parentElement.offsetHeight) * this.currentZoom;
      if (this.parentElement.scrollLeft < minScrollLeftAllowed) {
        this.parentElement.scrollLeft = minScrollLeftAllowed;
      }
      if (this.parentElement.scrollLeft > maxScrollLeftAllowed) {
        this.parentElement.scrollLeft = maxScrollLeftAllowed;
      }
      if (this.parentElement.scrollTop < minScrollTopAllowed) {
        this.parentElement.scrollTop = minScrollTopAllowed;
      }
      if (this.parentElement.scrollTop > maxScrollTopAllowed) {
        this.parentElement.scrollTop = maxScrollTopAllowed;
      }
    }
  }
};
window["FlowJS"] = FlowJS;
export {
  FlowJS as default
};
