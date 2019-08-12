let autoIncrement = 0;
let pos;

function init(){

}

//Добавление вершины на граф и запись в бд
function createNode(graph, pos){
    let node = graph.add({
        group: 'nodes',
        data: { id: autoIncrement, name: "Node"+autoIncrement},
        renderedPosition: pos
    });
    $.ajax({
        url: "http://127.0.0.1:8000/editor/create/node",
        method: "GET",
        data: {
            name: node.data("name"),
            x: node.position().x,
            y: node.position().y
        },
        success: function(response){
            $("#log").html("Добавлено");
            console.log(response);
        },
        error: function(response) {
            $("#log").html("Ошибка связи");
        }
    });
}

//Обновление координаты вершины в бд
function updateNode(node){
    $.ajax({
        url: "/editor/create/node",
        method: "Post",
        data: {
            id: node.id(),
            x: node.position().x,
            y: node.position().y
        },
        success: function(response){
            $("#log").html("Координаты обновлены");
        },
        error: function(response) {
            $("#log").html("Ошибка связи");
        }

    });
}

//Удаление вершины по ключу
function deleteNode(graph, ele){
    graph.remove(ele);
    $.ajax({
        url: "/editor/create/node",
        method: "Post",
        data: { id: node.id() },
        success: function(response){
            $("#log").html("Вершина удалена");
        },
        error: function(response) {
            $("#log").html("Ошибка связи");
        }
    });
}

//Инициализация редактора на странице
window.onload = function() {
    let cy_container = document.getElementById("cy");
    let cy = cytoscape({
        container: cy_container,
        elements: {
            nodes: [],
            edges: []},
            style: [
						{
							selector: 'node',
							css: {
								'content': 'data(name)',
                                'width': '50px',
                                'height': '50px'
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

    //Позиция будующей вершины
    cy.on("cxttapstart", function(event){
        pos = event.renderedPosition;
    });

    //Сохранение координаты в конце перемещения
    cy.on("dragfree", "node", function(event){
        updateNode(target);
        console.log(event.target.position());
    });

    //Контекстное меню при нажатии на вершину
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
                    deleteNode(cy, ele);
                }
            }
        ]
    });

    //Контекстное меню при нажатии на канвас
    cy.cxtmenu({
        menuRadius: 80,
        selector: "core",
        commands: [
            {
                content: "Add",
                select: function(ele){
                    autoIncrement++;
                    createNode(cy, pos);
                }
            },
        ],
        separatorWidth: 0
    });
};
