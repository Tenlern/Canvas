<?php

namespace App\Controller;

use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Symfony\Component\HttpFoundation\{Request, Response};
//use Symfony\Component\HttpFoundation\Response;
use App\Entity\Node;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\Routing\Annotation\Route;

//Основной контроллер редактора
class EditorController extends AbstractController
{
    /**
     * @Route("/editor", name="editor")
     */
    public function index()
    {
        return $this->render('editor/index.html.twig');
    }


    /**
     * @Route("/editor/init", name="init")
     */
    public function init()
    {
        $result = array();
        $manager = $this -> getDoctrine() -> getManager();
        $nodes = $manager -> getRepository(Node::class) -> findAll();
        foreach ($nodes as $node)
        {
            array_push($result, array(
                "id" => $node -> getId(),
                "name" => $node -> getName(),
                "x" => $node -> getX(),
                "y" => $node -> getY()
            ));
        }
        echo json_encode($result);
        return new Response();
    }

    /**
     * @Route("/editor/create/node", name="node_creator")
     */
    public function createNode(Request $request)
    {
        //$request = Request::createFromGlobals();
        $request->getPathInfo();
        $manager = $this -> getDoctrine() -> getManager();
        $x = $request -> query -> get("x");
        $y = $request -> query -> get("y");
        $node = new Node();
        $node -> setName("Node");
        $node -> setX($x);
        $node -> setY($y);
        $manager -> persist($node);
        $manager->flush();
        $result = array(
            "id" => $node -> getId(),
            "name" => $node -> getName(),
            "x" => $node -> getX(),
            "y" => $node -> getY()
        );
        //echo json_encode($result);
        //return new Response();
        return new Response(json_encode($result));
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
