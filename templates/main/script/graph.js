let autoIncrement = 0;
let pos;

function init(){

}

//Добавление вершины на граф
function createNode(graph, pos){
    graph.add({
        group: 'nodes',
        data: { id: autoIncrement, name: "Node"+autoIncrement},
        renderedPosition: pos
    });
}

//Инициализация редактора на странице
window.onload = function() {
    let cy_container = document.getElementById("cy");
    let cy = cytoscape({
        container: cy_container,
        elements: {
            nodes: [
                { data: { id: 'j', name: 'Jerry' } },
                { data: { id: 'e', name: 'Elaine' } },
                { data: { id: 'k', name: 'Kramer' } },
                { data: { id: 'g', name: 'George' } }
            ],
            edges: []},
            style: [
						{
							selector: 'node',
							css: {
								'content': 'data(name)'
							}
						},

						{
							selector: 'edge',
							css: {
								'curve-style': 'bezier',
								'target-arrow-shape': 'triangle'
							}
						}
					],

            layout: {name: 'grid',rows: 2},
            zoom: 1,
            pan: {x:1, y:1},
            minZoom: 1e-1,
            maxZoom: 1,
            zoomingEnabled: true,
            userZoomingEnabled: true,
            panningEnabled: true,
            userPanningEnabled: true,
            boxSelectionEnabled: false,
            selectionType: 'single',
            touchTapThreshold: 8,
            desktopTapThreshold: 4,
            autolock: false,
            autoungrabify: false,
            autounselectify: false,

            // rendering options:
            headless: false,
            styleEnabled: true,
            hideEdgesOnViewport: false,
            hideLabelsOnViewport: false,
            textureOnViewport: false,
            motionBlur: false,
            motionBlurOpacity: 0.2,
            //wheelSensitivity: 1,
            pixelRatio: 'auto'
    });
    cy.on("cxttapstart", function(event){
        console.log(event.renderedPosition);
        pos = event.renderedPosition;
    });
    cy.cxtmenu({
        selector: "node",
        commands: [
            {
                content: "Add",
                select: function(ele){
                }
            },
            {
                content: "Remove",
                select: function(ele){
                }
            }
        ]
    });
    cy.cxtmenu({
        selector: "core",
        commands: [
            {
                content: "Add",
                select: function(ele){
                    ++autoIncrement;
                    createNode(cy, pos);
                }
            },
        ]
    });
};
