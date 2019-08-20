// assets/js/app.js

require('../css/app.css');
import $ from "jquery";
import cytoscape from 'cytoscape';
import cxtmenu from 'cytoscape-cxtmenu';
import edgehandles from 'cytoscape-edgehandles';

cytoscape.use( cxtmenu );
cytoscape.use( edgehandles );

let pos;
//Настройки отображения элементов редактора
let style = [
    {
        //Настройки отображения вершин
        selector: 'node',
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
            'curve-style': 'bezier',
            'target-arrow-shape': 'triangle'
        }
    }
];

//Функция, возвращающая блок alert Bootstrap4
function printMessage(message) {
    return '<div class="alert alert-warning alert-dismissible fade show fixed-bottom mb-0" role="alert">'+message+'<button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button></div>';
}


window.onload = function() {
    console.log('Init cytoscape');
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

    //Загрузка сохраненных вершин и локаций из бд на момент прорисовки поля
    cy.one("render", function(event){
        $.ajax({
            url: "editor/init",
            dataType: "json",
            success: function(response){
                cy.json({elements: response});
            },
            error: function(response){
                $("footer").append(printMessage("Нет подключения к базе данных"));
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
                $("#log").html("Координаты обновлены");
            },
            error: function(response) {
                //Возвращенение элемента к исходной позиции
                event.target.position(event.position);
                //Запрет на перемещение элементов
                cy.nodes().ungrabify();
                $("footer").append(printMessage("Нет подключения к базе данных"));
            }

        });
        console.log(event.target.position());
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
                        url: "editor/delete/node",
                        method: "GET",
                        data: { id: ele.id() },
                        success: function(response) {
                            $("footer").append(printMessage("Вершина успешно удалена"));
                            cy.remove(ele);
                        },
                        error: function(response) {
                            cy.nodes().ungrabify();
                            $("footer").append(printMessage("Нет подключения к базе данных"));
                        }
                    });
                }
            }
        ]
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
                        data: {
                            x: pos.x,
                            y: pos.y
                        },
                        success: function(response){
                            graph.add(response);
                        },
                        error: function(response) {
                            $("footer").append(printMessage("Нет подключения к базе данных"));
                        }
                    });
                    //createNode(cy, pos);
                }
            },
        ],
        activePadding: 10,
        indicatorSize: 12,
        separatorWidth: 0
    });
    cy.edgehandles({});
    console.log(cy.json());
}
