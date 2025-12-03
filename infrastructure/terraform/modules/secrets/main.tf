variable "environment" {
  type        = string
  description = "Environment name"
}

variable "mongo_connection_string" {
  type        = string
  description = "MongoDB connection string"
  sensitive   = true
}

resource "random_password" "jwt_secret" {
  length  = 64
  special = false
}

resource "random_password" "jwt_refresh_secret" {
  length  = 64
  special = false
}

resource "aws_secretsmanager_secret" "app_secrets" {
  name = "popflash/${var.environment}/app-secrets"

  tags = {
    Environment = var.environment
  }
}

resource "aws_secretsmanager_secret_version" "app_secrets" {
  secret_id = aws_secretsmanager_secret.app_secrets.id
  secret_string = jsonencode({
    POPFLASH_MONGO_URI          = var.mongo_connection_string
    POPFLASH_JWT_SECRET         = random_password.jwt_secret.result
    POPFLASH_JWT_REFRESH_SECRET = random_password.jwt_refresh_secret.result
  })
}

resource "aws_secretsmanager_secret" "steam_api" {
  name = "popflash/${var.environment}/steam-api"

  tags = {
    Environment = var.environment
  }
}

resource "aws_secretsmanager_secret" "stripe" {
  name = "popflash/${var.environment}/stripe"

  tags = {
    Environment = var.environment
  }
}

resource "aws_secretsmanager_secret" "persona" {
  name = "popflash/${var.environment}/persona"

  tags = {
    Environment = var.environment
  }
}

output "app_secrets_arn" {
  value = aws_secretsmanager_secret.app_secrets.arn
}

output "steam_api_secrets_arn" {
  value = aws_secretsmanager_secret.steam_api.arn
}

output "stripe_secrets_arn" {
  value = aws_secretsmanager_secret.stripe.arn
}

output "persona_secrets_arn" {
  value = aws_secretsmanager_secret.persona.arn
}
