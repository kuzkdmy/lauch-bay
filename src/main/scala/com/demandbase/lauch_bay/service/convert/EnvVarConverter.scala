package com.demandbase.lauch_bay.service.convert

import com.demandbase.lauch_bay.domain._
import com.demandbase.lauch_bay.dto._

object EnvVarConverter {
  def toEnvVarConf(api: ApiEnvVarConf): EnvVarConf = {
    EnvVarConf(
      envKey      = api.envKey,
      default     = api.default.map(toEnvVarValue),
      envOverride = toEnvOverride(api.envOverride)
    )
  }
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
}
