package com.demandbase.lauch_bay.domain

import com.demandbase.lauch_bay.domain.types._
import derevo.cats.show
import derevo.derive

@derive(show) case class GlobalConfigDetails(envConf: List[EnvVarConf], deployConf: List[DeploymentConf], version: IntVersion)
@derive(show) case class AppConfigDetails(id: AppId, projectId: ProjectId, name: AppName, envConf: List[EnvVarConf], deployConf: List[DeploymentConf], version: IntVersion)
@derive(show) case class ProjectConfigDetails(id: ProjectId, name: ProjectName, envConf: List[EnvVarConf], deployConf: List[DeploymentConf], version: IntVersion)
@derive(show) case class EnvOverride[T](dev: Option[T], stage: Option[T], prod: Option[T])
@derive(show) case class EnvVarConf(envKey: EnvVarKey, default: Option[EnvVarValue], envOverride: EnvOverride[EnvVarValue])

@derive(show) sealed trait EnvVarValue
@derive(show) case class StringEnvVar(value: String) extends EnvVarValue
@derive(show) case class BooleanEnvVar(value: Boolean) extends EnvVarValue
@derive(show) case class IntEnvVar(value: Int) extends EnvVarValue

@derive(show) sealed trait DeploymentConf
@derive(show) case class ReplicaCountConf(default: Int, envOverride: Option[EnvOverride[Int]]) extends DeploymentConf
@derive(show) case class CpuRequestConf(default: Int, envOverride: Option[EnvOverride[Int]]) extends DeploymentConf
@derive(show) case class RamMegabytesConf(default: Int, envOverride: Option[EnvOverride[Int]]) extends DeploymentConf
