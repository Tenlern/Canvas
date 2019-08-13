let pos;

function init(graph){
    $.ajax({
        url: "editor/init",
        success: function(response){
            $("#log").html("Добро пожаловать");
            result = result = $.parseJSON(response);
            result.forEach(function(entry){
                console.log(entry);
                graph.add({
                    group: 'nodes',
                    data: { id: entry.id, name: entry.name},
                    position: { x: entry.x , y: entry.y }
                });
            });
        },
        error: function(response){
            $("#log").html("Ошибка");
        }
    })

}

//Добавление вершины на граф и запись в бд
function createNode(graph, pos){
    $.ajax({
        url: "editor/create/node",
        method: "GET",
        data: {
            x: pos.x,
            y: pos.y
        },
        success: function(response){
            $("#log").html("Добавлено");
            result = $.parseJSON(response);
            console.log(result);
            graph.add({
                group: 'nodes',
                data: { id: result.id, name: result.name},
                position: { x: result.x , y: result.y }
            });
        },
        error: function(response) {
            $("#log").html("Ошибка связи");
        }
    });
}

//Обновление координаты вершины в бд
function updateNode(node){
    $.ajax({
        url: "/editor/update/node",
        method: "GET",
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
    $.ajax({
        url: "editor/delete/node",
        method: "GET",
        data: { id: ele.id() },
        success: function(response){
            $("#log").html("Вершина удалена");
            graph.remove(ele);
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

            layout: {},
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
        pos = event.position;
    });

    //Сохранение координаты в конце перемещения
    cy.on("dragfree", "node", function(event){
        updateNode(event.target);
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
                    createNode(cy, pos);
                }
            },
        ],
        separatorWidth: 0
    });

    init(cy);
    $("#remove").click(function(){
        if (confirm("Удаление необратимо. Вы уверены, что хотите удалить все объекты на схеме?")){
            cy.remove("node");
        }
    });
};
