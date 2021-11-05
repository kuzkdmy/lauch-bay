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
@derive(schema, encoder, decoder) case class ApiApplication(
                                                             id: AppId,
                                                             projectId: ProjectId,
                                                             name: AppName,
                                                             envConf: List[ApiEnvVarConf],
                                                             deployConf: List[ApiDeploymentConf],
                                                             version: IntVersion
                                                           )
@derive(schema, encoder, decoder) case class ApiHasVersion(version: IntVersion)

sealed trait ApiEnvVarConf {
  def `type`: String
  def envKey: EnvVarKey
  def default: Option[ApiEnvVarValue]
  def envOverride: ApiEnvVarOverride
}
object ApiEnvVarConf {
  implicit val genDevConfig: sttp.tapir.generic.Configuration = sttp.tapir.generic.Configuration.default
    .withDiscriminator("type")
  implicit val sEntity: Schema[ApiEnvVarConf] =
    Schema.oneOfUsingField[ApiEnvVarConf, String](_.`type`, identity)(
      "string"  -> Schema.derived[ApiEnvStringVarConf],
      "boolean" -> Schema.derived[ApiEnvBooleanVarConf],
      "integer" -> Schema.derived[ApiEnvIntVarConf]
    )
  private val circeDiscriminators = Map(
    typeOf[ApiEnvStringVarConf].typeSymbol.name.toString  -> "string",
    typeOf[ApiEnvBooleanVarConf].typeSymbol.name.toString -> "boolean",
    typeOf[ApiEnvIntVarConf].typeSymbol.name.toString     -> "integer"
  )
  implicit val circeConfiguration: io.circe.generic.extras.Configuration =
    io.circe.generic.extras.Configuration.default.withSnakeCaseConstructorNames
      .withDiscriminator("type")
      .copy(transformConstructorNames = name => circeDiscriminators.getOrElse(name, name))

  implicit val decoder: Decoder[ApiEnvVarConf] = deriveConfiguredDecoder
  implicit val encoder: Encoder[ApiEnvVarConf] = deriveConfiguredEncoder
}

@derive(schema, encoder, decoder) case class ApiEnvStringVarConf(envKey: EnvVarKey, default: Option[ApiStringEnvVar], envOverride: ApiStringEnvVarOverride) extends ApiEnvVarConf {
  override val `type`: String = "string"
}
@derive(schema, encoder, decoder) case class ApiEnvBooleanVarConf(envKey: EnvVarKey, default: Option[ApiBooleanEnvVar], envOverride: ApiBooleanEnvVarOverride) extends ApiEnvVarConf {
  override val `type`: String = "boolean"
}
@derive(schema, encoder, decoder) case class ApiEnvIntVarConf(envKey: EnvVarKey, default: Option[ApiIntEnvVar], envOverride: ApiIntEnvVarOverride) extends ApiEnvVarConf {
  override val `type`: String = "int"
}

sealed trait ApiEnvVarOverride {
  def dev: Option[ApiEnvVarValue]
  def stage: Option[ApiEnvVarValue]
  def prod: Option[ApiEnvVarValue]
}

@derive(schema, encoder, decoder) case class ApiStringEnvVarOverride(dev: Option[ApiStringEnvVar], stage: Option[ApiStringEnvVar], prod: Option[ApiStringEnvVar]) extends ApiEnvVarOverride
@derive(schema, encoder, decoder) case class ApiBooleanEnvVarOverride(dev: Option[ApiBooleanEnvVar], stage: Option[ApiBooleanEnvVar], prod: Option[ApiBooleanEnvVar]) extends ApiEnvVarOverride
@derive(schema, encoder, decoder) case class ApiIntEnvVarOverride(dev: Option[ApiIntEnvVar], stage: Option[ApiIntEnvVar], prod: Option[ApiIntEnvVar]) extends ApiEnvVarOverride

sealed trait ApiEnvVarValue

@derive(schema, encoder, decoder) case class ApiStringEnvVar(value: String) extends ApiEnvVarValue
@derive(schema, encoder, decoder) case class ApiBooleanEnvVar(value: Boolean) extends ApiEnvVarValue
@derive(schema, encoder, decoder) case class ApiIntEnvVar(value: Int) extends ApiEnvVarValue

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
