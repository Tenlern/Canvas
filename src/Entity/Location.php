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
     * @ORM\Column(type="string", length=127)
     */
    private $name;

    /**
     * @ORM\ManyToOne(targetEntity="App\Entity\Node")
     * @ORM\JoinColumn(nullable=false)
     */
    private $node1_id;

    /**
     * @ORM\ManyToOne(targetEntity="App\Entity\Node")
     * @ORM\JoinColumn(nullable=false)
     */
    private $node2_id;

    public function getId(): ?int
    {
        return $this->id;
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

    public function getNode1Id(): ?Node
    {
        return $this->node1_id;
    }

    public function setNode1Id(?Node $node1_id): self
    {
        $this->node1_id = $node1_id;

        return $this;
    }

    public function getNode2Id(): ?Node
    {
        return $this->node2_id;
    }

    public function setNode2Id(?Node $node2_id): self
    {
        $this->node2_id = $node2_id;

        return $this;
    }
}
