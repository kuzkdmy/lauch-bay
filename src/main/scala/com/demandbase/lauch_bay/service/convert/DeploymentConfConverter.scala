package com.demandbase.lauch_bay.service.convert

import com.demandbase.lauch_bay.domain._
import com.demandbase.lauch_bay.dto._
import com.demandbase.lauch_bay.service.convert.EnvVarConverter._

object DeploymentConfConverter {
  def toDeploymentConf(api: ApiDeploymentConf): DeploymentConf = {
    api match {
      case ApiReplicaCountConf(default, envOverride)        => ReplicaCountConf(default, envOverride.map(toIntEnvOverride))
      case ApiCpuRequestConf(default, envOverride)          => CpuRequestConf(default, envOverride.map(toIntEnvOverride))
      case ApiCpuLimitConf(default, envOverride)            => CpuLimitConf(default, envOverride.map(toIntEnvOverride))
      case ApiRamMegabytesRequestConf(default, envOverride) => RamMegabytesRequestConf(default, envOverride.map(toIntEnvOverride))
      case ApiRamMegabytesLimitConf(default, envOverride)   => RamMegabytesLimitConf(default, envOverride.map(toIntEnvOverride))
      case ApiJavaOptsConf(default, envOverride)            => JavaOptsConf(default, envOverride.map(toStringEnvOverride))
      case ApiEmptyDirMemoryConf(default, envOverride)      => EmptyDirMemoryConf(default, envOverride.map(toBooleanEnvOverride))
    }
  }
  def toApiDeploymentConf(r: DeploymentConf): ApiDeploymentConf = {
    r match {
      case ReplicaCountConf(default, envOverride)        => ApiReplicaCountConf(default, envOverride.map(toApiIntEnvOverride))
      case CpuRequestConf(default, envOverride)          => ApiCpuRequestConf(default, envOverride.map(toApiIntEnvOverride))
      case CpuLimitConf(default, envOverride)            => ApiCpuLimitConf(default, envOverride.map(toApiIntEnvOverride))
      case RamMegabytesRequestConf(default, envOverride) => ApiRamMegabytesRequestConf(default, envOverride.map(toApiIntEnvOverride))
      case RamMegabytesLimitConf(default, envOverride)   => ApiRamMegabytesLimitConf(default, envOverride.map(toApiIntEnvOverride))
      case JavaOptsConf(default, envOverride)            => ApiJavaOptsConf(default, envOverride.map(toApiStringEnvOverride))
      case EmptyDirMemoryConf(default, envOverride)      => ApiEmptyDirMemoryConf(default, envOverride.map(toApiBooleanEnvOverride))
    }
  }
}
