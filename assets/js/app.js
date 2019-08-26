// assets/js/app.js
import 'bootstrap/dist/css/bootstrap.min.css';

import 'bootstrap';
import $ from "jquery";
import cytoscape from 'cytoscape';
import cxtmenu from 'cytoscape-cxtmenu';
import edgehandles from 'cytoscape-edgehandles';

cytoscape.use( cxtmenu );
cytoscape.use( edgehandles );

/*
 * Позиция курсора на момент вызова контекстного меню
 */
let cxtPosition = {x: 0, y: 0};
/*
 * Настройки отображения элементов редактора
 * selector - класс объекта
 * css - стили
 * node - узел, edge - локация
 * .eh-handle - маркер компонента рисования локаций
 * .eh-preview, .eh-ghost-edge - элементы доступные во время рисования
 */
let style = [
    {
        selector: 'node[name]',
        css: {
            'content': 'data(name)',
            'width': '50px',
            'height': '50px'
        }
    },
    {
        selector: 'edge',
        css: {
            'curve-style': 'straight',
            'target-arrow-shape': 'triangle'
        }
    },
    {
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

/*
 * Функция, добавляющая блок alert Bootstrap4 и кнопку для его удаления
 * @param message {string} - сообщение, которое нужно указать
 */
function printMessage(message) {
    $("footer").append('<div class="alert alert-info alert-dismissible fade show" role="alert">'+message+'</div>');
    $(".alert").append('<button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>');
}

window.onload = function() {
    /*
     * Создание экземляра cytoscape - ядра редактора
     * @param container - элемент html, куда будет интегрирован редактор
     * @param style - стили элементов
     * @param zoom {number} - начальный зум
     * @param pan {x {number}, y {number}} - позиция верхнего левого угла
     * @param minZoom, maxZoom - минимальное, максимальное увелечиние полотна
     * @param zoomingEnabled {bool} - возможность изменения зума
     * userZoomingEnabled {bool} - возможность изменения зума пользователем
     */
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

    /*
     * Вспомогательное событие, отслеживающие позицию правого клика
     * @param "cxttapstart" - название нажатия на правую кнопку мыши
     * @param event.position - позиция события на полотне
     */
    cy.on("cxttapstart", function(event){
        cxtPosition = event.position;
    });

    /*
     * Загрузка сохраненных вершин и локаций из бд на момент прорисовки поля
     * Отправляется ajax запрос на сервер, который должен вернуть JSON с данными
     * элементов, записанных в базу данных. В случае успеха передает ответ полю elements
     * объекта cytoscape. Иначе - сообщение об ошибке
     * @param "render" - момент подготовки редактора к работе
     * @param response {JSON} - ответ сервера в формате JSON
     */
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

    /*
     * Сохранение координаты узла в конце перемещения
     * Отправляется ajax-запрос на сервер. В случае ошибки запроса, выдает ошибку,
     * возвращает узел на начальное положение и блокирует возможность внести изменения
     * @param "dragfree" - момент прекращения перетаскивания узла
     * @param response {JSON} - ответ сервера в формате JSON
     * @param event.tagret - элемент, над которым совершено действие (узел)
     */
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
                event.target.position(event.position);
                cy.nodes().ungrabify();
                printMessage("Нет подключения к базе данных");
            }

        });
    });

    /*
     * Создание экземляра контекстного меню узла
     * Доступна одна кнопка "Удалить", при нажатии создается ajax запрос, передающий
     * id и класс элемента для удаления. В случае успеха - удаление элемента из редактора,
     * иначе - блокировка редактора и вывод сообщения об ошибке.
     * @param menuRadius - радиус меню в пикселях
     * @param selector - класс элемента, для которого доступно данное меню
     * @param commands - команды контекстного меню
     * @param element - элемент, над которым совершено действие (узел)
     * @param commands - команды контекстного меню
     * @param openMenuEvents - событие, приводящие открытие контекстного меню
     * @param
     * @param
     */
    cy.cxtmenu({
        menuRadius: 85,
        selector: "node",
        commands: [
            {
                content: "Удалить",
                select: function(element) {
                    $.ajax({
                        url: "editor/delete",
                        method: "GET",
                        data: {
                            id: element.id(),
                            group: "nodes"
                        },
                        success: function(response) {
                            printMessage("Вершина успешно удалена");
                            cy.remove(element);
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

    /*
     * Создание экземляра контекстного меню локации
     * Доступна одна кнопка "Удалить", при нажатии создается ajax запрос, передающий
     * id и класс элемента для удаления. В случае успеха - удаление элемента из редактора,
     * иначе - блокировка редактора и вывод сообщения об ошибке.
     * @param menuRadius - радиус меню в пикселях
     * @param selector - класс элемента, для которого доступно данное меню
     * @param commands - команды контекстного меню
     * @param element - элемент, над которым совершено действие (локация)
     * @param commands - команды контекстного меню
     * @param openMenuEvents - событие, приводящие к открытию контекстного меню
     * @param
     * @param
     */
    cy.cxtmenu({
        menuRadius: 85,
        selector: "edge",
        commands: [
            {
                content: "Удалить",
                select: function(element) {
                    $.ajax({
                        url: "editor/delete",
                        method: "GET",
                        data: {
                            id: element.id().substr(1),
                            group: "edges"
                        },
                        dataType: "json",
                        success: function(response) {
                            printMessage("Путь успешно удален");
                            cy.remove(element);
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

    /*
     * Создание экземляра контекстного меню осного редактора
     * Доступна одна кнопка "Узел", при нажатии создается ajax запрос, передающий
     * позицию для добавления элемента. В случае успеха - создание нового узла с данными из ответа,
     * иначе - вывод сообщения об ошибке.
     * @param menuRadius - радиус меню в пикселях
     * @param selector - класс элемента, для которого доступно данное меню
     * @param commands - команды контекстного меню
     * @param element - элемент, над которым совершено действие (ядро)
     * @param commands - команды контекстного меню
     * @param openMenuEvents - событие, приводящие к открытию контекстного меню
     * @param
     * @param
     */
    cy.cxtmenu({
        menuRadius: 85,
        selector: "core",
        commands: [
            {
                content: "Новый",
                enabled: false

            },
            {
                content: "Узел",
                select: function(ele){
                    $.ajax({
                        url: "editor/create/node",
                        method: "GET",
                        dataType: "json",
                        data: {
                            x: cxtPosition.x,
                            y: cxtPosition.y
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

    /*
     * Создание экземляра модуля создания локаций
     * В случае нажития на индикатор, начинается процесс создания новой локации
     * @param preview - возможно видеть новый элемент в момент рисования
     * @param handleNodes - класс элемента, для которого доступно данная функция
     * В момент создания локации-якоря, создает ajax-запрос на сервер. В случае успеха
     * ярокь удаляется, а на его место встает новый элемент с данными ответа. Иначе - удаление
     * якоря и сообщение об ошибке
     * @param complete - событие завершения рисования
     * @param sourceNode, targetNode, addedEles - узел-источник, узел-цель и
     * добавленный элемент соответственно
     * @param response {JSON} - ответ сервера в формате JSON
     */
    cy.edgehandles({
        preview: true,
        handleNodes: 'node',
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
                    addedEles.remove();
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

    /*
     * Обработчик кнопки "Добавить"
     * Создает узел-якорь в центре экрана, чтобы получить его позицию. Создается
     * ajax-запрос, который передает позицию якоря на сервер. В случае успеха якорь
     * заменяется новым элементом на основе ответа. Иначе - удаление якоря и сообщение об
     * ошибке
     * @param anchor - узел-якорь, создаваемый в центре экрана
     * @param response {JSON} - ответ сервера в формате JSON
     */
    $('#add').click(function(){
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
                cy.add(response);
                cy.remove(anchor);
            },
            error: function(response) {
                cy.remove(anchor);
                $("footer").append(printMessage("Нет подключения к базе данных"));
            },
        });
    });
}
