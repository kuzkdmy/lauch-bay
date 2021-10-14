package com.demandbase.lauch_bay.domain.filter

import cats.data.NonEmptyList
import com.demandbase.lauch_bay.domain.types.{AppId, QueryLimit}

case class ListApplicationsFilter(
    ids: Option[NonEmptyList[AppId]] = None,
    limit: Option[QueryLimit]        = None
)
