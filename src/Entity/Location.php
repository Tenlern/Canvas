<?php

namespace App\Entity;

use Doctrine\ORM\Mapping as ORM;

/**
 * @ORM\Entity(repositoryClass="App\Repository\LocationRepository")
 */
class Location
{
    /**
     * @ORM\Id()
     * @ORM\GeneratedValue()
     * @ORM\Column(type="integer")
     */
    private $id;

    /**
     * @ORM\Column(type="integer")
     */
    private $node1_id;

    /**
     * @ORM\Column(type="integer")
     */
    private $node2_id;

    /**
     * @ORM\Column(type="string", length=127)
     */
    private $name;

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getNode1Id(): ?int
    {
        return $this->node1_id;
    }

    public function setNode1Id(int $node1_id): self
    {
        $this->node1_id = $node1_id;

        return $this;
    }

    public function getNode2Id(): ?int
    {
        return $this->node2_id;
    }

    public function setNode2Id(int $node2_id): self
    {
        $this->node2_id = $node2_id;

        return $this;
    }

    public function getName(): ?string
    {
        return $this->name;
    }

    public function setName(string $name): self
    {
        $this->name = $name;

        return $this;
    }
}
