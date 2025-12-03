terraform {
  required_version = ">= 1.5.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.5"
    }
  }

  backend "s3" {
    bucket         = "popflash-terraform-state"
    key            = "staging/terraform.tfstate"
    region         = "us-east-1"
    encrypt        = true
    dynamodb_table = "popflash-terraform-locks"
  }
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project     = "PopFlash"
      Environment = "staging"
      ManagedBy   = "Terraform"
    }
  }
}

variable "aws_region" {
  type    = string
  default = "us-east-1"
}

locals {
  environment        = "staging"
  availability_zones = ["${var.aws_region}a", "${var.aws_region}b"]
}

module "networking" {
  source = "../../modules/networking"

  environment        = local.environment
  vpc_cidr           = "10.1.0.0/16"
  availability_zones = local.availability_zones
}

module "database" {
  source = "../../modules/database"

  environment        = local.environment
  vpc_id             = module.networking.vpc_id
  private_subnet_ids = module.networking.private_subnet_ids
  instance_class     = "db.t3.medium"
  instance_count     = 2
}

module "secrets" {
  source = "../../modules/secrets"

  environment             = local.environment
  mongo_connection_string = module.database.connection_string
}

module "compute" {
  source = "../../modules/compute"

  environment        = local.environment
  vpc_id             = module.networking.vpc_id
  public_subnet_ids  = module.networking.public_subnet_ids
  private_subnet_ids = module.networking.private_subnet_ids

  services = {
    api-gateway = { port = 4000, cpu = 256, memory = 512, desired_count = 2, health_path = "/health" }
    auth        = { port = 4100, cpu = 256, memory = 512, desired_count = 2, health_path = "/health" }
    trading     = { port = 4200, cpu = 256, memory = 512, desired_count = 2, health_path = "/health" }
    escrow      = { port = 4300, cpu = 256, memory = 512, desired_count = 2, health_path = "/health" }
    insights    = { port = 4400, cpu = 256, memory = 512, desired_count = 1, health_path = "/health" }
    compliance  = { port = 4500, cpu = 256, memory = 512, desired_count = 2, health_path = "/health" }
  }
}

output "api_endpoint" {
  value = "http://${module.compute.alb_dns_name}"
}

output "database_endpoint" {
  value     = module.database.endpoint
  sensitive = true
}
