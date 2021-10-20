package com.demandbase.lauch_bay.domain

import com.demandbase.lauch_bay.domain.types._
import derevo.cats.show
import derevo.circe.{decoder, encoder}
import derevo.derive

@derive(show, encoder, decoder) case class GlobalConfigDetails(envConf: List[EnvVarConf], deployConf: List[DeploymentConf], version: IntVersion)
@derive(show, encoder, decoder) case class AppConfigDetails(id: SubProjectName, projectId: ProjectId, name: AppName, envConf: List[EnvVarConf], deployConf: List[DeploymentConf], version: IntVersion)
@derive(show, encoder, decoder) case class ProjectConfigDetails(id: ProjectId, name: ProjectName, envConf: List[EnvVarConf], deployConf: List[DeploymentConf], version: IntVersion)
@derive(show, encoder, decoder) case class EnvOverride[T](dev: Option[T], stage: Option[T], prod: Option[T])
@derive(show, encoder, decoder) case class EnvVarConf(envKey: EnvVarKey, default: Option[EnvVarValue], envOverride: EnvOverride[EnvVarValue])

@derive(show, encoder, decoder) sealed trait EnvVarValue
@derive(show, encoder, decoder) case class StringEnvVar(value: String) extends EnvVarValue
@derive(show, encoder, decoder) case class BooleanEnvVar(value: Boolean) extends EnvVarValue
@derive(show, encoder, decoder) case class IntEnvVar(value: Int) extends EnvVarValue

@derive(show, encoder, decoder) sealed trait DeploymentConf
@derive(show, encoder, decoder) case class ReplicaCountConf(default: Int, envOverride: Option[EnvOverride[Int]]) extends DeploymentConf
@derive(show, encoder, decoder) case class CpuRequestConf(default: Int, envOverride: Option[EnvOverride[Int]]) extends DeploymentConf
@derive(show, encoder, decoder) case class RamMegabytesConf(default: Int, envOverride: Option[EnvOverride[Int]]) extends DeploymentConf
