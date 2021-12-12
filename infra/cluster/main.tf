resource "digitalocean_project" "project" {
  name="nbfc ${terraform.workspace}"
  environment=terraform.workspace
  purpose="Just trying out DigitalOcean"
}

data "digitalocean_project" "project" {
  name="nbfc ${terraform.workspace}"
}

resource "digitalocean_vpc" "vpc" {
  name   = "sfo3-vpc-01"
  region = "sfo3"
  ip_range = "10.124.0.0/20"
}
