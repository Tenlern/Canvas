// assets/js/app.js
import 'bootstrap/dist/css/bootstrap.min.css';

import 'bootstrap';
import $ from "jquery";
import cytoscape from 'cytoscape';
import cxtmenu from 'cytoscape-cxtmenu';
import edgehandles from 'cytoscape-edgehandles';

cytoscape.use( cxtmenu );
cytoscape.use( edgehandles );

//Позиция создания вершины через контекстное меню
let pos = {x: 0, y: 0};
//Настройки отображения элементов редактора
let style = [
    {
        //Настройки отображения вершин
        selector: 'node[name]',
        css: {
            'content': 'data(name)',
            'width': '50px',
            'height': '50px'
        }
    },
    {
        //Настройки отображения локаций
        selector: 'edge',
        css: {
            'curve-style': 'straight',
            'target-arrow-shape': 'triangle'
        }
    },
    {
        //Настройки отображения
        selector: '.eh-handle',
        style: {
            'background-color': '#1477EC',
            'width': 12,
            'height': 12,
            'shape': 'ellipse',
            'overlay-opacity': 0,
            'border-width': 12,
            'border-opacity': 0
        }
    },
    {
        selector: '.eh-preview, .eh-ghost-edge',
        style: {
            'opacity': 0.8,
            'line-color': '#1477EC',
            'target-arrow-color': '#1477EC',
            'source-arrow-color': '#1477EC'
        }
    }
];

//Функция, возвращающая блок alert Bootstrap4
function printMessage(message) {
    $("footer").append('<div class="alert alert-info alert-dismissible fade show" role="alert">'+message+'</div>');
    $(".alert").append('<button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>');
}

window.onload = function() {
    let cy = cytoscape({
        container: $("#cy"),
        style: style,
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

        headless: false,
        styleEnabled: true,
        hideEdgesOnViewport: false,
        hideLabelsOnViewport: false,
        textureOnViewport: false,
        motionBlur: false,
        motionBlurOpacity: 0.2,
        pixelRatio: 'auto'
    });

    //Вспомогательное событие, отслеживающие позицию правого клика
    cy.on("cxttapstart", function(event){
        pos = event.position;
    });

    //Загрузка сохраненных вершин и локаций из бд на момент прорисовки поля
    cy.one("render", function(event){
        $.ajax({
            url: "editor/init",
            dataType: "json",
            success: function(response){
                cy.json({elements: response});
            },
            error: function(response){
                printMessage("Нет подключения к базе данных");
            }
        });
    });

    //Сохранение координаты в конце перемещения
    cy.on("dragfree", "node", function(event){
        $.ajax({
            url: "/editor/update/node",
            method: "GET",
            data: {
                id: event.target.id(),
                x: event.target.position().x,
                y: event.target.position().y
            },
            dataType: "json",
            success: function(response){
            },
            error: function(response) {
                //Возвращенение элемента к исходной позиции
                event.target.position(event.position);
                //Запрет на перемещение элементов
                cy.nodes().ungrabify();
                printMessage("Нет подключения к базе данных");
            }

        });
    });

    //Контекстное меню вершины
    cy.cxtmenu({
        menuRadius: 85,
        selector: "node",
        commands: [
            {
                content: "Удалить",
                select: function(ele) {
                    $.ajax({
                        url: "editor/delete",
                        method: "GET",
                        data: { id: ele.id(), group: "nodes" },
                        success: function(response) {
                            printMessage("Вершина успешно удалена");
                            cy.remove(ele);
                        },
                        error: function(response) {
                            cy.nodes().ungrabify();
                            printMessage("Нет подключения к базе данных");
                        }
                    });
                }
            }
        ],
        activePadding: 10,
        indicatorSize: 12,
        separatorWidth: 0,
        openMenuEvents: 'cxttapstart',
    });

    //Контекстное меню локации
    cy.cxtmenu({
        menuRadius: 85,
        selector: "edge",
        commands: [
            {
                content: "Удалить",
                select: function(ele) {
                    $.ajax({
                        url: "editor/delete",
                        method: "GET",
                        data: { id: ele.id().substr(1), group: "edges" },
                        dataType: "json",
                        success: function(response) {
                            printMessage("Путь успешно удален");
                            cy.remove(ele);
                        },
                        error: function(response) {
                            cy.nodes().ungrabify();
                            $("footer").append(printMessage("Нет подключения к базе данных"));
                        }
                    });
                }
            }
        ],
        activePadding: 10,
        indicatorSize: 12,
        separatorWidth: 0,
        openMenuEvents: 'cxttapstart',
    });

    //Контекстное меню канваса
    cy.cxtmenu({
        menuRadius: 85,
        selector: "core",
        commands: [
            {
                content: "Новая",
                enabled: false

            },
            {
                content: "Вершина",
                select: function(ele){
                    $.ajax({
                        url: "editor/create/node",
                        method: "GET",
                        dataType: "json",
                        data: {
                            x: pos.x,
                            y: pos.y
                        },
                        success: function(response){
                            cy.add(response);
                        },
                        error: function(response) {
                            printMessage("Нет подключения к базе данных");
                        }
                    });
                    //createNode(cy, pos);
                }
            },
        ],
        activePadding: 10,
        indicatorSize: 12,
        separatorWidth: 0,
        openMenuEvents: 'cxttapstart',
    });

    //Настройки модуля отрисовки локаций
    cy.edgehandles({
        preview: true,
        handleNodes: 'node',
        noEdgeEventsInDraw: false,
        //Обработчик события добавления новой локации
        complete: function( sourceNode, targetNode, addedEles ) {
            $.ajax({
                url: "editor/create/location",
                method: "GET",
                dataType: "json",
                data: {
                    source: sourceNode.id(),
                    target: targetNode.id(),
                },
                success: function(response){
                    //Созданный макет уничтожается
                    addedEles.remove();
                    //Создается новая локация на основе данных ответа
                    cy.add(response);
                    printMessage("Создан новый путь из " + sourceNode.data("name") + " в " + targetNode.data("name"));
                },
                error: function(response) {
                    cy.remove(addedEles)
                    printMessage("Нет подключения к базе данных");
                }
            });
        },
    });

    //Обработчик клика на кнопку "Добавить"
    $('#add').click(function(){
        //Создается якроь, чтобы вычислить position центра
        let anchor = cy.add({
            group: "nodes",
            renderedPosition: {x: cy.width()/2, y: cy.height()/2}
        });
        $.ajax({
            url: "editor/create/node",
            method: "GET",
            dataType: "json",
            data: {
                x: anchor.position().x,
                y: anchor.position().y
            },
            success: function(response){
                //Создается новая веришна из ответа сервера
                cy.add(response);
                //Якорь удаляется
                cy.remove(anchor);
            },
            error: function(response) {
                //Отмена операции
                cy.remove(anchor);
                $("footer").append(printMessage("Нет подключения к базе данных"));
            },
        });
    });
}
