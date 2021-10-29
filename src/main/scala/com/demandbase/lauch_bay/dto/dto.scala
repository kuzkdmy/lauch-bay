package com.demandbase.lauch_bay.dto

import com.demandbase.lauch_bay.domain.types._
import derevo.circe.{decoder, encoder}
import derevo.derive
import io.circe.generic.extras.semiauto.{deriveConfiguredDecoder, deriveConfiguredEncoder}
import io.circe.{Decoder, Encoder}
import sttp.tapir.Schema
import sttp.tapir.derevo.schema

import scala.reflect.runtime.universe.typeOf

@derive(schema, encoder, decoder) case class ApiGlobalConfig(envConf: List[ApiEnvVarConf], deployConf: List[ApiDeploymentConf], version: IntVersion)
@derive(schema, encoder, decoder) case class ApiProject(id: ProjectId, name: ProjectName, envConf: List[ApiEnvVarConf], deployConf: List[ApiDeploymentConf], version: IntVersion)
@derive(schema, encoder, decoder) case class ApiApplication(id: AppId, projectId: ProjectId, name: AppName, envConf: List[ApiEnvVarConf], deployConf: List[ApiDeploymentConf], version: IntVersion)
@derive(schema, encoder, decoder) case class ApiEnvVarConf(envKey: EnvVarKey, default: Option[ApiEnvVarValue], envOverride: ApiEnvOverride)
@derive(schema, encoder, decoder) case class ApiEnvOverride(dev: Option[ApiEnvVarValue], stage: Option[ApiEnvVarValue], prod: Option[ApiEnvVarValue])
@derive(schema, encoder, decoder) case class ApiHasVersion(version: IntVersion)

sealed trait ApiEnvVarValue {
  def `type`: String
}
object ApiEnvVarValue {
  implicit val genDevConfig: sttp.tapir.generic.Configuration = sttp.tapir.generic.Configuration.default
    .withDiscriminator("type")
  implicit val sEntity: Schema[ApiEnvVarValue] =
    Schema.oneOfUsingField[ApiEnvVarValue, String](_.`type`, identity)(
      "string"  -> Schema.derived[ApiStringEnvVar],
      "boolean" -> Schema.derived[ApiBooleanEnvVar],
      "integer" -> Schema.derived[ApiIntEnvVar]
    )
  private val circeDiscriminators = Map(
    typeOf[ApiStringEnvVar].typeSymbol.name.toString  -> "string",
    typeOf[ApiBooleanEnvVar].typeSymbol.name.toString -> "boolean",
    typeOf[ApiIntEnvVar].typeSymbol.name.toString     -> "integer"
  )
  implicit val circeConfiguration: io.circe.generic.extras.Configuration =
    io.circe.generic.extras.Configuration.default.withSnakeCaseConstructorNames
      .withDiscriminator("type")
      .copy(transformConstructorNames = name => circeDiscriminators.getOrElse(name, name))
  implicit val decoder: Decoder[ApiEnvVarValue] = deriveConfiguredDecoder
  implicit val encoder: Encoder[ApiEnvVarValue] = deriveConfiguredEncoder
}
@derive(schema, encoder, decoder) case class ApiStringEnvVar(value: String) extends ApiEnvVarValue { override val `type`: String = "string" }
@derive(schema, encoder, decoder) case class ApiBooleanEnvVar(value: Boolean) extends ApiEnvVarValue { override val `type`: String = "boolean" }
@derive(schema, encoder, decoder) case class ApiIntEnvVar(value: Int) extends ApiEnvVarValue { override val `type`: String = "integer" }

@derive(schema, encoder, decoder) case class ApiIntEnvOverride(dev: Option[Int], stage: Option[Int], prod: Option[Int])

sealed trait ApiDeploymentConf {
  def `type`: String
}
object ApiDeploymentConf {
  implicit val genDevConfig: sttp.tapir.generic.Configuration = sttp.tapir.generic.Configuration.default
    .withDiscriminator("type")
  implicit val sEntity: Schema[ApiDeploymentConf] =
    Schema.oneOfUsingField[ApiDeploymentConf, String](_.`type`, identity)(
      "replica" -> Schema.derived[ApiReplicaCountConf],
      "cpu"     -> Schema.derived[ApiCpuRequestConf],
      "ram"     -> Schema.derived[ApiRamMegabytesConf]
    )
  private val circeDiscriminators = Map(
    typeOf[ApiReplicaCountConf].typeSymbol.name.toString -> "replica",
    typeOf[ApiCpuRequestConf].typeSymbol.name.toString   -> "cpu",
    typeOf[ApiRamMegabytesConf].typeSymbol.name.toString -> "ram"
  )
  implicit val circeConfiguration: io.circe.generic.extras.Configuration =
    io.circe.generic.extras.Configuration.default.withSnakeCaseConstructorNames
      .withDiscriminator("type")
      .copy(transformConstructorNames = name => circeDiscriminators.getOrElse(name, name))
  implicit val decoder: Decoder[ApiDeploymentConf] = deriveConfiguredDecoder
  implicit val encoder: Encoder[ApiDeploymentConf] = deriveConfiguredEncoder
}
@derive(schema, encoder, decoder) case class ApiReplicaCountConf(default: Int, envOverride: Option[ApiIntEnvOverride]) extends ApiDeploymentConf { override val `type`: String = "replica" }
@derive(schema, encoder, decoder) case class ApiCpuRequestConf(default: Int, envOverride: Option[ApiIntEnvOverride]) extends ApiDeploymentConf { override val `type`: String = "cpu" }
@derive(schema, encoder, decoder) case class ApiRamMegabytesConf(default: Int, envOverride: Option[ApiIntEnvOverride]) extends ApiDeploymentConf { override val `type`: String = "ram" }
