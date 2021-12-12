variable do_token {}

variable vpc_subnet {}

variable ssh_key {}

variable image {
  default = "debian-11-x64"
}

variable size {
  default = "s-1vcpu-1gb-amd"
}

variable app {
  default = "nbfc"
}

variable region {
  default = "sfo3"
}
