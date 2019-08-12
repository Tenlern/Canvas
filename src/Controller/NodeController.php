<?php

namespace App\Controller;

use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use App\Entity\Node;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\Routing\Annotation\Route;

class NodeController extends AbstractController
{
    /**
     * @Route("/node", name="node")
     */
    public function index() : Response
    {
        $controller = $this -> getDoctrine() -> getManager();
        $testNode = new Node();
        $testNode->setName("Test1");
        $testNode->setX(0);
        $testNode->setY(0);
        $controller->persist($testNode);
        $controller->flush();
        return new Response("Добавлена новая вершина ". $testNode->getName(). "С id: ". $testNode->getId());
        //return new Response('Saved new product with id '.$testNode->getId());
            /*$node = $this -> getDoctrine() -> getRepository(Node::class) -> findOne();
            if (!$node) {
                throw $this-> createNotFoundException("Произошла ошибка");
            }
            return new Response("Сохранена под id: ". $node->getId());
        }
        else {
            return new Response("Ошибка записи");*/

    }


    /**
    * @Route("/node/{id}", name="nodeInfo")
    */
    public function showNode($id) : Response
    {
        $controller = $this -> getDoctrine() -> getManager();
        $node = $this->getDoctrine()
            ->getRepository(Node::class)
            ->find($id);
        if (!$node) {
            throw $this->createNotFoundException('No product found for id '.$id);
        }
        $controller->remove($node);
        $controller->flush();
        return new Response('Check');
    }

    /**
     * @Route("/node/error", name="error")
     */
    public function error() {
         throw $this->createNotFoundException('The product does not exist');
    }

}
