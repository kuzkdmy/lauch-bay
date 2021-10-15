package com.demandbase.lauch_bay.service.convert

import com.demandbase.lauch_bay.domain._
import com.demandbase.lauch_bay.dto._
import com.demandbase.lauch_bay.service.convert.EnvVarConverter.{toApiIntEnvOverride, toIntEnvOverride}

object DeploymentConfConverter {
  def toDeploymentConf(api: ApiDeploymentConf): DeploymentConf = {
    api match {
      case ApiReplicaCountConf(default, envOverride) => ReplicaCountConf(default, envOverride.map(toIntEnvOverride))
      case ApiCpuRequestConf(default, envOverride)   => CpuRequestConf(default, envOverride.map(toIntEnvOverride))
      case ApiRamMegabytesConf(default, envOverride) => RamMegabytesConf(default, envOverride.map(toIntEnvOverride))
    }
  }
  def toApiDeploymentConf(r: DeploymentConf): ApiDeploymentConf = {
    r match {
      case ReplicaCountConf(default, envOverride) => ApiReplicaCountConf(default, envOverride.map(toApiIntEnvOverride))
      case CpuRequestConf(default, envOverride)   => ApiCpuRequestConf(default, envOverride.map(toApiIntEnvOverride))
      case RamMegabytesConf(default, envOverride) => ApiRamMegabytesConf(default, envOverride.map(toApiIntEnvOverride))
    }
  }
}
