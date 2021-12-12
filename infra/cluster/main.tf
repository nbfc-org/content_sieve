locals {
  name = "${var.app}-${terraform.workspace}"
}

resource "digitalocean_project" "project" {
  name = local.name
  environment=terraform.workspace
  purpose="Just trying out DigitalOcean"
}

resource "digitalocean_project_resources" "resources" {
  project = digitalocean_project.project.id

  # Bucket Database Domain DomainRecord Droplet Firewall FloatingIp Image Kubernetes LoadBalancer MarketplaceApp Saas Volume
  resources = [
    digitalocean_droplet.docker.urn,
    digitalocean_floating_ip.ip.urn,
  ]
}

resource "digitalocean_vpc" "vpc" {
  name   = "${terraform.workspace}-${var.region}-vpc-01"
  region = var.region
  ip_range = var.vpc_subnet
}

resource "digitalocean_ssh_key" "key" {
  name       = var.ssh_key
  public_key = file("~/.ssh/${var.ssh_key}.pub")
}

resource "digitalocean_tag" "env" {
  name = terraform.workspace
}

resource "digitalocean_droplet" "docker" {
  image  = var.image
  name   = "${digitalocean_tag.env.id}-debian-s-1vcpu-1gb-amd-${var.region}-01"
  region = var.region
  size   = var.size

  # TODO: uncomment this for prod
  ssh_keys = [digitalocean_ssh_key.key.fingerprint]

  vpc_uuid = digitalocean_vpc.vpc.id

  connection {
    host = self.ipv4_address
    user = "root"
    type = "ssh"
    private_key = file("~/.ssh/${var.ssh_key}")
    timeout = "2m"
  }

  provisioner "remote-exec" {
    inline = [
      "apt-get update",
      "apt-get -y dist-upgrade",
      "apt-get -y install docker.io htop",
      "mkdir -p data/content_sieve",
      "mkdir -p data/keycloak",
      "mkdir -p data/cloudflare",
      "fallocate -l 2G /root/swapfile",
      "chmod 600 /root/swapfile",
      "mkswap /root/swapfile",
      "swapon /root/swapfile",
      "echo '/root/swapfile swap swap defaults 0 0' >> /etc/fstab",
    ]
  }

  tags = [
    digitalocean_tag.env.id
  ]
}

resource "digitalocean_floating_ip" "ip" {
  region = var.region
  droplet_id = digitalocean_droplet.docker.id
}

resource "digitalocean_firewall" "firewall" {
  name = local.name

  inbound_rule {
    protocol         = "tcp"
    port_range       = "22"
    source_addresses = ["0.0.0.0/0", "::/0"]
  }

  inbound_rule {
    protocol         = "tcp"
    port_range       = "443"
    source_addresses = ["0.0.0.0/0", "::/0"]
  }

  outbound_rule {
    protocol         = "icmp"
    destination_addresses = ["0.0.0.0/0", "::/0"]
  }

  outbound_rule {
    protocol              = "tcp"
    port_range            = "all"
    destination_addresses = ["0.0.0.0/0", "::/0"]
  }

  outbound_rule {
    protocol              = "udp"
    port_range            = "all"
    destination_addresses = ["0.0.0.0/0", "::/0"]
  }

  tags = [
    digitalocean_tag.env.id
  ]

}
