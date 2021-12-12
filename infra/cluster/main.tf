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
  ]
}

resource "digitalocean_vpc" "vpc" {
  name   = "sfo3-vpc-01"
  region = "sfo3"
  ip_range = "10.124.0.0/20"
}

resource "digitalocean_droplet" "docker" {
  image  = "debian-11-x64"
  name   = "debian-s-1vcpu-1gb-amd-sfo3-01"
  region = "sfo3"
  size   = "s-1vcpu-1gb-amd"
  tags = [
    terraform.workspace,
  ]
}
