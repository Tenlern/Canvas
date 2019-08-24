<?php

namespace App\Entity;

use Doctrine\ORM\Mapping as ORM;

/**
 * @ORM\Entity(repositoryClass="App\Repository\NodeRepository")
 * @ORM\HasLifecycleCallbacks()
 */
class Node
{
    /**
     * @property Первичный ключ объекта класса
     * @ORM\Id()
     * @ORM\GeneratedValue()
     * @ORM\Column(type="integer")
     */
    private $id;

    /**
     * @property Имя объекта класса
     * @ORM\Column(type="string", length=127)
     */
    private $name;

    /**
     * @property Позиция на оси Х объекта класса
     * @ORM\Column(type="float")
     */
    private $x;

    /**
     * @property Позиция на оси Y объекта класса
     * @ORM\Column(type="float")
     */
    private $y;

    /**
     * Возвращает значение первичного ключа объекта
     * @property-read id
     * @return id:int
     */
    public function getId(): ?int
    {
        return $this->id;
    }

    /**
     * Возвращает значение наименования объекта
     * @property-read name
     * @return name:string
     */
    public function getName(): ?string
    {
        return $this->name;
    }

    /**
     * Задает значение поля name
     * @property-write name
     * @return self
     */
    public function setName(string $name): self
    {
        $this->name = $name;

        return $this;
    }

    /**
     * Возвращает Х объекта
     * @property-read x
     * @return x:float
     */
    public function getX(): ?float
    {
        return $this->x;
    }

    /**
     * Задает Х объекта
     * @property-write x
     * @return self
     */
    public function setX(float $x): self
    {
        $this->x = $x;

        return $this;
    }

    /**
     * Возвращает Y объекта
     * @property-read y
     * @return y:float
     */
    public function getY(): ?float
    {
        return $this->y;
    }

    /**
     * Задает Y объекта
     * @property-write y
     * @return self
     */
    public function setY(float $y): self
    {
        $this->y = $y;

        return $this;
    }
    /**
     * Перед добавлением объекта в базу данных
     * задает ему уникальное значение name
     * @return this
     * @ORM\PreFlush
     */
    public function generateName(): self
    {
        $this->name = "Node".$this->id;
        return $this;
    }
}
