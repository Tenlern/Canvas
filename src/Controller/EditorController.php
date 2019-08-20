<?php

namespace App\Controller;

use App\Entity\{Node, Location};
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\HttpFoundation\{Request, Response};
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;

//Основной контроллер редактора
class EditorController extends AbstractController
{
    /**
     * @Route("/editor", name="editor")
     */
    public function index() {
        //Возвращается главная страница редактора
        return $this->render('editor/index2.html.twig');
    }

    /**
     * @Route("/editor/init", name="init")
     */
    public function init(Request $request) {
        //Если приходит запрос Ajax, то начинается обработка
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
            /*$items = $manager -> getRepository(Location::class) -> findAll();
            foreach ($items as $location)
            {

            }
            */
            return new Response(json_encode($result));
        }
        //Иначе создается ошибка 404
        else {
            throw $this->createNotFoundException('No route found for "GET /init"');
        }
    }

    /**
     * @Route("/editor/create/node", name="node_creator")
     */
    public function createNode(Request $request) {
        if( $request->isXmlHttpRequest() ) {
            $request -> getPathInfo();
            $manager = $this -> getDoctrine() -> getManager();
            $x = $request -> query -> get("x");
            $y = $request -> query -> get("y");
            $node = new Node();
            $node -> setName("Node");
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
            throw $this->createNotFoundException('No route found for "GET /init"');
        }
    }

    /**
     * @Route("/editor/delete/node", name="node_deletor")
     */
    public function deleteNode(Request $request)
    {
        $request->getPathInfo();
        $manager = $this -> getDoctrine() -> getManager();
        $id= $request -> query -> get("id");
        $manager -> remove($manager -> getRepository(Node::class) -> find($id));
        $manager->flush();
        $result = "Успешно";
        //echo json_encode($result);
        return new Response(json_encode($result));
    }

    /**
     * @Route("/editor/update/node", name="node_updater")
     */
    public function updateNode(Request $request)
    {
        $request -> getPathInfo();
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
}
