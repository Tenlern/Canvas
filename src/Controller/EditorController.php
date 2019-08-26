<?php

namespace App\Controller;

/**
 * Подключаем необходимые библиотеки
 * App\Entity\{Node, Location} - классы для работы с объктами графа
 * Doctrine\ORM\EntityManagerInterface - набор интерфейсов для Doctrine ORM
 * Symfony\Component\Routing\Annotation\Route - создание адресов страниц через аннотации
 * Symfony\Component\HttpFoundation\{Request, Response} - классы для работы с запросами
 * и ответами HTTP
 * Symfony\Component\HttpKernel\Exception\NotFoundHttpException - объект ошибки 404
 * Symfony\Bundle\FrameworkBundle\Controller\AbstractController - контроллер приложения
*/
use App\Entity\{Node, Location};
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\HttpFoundation\{Request, Response};
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;

/**
 * Основной контроллер редактора
 */
class EditorController extends AbstractController
{
    /**
     * Главная страница редактора.
     * @Route("/editor", name="editor")
    */
    public function index() {
        return $this->render('editor/editor.html.twig');
    }

    /**
     * Обработчик инициализации графа
     * В случае получения xmlhttp запроса возвращает json с данными элементов
     * @param request - данные запроса
     * @return response - JSON элементов графа
     * @throws NotFoundException если приходит не xmlhttp запрос
     * @Route("/editor/init", name="init")
     */
    public function init(Request $request) {
        if( $request->isXmlHttpRequest() ){
            $result = array();
            $manager = $this -> getDoctrine() -> getManager();
            $items = $manager -> getRepository(Node::class) -> findAll();
            foreach ($items as $node) {
                array_push($result, array(
                    "group" => "nodes",
                    "data" => array(
                        "id" => $node -> getId(),
                        "name" => $node -> getName()
                    ),
                    "position" => array(
                        "x" => $node -> getX(),
                        "y" => $node -> getY()
                    )
                ));
            }
            $items = $manager -> getRepository(Location::class) -> findAll();
            foreach ($items as $location) {
                array_push($result, array(
                    "group" => "edges",
                    "data" => array(
                        "id" => "e".$location -> getId(),
                        "name" => $location -> getName(),
                        "source" => $location -> getNode1() -> getId(),
                        "target" => $location -> getNode2() -> getId()
                    )
                ));
            }
            return new Response(json_encode($result));
        }
        else {
            throw $this->createNotFoundException(
                'No route found for "GET "' . $request -> getPathInfo());
        }
    }

    /**
     * Обработчик создания новой локации
     * Принимает данные из GET и заносит их значения в новый объект
     * Объект сохраняется в базу данных
     * Формируется JSON ответа
     * @param request - данные запроса
     * @return response - JSON вершины
     * @throws NotFoundException если приходит не xmlhttp запрос
     * @Route("/editor/create/node", name="node_creator")
     */
    public function createNode(Request $request) {
        if( $request->isXmlHttpRequest() ) {
            $manager = $this -> getDoctrine() -> getManager();
            $x = $request -> query -> get("x");
            $y = $request -> query -> get("y");
            $node = new Node();
            $node -> setX($x);
            $node -> setY($y);
            $manager -> persist($node);
            $manager->  flush();
            $result = array(
                "group" => "nodes",
                "data" => array(
                    "id" => $node -> getId(),
                    "name" => $node -> getName()
                ),
                "position" => array(
                    "x" => $node -> getX(),
                    "y" => $node -> getY()
                )
            );
            return new Response(json_encode($result));
        }
        else {
            throw $this->createNotFoundException(
                'No route found for "GET "' . $request -> getPathInfo());
        }
    }

    /**
     * Обработчик создания новой локации
     * Принимает данные из GET и заносит их значения в новый объект
     * Объект сохраняется в базу данных
     * Формируется JSON ответа
     * @param request - данные запроса: source - id вершины-источника,
     * target - id вершины-цели
     * @return response - JSON локации
     * @throws NotFoundException если приходит не xmlhttp запрос
     * @Route("/editor/create/location", name="location_creator")
     */
    public function createLocation(Request $request) {
        if( $request->isXmlHttpRequest() ) {
            $manager = $this -> getDoctrine() -> getManager();
            $node1_id = $request -> query -> get("source");
            $node2_id = $request -> query -> get("target");
            $location = new Location();
            $location -> setName("Location ". $node1_id. "-". $node2_id);
            $location -> setNode1($manager -> getRepository(Node::class) -> find($node1_id));
            $location -> setNode2($manager -> getRepository(Node::class) -> find($node2_id));
            $manager -> persist($location);
            $manager->  flush();
            $result = array(
                "group" => "edges",
                "data" => array(
                    "id" => "e".$location -> getId(),
                    "name" => $location -> getName(),
                    "source" => $location -> getNode1() -> getId(),
                    "target" => $location -> getNode2() -> getId()
                )
            );
        return new Response(json_encode($result));
        }
        else {
            throw $this->createNotFoundException(
                'No route found for "GET "' . $request -> getPathInfo());
        }
    }

    /**
     * Обработчик удаления вершины или локации
     * Удаляет объект с полям id и подходящей group из GET xmlhttp запроса
     * @param request - данные запроса: id, group - вершина или локация
     * @return response - JSON вершины
     * @throws NotFoundException если приходит не xmlhttp запрос
     * @Route("/editor/delete", name="cleaner")
     */
    public function deleteElement(Request $request)
    {
        if( $request->isXmlHttpRequest() ) {
            $manager = $this -> getDoctrine() -> getManager();
            $data = $request -> query -> all();
            if ($data['group'] === "nodes")
                $manager -> remove(
                    $manager -> getRepository(Node::class) -> find($data['id'])
                );
            else if ($data['group'] === "edges")
                $manager -> remove(
                    $manager -> getRepository(Location::class) -> find($data['id'])
                );
            $manager->flush();
            $result = "Успешно";
            return new Response(json_encode($result));
        }
        else {
            throw $this->createNotFoundException(
                'No route found for "GET "' . $request -> getPathInfo());
            }
    }

    /**
     * Обработчик обновления координат веришны
     * Обновляет поля x, y объекта с подходящим id из GET xmlhttp запроса
     * @param request - данные запроса: id, x, y - новые координаты вершины
     * @return response - сообщение успешного выполнения
     * @throws NotFoundException если приходит не xmlhttp запрос
     * @Route("/editor/update/node", name="node_updater")
     */
    public function updateNode(Request $request)
    {
        if( $request->isXmlHttpRequest() ) {
            $manager = $this -> getDoctrine() -> getManager();
            $id= $request -> query -> get("id");
            $x = $request -> query -> get("x");
            $y = $request -> query -> get("y");
            $node = $manager -> getRepository(Node::class) -> find($id);
            $node -> setName("Node" . $node -> getId());
            $node -> setX($x);
            $node -> setY($y);
            $manager->flush();
            $result = "Успешно";
            return new Response(json_encode($result));
        }
        else {
            throw $this->createNotFoundException(
                'No route found for "GET "' . $request -> getPathInfo());
        }
    }
}
