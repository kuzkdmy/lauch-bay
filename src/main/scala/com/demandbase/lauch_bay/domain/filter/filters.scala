package com.demandbase.lauch_bay.domain.filter

import cats.data.NonEmptyList
import com.demandbase.lauch_bay.domain.types.{AppId, ProjectId, QueryLimit}

case class ListApplicationsFilter(
    ids: Option[NonEmptyList[AppId]]            = None,
    projectIds: Option[NonEmptyList[ProjectId]] = None,
    limit: Option[QueryLimit]                   = None
)

case class ListProjectsFilter(
    ids: Option[NonEmptyList[ProjectId]] = None,
    limit: Option[QueryLimit]            = None
)
