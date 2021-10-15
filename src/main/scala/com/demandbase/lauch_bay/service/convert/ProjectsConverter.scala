package com.demandbase.lauch_bay.service.convert

import cats.syntax.list._
import com.demandbase.lauch_bay.domain._
import com.demandbase.lauch_bay.domain.filter.ListProjectsFilter
import com.demandbase.lauch_bay.domain.types._
import com.demandbase.lauch_bay.dto._
import com.demandbase.lauch_bay.service.convert.DeploymentConfConverter._
import com.demandbase.lauch_bay.service.convert.EnvVarConverter._

object ProjectsConverter {
  def toListProjectFilter(ids: List[ProjectId], queryLimit: Option[QueryLimit]): ListProjectsFilter = {
    ListProjectsFilter(
      ids   = ids.toNel,
      limit = queryLimit
    )
  }
  def toUpsertProject(api: ApiProject): ProjectConfigDetails = {
    ProjectConfigDetails(
      id         = api.id,
      name       = api.name,
      envConf    = api.envConf.map(toEnvVarConf),
      deployConf = api.deployConf.map(toDeploymentConf)
    )
  }
  def toApiProject(r: ProjectConfigDetails): ApiProject = {
    ApiProject(
      id         = r.id,
      name       = r.name,
      envConf    = r.envConf.map(toApiEnvVarConf),
      deployConf = r.deployConf.map(toApiDeploymentConf)
    )
  }
}
