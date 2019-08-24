<?php

namespace App\Entity;

use Doctrine\ORM\Mapping as ORM;

/**
 * @ORM\Entity(repositoryClass="App\Repository\LocationRepository")
 * @ORM\HasLifecycleCallbacks()
 */
class Location
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
     * @property Ссылка на источник локации - узел Node
     * @ORM\ManyToOne(targetEntity="App\Entity\Node")
     * @ORM\JoinColumn(nullable=false, onDelete="CASCADE")
     */
    private $node1;

    /**
     * @property Ссылка на цель локации - узел Node
     * @ORM\ManyToOne(targetEntity="App\Entity\Node")
     * @ORM\JoinColumn(nullable=false, onDelete="CASCADE")
     */
    private $node2;

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

    public function getNode1(): ?Node
    {
        return $this->node1;
    }

    public function setNode1(?Node $node1): self
    {
        $this->node1 = $node1;

        return $this;
    }

    public function getNode2(): ?Node
    {
        return $this->node2;
    }

    public function setNode2(?Node $node2): self
    {
        $this->node2 = $node2;

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
        $this->name = "Локация №".$this->id;
        return $this;
    }
}
