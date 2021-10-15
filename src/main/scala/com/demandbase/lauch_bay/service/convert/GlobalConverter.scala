package com.demandbase.lauch_bay.service.convert

import com.demandbase.lauch_bay.domain._
import com.demandbase.lauch_bay.dto._
import com.demandbase.lauch_bay.service.convert.DeploymentConfConverter._
import com.demandbase.lauch_bay.service.convert.EnvVarConverter._

object GlobalConverter {
  def toUpsertGlobalConfig(api: ApiGlobalConfig): GlobalConfigDetails = {
    GlobalConfigDetails(
      envConf    = api.envConf.map(toEnvVarConf),
      deployConf = api.deployConf.map(toDeploymentConf),
      version    = api.version
    )
  }

  def toApiGlobalConfig(r: GlobalConfigDetails): ApiGlobalConfig = {
    ApiGlobalConfig(
      envConf    = r.envConf.map(toApiEnvVarConf),
      deployConf = r.deployConf.map(toApiDeploymentConf),
      version    = r.version
    )
  }
}
