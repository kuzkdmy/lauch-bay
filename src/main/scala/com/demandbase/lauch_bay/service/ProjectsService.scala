package com.demandbase.lauch_bay.service

import cats.implicits.{catsSyntaxOptionId, toShow}
import com.demandbase.lauch_bay.domain.ProjectConfigDetails
import com.demandbase.lauch_bay.domain.error.EntryModifiedError
import com.demandbase.lauch_bay.domain.filter.ListProjectsFilter
import com.demandbase.lauch_bay.domain.types.{IntVersion, ProjectId}
import com.demandbase.lauch_bay.trace.{log, Ctx}
import org.slf4j.LoggerFactory
import zio._

trait ProjectsService {
  def upsert(cmd: ProjectConfigDetails)(implicit ctx: Ctx): IO[EntryModifiedError, ProjectConfigDetails]
  def get(id: ProjectId)(implicit ctx: Ctx): Task[Option[ProjectConfigDetails]]
  def list(filter: ListProjectsFilter)(implicit ctx: Ctx): Task[List[ProjectConfigDetails]]
  def delete(id: ProjectId, version: IntVersion)(implicit ctx: Ctx): IO[EntryModifiedError, Option[ProjectConfigDetails]]
}
object ProjectsService extends Accessible[ProjectsService]

case class ProjectsServiceLive(ref: Ref[Map[ProjectId, ProjectConfigDetails]]) extends ProjectsService {
  implicit private val logger: org.slf4j.Logger = LoggerFactory.getLogger(this.getClass)

  override def upsert(cmd: ProjectConfigDetails)(implicit ctx: Ctx): IO[EntryModifiedError, ProjectConfigDetails] = {
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
          log.info(s"upsert project config fail, server version:[$stateV], cmd version:[${cmd.version}]") *>
            IO.fail(EntryModifiedError("Project Config"))
        case UpsertRes.Upserted(prev, upserted) =>
          log.info(s"upsert project config, prev:[${prev.map(_.show).getOrElse("")}], current:[${upserted.show}]").as(upserted)
      }
  }
  override def get(id: ProjectId)(implicit ctx: Ctx): Task[Option[ProjectConfigDetails]] = {
    ref.get.map(_.get(id))
  }
  override def list(filter: ListProjectsFilter)(implicit ctx: Ctx): Task[List[ProjectConfigDetails]] = {
    for {
      data <- ref.get
      res <- ZIO.succeed {
               val idsF = filter.ids.map(_.toList.toSet)
               data.values.toList
                 .flatMap(t => if (idsF.forall(_.contains(t.id))) t.some else None)
             }
    } yield res.sortBy(_.name.value).take(filter.limit.map(_.value).getOrElse(res.size))
  }
  override def delete(id: ProjectId, version: IntVersion)(implicit ctx: Ctx): IO[EntryModifiedError, Option[ProjectConfigDetails]] = {
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
          log.info(s"delete project config fail, server version:[$version], cmd version:[${stateV}]") *>
            IO.fail(EntryModifiedError("Project Config"))
        case DeleteRes.Deleted(prev) =>
          log.info(s"deleted project: ${prev.show}") *> IO.some(prev)
      }
  }
  sealed private trait UpsertRes
  private object UpsertRes {
    case class EntryModified(stateV: IntVersion) extends UpsertRes
    case class Upserted(prev: Option[ProjectConfigDetails], upserted: ProjectConfigDetails) extends UpsertRes
  }

  sealed private trait DeleteRes
  private object DeleteRes {
    case object NotFound extends DeleteRes
    case class EntryModified(stateV: IntVersion) extends DeleteRes
    case class Deleted(prev: ProjectConfigDetails) extends DeleteRes
  }
}

object ProjectsServiceLive {
  val layer = (for {
    ref <- Ref.makeManaged(Map.empty[ProjectId, ProjectConfigDetails])
  } yield ProjectsServiceLive(ref)).toLayer[ProjectsService]
}
