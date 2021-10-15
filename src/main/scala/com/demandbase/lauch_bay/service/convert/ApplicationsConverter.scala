package com.demandbase.lauch_bay.service.convert

import cats.syntax.list._
import com.demandbase.lauch_bay.domain._
import com.demandbase.lauch_bay.domain.filter.ListApplicationsFilter
import com.demandbase.lauch_bay.domain.types._
import com.demandbase.lauch_bay.dto._
import com.demandbase.lauch_bay.service.convert.DeploymentConfConverter._
import com.demandbase.lauch_bay.service.convert.EnvVarConverter._

object ApplicationsConverter {
  def toListApplicationFilter(ids: List[AppId], projectIds: List[ProjectId], queryLimit: Option[QueryLimit]): ListApplicationsFilter = {
    ListApplicationsFilter(
      ids        = ids.toNel,
      projectIds = projectIds.toNel,
      limit      = queryLimit
    )
  }
  def toUpsertApplication(api: ApiApplication): AppConfigDetails = {
    AppConfigDetails(
      id         = api.id,
      projectId  = api.projectId,
      name       = api.name,
      envConf    = api.envConf.map(toEnvVarConf),
      deployConf = api.deployConf.map(toDeploymentConf),
      version    = api.version
    )
  }
  def toApiApplication(r: AppConfigDetails): ApiApplication = {
    ApiApplication(
      id         = r.id,
      projectId  = r.projectId,
      name       = r.name,
      envConf    = r.envConf.map(toApiEnvVarConf),
      deployConf = r.deployConf.map(toApiDeploymentConf),
      version    = r.version
    )
  }
}
