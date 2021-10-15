package com.demandbase.lauch_bay.dto

import com.demandbase.lauch_bay.domain.types._
import derevo.circe.{decoder, encoder}
import derevo.derive
import sttp.tapir.derevo.schema

@derive(schema, encoder, decoder) case class ApiGlobalConfig(envConf: List[ApiEnvVarConf], deployConf: List[ApiDeploymentConf], version: IntVersion)
@derive(schema, encoder, decoder) case class ApiProject(id: ProjectId, name: ProjectName, envConf: List[ApiEnvVarConf], deployConf: List[ApiDeploymentConf], version: IntVersion)
@derive(schema, encoder, decoder) case class ApiApplication(id: AppId, projectId: ProjectId, name: AppName, envConf: List[ApiEnvVarConf], deployConf: List[ApiDeploymentConf], version: IntVersion)
@derive(schema, encoder, decoder) case class ApiEnvVarConf(envKey: EnvVarKey, default: Option[ApiEnvVarValue], envOverride: ApiEnvOverride)
@derive(schema, encoder, decoder) case class ApiEnvOverride(dev: Option[ApiEnvVarValue], stage: Option[ApiEnvVarValue], prod: Option[ApiEnvVarValue])

@derive(schema, encoder, decoder) sealed trait ApiEnvVarValue
@derive(schema, encoder, decoder) case class ApiStringEnvVar(value: String) extends ApiEnvVarValue
@derive(schema, encoder, decoder) case class ApiBooleanEnvVar(value: Boolean) extends ApiEnvVarValue
@derive(schema, encoder, decoder) case class ApiIntEnvVar(value: Int) extends ApiEnvVarValue

@derive(schema, encoder, decoder) sealed trait ApiDeploymentConf
@derive(schema, encoder, decoder) case class ApiIntEnvOverride(dev: Option[Int], stage: Option[Int], prod: Option[Int])
@derive(schema, encoder, decoder) case class ApiReplicaCountConf(default: Int, envOverride: Option[ApiIntEnvOverride]) extends ApiDeploymentConf
@derive(schema, encoder, decoder) case class ApiCpuRequestConf(default: Int, envOverride: Option[ApiIntEnvOverride]) extends ApiDeploymentConf
@derive(schema, encoder, decoder) case class ApiRamMegabytesConf(default: Int, envOverride: Option[ApiIntEnvOverride]) extends ApiDeploymentConf
