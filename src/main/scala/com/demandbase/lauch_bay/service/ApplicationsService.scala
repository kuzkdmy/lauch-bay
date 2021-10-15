package com.demandbase.lauch_bay.service

import cats.implicits.toShow
import cats.syntax.option._
import com.demandbase.lauch_bay.domain.AppConfigDetails
import com.demandbase.lauch_bay.domain.error.EntryModifiedError
import com.demandbase.lauch_bay.domain.filter.ListApplicationsFilter
import com.demandbase.lauch_bay.domain.types.{AppId, IntVersion}
import com.demandbase.lauch_bay.trace.{log, Ctx}
import org.slf4j.LoggerFactory
import zio._

trait ApplicationsService {
  def upsert(cmd: AppConfigDetails)(implicit ctx: Ctx): IO[EntryModifiedError, AppConfigDetails]
  def get(id: AppId)(implicit ctx: Ctx): Task[Option[AppConfigDetails]]
  def list(filter: ListApplicationsFilter)(implicit ctx: Ctx): Task[List[AppConfigDetails]]
  def delete(id: AppId, version: IntVersion)(implicit ctx: Ctx): IO[EntryModifiedError, Option[AppConfigDetails]]
}
object ApplicationsService extends Accessible[ApplicationsService]

case class ApplicationsServiceLive(ref: Ref[Map[AppId, AppConfigDetails]]) extends ApplicationsService {
  implicit private val logger: org.slf4j.Logger = LoggerFactory.getLogger(this.getClass)

  override def upsert(cmd: AppConfigDetails)(implicit ctx: Ctx): IO[EntryModifiedError, AppConfigDetails] = {
    ref
      .modify { map =>
        val nextState = cmd.copy(version = cmd.version.inc)
        map.get(cmd.id) match {
          case None                                      => (UpsertRes.Upserted(None, nextState), map + (cmd.id -> nextState))
          case Some(prev) if prev.version == cmd.version => (UpsertRes.Upserted(prev.some, nextState), map + (cmd.id -> nextState))
          case Some(state)                               => (UpsertRes.EntryModified(state.version), map)
        }
      }
      .flatMap {
        case UpsertRes.EntryModified(stateV) =>
          log.info(s"upsert application config fail, server version:[$stateV], cmd version:[${cmd.version}]") *>
            IO.fail(EntryModifiedError("Project Config"))
        case UpsertRes.Upserted(prev, upserted) =>
          log.info(s"upsert application config, prev:[${prev.map(_.show).getOrElse("")}], current:[${upserted.show}]").as(upserted)
      }
  }
  override def get(id: AppId)(implicit ctx: Ctx): Task[Option[AppConfigDetails]] = {
    ref.get.map(_.get(id))
  }
  override def list(filter: ListApplicationsFilter)(implicit ctx: Ctx): Task[List[AppConfigDetails]] = {
    for {
      data <- ref.get
      res <- ZIO.succeed {
               val idsF      = filter.ids.map(_.toList.toSet)
               val projectsF = filter.projectIds.map(_.toList.toSet)
               data.values.toList
                 .flatMap(t => if (idsF.forall(_.contains(t.id))) t.some else None)
                 .flatMap(t => if (projectsF.forall(_.contains(t.projectId))) t.some else None)
             }
    } yield res.sortBy(_.name.value).take(filter.limit.map(_.value).getOrElse(res.size))
  }
  override def delete(id: AppId, version: IntVersion)(implicit ctx: Ctx): IO[EntryModifiedError, Option[AppConfigDetails]] = {
    ref
      .modify { map =>
        map.get(id) match {
          case Some(prev) if prev.version == version => (DeleteRes.Deleted(prev), map - id)
          case Some(state)                           => (DeleteRes.EntryModified(state.version), map)
          case None                                  => (DeleteRes.NotFound, map)
        }
      }
      .flatMap {
        case DeleteRes.NotFound => IO.none
        case DeleteRes.EntryModified(stateV) =>
          log.info(s"delete application config fail, server version:[$version], cmd version:[${stateV}]") *>
            IO.fail(EntryModifiedError("Application Config"))
        case DeleteRes.Deleted(prev) =>
          log.info(s"deleted application: ${prev.show}") *> IO.some(prev)
      }
  }
  sealed private trait UpsertRes
  private object UpsertRes {
    case class EntryModified(stateV: IntVersion) extends UpsertRes
    case class Upserted(prev: Option[AppConfigDetails], upserted: AppConfigDetails) extends UpsertRes
  }
  sealed private trait DeleteRes
  private object DeleteRes {
    case object NotFound extends DeleteRes
    case class EntryModified(stateV: IntVersion) extends DeleteRes
    case class Deleted(prev: AppConfigDetails) extends DeleteRes
  }
}

object ApplicationsServiceLive {
  val layer = (for {
    ref <- Ref.makeManaged(Map.empty[AppId, AppConfigDetails])
  } yield ApplicationsServiceLive(ref)).toLayer[ApplicationsService]
}
