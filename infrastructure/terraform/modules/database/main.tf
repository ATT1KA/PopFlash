variable "environment" {
  type        = string
  description = "Environment name"
}

variable "vpc_id" {
  type        = string
  description = "VPC ID for security group"
}

variable "private_subnet_ids" {
  type        = list(string)
  description = "Private subnet IDs for DocumentDB"
}

variable "instance_class" {
  type        = string
  default     = "db.t3.medium"
  description = "DocumentDB instance class"
}

variable "instance_count" {
  type        = number
  default     = 1
  description = "Number of DocumentDB instances"
}

resource "aws_security_group" "docdb" {
  name_prefix = "popflash-${var.environment}-docdb-"
  vpc_id      = var.vpc_id

  ingress {
    from_port   = 27017
    to_port     = 27017
    protocol    = "tcp"
    cidr_blocks = ["10.0.0.0/16"]
    description = "MongoDB from VPC"
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name        = "popflash-${var.environment}-docdb-sg"
    Environment = var.environment
  }

  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_docdb_subnet_group" "main" {
  name       = "popflash-${var.environment}-docdb-subnet"
  subnet_ids = var.private_subnet_ids

  tags = {
    Name        = "popflash-${var.environment}-docdb-subnet"
    Environment = var.environment
  }
}

resource "random_password" "docdb" {
  length  = 32
  special = false
}

resource "aws_docdb_cluster" "main" {
  cluster_identifier      = "popflash-${var.environment}"
  engine                  = "docdb"
  master_username         = "popflash_admin"
  master_password         = random_password.docdb.result
  db_subnet_group_name    = aws_docdb_subnet_group.main.name
  vpc_security_group_ids  = [aws_security_group.docdb.id]
  skip_final_snapshot     = var.environment != "prod"
  deletion_protection     = var.environment == "prod"
  backup_retention_period = var.environment == "prod" ? 7 : 1

  tags = {
    Name        = "popflash-${var.environment}-docdb"
    Environment = var.environment
  }
}

resource "aws_docdb_cluster_instance" "main" {
  count              = var.instance_count
  identifier         = "popflash-${var.environment}-${count.index + 1}"
  cluster_identifier = aws_docdb_cluster.main.id
  instance_class     = var.instance_class

  tags = {
    Name        = "popflash-${var.environment}-docdb-${count.index + 1}"
    Environment = var.environment
  }
}

output "endpoint" {
  value = aws_docdb_cluster.main.endpoint
}

output "reader_endpoint" {
  value = aws_docdb_cluster.main.reader_endpoint
}

output "connection_string" {
  value     = "mongodb://${aws_docdb_cluster.main.master_username}:${random_password.docdb.result}@${aws_docdb_cluster.main.endpoint}:27017/popflash?tls=true&replicaSet=rs0&readPreference=secondaryPreferred"
  sensitive = true
}

output "security_group_id" {
  value = aws_security_group.docdb.id
}
