resource "digitalocean_project" "project" {
  name="nbfc ${terraform.workspace}"
  environment=terraform.workspace
  purpose="Just trying out DigitalOcean"
}
