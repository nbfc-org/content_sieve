variable region {
  default = "sfo3"
}

resource "digitalocean_project" "project" {
  name="nbfc ${terraform.workspace}"
  environment=terraform.workspace
  purpose="Just trying out DigitalOcean"
}

data "digitalocean_project" "project" {
  name="nbfc ${terraform.workspace}"
}

resource "digitalocean_project_resources" "resources" {
  project = data.digitalocean_project.project.id

  # Bucket Database Domain DomainRecord Droplet Firewall FloatingIp Image Kubernetes LoadBalancer MarketplaceApp Saas Volume
  resources = [
    digitalocean_droplet.docker.urn,
    digitalocean_floating_ip.ip.urn,
  ]
}

resource "digitalocean_vpc" "vpc" {
  name   = "sfo3-vpc-01"
  region = var.region
  ip_range = "10.124.0.0/20"
}

resource "digitalocean_droplet" "docker" {
  image  = "debian-11-x64"
  name   = "debian-s-1vcpu-1gb-amd-sfo3-01"
  region = var.region
  size   = "s-1vcpu-1gb-amd"
  tags = [
    terraform.workspace,
  ]
}

resource "digitalocean_floating_ip" "ip" {
  region = var.region
  droplet_id = digitalocean_droplet.docker.id
}

resource "digitalocean_firewall" "firewall" {
  name = "nbfc-staging"

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
    terraform.workspace,
  ]

}
