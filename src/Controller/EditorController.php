<?php

namespace App\Controller;

use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Symfony\Component\HttpFoundation\Request;
use App\Entity\Node;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\Response;
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
        $controller = $this -> getDoctrine() -> getManager();
        $node = $this->getDoctrine()
            ->getRepository(Node::class)
            ->findAll();
        return $this->render('editor/index.html.twig', [
            'pageTitle' => 'TestTemlpate',
            'nodes' => $node,
        ]);
    }

    /**
     * @Route("/editor/create/node", name="node_creator")
     */
    public function createNode()
    {
        $request = Request::createFromGlobals();
        $request->getPathInfo();
        $manager = $this -> getDoctrine() -> getManager();
        $name = $request -> query -> get("name");
        $x = $request -> query -> get("x");
        $y = $request -> query -> get("y");
        $node = new Node();
        $node -> setName($name);
        $node -> setX($x);
        $node -> setY($y);
        $manager -> persist($node);
        $manager->flush();
        $result = "Успешно";
        echo json_encode($result);
        return new Response();
    }
}
