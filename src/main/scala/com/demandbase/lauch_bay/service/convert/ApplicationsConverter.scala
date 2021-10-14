package com.demandbase.lauch_bay.service.convert

import cats.syntax.list._
import com.demandbase.lauch_bay.domain._
import com.demandbase.lauch_bay.domain.filter.ListApplicationsFilter
import com.demandbase.lauch_bay.domain.types._
import com.demandbase.lauch_bay.dto._

object ApplicationsConverter {
  def toListApplicationFilter(ids: List[AppId], queryLimit: Option[QueryLimit]): ListApplicationsFilter =
    ListApplicationsFilter(
      ids   = ids.toNel,
      limit = queryLimit
    )
  def toEnvVarConf(api: ApiEnvVarConf): EnvVarConf = {
    EnvVarConf(
      envKey      = api.envKey,
      default     = api.default.map(toEnvVarValue),
      envOverride = toEnvOverride(api.envOverride)
    )
  }
  def toDeploymentConf(api: ApiDeploymentConf): DeploymentConf = {
    api match {
      case ApiReplicaCountConf(default, envOverride) => ReplicaCountConf(default, envOverride.map(toIntEnvOverride))
      case ApiCpuRequestConf(default, envOverride)   => CpuRequestConf(default, envOverride.map(toIntEnvOverride))
      case ApiRamMegabytesConf(default, envOverride) => RamMegabytesConf(default, envOverride.map(toIntEnvOverride))
    }
  }
  def toUpsertApplication(api: ApiApplication): AppConfigDetails =
    AppConfigDetails(
      id         = api.id,
      name       = api.name,
      envConf    = api.envConf.map(toEnvVarConf),
      deployConf = api.deployConf.map(toDeploymentConf)
    )

  def toApiEnvVarValue(r: EnvVarValue): ApiEnvVarValue = {
    r match {
      case StringEnvVar(value)  => ApiStringEnvVar(value)
      case BooleanEnvVar(value) => ApiBooleanEnvVar(value)
      case IntEnvVar(value)     => ApiIntEnvVar(value)
    }
  }
  def toEnvVarValue(api: ApiEnvVarValue): EnvVarValue = {
    api match {
      case ApiStringEnvVar(value)  => StringEnvVar(value)
      case ApiBooleanEnvVar(value) => BooleanEnvVar(value)
      case ApiIntEnvVar(value)     => IntEnvVar(value)
    }
  }
  def toApiEnvOverride(r: EnvOverride[EnvVarValue]): ApiEnvOverride = {
    ApiEnvOverride(
      dev   = r.dev.map(toApiEnvVarValue),
      stage = r.stage.map(toApiEnvVarValue),
      prod  = r.prod.map(toApiEnvVarValue)
    )
  }
  def toApiIntEnvOverride(r: EnvOverride[Int]): ApiIntEnvOverride = {
    ApiIntEnvOverride(
      dev   = r.dev,
      stage = r.stage,
      prod  = r.prod
    )
  }
  def toIntEnvOverride(r: ApiIntEnvOverride): EnvOverride[Int] = {
    EnvOverride[Int](
      dev   = r.dev,
      stage = r.stage,
      prod  = r.prod
    )
  }
  def toEnvOverride(r: ApiEnvOverride): EnvOverride[EnvVarValue] = {
    EnvOverride[EnvVarValue](
      dev   = r.dev.map(toEnvVarValue),
      stage = r.stage.map(toEnvVarValue),
      prod  = r.prod.map(toEnvVarValue)
    )
  }
  def toApiEnvVarConf(r: EnvVarConf): ApiEnvVarConf = {
    ApiEnvVarConf(
      envKey      = r.envKey,
      default     = r.default.map(toApiEnvVarValue),
      envOverride = toApiEnvOverride(r.envOverride)
    )
  }
  def toApiDeploymentConf(r: DeploymentConf): ApiDeploymentConf = {
    r match {
      case ReplicaCountConf(default, envOverride) => ApiReplicaCountConf(default, envOverride.map(toApiIntEnvOverride))
      case CpuRequestConf(default, envOverride)   => ApiCpuRequestConf(default, envOverride.map(toApiIntEnvOverride))
      case RamMegabytesConf(default, envOverride) => ApiRamMegabytesConf(default, envOverride.map(toApiIntEnvOverride))
    }
  }
  def toApiApplication(r: AppConfigDetails): ApiApplication = {
    ApiApplication(
      id         = r.id,
      name       = r.name,
      envConf    = r.envConf.map(toApiEnvVarConf),
      deployConf = r.deployConf.map(toApiDeploymentConf)
    )
  }
}
